import React, { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { imagesToPdf, formatBytes } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { ArrowUp, ArrowDown, Trash2, Plus, FileCheck, Layers } from 'lucide-react';

interface PngItem {
  file: File;
  previewUrl: string;
}

export const PngToPdfTool: React.FC = () => {
  const [images, setImages] = useState<PngItem[]>([]);
  const [pageSize, setPageSize] = useState<'fit' | 'a4' | 'letter'>('fit');
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [margin, setMargin] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Converting PNG to PDF...');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    setError(null);
    const validFiles = files.filter(
      (f) => f.type === 'image/png' || f.name.toLowerCase().endsWith('.png')
    );
    if (validFiles.length === 0) {
      setError('Please select valid PNG image files.');
      return;
    }
    const newItems: PngItem[] = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newItems]);
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(images[idx].previewUrl);
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx - 1];
      copy[idx - 1] = temp;
      return copy;
    });
  };

  const moveDown = (idx: number) => {
    if (idx === images.length - 1) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx + 1];
      copy[idx + 1] = temp;
      return copy;
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      setError('Please select at least one PNG file.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const items = images.map((img) => ({
        file: img.file,
        orientation,
        margin,
      }));

      const res = await imagesToPdf(items, pageSize, (msg) => setProgressMsg(msg));
      res.downloadName = images.length === 1 
        ? `${images[0].file.name.replace(/\.png$/i, '')}.pdf`
        : 'compiled_png_documents.pdf';
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setResult(null);
    setError(null);
  };

  if (result) {
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Convert More PNGs" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Assembling transparent & vector PNG graphics into PDF" />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {images.length === 0 ? (
        <FileUploader
          acceptedFiles=".png"
          maxFiles={50}
          maxSizeMB={50}
          onFilesSelected={handleFilesSelected}
          descriptionText="Select or drag and drop PNG images. Transparency and high resolution are preserved."
        />
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-sm font-semibold text-neutral-900">
                  {images.length} PNG {images.length > 1 ? 'Images' : 'Image'} Selected
                </span>
                <p className="text-xs text-neutral-500">
                  Total weight: {formatBytes(images.reduce((acc, curr) => acc + curr.file.size, 0))}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold px-3 py-2 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 cursor-pointer flex items-center gap-1.5 transition-colors">
                  <Plus className="w-3.5 h-3.5 text-neutral-600" />
                  Add More PNGs
                  <input
                    type="file"
                    accept=".png"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Layout Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-neutral-200/60">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Page Sizing
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                >
                  <option value="fit">Fit to Image Size</option>
                  <option value="a4">Standard A4 (595 × 842 pt)</option>
                  <option value="letter">US Letter (612 × 792 pt)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Page Orientation
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  disabled={pageSize === 'fit'}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-800 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                >
                  <option value="auto">Auto (Match Image Ratio)</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Page Margin
                </label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  disabled={pageSize === 'fit'}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-800 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                >
                  <option value={0}>No Margin (Edge-to-Edge)</option>
                  <option value={15}>Small (15 pt)</option>
                  <option value={30}>Standard (30 pt)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image Grid with Reorder */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto p-1">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="group relative bg-white border border-neutral-200 rounded-xl p-2 shadow-xs hover:border-neutral-400 transition-all flex flex-col"
              >
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px] bg-neutral-100 flex items-center justify-center border border-neutral-100">
                  <img
                    src={img.previewUrl}
                    alt={img.file.name}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-neutral-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-1.5 py-0.5 rounded-md">
                    #{idx + 1}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs">
                  <p className="truncate text-[11px] font-medium text-neutral-700 max-w-[100px]" title={img.file.name}>
                    {img.file.name}
                  </p>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {formatBytes(img.file.size)}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-900 disabled:opacity-20 hover:bg-neutral-100 transition-colors"
                      title="Move earlier"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(idx)}
                      disabled={idx === images.length - 1}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-900 disabled:opacity-20 hover:bg-neutral-100 transition-colors"
                      title="Move later"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleConvert}
              className="px-6 py-2.5 bg-neutral-950 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Convert {images.length} PNG{images.length > 1 ? 's' : ''} to PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
