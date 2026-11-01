import React, { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { imagesToPdf, formatBytes } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { Image as ImageIcon, ArrowUp, ArrowDown, Trash2, Plus, FileCheck } from 'lucide-react';

interface ImageItem {
  file: File;
  previewUrl: string;
}

export const JpgToPdfTool: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'fit' | 'a4' | 'letter'>('fit');
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [margin, setMargin] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Generating PDF...');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    setError(null);
    const newItems: ImageItem[] = files.map((file) => ({
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
      setError('Please select at least one image to convert.');
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
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Convert More Images" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Embedding high-resolution images into PDF structure" />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      {images.length === 0 ? (
        <FileUploader
          accept=".jpg,.jpeg,.png,.webp"
          multiple={true}
          maxFiles={30}
          maxFileSizeMB={50}
          onFilesSelected={handleFilesSelected}
          title="Select or Drop Images to Convert to PDF"
          subtitle="Supports JPG, JPEG, PNG, and WebP formats"
        />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 font-sans">
                {images.length} Image{images.length === 1 ? '' : 's'} Selected
              </h3>
              <p className="text-xs text-neutral-500">
                Total size: {formatBytes(images.reduce((acc, img) => acc + img.file.size, 0))} &bull; Drag or use controls to reorder
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors border border-neutral-200">
                <Plus className="w-3.5 h-3.5" />
                <span>Add More</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                    e.target.value = '';
                  }}
                />
              </label>

              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-red-600 rounded-lg transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Layout Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
            {/* Page Size */}
            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">Page Dimension:</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-medium focus:ring-1 focus:ring-neutral-900"
              >
                <option value="fit">Fit to Image Aspect Ratio</option>
                <option value="a4">Standard A4 (210 x 297 mm)</option>
                <option value="letter">US Letter (8.5 x 11 in)</option>
              </select>
            </div>

            {/* Orientation */}
            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">Orientation:</label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as any)}
                className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-medium focus:ring-1 focus:ring-neutral-900"
              >
                <option value="auto">Auto-detect per image</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            {/* Margins */}
            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">Page Margin:</label>
              <select
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-medium focus:ring-1 focus:ring-neutral-900"
              >
                <option value={0}>No Margin (Edge-to-edge)</option>
                <option value={20}>Small Margin (20 pt)</option>
                <option value={40}>Large Margin (40 pt)</option>
              </select>
            </div>
          </div>

          {/* Visual Images Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative bg-neutral-100 rounded-xl border border-neutral-200 overflow-hidden group flex flex-col shadow-xs"
              >
                <div className="aspect-3/4 w-full bg-neutral-200 flex items-center justify-center overflow-hidden">
                  <img
                    src={img.previewUrl}
                    alt={img.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-2 bg-white flex items-center justify-between gap-1 border-t border-neutral-200 text-xs">
                  <span className="font-mono text-neutral-500 font-bold">#{idx + 1}</span>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      title="Move backward"
                      className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-20 rounded"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === images.length - 1}
                      title="Move forward"
                      className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-20 rounded"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeImage(idx)}
                      title="Delete image"
                      className="p-1 text-neutral-400 hover:text-red-600 rounded ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              {images.length} image{images.length === 1 ? '' : 's'} will be compiled into 1 PDF
            </span>

            <button
              onClick={handleConvert}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <FileCheck className="w-4 h-4" />
              <span>Convert to PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
