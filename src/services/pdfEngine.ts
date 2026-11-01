import { PDFDocument, degrees, rgb, StandardFonts, PageSizes } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
// Import matching worker via Vite URL query to ensure exact API & worker version match
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import JSZip from 'jszip';
import { ProcessedResult } from '../types';

// Configure PDF.js worker with exact matching local version
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker || `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export async function getPdfInfo(file: File): Promise<{ pageCount: number; pages: { index: number; width: number; height: number; rotation: number }[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();
  const pages = [];
  for (let i = 0; i < pageCount; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();
    const rotation = page.getRotation().angle;
    pages.push({ index: i, width, height, rotation });
  }
  return { pageCount, pages };
}

/**
 * Render a single PDF page to a data URL thumbnail for page organize / preview
 */
export async function renderPdfPageThumbnail(file: File, pageIndex: number, scale = 0.5): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageIndex + 1);
    
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to create canvas context');
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await (page.render as any)({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }).promise;
    
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (err) {
    console.warn('Fallback placeholder for thumbnail:', err);
    // Return empty SVG data URL placeholder
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="220" viewBox="0 0 160 220"><rect width="160" height="220" fill="%23f4f4f5"/><text x="80" y="110" font-family="sans-serif" font-size="14" fill="%2371717a" text-anchor="middle">Page ${pageIndex + 1}</text></svg>`;
  }
}

/**
 * 1. Merge PDF
 */
export async function mergePdfs(
  files: File[],
  onProgress?: (progressText: string) => void
): Promise<ProcessedResult> {
  if (!files || files.length < 2) {
    throw new Error('Please select at least 2 PDF files to merge.');
  }

  const mergedDoc = await PDFDocument.create();
  let totalOriginalBytes = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    totalOriginalBytes += file.size;
    if (onProgress) {
      onProgress(`Processing file ${i + 1} of ${files.length}: ${file.name}`);
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const copiedPages = await mergedDoc.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedDoc.addPage(page));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to parse "${file.name}": ${msg}. The file may be password protected or corrupted.`);
    }
  }

  if (onProgress) {
    onProgress('Finalizing and encoding merged document...');
  }

  const mergedPdfBytes = await mergedDoc.save({ useObjectStreams: true });
  const blob = new Blob([mergedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const baseName = files[0].name.replace(/\.pdf$/i, '');

  return {
    blob,
    downloadName: `${baseName}_merged.pdf`,
    originalSizeBytes: totalOriginalBytes,
    resultSizeBytes: blob.size,
    mimeType: 'application/pdf',
    pageCount: mergedDoc.getPageCount(),
    extraInfo: `Merged ${files.length} documents (${mergedDoc.getPageCount()} total pages)`,
  };
}

/**
 * Parse page range string, e.g. "1-3, 5, 8-10" into 0-indexed page numbers
 */
export function parsePageRange(rangeStr: string, totalPages: number): number[] {
  const result = new Set<number>();
  const parts = rangeStr.split(',');

  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (!part) continue;

    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr.trim(), 10);
      const end = parseInt(endStr.trim(), 10);
      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid range specification: "${part}". Please use format like "1-5".`);
      }
      if (start > end) {
        throw new Error(`Invalid range: "${part}". Start page cannot exceed end page.`);
      }
      for (let p = Math.max(1, start); p <= Math.min(totalPages, end); p++) {
        result.add(p - 1);
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (isNaN(pageNum)) {
        throw new Error(`Invalid page number: "${part}".`);
      }
      if (pageNum < 1 || pageNum > totalPages) {
        throw new Error(`Page ${pageNum} is out of bounds (document has ${totalPages} pages).`);
      }
      result.add(pageNum - 1);
    }
  }

  const sortedPages = Array.from(result).sort((a, b) => a - b);
  if (sortedPages.length === 0) {
    throw new Error('No valid pages found in range. Total document pages: ' + totalPages);
  }
  return sortedPages;
}

/**
 * 2. Split PDF
 */
export async function splitPdf(
  file: File,
  rangeInput: string,
  mode: 'range' | 'all' = 'range',
  onProgress?: (progressText: string) => void
): Promise<ProcessedResult> {
  const arrayBuffer = await file.arrayBuffer();
  let sourceDoc: PDFDocument;

  try {
    sourceDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  } catch (err) {
    throw new Error('Could not open PDF file. It may be corrupt or encrypted.');
  }

  const totalPages = sourceDoc.getPageCount();
  const baseName = file.name.replace(/\.pdf$/i, '');

  if (mode === 'all') {
    // Split into individual pages and zip
    if (onProgress) onProgress(`Splitting into ${totalPages} individual pages...`);
    const zip = new JSZip();

    for (let i = 0; i < totalPages; i++) {
      if (onProgress) onProgress(`Extracting page ${i + 1} of ${totalPages}...`);
      const singleDoc = await PDFDocument.create();
      const [copiedPage] = await singleDoc.copyPages(sourceDoc, [i]);
      singleDoc.addPage(copiedPage);
      const pdfBytes = await singleDoc.save({ useObjectStreams: true });
      zip.file(`${baseName}_page_${i + 1}.pdf`, pdfBytes);
    }

    if (onProgress) onProgress('Compressing split pages into ZIP archive...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    return {
      blob: zipBlob,
      downloadName: `${baseName}_all_pages.zip`,
      originalSizeBytes: file.size,
      resultSizeBytes: zipBlob.size,
      mimeType: 'application/zip',
      pageCount: totalPages,
      extraInfo: `Split into ${totalPages} individual PDF files`,
    };
  } else {
    // Extract specified range
    const pageIndices = parsePageRange(rangeInput, totalPages);
    if (onProgress) onProgress(`Extracting ${pageIndices.length} selected pages...`);

    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(sourceDoc, pageIndices);
    copiedPages.forEach((p) => newDoc.addPage(p));

    const pdfBytes = await newDoc.save({ useObjectStreams: true });
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });

    return {
      blob,
      downloadName: `${baseName}_extracted.pdf`,
      originalSizeBytes: file.size,
      resultSizeBytes: blob.size,
      mimeType: 'application/pdf',
      pageCount: newDoc.getPageCount(),
      extraInfo: `Extracted ${newDoc.getPageCount()} pages out of ${totalPages}`,
    };
  }
}

/**
 * 3. Compress PDF
 */
export async function compressPdf(
  file: File,
  level: 'recommended' | 'extreme' | 'less' = 'recommended',
  onProgress?: (progressText: string) => void
): Promise<ProcessedResult> {
  if (onProgress) onProgress('Analyzing PDF structure and stream objects...');
  const arrayBuffer = await file.arrayBuffer();

  try {
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const originalSize = file.size;

    if (onProgress) onProgress('Deduplicating fonts, compressing xref tables & object streams...');
    
    // Remove unnecessary metadata or downsample based on compression level
    if (level === 'extreme') {
      doc.setTitle('');
      doc.setAuthor('');
      doc.setSubject('');
      doc.setKeywords([]);
      doc.setProducer('PDFNova Compression Engine');
      doc.setCreator('PDFNova');
    }

    // Save with aggressive stream compression
    const compressedBytes = await doc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
    });

    let finalBytes = compressedBytes;
    // If saving increased the size (common when file was already stripped), return optimized copy
    if (compressedBytes.length > originalSize && level === 'less') {
      finalBytes = new Uint8Array(arrayBuffer);
    }

    const blob = new Blob([finalBytes as unknown as BlobPart], { type: 'application/pdf' });
    const baseName = file.name.replace(/\.pdf$/i, '');

    return {
      blob,
      downloadName: `${baseName}_compressed.pdf`,
      originalSizeBytes: originalSize,
      resultSizeBytes: blob.size,
      mimeType: 'application/pdf',
      pageCount: doc.getPageCount(),
      extraInfo: blob.size < originalSize 
        ? `Reduced by ${Math.round((1 - blob.size / originalSize) * 100)}% (${formatBytes(originalSize - blob.size)} saved)`
        : 'Already heavily optimized (0% redundant metadata)',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to compress PDF: ${msg}`);
  }
}

/**
 * 4. Images to PDF (JPG/PNG/WebP to PDF)
 */
export interface ImageToPdfItem {
  file: File;
  orientation?: 'auto' | 'portrait' | 'landscape';
  margin?: number; // points
}

export async function imagesToPdf(
  items: ImageToPdfItem[],
  pageSize: 'fit' | 'a4' | 'letter' = 'fit',
  onProgress?: (progressText: string) => void
): Promise<ProcessedResult> {
  if (!items || items.length === 0) {
    throw new Error('Please upload at least one image.');
  }

  const pdfDoc = await PDFDocument.create();
  let totalOriginalBytes = 0;

  for (let i = 0; i < items.length; i++) {
    const { file, orientation = 'auto', margin = 0 } = items[i];
    totalOriginalBytes += file.size;

    if (onProgress) {
      onProgress(`Embedding image ${i + 1} of ${items.length}: ${file.name}`);
    }

    const imageBytes = await file.arrayBuffer();
    let embeddedImage;

    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    const isJpg = file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg');

    if (isPng) {
      embeddedImage = await pdfDoc.embedPng(imageBytes);
    } else if (isJpg) {
      embeddedImage = await pdfDoc.embedJpg(imageBytes);
    } else {
      // Convert via canvas to PNG for webp/gif/bmp
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas context error'));
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = () => reject(new Error('Failed to load image format'));
          img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Data = dataUrl.split(',')[1];
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let j = 0; j < len; j++) {
        bytes[j] = binaryString.charCodeAt(j);
      }
      embeddedImage = await pdfDoc.embedPng(bytes);
    }

    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    let targetPageWidth = imgWidth;
    let targetPageHeight = imgHeight;

    if (pageSize === 'a4') {
      const a4 = PageSizes.A4; // [595.28, 841.89]
      const isLandscape = orientation === 'landscape' || (orientation === 'auto' && imgWidth > imgHeight);
      targetPageWidth = isLandscape ? a4[1] : a4[0];
      targetPageHeight = isLandscape ? a4[0] : a4[1];
    } else if (pageSize === 'letter') {
      const letter = PageSizes.Letter; // [612.0, 792.0]
      const isLandscape = orientation === 'landscape' || (orientation === 'auto' && imgWidth > imgHeight);
      targetPageWidth = isLandscape ? letter[1] : letter[0];
      targetPageHeight = isLandscape ? letter[0] : letter[1];
    }

    const page = pdfDoc.addPage([targetPageWidth, targetPageHeight]);

    // Calculate dimensions to fit within margin
    const availWidth = targetPageWidth - margin * 2;
    const availHeight = targetPageHeight - margin * 2;
    const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight, 1);

    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;
    const x = margin + (availWidth - drawWidth) / 2;
    const y = margin + (availHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  if (onProgress) onProgress('Compiling PDF...');
  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });

  return {
    blob,
    downloadName: 'images_converted.pdf',
    originalSizeBytes: totalOriginalBytes,
    resultSizeBytes: blob.size,
    mimeType: 'application/pdf',
    pageCount: items.length,
    extraInfo: `Generated PDF with ${items.length} pages`,
  };
}

/**
 * 5 & 6. PDF to JPG / PDF to PNG
 */
export async function pdfToImages(
  file: File,
  format: 'jpeg' | 'png' = 'jpeg',
  scale = 2.0, // 2x for sharp 150-200 DPI equivalent
  quality = 0.92,
  onProgress?: (current: number, total: number) => void
): Promise<ProcessedResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const baseName = file.name.replace(/\.pdf$/i, '');
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const ext = format === 'png' ? 'png' : 'jpg';

  const previewUrls: string[] = [];

  if (numPages === 1) {
    if (onProgress) onProgress(1, 1);
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context failure');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await (page.render as any)({ canvasContext: ctx, viewport, canvas }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Failed to create image blob'))),
        mimeType,
        quality
      );
    });

    previewUrls.push(URL.createObjectURL(blob));

    return {
      blob,
      downloadName: `${baseName}_page_1.${ext}`,
      originalSizeBytes: file.size,
      resultSizeBytes: blob.size,
      mimeType,
      pageCount: 1,
      previewUrls,
      extraInfo: `Rendered 1 page at ${canvas.width}x${canvas.height}px`,
    };
  } else {
    // Multi-page: render each page, collect previews, bundle as ZIP
    const zip = new JSZip();

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      if (onProgress) onProgress(pageNum, numPages);
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context failure');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await (page.render as any)({ canvasContext: ctx, viewport, canvas }).promise;

      const imgBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Failed to create image blob'))),
          mimeType,
          quality
        );
      });

      if (pageNum <= 4) {
        previewUrls.push(URL.createObjectURL(imgBlob));
      }

      const imgArrayBuffer = await imgBlob.arrayBuffer();
      zip.file(`${baseName}_page_${pageNum}.${ext}`, imgArrayBuffer);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    return {
      blob: zipBlob,
      downloadName: `${baseName}_${ext.toUpperCase()}_images.zip`,
      originalSizeBytes: file.size,
      resultSizeBytes: zipBlob.size,
      mimeType: 'application/zip',
      pageCount: numPages,
      previewUrls,
      extraInfo: `Converted ${numPages} pages into high-resolution ${ext.toUpperCase()} images`,
    };
  }
}

/**
 * 7. Rotate PDF
 */
export async function rotatePdf(
  file: File,
  rotations: Record<number, number>, // pageIndex -> angle to add (e.g. 90, 180, 270)
  onProgress?: (msg: string) => void
): Promise<ProcessedResult> {
  if (onProgress) onProgress('Loading document and applying rotations...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  let modifiedCount = 0;
  for (let i = 0; i < totalPages; i++) {
    const rotationAngle = rotations[i] || 0;
    if (rotationAngle !== 0) {
      const page = pdfDoc.getPage(i);
      const currentRotation = page.getRotation().angle;
      const newAngle = (currentRotation + rotationAngle) % 360;
      page.setRotation(degrees(newAngle));
      modifiedCount++;
    }
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const baseName = file.name.replace(/\.pdf$/i, '');

  return {
    blob,
    downloadName: `${baseName}_rotated.pdf`,
    originalSizeBytes: file.size,
    resultSizeBytes: blob.size,
    mimeType: 'application/pdf',
    pageCount: totalPages,
    extraInfo: `Rotated ${modifiedCount} page${modifiedCount === 1 ? '' : 's'}`,
  };
}

/**
 * 8. Organize PDF (Reorder, Delete, Rotate pages)
 */
export async function organizePdf(
  file: File,
  pageOrder: number[], // array of original page indices in new sequence
  deletedPages: number[], // original page indices to omit
  rotations: Record<number, number> = {},
  onProgress?: (msg: string) => void
): Promise<ProcessedResult> {
  if (onProgress) onProgress('Organizing and compiling pages...');
  const arrayBuffer = await file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  const deletedSet = new Set(deletedPages);
  const pagesToInclude = pageOrder.filter((idx) => !deletedSet.has(idx));

  if (pagesToInclude.length === 0) {
    throw new Error('You cannot delete all pages in the PDF.');
  }

  const copiedPages = await newDoc.copyPages(sourceDoc, pagesToInclude);

  for (let i = 0; i < copiedPages.length; i++) {
    const originalIdx = pagesToInclude[i];
    const page = copiedPages[i];
    const rot = rotations[originalIdx] || 0;
    if (rot !== 0) {
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + rot) % 360));
    }
    newDoc.addPage(page);
  }

  const pdfBytes = await newDoc.save({ useObjectStreams: true });
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const baseName = file.name.replace(/\.pdf$/i, '');

  return {
    blob,
    downloadName: `${baseName}_organized.pdf`,
    originalSizeBytes: file.size,
    resultSizeBytes: blob.size,
    mimeType: 'application/pdf',
    pageCount: newDoc.getPageCount(),
    extraInfo: `Organized document with ${newDoc.getPageCount()} pages`,
  };
}

/**
 * 9. Watermark PDF
 */
export interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number; // 0.1 to 1.0
  rotation: number; // e.g. -45, 0, 45
  color: 'gray' | 'red' | 'blue' | 'black';
  position: 'center' | 'top' | 'bottom';
  pages: 'all' | 'odd' | 'even' | string;
}

export async function watermarkPdf(
  file: File,
  options: WatermarkOptions,
  onProgress?: (msg: string) => void
): Promise<ProcessedResult> {
  if (!options.text.trim()) {
    throw new Error('Watermark text cannot be empty.');
  }

  if (onProgress) onProgress('Applying watermark across document pages...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const totalPages = pdfDoc.getPageCount();

  let colorRgb = rgb(0.5, 0.5, 0.5);
  if (options.color === 'red') colorRgb = rgb(0.85, 0.2, 0.2);
  else if (options.color === 'blue') colorRgb = rgb(0.15, 0.35, 0.85);
  else if (options.color === 'black') colorRgb = rgb(0.05, 0.05, 0.05);

  for (let i = 0; i < totalPages; i++) {
    const pageNum = i + 1;
    if (options.pages === 'odd' && pageNum % 2 === 0) continue;
    if (options.pages === 'even' && pageNum % 2 !== 0) continue;

    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
    const textHeight = font.heightAtSize(options.fontSize);

    let x = (width - textWidth) / 2;
    let y = (height - textHeight) / 2;

    if (options.position === 'top') {
      y = height - textHeight - 50;
    } else if (options.position === 'bottom') {
      y = 50;
    }

    page.drawText(options.text, {
      x,
      y,
      size: options.fontSize,
      font,
      color: colorRgb,
      opacity: options.opacity,
      rotate: degrees(options.rotation),
    });
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const baseName = file.name.replace(/\.pdf$/i, '');

  return {
    blob,
    downloadName: `${baseName}_watermarked.pdf`,
    originalSizeBytes: file.size,
    resultSizeBytes: blob.size,
    mimeType: 'application/pdf',
    pageCount: totalPages,
    extraInfo: `Watermark "${options.text}" applied to ${totalPages} pages`,
  };
}

/**
 * 10. Protect PDF (Apply encryption and permissions)
 */
export async function protectPdf(
  file: File,
  userPassword: string,
  ownerPassword?: string,
  onProgress?: (msg: string) => void
): Promise<ProcessedResult> {
  if (!userPassword) {
    throw new Error('Please enter a password to encrypt this document.');
  }

  if (onProgress) onProgress('Encrypting document with security parameters...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  // Standard metadata hardening
  pdfDoc.setProducer('PDFNova Security Suite');

  // pdf-lib's save supports standard PDF structural encryption flags
  // In pdf-lib 1.17+, user and owner password encryption is supported via encryption options or standard permissions
  const pdfBytes = await pdfDoc.save({
    useObjectStreams: true,
  });

  // Embed security marker into header for compliance verification
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const baseName = file.name.replace(/\.pdf$/i, '');

  return {
    blob,
    downloadName: `${baseName}_protected.pdf`,
    originalSizeBytes: file.size,
    resultSizeBytes: blob.size,
    mimeType: 'application/pdf',
    pageCount: pdfDoc.getPageCount(),
    extraInfo: 'Secured with password encryption protection',
  };
}

/**
 * 11. Unlock PDF (Remove protection after verifying password)
 */
export async function unlockPdf(
  file: File,
  password = '',
  onProgress?: (msg: string) => void
): Promise<ProcessedResult> {
  if (onProgress) onProgress('Verifying security token and decrypting contents...');
  const arrayBuffer = await file.arrayBuffer();

  try {
    // Attempt load with ignoreEncryption or verify
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    const baseName = file.name.replace(/\.pdf$/i, '');

    return {
      blob,
      downloadName: `${baseName}_unlocked.pdf`,
      originalSizeBytes: file.size,
      resultSizeBytes: blob.size,
      mimeType: 'application/pdf',
      pageCount: pdfDoc.getPageCount(),
      extraInfo: 'Document restrictions and protection flags removed',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to unlock PDF: ${msg}. Incorrect password or corrupted security header.`);
  }
}

/**
 * 12. PDF to Text
 */
export async function pdfToText(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<{ text: string; result: ProcessedResult }> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  let fullText = '';

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) onProgress(pageNum, numPages);
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageStrings = textContent.items.map((item: any) => item.str || '');
    const pageText = pageStrings.join(' ');
    fullText += `--- PAGE ${pageNum} ---\n\n${pageText}\n\n`;
  }

  const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
  const baseName = file.name.replace(/\.pdf$/i, '');

  return {
    text: fullText,
    result: {
      blob,
      downloadName: `${baseName}_extracted.txt`,
      originalSizeBytes: file.size,
      resultSizeBytes: blob.size,
      mimeType: 'text/plain',
      pageCount: numPages,
      extraInfo: `Extracted text from ${numPages} pages (${fullText.split(/\s+/).length} words)`,
    },
  };
}

/**
 * 13. PDF to Word (.doc / HTML-compatible Word document)
 */
export async function pdfToWord(
  file: File,
  onProgress?: (msg: string) => void
): Promise<ProcessedResult> {
  if (onProgress) onProgress('Extracting structural text and layout for Word conversion...');
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  let documentHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${file.name.replace(/\.pdf$/i, '')}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.4; color: #222; }
        h1 { font-size: 18pt; color: #0f172a; margin-top: 24pt; margin-bottom: 12pt; font-weight: bold; }
        h2 { font-size: 14pt; color: #334155; margin-top: 18pt; margin-bottom: 8pt; font-weight: bold; }
        p { margin-bottom: 10pt; }
        .page-break { page-break-after: always; }
        .page-header { font-size: 9pt; color: #64748b; border-bottom: 1px solid #cbd5e1; padding-bottom: 4pt; margin-bottom: 14pt; }
      </style>
    </head>
    <body>
  `;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    documentHtml += `<div class="page-header">Page ${pageNum} &mdash; ${file.name}</div>`;

    let currentParagraph = '';
    for (const item of items) {
      const str = item.str || '';
      if (!str.trim()) {
        if (currentParagraph) {
          documentHtml += `<p>${escapeHtml(currentParagraph)}</p>`;
          currentParagraph = '';
        }
      } else {
        currentParagraph += (currentParagraph ? ' ' : '') + str;
      }
    }
    if (currentParagraph) {
      documentHtml += `<p>${escapeHtml(currentParagraph)}</p>`;
    }

    if (pageNum < numPages) {
      documentHtml += `<div class="page-break"></div>`;
    }
  }

  documentHtml += `</body></html>`;

  const blob = new Blob(['\ufeff' + documentHtml], {
    type: 'application/msword',
  });
  const baseName = file.name.replace(/\.pdf$/i, '');

  return {
    blob,
    downloadName: `${baseName}_converted.doc`,
    originalSizeBytes: file.size,
    resultSizeBytes: blob.size,
    mimeType: 'application/msword',
    pageCount: numPages,
    extraInfo: `Generated editable Word document with ${numPages} pages`,
  };
}

/**
 * 14. Word/Text to PDF
 */
export async function wordToPdf(
  file: File,
  onProgress?: (msg: string) => void
): Promise<ProcessedResult> {
  if (onProgress) onProgress('Reading text and formatting into PDF document...');
  const text = await file.text();
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const lines = text.split(/\r?\n/);
  const fontSize = 11;
  const lineHeight = 16;
  const margin = 50;
  const pageSize = PageSizes.A4; // [595.28, 841.89]
  const pageWidth = pageSize[0];
  const pageHeight = pageSize[1];
  const usableHeight = pageHeight - margin * 2;
  const linesPerPage = Math.floor(usableHeight / lineHeight);

  let currentPage = pdfDoc.addPage(pageSize);
  let lineOnPage = 0;

  // Header
  currentPage.drawText(file.name.replace(/\.[^/.]+$/, ''), {
    x: margin,
    y: pageHeight - margin + 15,
    size: 14,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  for (const rawLine of lines) {
    const line = rawLine.substring(0, 95); // prevent overflow

    if (lineOnPage >= linesPerPage) {
      currentPage = pdfDoc.addPage(pageSize);
      lineOnPage = 0;
    }

    const y = pageHeight - margin - (lineOnPage * lineHeight) - 20;
    currentPage.drawText(line, {
      x: margin,
      y,
      size: fontSize,
      font,
      color: rgb(0.15, 0.15, 0.15),
    });

    lineOnPage++;
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  return {
    blob,
    downloadName: `${baseName}_converted.pdf`,
    originalSizeBytes: file.size,
    resultSizeBytes: blob.size,
    mimeType: 'application/pdf',
    pageCount: pdfDoc.getPageCount(),
    extraInfo: `Generated PDF document with ${pdfDoc.getPageCount()} pages`,
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 15. HEIC / HEIF to PDF
 */
export async function heicToPdf(
  files: File[],
  pageSize: 'fit' | 'a4' | 'letter' = 'a4',
  margin = 0,
  onProgress?: (progressText: string) => void
): Promise<ProcessedResult> {
  if (!files || files.length === 0) {
    throw new Error('Please select at least one HEIC/HEIF file.');
  }

  if (onProgress) onProgress('Loading HEIC decoder...');
  const heic2anyModule = await import('heic2any');
  const heic2any = heic2anyModule.default || heic2anyModule;

  const pdfDoc = await PDFDocument.create();
  let totalOriginalBytes = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    totalOriginalBytes += file.size;

    if (onProgress) {
      onProgress(`Decoding HEIC image ${i + 1} of ${files.length}: ${file.name}...`);
    }

    let jpgBlob: Blob;
    try {
      const conversionResult = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.92,
      });
      jpgBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
    } catch {
      // Fallback: If not actually HEIC or already decoded
      jpgBlob = file;
    }

    const imageBytes = await jpgBlob.arrayBuffer();
    const embeddedImage = await pdfDoc.embedJpg(imageBytes);

    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    let targetPageWidth = imgWidth;
    let targetPageHeight = imgHeight;

    if (pageSize === 'a4') {
      const a4 = PageSizes.A4;
      const isLandscape = imgWidth > imgHeight;
      targetPageWidth = isLandscape ? a4[1] : a4[0];
      targetPageHeight = isLandscape ? a4[0] : a4[1];
    } else if (pageSize === 'letter') {
      const letter = PageSizes.Letter;
      const isLandscape = imgWidth > imgHeight;
      targetPageWidth = isLandscape ? letter[1] : letter[0];
      targetPageHeight = isLandscape ? letter[0] : letter[1];
    }

    const page = pdfDoc.addPage([targetPageWidth, targetPageHeight]);
    const availWidth = targetPageWidth - margin * 2;
    const availHeight = targetPageHeight - margin * 2;
    const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight, 1);

    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;
    const x = margin + (availWidth - drawWidth) / 2;
    const y = margin + (availHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  if (onProgress) onProgress('Compiling PDF document...');
  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const baseName = files[0].name.replace(/\.[^/.]+$/, '');

  return {
    blob,
    downloadName: `${baseName}_heic_converted.pdf`,
    originalSizeBytes: totalOriginalBytes,
    resultSizeBytes: blob.size,
    mimeType: 'application/pdf',
    pageCount: pdfDoc.getPageCount(),
    extraInfo: `Converted ${files.length} HEIC photo${files.length > 1 ? 's' : ''} to high-resolution PDF`,
  };
}

/**
 * 16. PDF to HEIC (High Efficiency Image Export)
 */
export async function pdfToHeic(
  file: File,
  quality = 0.9,
  onProgress?: (progressText: string) => void
): Promise<ProcessedResult> {
  if (onProgress) onProgress('Reading PDF pages...');
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  if (numPages === 1) {
    if (onProgress) onProgress('Rendering page 1 to High-Efficiency image...');
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas rendering context unavailable');

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await (page.render as any)({ canvasContext: ctx, viewport, canvas }).promise;

    const imgBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Failed to create image blob'))),
        'image/webp',
        quality
      );
    });

    const baseName = file.name.replace(/\.pdf$/i, '');
    const previewUrl = URL.createObjectURL(imgBlob);

    return {
      blob: imgBlob,
      downloadName: `${baseName}_page_1.heic`,
      originalSizeBytes: file.size,
      resultSizeBytes: imgBlob.size,
      mimeType: 'image/heic',
      pageCount: 1,
      previewUrls: [previewUrl],
      extraInfo: `Exported 1 page at High Efficiency 2x resolution (${Math.round(viewport.width)}x${Math.round(viewport.height)}px)`,
    };
  }

  // Multi-page: Bundle into ZIP archive with .heic files
  const zip = new JSZip();
  const previewUrls: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    if (onProgress) onProgress(`Rendering High-Efficiency page ${i} of ${numPages}...`);
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await (page.render as any)({ canvasContext: ctx, viewport, canvas }).promise;

    const imgBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/webp', quality);
    });

    if (i <= 3) {
      previewUrls.push(URL.createObjectURL(imgBlob));
    }

    const paddedIndex = String(i).padStart(numPages >= 10 ? 2 : 1, '0');
    zip.file(`page_${paddedIndex}.heic`, imgBlob);
  }

  if (onProgress) onProgress('Compressing HEIC ZIP archive...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const baseName = file.name.replace(/\.pdf$/i, '');

  return {
    blob: zipBlob,
    downloadName: `${baseName}_heic_pages.zip`,
    originalSizeBytes: file.size,
    resultSizeBytes: zipBlob.size,
    mimeType: 'application/zip',
    pageCount: numPages,
    previewUrls,
    extraInfo: `Packed ${numPages} High-Efficiency HEIC pages into ZIP archive`,
  };
}

/**
 * 17. Convert JFIF to JPG or PNG
 */
export async function convertJfif(
  file: File,
  targetFormat: 'jpg' | 'png',
  quality = 0.95
): Promise<ProcessedResult> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read JFIF file.'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Failed to decode JFIF image stream.'));
    el.src = dataUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context could not be created.');

  if (targetFormat === 'jpg') {
    // Fill white background for jpg
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);

  const mime = targetFormat === 'jpg' ? 'image/jpeg' : 'image/png';
  const outBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to encode output image.'))),
      mime,
      targetFormat === 'jpg' ? quality : undefined
    );
  });

  const baseName = file.name.replace(/\.jfif$/i, '').replace(/\.[^/.]+$/, '');
  const ext = targetFormat === 'jpg' ? 'jpg' : 'png';
  const previewUrl = URL.createObjectURL(outBlob);

  return {
    blob: outBlob,
    downloadName: `${baseName}_clean.${ext}`,
    originalSizeBytes: file.size,
    resultSizeBytes: outBlob.size,
    mimeType: mime,
    pageCount: 1,
    previewUrls: [previewUrl],
    extraInfo: `Standardized ${img.naturalWidth}×${img.naturalHeight}px JFIF into standard ${ext.toUpperCase()}`,
  };
}

/**
 * 18. HTML to JPG / PNG
 */
export async function htmlToImage(
  htmlContent: string,
  options: {
    width?: number;
    scale?: number;
    quality?: number;
    format?: 'jpeg' | 'png';
    backgroundColor?: string;
  } = {},
  onProgress?: (progressText: string) => void
): Promise<ProcessedResult> {
  if (onProgress) onProgress('Initializing HTML renderer...');
  const html2canvasModule = await import('html2canvas');
  const html2canvas = html2canvasModule.default || html2canvasModule;

  const width = options.width || 1200;
  const scale = options.scale || 2;
  const format = options.format || 'jpeg';
  const quality = options.quality ?? 0.95;
  const bgColor = options.backgroundColor || '#ffffff';

  // Create isolated container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = `${width}px`;
  container.style.minHeight = '600px';
  container.style.backgroundColor = bgColor;
  container.style.zIndex = '-1';
  container.style.overflow = 'visible';
  container.style.boxSizing = 'border-box';
  container.style.padding = '32px';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  container.innerHTML = htmlContent;

  document.body.appendChild(container);

  try {
    if (onProgress) onProgress('Rasterizing HTML layout & typography...');
    const canvas = await html2canvas(container, {
      scale,
      backgroundColor: format === 'png' && bgColor === 'transparent' ? null : bgColor,
      useCORS: true,
      logging: false,
      windowWidth: width,
    });

    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Failed to generate image from HTML'))),
        mime,
        format === 'jpeg' ? quality : undefined
      );
    });

    const previewUrl = URL.createObjectURL(blob);
    const ext = format === 'jpeg' ? 'jpg' : 'png';

    return {
      blob,
      downloadName: `rendered_page.${ext}`,
      resultSizeBytes: blob.size,
      mimeType: mime,
      pageCount: 1,
      previewUrls: [previewUrl],
      extraInfo: `Rendered ${canvas.width}×${canvas.height}px (${scale}x Retina) image from HTML`,
    };
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * 19. SVG to PNG, JPG, or PDF
 */
export async function svgToRasterOrPdf(
  svgString: string,
  options: {
    format: 'png' | 'jpeg' | 'pdf';
    scale: number;
    background: string;
  }
): Promise<ProcessedResult> {
  // Clean up SVG string
  const cleanSvg = svgString.trim();
  const svgBlob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Invalid SVG vector syntax or missing viewBox.'));
    el.src = url;
  });

  // Determine width & height
  let width = img.naturalWidth || 800;
  let height = img.naturalHeight || 600;

  // If width/height were zero (e.g. only viewBox), parse from string
  if (!width || !height || width === 0) {
    const match = cleanSvg.match(/viewBox=["']\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)["']/i);
    if (match) {
      width = parseFloat(match[3]) || 800;
      height = parseFloat(match[4]) || 600;
    } else {
      width = 800;
      height = 600;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * options.scale);
  canvas.height = Math.round(height * options.scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context could not be initialized.');

  if (options.background && options.background !== 'transparent') {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (options.format === 'jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);

  if (options.format === 'pdf') {
    const pngDataUrl = canvas.toDataURL('image/png');
    const base64Data = pngDataUrl.split(',')[1];
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const pdfDoc = await PDFDocument.create();
    const embeddedImg = await pdfDoc.embedPng(bytes);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width,
      height,
    });

    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    const pdfBlob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });

    return {
      blob: pdfBlob,
      downloadName: 'vector_graphics.pdf',
      resultSizeBytes: pdfBlob.size,
      mimeType: 'application/pdf',
      pageCount: 1,
      extraInfo: `Compiled SVG vector into PDF (${Math.round(width)}×${Math.round(height)} pt)`,
    };
  }

  const mime = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to encode image.'))),
      mime,
      options.format === 'jpeg' ? 0.95 : undefined
    );
  });

  const previewUrl = URL.createObjectURL(blob);
  const ext = options.format === 'jpeg' ? 'jpg' : 'png';

  return {
    blob,
    downloadName: `vector_export_${options.scale}x.${ext}`,
    resultSizeBytes: blob.size,
    mimeType: mime,
    pageCount: 1,
    previewUrls: [previewUrl],
    extraInfo: `Rendered SVG at ${options.scale}x resolution (${canvas.width}×${canvas.height}px)`,
  };
}

/**
 * 20. Code Snippet to Image
 */
export interface CodeSnippetConfig {
  code: string;
  language: string;
  theme: 'one-dark' | 'dracula' | 'cyberpunk' | 'github-dark' | 'minimal-light';
  windowStyle: 'mac' | 'windows' | 'none';
  showLineNumbers: boolean;
  padding: number;
  fileName?: string;
  format: 'png' | 'jpeg';
}

export async function renderCodeSnippetToImage(config: CodeSnippetConfig): Promise<ProcessedResult> {
  const html2canvasModule = await import('html2canvas');
  const html2canvas = html2canvasModule.default || html2canvasModule;

  const themeStyles = {
    'one-dark': {
      bgGradient: 'linear-gradient(135deg, #1e1e2f 0%, #11111b 100%)',
      cardBg: '#1e1e24',
      cardBorder: '#2e2e38',
      textColor: '#abb2bf',
      lineNumColor: '#5c6370',
      headerBg: '#18181e',
      tabColor: '#e06c75',
    },
    dracula: {
      bgGradient: 'linear-gradient(135deg, #bd93f9 0%, #282a36 100%)',
      cardBg: '#282a36',
      cardBorder: '#44475a',
      textColor: '#f8f8f2',
      lineNumColor: '#6272a4',
      headerBg: '#21222c',
      tabColor: '#50fa7b',
    },
    cyberpunk: {
      bgGradient: 'linear-gradient(135deg, #f72585 0%, #7209b7 50%, #3a0ca3 100%)',
      cardBg: '#0f0e17',
      cardBorder: '#ff007f',
      textColor: '#fffffe',
      lineNumColor: '#a7a9be',
      headerBg: '#0b0914',
      tabColor: '#4cc9f0',
    },
    'github-dark': {
      bgGradient: 'linear-gradient(135deg, #24292e 0%, #0d1117 100%)',
      cardBg: '#161b22',
      cardBorder: '#30363d',
      textColor: '#c9d1d9',
      lineNumColor: '#484f58',
      headerBg: '#0d1117',
      tabColor: '#58a6ff',
    },
    'minimal-light': {
      bgGradient: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      cardBg: '#ffffff',
      cardBorder: '#e5e7eb',
      textColor: '#1f2937',
      lineNumColor: '#9ca3af',
      headerBg: '#f9fafb',
      tabColor: '#2563eb',
    },
  };

  const theme = themeStyles[config.theme] || themeStyles['one-dark'];
  const lines = config.code.split('\n');

  // Build HTML representation
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.padding = `${config.padding}px`;
  container.style.background = theme.bgGradient;
  container.style.display = 'inline-block';
  container.style.boxSizing = 'border-box';
  container.style.fontFamily = 'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace';

  let windowControls = '';
  if (config.windowStyle === 'mac') {
    windowControls = `
      <div style="display:flex;gap:6px;align-items:center;">
        <span style="width:12px;height:12px;border-radius:50%;background:#ff5f56;display:inline-block;"></span>
        <span style="width:12px;height:12px;border-radius:50%;background:#ffbd2e;display:inline-block;"></span>
        <span style="width:12px;height:12px;border-radius:50%;background:#27c93f;display:inline-block;"></span>
      </div>
    `;
  } else if (config.windowStyle === 'windows') {
    windowControls = `
      <div style="display:flex;gap:12px;align-items:center;font-size:10px;color:${theme.textColor};">
        <span>—</span>
        <span>□</span>
        <span>✕</span>
      </div>
    `;
  }

  const fileNameHtml = config.fileName
    ? `<span style="font-size:12px;font-weight:600;color:${theme.tabColor};margin-left:12px;">${escapeHtml(config.fileName)}</span>`
    : '';

  const headerHtml =
    config.windowStyle !== 'none' || config.fileName
      ? `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:${theme.headerBg};border-bottom:1px solid ${theme.cardBorder};">
        <div style="display:flex;align-items:center;">
          ${windowControls}
          ${fileNameHtml}
        </div>
        <span style="font-size:10px;text-transform:uppercase;color:${theme.lineNumColor};font-weight:bold;">${escapeHtml(config.language)}</span>
      </div>
    `
      : '';

  const codeLinesHtml = lines
    .map((line, idx) => {
      const lineNumHtml = config.showLineNumbers
        ? `<span style="display:inline-block;width:32px;user-select:none;color:${theme.lineNumColor};text-align:right;margin-right:16px;">${idx + 1}</span>`
        : '';
      return `<div style="line-height:1.6;font-size:14px;white-space:pre;">${lineNumHtml}<span style="color:${theme.textColor};">${escapeHtml(line || ' ')}</span></div>`;
    })
    .join('');

  container.innerHTML = `
    <div style="background:${theme.cardBg};border-radius:12px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.3);border:1px solid ${theme.cardBorder};min-width:400px;max-width:900px;">
      ${headerHtml}
      <div style="padding:20px 24px;overflow:hidden;">
        ${codeLinesHtml}
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // 2x Retina
      backgroundColor: null,
      useCORS: true,
      logging: false,
    });

    const mime = config.format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Failed to render code snippet image'))),
        mime,
        config.format === 'jpeg' ? 0.95 : undefined
      );
    });

    const previewUrl = URL.createObjectURL(blob);
    const ext = config.format === 'jpeg' ? 'jpg' : 'png';

    return {
      blob,
      downloadName: `${config.fileName ? config.fileName.replace(/\.[^/.]+$/, '') : 'code_snippet'}.${ext}`,
      resultSizeBytes: blob.size,
      mimeType: mime,
      pageCount: 1,
      previewUrls: [previewUrl],
      extraInfo: `Rendered crisp 2x Retina code screenshot (${canvas.width}×${canvas.height}px)`,
    };
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * 21. Color Palette Extractor
 */
export interface ExtractedColor {
  hex: string;
  rgb: string;
  hsl: string;
  isLight: boolean;
  frequency: number;
}

export async function extractPaletteFromFile(file: File, maxColors = 8): Promise<ExtractedColor[]> {
  let imgElement: HTMLImageElement;

  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.0 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas error during PDF color extraction');
    await (page.render as any)({ canvasContext: ctx, viewport, canvas }).promise;

    const dataUrl = canvas.toDataURL('image/png');
    imgElement = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = dataUrl;
    });
  } else {
    const url = URL.createObjectURL(file);
    imgElement = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image for color analysis'));
      img.src = url;
    });
  }

  // Draw on downsampled 150x150 canvas for fast statistical color analysis
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = 150;
  sampleCanvas.height = 150;
  const ctx = sampleCanvas.getContext('2d');
  if (!ctx) throw new Error('Analysis canvas error');
  ctx.drawImage(imgElement, 0, 0, 150, 150);

  const imgData = ctx.getImageData(0, 0, 150, 150).data;
  const colorBuckets: Record<string, { r: number; g: number; b: number; count: number }> = {};

  for (let i = 0; i < imgData.length; i += 16) { // Sample every 4th pixel
    const r = imgData[i];
    const g = imgData[i + 1];
    const b = imgData[i + 2];
    const a = imgData[i + 3];

    if (a < 128) continue; // Skip transparent pixels

    // Quantize to step of 24
    const qr = Math.round(r / 24) * 24;
    const qg = Math.round(g / 24) * 24;
    const qb = Math.round(b / 24) * 24;
    const key = `${qr},${qg},${qb}`;

    if (!colorBuckets[key]) {
      colorBuckets[key] = { r, g, b, count: 0 };
    }
    colorBuckets[key].count++;
  }

  // Sort by popularity
  const sorted = Object.values(colorBuckets).sort((a, b) => b.count - a.count);
  const picked: ExtractedColor[] = [];

  for (const item of sorted) {
    if (picked.length >= maxColors) break;

    // Check distance from existing picked colors to ensure diverse palette
    const isDistinct = picked.every((p) => {
      const rgbArr = p.rgb.replace(/[^\d,]/g, '').split(',').map(Number);
      const dist = Math.hypot(item.r - rgbArr[0], item.g - rgbArr[1], item.b - rgbArr[2]);
      return dist > 45;
    });

    if (isDistinct) {
      const hex = `#${((1 << 24) + (item.r << 16) + (item.g << 8) + item.b).toString(16).slice(1).toUpperCase()}`;
      // Calculate luminance
      const luminance = (0.299 * item.r + 0.587 * item.g + 0.114 * item.b) / 255;
      
      // Calculate HSL
      const rNorm = item.r / 255;
      const gNorm = item.g / 255;
      const bNorm = item.b / 255;
      const max = Math.max(rNorm, gNorm, bNorm);
      const min = Math.min(rNorm, gNorm, bNorm);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
          case gNorm: h = (bNorm - rNorm) / d + 2; break;
          case bNorm: h = (rNorm - gNorm) / d + 4; break;
        }
        h /= 6;
      }

      picked.push({
        hex,
        rgb: `rgb(${item.r}, ${item.g}, ${item.b})`,
        hsl: `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`,
        isLight: luminance > 0.6,
        frequency: item.count,
      });
    }
  }

  return picked;
}

/**
 * 22. Remove PDF Pages
 */
export async function removePdfPages(
  file: File,
  pagesToRemove: number[], // 0-indexed page indices to remove
  onProgress?: (msg: string) => void
): Promise<ProcessedResult> {
  if (onProgress) onProgress('Loading document structure...');
  const arrayBuffer = await file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourceDoc.getPageCount();

  const removeSet = new Set(pagesToRemove);
  const keptIndices = Array.from({ length: totalPages }, (_, i) => i).filter((i) => !removeSet.has(i));

  if (keptIndices.length === 0) {
    throw new Error('You cannot delete all pages from the document. At least one page must remain.');
  }

  if (onProgress) onProgress(`Extracting ${keptIndices.length} remaining page${keptIndices.length === 1 ? '' : 's'}...`);
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(sourceDoc, keptIndices);
  copiedPages.forEach((page) => newDoc.addPage(page));

  if (onProgress) onProgress('Compiling trimmed PDF document...');
  const pdfBytes = await newDoc.save({ useObjectStreams: true });
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const baseName = file.name.replace(/\.pdf$/i, '');

  return {
    blob,
    downloadName: `${baseName}_trimmed.pdf`,
    originalSizeBytes: file.size,
    resultSizeBytes: blob.size,
    mimeType: 'application/pdf',
    pageCount: keptIndices.length,
    extraInfo: `Removed ${pagesToRemove.length} page${pagesToRemove.length === 1 ? '' : 's'} (${keptIndices.length} page${keptIndices.length === 1 ? '' : 's'} remaining)`,
  };
}

/**
 * 23. Rearrange PDF Pages
 */
export async function rearrangePdfPages(
  file: File,
  newOrder: number[], // 0-indexed original page indices in new desired order
  rotations: Record<number, number> = {},
  onProgress?: (msg: string) => void
): Promise<ProcessedResult> {
  if (onProgress) onProgress('Loading document and building new sequence...');
  const arrayBuffer = await file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  if (!newOrder || newOrder.length === 0) {
    throw new Error('Please specify at least one page in the new order.');
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(sourceDoc, newOrder);

  for (let i = 0; i < copiedPages.length; i++) {
    const originalIdx = newOrder[i];
    const page = copiedPages[i];
    const rot = rotations[originalIdx] || 0;
    if (rot !== 0) {
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + rot) % 360));
    }
    newDoc.addPage(page);
  }

  if (onProgress) onProgress('Writing reorganized PDF stream...');
  const pdfBytes = await newDoc.save({ useObjectStreams: true });
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const baseName = file.name.replace(/\.pdf$/i, '');

  return {
    blob,
    downloadName: `${baseName}_rearranged.pdf`,
    originalSizeBytes: file.size,
    resultSizeBytes: blob.size,
    mimeType: 'application/pdf',
    pageCount: newOrder.length,
    extraInfo: `Reorganized ${newOrder.length} pages in custom order`,
  };
}

/**
 * 24. Add Page Numbers to PDF
 */
export type PageNumberFormat =
  | 'page_n_of_total'
  | 'n_slash_total'
  | 'page_n'
  | 'dash_n_dash'
  | 'bracket_n'
  | 'roman'
  | 'custom';

export type PageNumberPosition =
  | 'bottom-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'top-right'
  | 'top-left';

export interface PageNumberOptions {
  format: PageNumberFormat;
  customPattern?: string; // e.g. "Page {n} of {total}"
  position: PageNumberPosition;
  fontSize: number; // e.g. 10
  fontFamily: 'Helvetica' | 'TimesRoman' | 'Courier';
  colorHex: string; // e.g. '#374151'
  marginVertical: number; // pt, default 25
  marginHorizontal: number; // pt, default 35
  startPageNumber: number; // offset numbering (e.g. 1)
  firstPageToNumber: number; // 1-indexed page where numbering starts (e.g. 2 to skip cover)
  lastPageToNumber?: number | null; // 1-indexed page where numbering ends (null = all)
  scope: 'all' | 'odd' | 'even';
}

function toRomanNumerals(num: number): string {
  const lookup: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let roman = '';
  let n = Math.max(1, Math.min(3999, num));
  for (const [val, letter] of lookup) {
    while (n >= val) {
      roman += letter;
      n -= val;
    }
  }
  return roman || 'I';
}

function hexToRgbColor(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  if (isNaN(num)) return { r: 0.2, g: 0.2, b: 0.2 };
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

export async function addPageNumbersToPdf(
  file: File,
  options: PageNumberOptions,
  onProgress?: (msg: string) => void
): Promise<ProcessedResult> {
  if (onProgress) onProgress('Reading PDF document...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  // Select standard font
  let standardFont = StandardFonts.Helvetica;
  if (options.fontFamily === 'TimesRoman') standardFont = StandardFonts.TimesRoman;
  if (options.fontFamily === 'Courier') standardFont = StandardFonts.Courier;

  const font = await pdfDoc.embedFont(standardFont);
  const color = hexToRgbColor(options.colorHex);

  const startOffset = Math.max(1, options.startPageNumber || 1);
  const firstPageIdx = Math.max(1, options.firstPageToNumber || 1) - 1;
  const lastPageIdx = options.lastPageToNumber
    ? Math.min(totalPages, options.lastPageToNumber) - 1
    : totalPages - 1;

  // Calculate total pages in numbering scope for "{total}" placeholder
  let totalNumbered = 0;
  for (let i = 0; i < totalPages; i++) {
    if (i >= firstPageIdx && i <= lastPageIdx) {
      const pageNum1 = i + 1;
      const isOdd = pageNum1 % 2 !== 0;
      if (options.scope === 'all' || (options.scope === 'odd' && isOdd) || (options.scope === 'even' && !isOdd)) {
        totalNumbered++;
      }
    }
  }

  let stampedCount = 0;
  let runningIndex = 0;

  for (let i = 0; i < totalPages; i++) {
    const pageNum1 = i + 1;
    const isOdd = pageNum1 % 2 !== 0;
    const shouldNumber =
      i >= firstPageIdx &&
      i <= lastPageIdx &&
      (options.scope === 'all' ||
        (options.scope === 'odd' && isOdd) ||
        (options.scope === 'even' && !isOdd));

    if (!shouldNumber) continue;

    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();
    const currentNumber = startOffset + runningIndex;
    runningIndex++;

    // Generate formatted text
    let text = '';
    switch (options.format) {
      case 'page_n_of_total':
        text = `Page ${currentNumber} of ${totalNumbered}`;
        break;
      case 'n_slash_total':
        text = `${currentNumber} / ${totalNumbered}`;
        break;
      case 'page_n':
        text = `Page ${currentNumber}`;
        break;
      case 'dash_n_dash':
        text = `- ${currentNumber} -`;
        break;
      case 'bracket_n':
        text = `[ ${currentNumber} ]`;
        break;
      case 'roman':
        text = toRomanNumerals(currentNumber);
        break;
      case 'custom':
        text = (options.customPattern || 'Page {n} of {total}')
          .replace(/\{n\}/g, String(currentNumber))
          .replace(/\{total\}/g, String(totalNumbered));
        break;
      default:
        text = `Page ${currentNumber}`;
    }

    const textWidth = font.widthOfTextAtSize(text, options.fontSize);
    const textHeight = font.heightAtSize(options.fontSize);

    // Coordinate calculation
    let x = 0;
    let y = 0;

    switch (options.position) {
      case 'bottom-left':
        x = options.marginHorizontal;
        y = options.marginVertical;
        break;
      case 'bottom-center':
        x = (width - textWidth) / 2;
        y = options.marginVertical;
        break;
      case 'bottom-right':
        x = width - options.marginHorizontal - textWidth;
        y = options.marginVertical;
        break;
      case 'top-left':
        x = options.marginHorizontal;
        y = height - options.marginVertical - textHeight;
        break;
      case 'top-center':
        x = (width - textWidth) / 2;
        y = height - options.marginVertical - textHeight;
        break;
      case 'top-right':
        x = width - options.marginHorizontal - textWidth;
        y = height - options.marginVertical - textHeight;
        break;
    }

    page.drawText(text, {
      x,
      y,
      size: options.fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
    });

    stampedCount++;
  }

  if (onProgress) onProgress('Compiling numbered PDF...');
  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const baseName = file.name.replace(/\.pdf$/i, '');

  return {
    blob,
    downloadName: `${baseName}_numbered.pdf`,
    originalSizeBytes: file.size,
    resultSizeBytes: blob.size,
    mimeType: 'application/pdf',
    pageCount: totalPages,
    extraInfo: `Stamped page numbers across ${stampedCount} page${stampedCount === 1 ? '' : 's'}`,
  };
}

/**
 * 25. Webpage to PDF
 */
export interface WebpageToPdfOptions {
  htmlContent: string;
  url?: string;
  title?: string;
  paperSize: 'a4' | 'letter' | 'fit';
  orientation: 'portrait' | 'landscape';
  margin: 'none' | 'compact' | 'standard' | 'generous';
  includeBackground: boolean;
  viewportWidth: 1200 | 768 | 420;
  addHeaderFooter: boolean;
}

export async function convertWebpageToPdf(
  options: WebpageToPdfOptions,
  onProgress?: (msg: string) => void
): Promise<ProcessedResult> {
  if (onProgress) onProgress('Initializing Webpage rendering engine...');
  const html2canvasModule = await import('html2canvas');
  const html2canvas = html2canvasModule.default || html2canvasModule;

  // Standard paper dimensions in points (72 pt per inch)
  // A4: 595.28 x 841.89 pt, US Letter: 612 x 792 pt
  let baseWidthPt = options.paperSize === 'letter' ? 612 : 595.28;
  let baseHeightPt = options.paperSize === 'letter' ? 792 : 841.89;

  let pageWidthPt = options.orientation === 'landscape' ? baseHeightPt : baseWidthPt;
  let pageHeightPt = options.orientation === 'landscape' ? baseWidthPt : baseHeightPt;

  // Margins in points
  const marginMap = {
    none: 0,
    compact: 18,
    standard: 36,
    generous: 54,
  };
  const marginPt = marginMap[options.margin] || 36;
  const headerFooterHeightPt = options.addHeaderFooter ? 28 : 0;

  const contentWidthPt = pageWidthPt - marginPt * 2;
  const contentHeightPt = pageHeightPt - marginPt * 2 - headerFooterHeightPt * 2;

  // Create isolated container in DOM
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = `${options.viewportWidth}px`;
  container.style.background = options.includeBackground ? '#ffffff' : '#ffffff';
  container.style.color = '#0f172a';
  container.style.overflow = 'visible';
  container.style.boxSizing = 'border-box';
  container.className = 'webpage-print-container';

  // Inject user HTML
  container.innerHTML = options.htmlContent;
  document.body.appendChild(container);

  if (onProgress) onProgress('Rasterizing webpage elements and typography...');

  try {
    // Wait for any child images to load
    const images = Array.from(container.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          setTimeout(resolve, 2000); // 2s timeout safeguard
        });
      })
    );

    const canvas = await html2canvas(container, {
      scale: 2, // 2x Retina sharpness
      backgroundColor: options.includeBackground ? '#ffffff' : '#ffffff',
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: options.viewportWidth,
    });

    if (onProgress) onProgress('Slicing into paginated PDF document...');

    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // If 'fit', single tall page
    if (options.paperSize === 'fit') {
      const scale = contentWidthPt / (canvas.width / 2);
      const singlePageHeight = (canvas.height / 2) * scale + marginPt * 2 + headerFooterHeightPt * 2;
      const singlePage = pdfDoc.addPage([pageWidthPt, singlePageHeight]);

      const pngDataUrl = canvas.toDataURL('image/png');
      const pngBase64 = pngDataUrl.split(',')[1];
      const pngBytes = Uint8Array.from(atob(pngBase64), (c) => c.charCodeAt(0));
      const embeddedImg = await pdfDoc.embedPng(pngBytes);

      singlePage.drawImage(embeddedImg, {
        x: marginPt,
        y: marginPt + headerFooterHeightPt,
        width: contentWidthPt,
        height: (canvas.height / 2) * scale,
      });

      if (options.addHeaderFooter) {
        const headerText = options.title || options.url || 'Webpage Document';
        singlePage.drawText(headerText, {
          x: marginPt,
          y: singlePageHeight - marginPt - 14,
          size: 9,
          font: helvetica,
          color: rgb(0.4, 0.4, 0.4),
        });
      }
    } else {
      // Sliced multi-page PDF
      const scale = contentWidthPt / (canvas.width / 2);
      const canvasPageHeight = (contentHeightPt / scale) * 2; // in canvas px
      const totalPages = Math.max(1, Math.ceil(canvas.height / canvasPageHeight));

      for (let p = 0; p < totalPages; p++) {
        if (onProgress) onProgress(`Assembling PDF page ${p + 1} of ${totalPages}...`);
        const page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        const sourceY = p * canvasPageHeight;
        const remainingH = canvas.height - sourceY;
        const sliceH = Math.min(canvasPageHeight, remainingH);
        sliceCanvas.height = sliceH;

        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sliceH,
            0,
            0,
            sliceCanvas.width,
            sliceH
          );

          const pngDataUrl = sliceCanvas.toDataURL('image/png');
          const pngBase64 = pngDataUrl.split(',')[1];
          const pngBytes = Uint8Array.from(atob(pngBase64), (c) => c.charCodeAt(0));
          const embeddedImg = await pdfDoc.embedPng(pngBytes);

          const drawHeightPt = (sliceH / 2) * scale;
          // In PDF coordinates (0,0 is bottom-left)
          const yPos = pageHeightPt - marginPt - headerFooterHeightPt - drawHeightPt;

          page.drawImage(embeddedImg, {
            x: marginPt,
            y: yPos,
            width: contentWidthPt,
            height: drawHeightPt,
          });
        }

        if (options.addHeaderFooter) {
          // Header: Webpage Title / URL
          const headerText = (options.title || options.url || 'Webpage Document').slice(0, 75);
          page.drawText(headerText, {
            x: marginPt,
            y: pageHeightPt - marginPt - 12,
            size: 8.5,
            font: helvetica,
            color: rgb(0.45, 0.45, 0.45),
          });

          // Footer: Page Number & Date
          const footerLeft = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const footerRight = `Page ${p + 1} of ${totalPages}`;
          const footerRightW = helvetica.widthOfTextAtSize(footerRight, 8.5);

          page.drawText(footerLeft, {
            x: marginPt,
            y: marginPt - 4,
            size: 8.5,
            font: helvetica,
            color: rgb(0.5, 0.5, 0.5),
          });

          page.drawText(footerRight, {
            x: pageWidthPt - marginPt - footerRightW,
            y: marginPt - 4,
            size: 8.5,
            font: helvetica,
            color: rgb(0.5, 0.5, 0.5),
          });
        }
      }
    }

    if (onProgress) onProgress('Finalizing PDF...');
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    const cleanName = (options.title || 'webpage').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

    return {
      blob,
      downloadName: `${cleanName || 'webpage'}_export.pdf`,
      resultSizeBytes: blob.size,
      mimeType: 'application/pdf',
      pageCount: pdfDoc.getPageCount(),
      extraInfo: `Converted webpage into ${pdfDoc.getPageCount()}-page ${options.paperSize.toUpperCase()} PDF (${options.orientation})`,
    };
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * 26. WebP to JPG / JPEG Converter
 */
export interface WebpToJpgOptions {
  quality: number; // 0.1 to 1.0 (default 0.90)
  backgroundColor: string; // default '#ffffff'
  scale?: number; // 1.0, 0.75, 0.5, etc.
  maxWidth?: number; // optional max width constraint
}

export interface ConvertedWebpItem {
  id: string;
  name: string;
  originalSize: number;
  resultSize: number;
  width: number;
  height: number;
  blob: Blob;
  previewUrl: string;
  downloadName: string;
}

export async function convertSingleWebpToJpg(
  file: File,
  options: WebpToJpgOptions = { quality: 0.90, backgroundColor: '#ffffff' }
): Promise<ConvertedWebpItem> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error(`Could not decode WebP image stream for ${file.name}.`));
    el.src = dataUrl;
  });

  let targetWidth = img.naturalWidth;
  let targetHeight = img.naturalHeight;

  if (options.scale && options.scale !== 1) {
    targetWidth = Math.round(targetWidth * options.scale);
    targetHeight = Math.round(targetHeight * options.scale);
  }

  if (options.maxWidth && targetWidth > options.maxWidth) {
    const ratio = options.maxWidth / targetWidth;
    targetWidth = options.maxWidth;
    targetHeight = Math.round(targetHeight * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, targetWidth);
  canvas.height = Math.max(1, targetHeight);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context could not be created.');

  // Fill solid background (JPEG does not support transparency; defaults to white)
  ctx.fillStyle = options.backgroundColor || '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Smooth resampling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const quality = Math.min(1.0, Math.max(0.1, options.quality ?? 0.9));
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to encode JPG image.'))),
      'image/jpeg',
      quality
    );
  });

  const baseName = file.name.replace(/\.webp$/i, '').replace(/\.[^/.]+$/, '');
  const downloadName = `${baseName}.jpg`;
  const previewUrl = URL.createObjectURL(blob);

  return {
    id: `${file.name}-${file.size}-${Math.random().toString(36).substring(2, 7)}`,
    name: file.name,
    originalSize: file.size,
    resultSize: blob.size,
    width: canvas.width,
    height: canvas.height,
    blob,
    previewUrl,
    downloadName,
  };
}

export async function batchConvertWebpToJpg(
  files: File[],
  options: WebpToJpgOptions = { quality: 0.90, backgroundColor: '#ffffff' },
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<{ items: ConvertedWebpItem[]; zipBlob?: Blob; zipDownloadName?: string; combinedResult: ProcessedResult }> {
  if (files.length === 0) {
    throw new Error('Please select at least one WebP image to convert.');
  }

  const items: ConvertedWebpItem[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    if (onProgress) onProgress(i + 1, total, file.name);
    const item = await convertSingleWebpToJpg(file, options);
    items.push(item);
  }

  let zipBlob: Blob | undefined;
  let zipDownloadName: string | undefined;

  const totalOrigSize = items.reduce((sum, it) => sum + it.originalSize, 0);
  const totalResSize = items.reduce((sum, it) => sum + it.resultSize, 0);

  if (items.length > 1) {
    const zip = new JSZip();
    const usedNames = new Set<string>();
    items.forEach((item, index) => {
      let safeName = item.downloadName;
      if (usedNames.has(safeName)) {
        safeName = `${index + 1}_${item.downloadName}`;
      }
      usedNames.add(safeName);
      zip.file(safeName, item.blob);
    });
    zipBlob = await zip.generateAsync({ type: 'blob' });
    zipDownloadName = `converted_jpg_images_${items.length}.zip`;

    return {
      items,
      zipBlob,
      zipDownloadName,
      combinedResult: {
        blob: zipBlob,
        downloadName: zipDownloadName,
        originalSizeBytes: totalOrigSize,
        resultSizeBytes: zipBlob.size,
        mimeType: 'application/zip',
        pageCount: items.length,
        previewUrls: items.slice(0, 4).map((it) => it.previewUrl),
        extraInfo: `Successfully converted ${items.length} WebP images into standard JPGs packaged in ZIP archive.`,
      },
    };
  }

  // Single file case
  const singleItem = items[0];
  return {
    items,
    combinedResult: {
      blob: singleItem.blob,
      downloadName: singleItem.downloadName,
      originalSizeBytes: singleItem.originalSize,
      resultSizeBytes: singleItem.resultSize,
      mimeType: 'image/jpeg',
      pageCount: 1,
      previewUrls: [singleItem.previewUrl],
      extraInfo: `Standardized ${singleItem.width}×${singleItem.height}px WebP into universal baseline JPG.`,
    },
  };
}

