import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { formatBytes } from '../../services/pdfEngine';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Lock,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Eye,
  Trash2,
  RefreshCw,
} from 'lucide-react';

// Configure matching worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    pdfjsWorker || `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface PdfFilePreviewProps {
  file: File;
  onRemove?: () => void;
  onChangeFile?: () => void;
  variant?: 'card' | 'compact' | 'mini';
  className?: string;
  initialPage?: number;
  showPageNavigation?: boolean;
}

interface PdfMetadata {
  numPages: number;
  pageWidth: number;
  pageHeight: number;
  isEncrypted: boolean;
  paperType: string;
}

export const PdfFilePreview: React.FC<PdfFilePreviewProps> = ({
  file,
  onRemove,
  onChangeFile,
  variant = 'card',
  className = '',
  initialPage = 1,
  showPageNavigation = true,
}) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [metadata, setMetadata] = useState<PdfMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalZoom, setModalZoom] = useState<number>(1.2);
  const [modalPage, setModalPage] = useState<number>(1);
  const [modalThumbnailUrl, setModalThumbnailUrl] = useState<string | null>(null);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);

  // Keep reference to PDF document in memory
  const pdfDocRef = useRef<any>(null);
  const arrayBufferRef = useRef<ArrayBuffer | null>(null);

  /**
   * Use FileReader to read uploaded File into an ArrayBuffer and parse with PDF.js
   */
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);
    setThumbnailUrl(null);
    setMetadata(null);

    // Explicitly using the browser's FileReader API as requested
    const fileReader = new FileReader();

    fileReader.onload = async (event) => {
      if (isCancelled) return;
      try {
        const buffer = event.target?.result as ArrayBuffer;
        if (!buffer || buffer.byteLength === 0) {
          throw new Error('Selected file buffer is empty.');
        }

        arrayBufferRef.current = buffer;

        // Load document through PDF.js
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(buffer),
          cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/',
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        if (isCancelled) return;

        pdfDocRef.current = pdf;

        // Extract metadata
        const firstPage = await pdf.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1 });
        const width = Math.round(viewport.width);
        const height = Math.round(viewport.height);

        let paperType = `${width} × ${height} pt`;
        if (Math.abs(width - 595) < 5 && Math.abs(height - 842) < 5) paperType = 'A4 (Portrait)';
        else if (Math.abs(width - 842) < 5 && Math.abs(height - 595) < 5) paperType = 'A4 (Landscape)';
        else if (Math.abs(width - 612) < 5 && Math.abs(height - 792) < 5) paperType = 'US Letter';

        setMetadata({
          numPages: pdf.numPages,
          pageWidth: width,
          pageHeight: height,
          isEncrypted: false,
          paperType,
        });

        // Render initial thumbnail
        await renderPageThumbnail(pdf, currentPage, 0.75, (url) => {
          if (!isCancelled) {
            setThumbnailUrl(url);
            setIsLoading(false);
          }
        });
      } catch (err: unknown) {
        if (isCancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('Password') || msg.includes('encrypted')) {
          setMetadata({
            numPages: 1,
            pageWidth: 0,
            pageHeight: 0,
            isEncrypted: true,
            paperType: 'Encrypted Document',
          });
          setError('This document is password protected.');
        } else {
          setError(`Unable to preview PDF: ${msg}`);
        }
        setIsLoading(false);
      }
    };

    fileReader.onerror = () => {
      if (!isCancelled) {
        setError('FileReader encountered an error reading the file stream.');
        setIsLoading(false);
      }
    };

    // Read the File using standard FileReader
    fileReader.readAsArrayBuffer(file);

    return () => {
      isCancelled = true;
      if (fileReader.readyState === FileReader.LOADING) {
        fileReader.abort();
      }
    };
  }, [file]);

  /**
   * Helper to render a page to Data URL
   */
  const renderPageThumbnail = async (
    pdf: any,
    pageNum: number,
    scale: number,
    onComplete: (url: string) => void
  ) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Fill crisp white backing
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await (page.render as any)({
        canvasContext: ctx,
        viewport,
      }).promise;

      onComplete(canvas.toDataURL('image/jpeg', 0.85));
    } catch (err) {
      console.warn('Page thumbnail render failed:', err);
    }
  };

  /**
   * Change displayed thumbnail page
   */
  const handlePageChange = async (newPage: number) => {
    if (!pdfDocRef.current || !metadata) return;
    if (newPage < 1 || newPage > metadata.numPages) return;

    setCurrentPage(newPage);
    setIsLoading(true);
    await renderPageThumbnail(pdfDocRef.current, newPage, 0.75, (url) => {
      setThumbnailUrl(url);
      setIsLoading(false);
    });
  };

  /**
   * Open high-resolution inspect modal
   */
  const openModal = async (pageToOpen = currentPage) => {
    setModalPage(pageToOpen);
    setIsModalOpen(true);
    setModalZoom(1.2);
    if (pdfDocRef.current) {
      setIsModalLoading(true);
      await renderPageThumbnail(pdfDocRef.current, pageToOpen, 1.5, (url) => {
        setModalThumbnailUrl(url);
        setIsModalLoading(false);
      });
    }
  };

  const handleModalPageChange = async (newPage: number) => {
    if (!pdfDocRef.current || !metadata) return;
    if (newPage < 1 || newPage > metadata.numPages) return;

    setModalPage(newPage);
    setIsModalLoading(true);
    await renderPageThumbnail(pdfDocRef.current, newPage, modalZoom * 1.2, (url) => {
      setModalThumbnailUrl(url);
      setIsModalLoading(false);
    });
  };

  const handleZoomChange = async (delta: number) => {
    const nextZoom = Math.min(Math.max(modalZoom + delta, 0.6), 2.5);
    setModalZoom(nextZoom);
    if (pdfDocRef.current) {
      setIsModalLoading(true);
      await renderPageThumbnail(pdfDocRef.current, modalPage, nextZoom * 1.2, (url) => {
        setModalThumbnailUrl(url);
        setIsModalLoading(false);
      });
    }
  };

  // ----------------------------------------------------
  // VARIANT: MINI
  // ----------------------------------------------------
  if (variant === 'mini') {
    return (
      <div className={`relative group inline-block ${className}`}>
        <div className="w-12 h-16 rounded border border-neutral-200 bg-white overflow-hidden shadow-xs flex items-center justify-center">
          {isLoading ? (
            <div className="w-full h-full bg-neutral-100 animate-pulse flex items-center justify-center">
              <FileText className="w-4 h-4 text-neutral-400" />
            </div>
          ) : thumbnailUrl ? (
            <img src={thumbnailUrl} alt={file.name} className="w-full h-full object-cover" />
          ) : (
            <FileText className="w-5 h-5 text-neutral-400" />
          )}
        </div>
        {thumbnailUrl && (
          <button
            type="button"
            onClick={() => openModal()}
            className="absolute inset-0 bg-neutral-900/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded"
            title="Inspect preview"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // VARIANT: COMPACT (Row in List)
  // ----------------------------------------------------
  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center justify-between gap-3 p-2.5 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-200 transition-colors ${className}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Thumbnail preview thumbnail */}
          <div
            onClick={() => thumbnailUrl && openModal()}
            className="relative w-10 h-14 rounded-md border border-neutral-200/80 bg-neutral-100 overflow-hidden shrink-0 shadow-2xs cursor-pointer group"
          >
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center animate-pulse bg-neutral-100">
                <FileText className="w-4 h-4 text-neutral-300" />
              </div>
            ) : thumbnailUrl ? (
              <>
                <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Eye className="w-3.5 h-3.5" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400">
                <FileText className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Name & stats */}
          <div className="min-w-0 text-left">
            <p className="text-xs font-semibold text-neutral-900 truncate" title={file.name}>
              {file.name}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono mt-0.5">
              <span>{formatBytes(file.size)}</span>
              {metadata && (
                <>
                  <span>&bull;</span>
                  <span>{metadata.numPages} {metadata.numPages === 1 ? 'page' : 'pages'}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {thumbnailUrl && (
            <button
              type="button"
              onClick={() => openModal()}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Inspect thumbnail"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove file"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Modal Lightbox */}
        {renderModal()}
      </div>
    );
  }

  // ----------------------------------------------------
  // VARIANT: CARD (Default full preview card)
  // ----------------------------------------------------
  return (
    <div
      className={`p-4 bg-neutral-50 rounded-2xl border border-neutral-200/90 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* PDF Thumbnail Canvas/Image Preview Box */}
        <div className="relative group shrink-0 mx-auto sm:mx-0">
          <div
            onClick={() => thumbnailUrl && openModal()}
            className="w-24 h-32 sm:w-28 sm:h-36 rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm flex items-center justify-center cursor-pointer transition-transform group-hover:scale-[1.02]"
          >
            {isLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-neutral-100/80 animate-pulse text-neutral-400">
                <FileText className="w-6 h-6 animate-bounce" />
                <span className="text-[10px] font-mono font-medium">Reading...</span>
              </div>
            ) : thumbnailUrl ? (
              <div className="relative w-full h-full">
                <img
                  src={thumbnailUrl}
                  alt={`Page ${currentPage}`}
                  className="w-full h-full object-cover object-top"
                />
                {/* Hover overlay with inspect icon */}
                <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 backdrop-blur-2xs">
                  <Maximize2 className="w-4 h-4" />
                  <span className="text-[10px] font-medium">Click to inspect</span>
                </div>
              </div>
            ) : error ? (
              <div className="w-full h-full p-2 flex flex-col items-center justify-center text-center bg-red-50 text-red-600 gap-1">
                {metadata?.isEncrypted ? (
                  <Lock className="w-5 h-5 text-amber-600" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
                <span className="text-[9px] font-medium leading-tight">
                  {metadata?.isEncrypted ? 'Password Protected' : 'No Preview'}
                </span>
              </div>
            ) : (
              <FileText className="w-8 h-8 text-neutral-300" />
            )}
          </div>

          {/* Page badge */}
          {metadata && metadata.numPages > 0 && !error && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-neutral-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-full shadow-xs pointer-events-none">
              Pg {currentPage} of {metadata.numPages}
            </div>
          )}
        </div>

        {/* File Metadata & Interactive Controls */}
        <div className="flex-1 min-w-0 space-y-2 text-left w-full">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                {error ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                    <Lock className="w-3 h-3" /> Encrypted / Restricted
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified PDF
                  </span>
                )}
                <span className="text-[10px] text-neutral-400 font-mono">
                  FileReader Memory Stream
                </span>
              </div>

              <h4
                className="text-sm sm:text-base font-bold text-neutral-900 truncate"
                title={file.name}
              >
                {file.name}
              </h4>
            </div>

            {/* Change file or remove */}
            <div className="flex items-center gap-2 shrink-0">
              {onChangeFile && (
                <button
                  type="button"
                  onClick={onChangeFile}
                  className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Change File
                </button>
              )}
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                  title="Remove document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Stats Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            <div className="p-2 rounded-lg bg-white border border-neutral-200/80">
              <span className="block text-[10px] uppercase font-semibold text-neutral-400">
                File Weight
              </span>
              <span className="text-xs font-bold text-neutral-800 font-mono">
                {formatBytes(file.size)}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-neutral-200/80">
              <span className="block text-[10px] uppercase font-semibold text-neutral-400">
                Total Pages
              </span>
              <span className="text-xs font-bold text-neutral-800 font-mono">
                {metadata ? `${metadata.numPages} ${metadata.numPages === 1 ? 'Page' : 'Pages'}` : '—'}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-neutral-200/80 col-span-2 sm:col-span-1">
              <span className="block text-[10px] uppercase font-semibold text-neutral-400">
                Dimensions
              </span>
              <span className="text-xs font-bold text-neutral-800 truncate block font-mono">
                {metadata?.paperType || 'Standard'}
              </span>
            </div>
          </div>

          {/* Multi-page Navigation Stepper (Flip through pages before processing) */}
          {showPageNavigation && metadata && metadata.numPages > 1 && !error && (
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200/70">
              <div className="flex items-center gap-1 text-xs text-neutral-600 font-medium">
                <Eye className="w-3.5 h-3.5 text-neutral-400" />
                <span>Preview Page:</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                  className="p-1 rounded-md bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Previous page thumbnail"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-white border border-neutral-200 rounded-md text-neutral-800">
                  {currentPage} / {metadata.numPages}
                </span>

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= metadata.numPages || isLoading}
                  className="p-1 rounded-md bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Next page thumbnail"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => openModal(currentPage)}
                  className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-200 hover:border-neutral-300 rounded-md text-xs font-semibold text-neutral-700 hover:text-neutral-950 transition-colors shadow-2xs cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3 text-neutral-500" />
                  Inspect
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Lightbox */}
      {renderModal()}
    </div>
  );

  /**
   * High-Resolution Inspection Modal
   */
  function renderModal() {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-neutral-200 flex items-center justify-center text-neutral-700 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-neutral-900 truncate max-w-sm sm:max-w-md">
                  {file.name}
                </h3>
                <p className="text-[11px] text-neutral-500 font-mono">
                  {formatBytes(file.size)} &bull; {metadata?.paperType}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <div className="hidden sm:flex items-center bg-white border border-neutral-200 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => handleZoomChange(-0.2)}
                  disabled={modalZoom <= 0.6 || isModalLoading}
                  className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 rounded hover:bg-neutral-100"
                  title="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono px-2 text-neutral-600 font-semibold">
                  {Math.round(modalZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => handleZoomChange(0.2)}
                  disabled={modalZoom >= 2.4 || isModalLoading}
                  className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 rounded hover:bg-neutral-100"
                  title="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                title="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body: Rendered Page Canvas View */}
          <div className="flex-1 overflow-auto p-6 bg-neutral-100/80 flex items-center justify-center min-h-[380px]">
            {isModalLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 text-neutral-500">
                <RefreshCw className="w-7 h-7 animate-spin text-neutral-600" />
                <span className="text-xs font-medium">Rendering high-resolution page...</span>
              </div>
            ) : modalThumbnailUrl ? (
              <div
                className="bg-white shadow-xl rounded-lg border border-neutral-300 overflow-hidden transition-all duration-150"
                style={{
                  transform: `scale(${modalZoom})`,
                  transformOrigin: 'center center',
                }}
              >
                <img
                  src={modalThumbnailUrl}
                  alt={`Page ${modalPage}`}
                  className="max-h-[65vh] w-auto object-contain block"
                />
              </div>
            ) : (
              <div className="text-neutral-400 text-xs">Preview unavailable</div>
            )}
          </div>

          {/* Footer Controls */}
          {metadata && metadata.numPages > 1 && (
            <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleModalPageChange(modalPage - 1)}
                disabled={modalPage <= 1 || isModalLoading}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous Page
              </button>

              <div className="text-xs font-mono font-semibold text-neutral-700">
                Page {modalPage} of {metadata.numPages}
              </div>

              <button
                type="button"
                onClick={() => handleModalPageChange(modalPage + 1)}
                disabled={modalPage >= metadata.numPages || isModalLoading}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 flex items-center gap-1 transition-colors"
              >
                Next Page
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
};
