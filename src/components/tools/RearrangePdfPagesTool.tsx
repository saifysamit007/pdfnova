import React, { useState, useEffect } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { rearrangePdfPages, getPdfInfo, renderPdfPageThumbnail, formatBytes } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import {
  ArrowLeft,
  ArrowRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCw,
  Trash2,
  Undo2,
  Shuffle,
  ArrowDownUp,
  FileText,
  Copy,
} from 'lucide-react';

export const RearrangePdfPagesTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]); // current sequence of original page indices
  const [originalCount, setOriginalCount] = useState<number>(0);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Rearranging PDF...');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setResult(null);
    setRotations({});

    try {
      const info = await getPdfInfo(selected);
      setOriginalCount(info.pageCount);
      const initial = Array.from({ length: info.pageCount }, (_, i) => i);
      setPageOrder(initial);

      const thumbs: Record<number, string> = {};
      for (let i = 0; i < info.pageCount; i++) {
        thumbs[i] = await renderPdfPageThumbnail(selected, i, 0.4);
        if (i % 3 === 0 || i === info.pageCount - 1) {
          setThumbnails({ ...thumbs });
        }
      }
      setThumbnails(thumbs);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError('Could not load PDF: ' + msg);
    }
  };

  const moveItem = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= pageOrder.length || fromIdx === toIdx) return;
    setPageOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  const moveToStart = (index: number) => moveItem(index, 0);
  const moveToEnd = (index: number) => moveItem(index, pageOrder.length - 1);
  const moveLeft = (index: number) => moveItem(index, index - 1);
  const moveRight = (index: number) => moveItem(index, index + 1);

  const removePageAt = (index: number) => {
    if (pageOrder.length <= 1) {
      setError('At least one page must remain in the document.');
      return;
    }
    setPageOrder((prev) => prev.filter((_, i) => i !== index));
  };

  const duplicatePageAt = (index: number) => {
    setPageOrder((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, next[index]);
      return next;
    });
  };

  const rotatePage = (originalIdx: number) => {
    setRotations((prev) => {
      const cur = prev[originalIdx] || 0;
      return { ...prev, [originalIdx]: (cur + 90) % 360 };
    });
  };

  // Bulk Reordering Actions
  const reverseOrder = () => {
    setPageOrder((prev) => [...prev].reverse());
  };

  const resetToOriginal = () => {
    setPageOrder(Array.from({ length: originalCount }, (_, i) => i));
    setRotations({});
  };

  const sortOddEven = () => {
    // Put odd pages first (1, 3, 5...), then even pages (2, 4, 6...)
    const odds = pageOrder.filter((orig) => (orig + 1) % 2 !== 0);
    const evens = pageOrder.filter((orig) => (orig + 1) % 2 === 0);
    setPageOrder([...odds, ...evens]);
  };

  const handleDragStart = (pos: number) => {
    setDraggedIndex(pos);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropPos: number) => {
    if (draggedIndex === null) return;
    moveItem(draggedIndex, dropPos);
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    if (!file) return;
    if (pageOrder.length === 0) {
      setError('No pages left to compile.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await rearrangePdfPages(file, pageOrder, rotations, (msg) => setProgressMsg(msg));
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPageOrder([]);
    setOriginalCount(0);
    setThumbnails({});
    setRotations({});
    setResult(null);
    setError(null);
  };

  if (result) {
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Rearrange Another PDF" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Reordering page streams and applying orientation fixes" />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      {!file ? (
        <FileUploader
          accept=".pdf"
          multiple={false}
          maxFileSizeMB={50}
          onFilesSelected={handleFileSelected}
          title="Select or Drop a PDF to Rearrange Pages"
          subtitle="Drag and drop or use arrow buttons to assemble your desired page sequence"
        />
      ) : (
        <div className="space-y-6">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold text-neutral-900 truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono tabular-nums">
                  <span>{formatBytes(file.size)}</span>
                  <span>&bull;</span>
                  <span>{pageOrder.length} pages in current layout</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-red-600 rounded-lg transition-colors shrink-0"
            >
              Change File
            </button>
          </div>

          {/* Reordering Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-white rounded-xl border border-neutral-200 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-neutral-700">Quick Sequence:</span>
              <button
                type="button"
                onClick={reverseOrder}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg transition-colors"
                title="Invert entire document order"
              >
                <ArrowDownUp className="w-3.5 h-3.5" />
                <span>Reverse Order</span>
              </button>
              <button
                type="button"
                onClick={sortOddEven}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg transition-colors"
                title="Group odd numbered pages first, then even pages"
              >
                <span>Odds First</span>
              </button>
              <button
                type="button"
                onClick={resetToOriginal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-neutral-500 hover:text-neutral-900 bg-transparent hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>
            </div>

            <div className="text-neutral-500 font-mono text-[11px]">
              Drag cards or use navigation arrows to shift
            </div>
          </div>

          {/* Interactive Drag & Drop Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 max-h-[480px] overflow-y-auto pr-1 p-1">
            {pageOrder.map((origIdx, pos) => {
              const rot = rotations[origIdx] || 0;
              const isFirst = pos === 0;
              const isLast = pos === pageOrder.length - 1;

              return (
                <div
                  key={`${origIdx}-${pos}`}
                  draggable
                  onDragStart={() => handleDragStart(pos)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(pos)}
                  className={`group bg-white rounded-xl border p-2 flex flex-col items-center space-y-2 transition-all shadow-xs select-none ${
                    draggedIndex === pos
                      ? 'opacity-40 border-dashed border-neutral-400 scale-95'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-3/4 w-full bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center relative cursor-grab active:cursor-grabbing">
                    {thumbnails[origIdx] ? (
                      <img
                        src={thumbnails[origIdx]}
                        alt={`Page ${pos + 1}`}
                        style={{ transform: `rotate(${rot}deg)`, transition: 'transform 0.2s ease' }}
                        className="max-w-full max-h-full object-contain pointer-events-none"
                      />
                    ) : (
                      <div className="text-[11px] font-mono text-neutral-400">Loading...</div>
                    )}

                    {/* New Position Badge */}
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-neutral-900/85 text-white rounded text-[10px] font-mono font-semibold shadow-xs">
                      #{pos + 1}
                    </span>

                    {/* Original Page Indicator */}
                    <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-white/90 text-neutral-600 rounded text-[9px] font-mono border border-neutral-200/80 shadow-xs">
                      Orig Pg {origIdx + 1}
                    </span>
                  </div>

                  {/* Card Action Controls */}
                  <div className="w-full flex items-center justify-between text-xs pt-0.5">
                    {/* Shift Controls */}
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveToStart(pos)}
                        disabled={isFirst}
                        title="Move to First"
                        className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 rounded"
                      >
                        <ChevronsLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLeft(pos)}
                        disabled={isFirst}
                        title="Move Left"
                        className="p-1 text-neutral-600 hover:text-neutral-900 disabled:opacity-20 rounded"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRight(pos)}
                        disabled={isLast}
                        title="Move Right"
                        className="p-1 text-neutral-600 hover:text-neutral-900 disabled:opacity-20 rounded"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveToEnd(pos)}
                        disabled={isLast}
                        title="Move to End"
                        className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 rounded"
                      >
                        <ChevronsRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Secondary Actions: Rotate, Duplicate, Delete */}
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => rotatePage(origIdx)}
                        title="Rotate 90°"
                        className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicatePageAt(pos)}
                        title="Duplicate this page"
                        className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePageAt(pos)}
                        title="Delete from sequence"
                        className="p-1 text-neutral-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-neutral-500">
              {pageOrder.length} pages will be compiled in this exact sequence.
            </span>

            <button
              onClick={handleSave}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <ArrowDownUp className="w-4 h-4" />
              <span>Save Rearranged PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
