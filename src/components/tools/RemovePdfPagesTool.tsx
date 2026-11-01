import React, { useState, useEffect, useMemo } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { removePdfPages, getPdfInfo, renderPdfPageThumbnail, formatBytes } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { Trash2, Undo2, CheckSquare, Square, RefreshCw, FileText, AlertCircle } from 'lucide-react';

export const RemovePdfPagesTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [selectedForRemoval, setSelectedForRemoval] = useState<Set<number>>(new Set());
  const [rangeInput, setRangeInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Removing pages...');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingThumbs, setIsLoadingThumbs] = useState(false);

  // Sync range input when selectedForRemoval changes
  const updateRangeInputFromSet = (set: Set<number>) => {
    if (set.size === 0) {
      setRangeInput('');
      return;
    }
    const sorted = Array.from(set).map((i) => i + 1).sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sorted[0];
    let end = start;

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) {
        end = sorted[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = sorted[i];
        end = start;
      }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    setRangeInput(ranges.join(', '));
  };

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setResult(null);
    setSelectedForRemoval(new Set());
    setRangeInput('');
    setIsLoadingThumbs(true);

    try {
      const info = await getPdfInfo(selected);
      setPageCount(info.pageCount);

      const thumbs: Record<number, string> = {};
      for (let i = 0; i < info.pageCount; i++) {
        thumbs[i] = await renderPdfPageThumbnail(selected, i, 0.4);
        // Progressive thumbnail update
        if (i % 3 === 0 || i === info.pageCount - 1) {
          setThumbnails({ ...thumbs });
        }
      }
      setThumbnails(thumbs);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError('Failed to load PDF structure: ' + msg);
    } finally {
      setIsLoadingThumbs(false);
    }
  };

  const togglePageRemoval = (pageIndex: number) => {
    setSelectedForRemoval((prev) => {
      const next = new Set(prev);
      if (next.has(pageIndex)) {
        next.delete(pageIndex);
      } else {
        next.add(pageIndex);
      }
      updateRangeInputFromSet(next);
      return next;
    });
  };

  const handleRangeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRangeInput(val);

    // Parse ranges (e.g. "1, 3-5, 8")
    const newSet = new Set<number>();
    const parts = val.split(',').map((p) => p.trim()).filter(Boolean);

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map((s) => parseInt(s.trim(), 10));
        if (!isNaN(startStr) && !isNaN(endStr)) {
          const min = Math.max(1, Math.min(startStr, endStr));
          const max = Math.min(pageCount, Math.max(startStr, endStr));
          for (let p = min; p <= max; p++) {
            newSet.add(p - 1);
          }
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= pageCount) {
          newSet.add(p - 1);
        }
      }
    }
    setSelectedForRemoval(newSet);
  };

  const selectOddPages = () => {
    const next = new Set<number>();
    for (let i = 0; i < pageCount; i++) {
      if ((i + 1) % 2 !== 0) next.add(i);
    }
    setSelectedForRemoval(next);
    updateRangeInputFromSet(next);
  };

  const selectEvenPages = () => {
    const next = new Set<number>();
    for (let i = 0; i < pageCount; i++) {
      if ((i + 1) % 2 === 0) next.add(i);
    }
    setSelectedForRemoval(next);
    updateRangeInputFromSet(next);
  };

  const invertSelection = () => {
    const next = new Set<number>();
    for (let i = 0; i < pageCount; i++) {
      if (!selectedForRemoval.has(i)) next.add(i);
    }
    setSelectedForRemoval(next);
    updateRangeInputFromSet(next);
  };

  const clearAllSelection = () => {
    const next = new Set<number>();
    setSelectedForRemoval(next);
    setRangeInput('');
  };

  const selectAllExceptFirst = () => {
    const next = new Set<number>();
    for (let i = 1; i < pageCount; i++) {
      next.add(i);
    }
    setSelectedForRemoval(next);
    updateRangeInputFromSet(next);
  };

  const remainingCount = pageCount - selectedForRemoval.size;
  const isAllSelected = selectedForRemoval.size >= pageCount && pageCount > 0;
  const isNoneSelected = selectedForRemoval.size === 0;

  const handleRemove = async () => {
    if (!file) return;
    if (selectedForRemoval.size === 0) {
      setError('Please select at least one page to remove.');
      return;
    }
    if (isAllSelected) {
      setError('You cannot remove all pages. At least one page must remain.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const toRemoveArray = Array.from(selectedForRemoval);
      const res = await removePdfPages(file, toRemoveArray, (msg) => setProgressMsg(msg));
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
    setPageCount(0);
    setThumbnails({});
    setSelectedForRemoval(new Set());
    setRangeInput('');
    setResult(null);
    setError(null);
  };

  if (result) {
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Remove Pages from Another PDF" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Generating cleaned document without deleted pages" />;
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
          title="Select or Drop a PDF to Remove Pages"
          subtitle="Click unwanted pages or enter page ranges to delete"
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
                  <span>{pageCount} total pages</span>
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

          {/* Quick Selection Toolbar */}
          <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex-1 max-w-md">
                <label htmlFor="range-input" className="block text-xs font-semibold text-neutral-700 mb-1">
                  Pages to remove (click cards below or enter ranges):
                </label>
                <input
                  id="range-input"
                  type="text"
                  value={rangeInput}
                  onChange={handleRangeInputChange}
                  placeholder="e.g. 1, 3-5, 8"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                />
              </div>

              {/* Quick Select Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={selectOddPages}
                  className="px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-md transition-colors"
                >
                  Odd Pages
                </button>
                <button
                  type="button"
                  onClick={selectEvenPages}
                  className="px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-md transition-colors"
                >
                  Even Pages
                </button>
                <button
                  type="button"
                  onClick={invertSelection}
                  className="px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-md transition-colors"
                >
                  Invert
                </button>
                <button
                  type="button"
                  onClick={clearAllSelection}
                  disabled={isNoneSelected}
                  className="px-2.5 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 disabled:opacity-40 rounded-md transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {/* Status Line */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-100 text-neutral-500">
              <span className="font-medium">
                {selectedForRemoval.size === 0 ? (
                  'Click pages to select them for removal'
                ) : (
                  <span className="text-red-600 font-semibold">
                    {selectedForRemoval.size} page{selectedForRemoval.size === 1 ? '' : 's'} marked for removal &bull; {remainingCount} page{remainingCount === 1 ? '' : 's'} will remain
                  </span>
                )}
              </span>

              {isAllSelected && (
                <span className="inline-flex items-center gap-1 text-red-600 font-medium text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Cannot delete all pages
                </span>
              )}
            </div>
          </div>

          {/* Interactive Thumbnail Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
              <span>Click a page thumbnail to toggle deletion</span>
              {isLoadingThumbs && <span className="animate-pulse">Loading preview thumbnails...</span>}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 max-h-[460px] overflow-y-auto pr-1 p-1">
              {Array.from({ length: pageCount }, (_, i) => {
                const isMarked = selectedForRemoval.has(i);
                const thumb = thumbnails[i];

                return (
                  <div
                    key={i}
                    onClick={() => togglePageRemoval(i)}
                    className={`group relative cursor-pointer bg-white rounded-xl border p-2 transition-all select-none text-left ${
                      isMarked
                        ? 'border-red-400 ring-2 ring-red-400/40 bg-red-50/20 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-400 hover:shadow-xs'
                    }`}
                  >
                    {/* Thumbnail Viewport */}
                    <div className="aspect-3/4 w-full bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center relative">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={`Page ${i + 1}`}
                          className={`max-w-full max-h-full object-contain transition-opacity ${
                            isMarked ? 'opacity-40 grayscale' : 'opacity-100'
                          }`}
                        />
                      ) : (
                        <div className="text-[11px] font-mono text-neutral-400">Loading...</div>
                      )}

                      {/* Page Index Badge */}
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-neutral-900/80 text-white rounded text-[10px] font-mono font-semibold">
                        #{i + 1}
                      </span>

                      {/* Action Icon on Top Right */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePageRemoval(i);
                        }}
                        aria-label={isMarked ? `Restore page ${i + 1}` : `Remove page ${i + 1}`}
                        className={`absolute top-1.5 right-1.5 p-1 rounded-md transition-colors ${
                          isMarked
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-white/90 text-neutral-600 group-hover:bg-red-50 group-hover:text-red-600 border border-neutral-200'
                        }`}
                      >
                        {isMarked ? <Undo2 className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>

                      {/* Removal Overlay */}
                      {isMarked && (
                        <div className="absolute inset-0 bg-red-900/30 backdrop-blur-[1px] flex flex-col items-center justify-center text-white p-2 text-center">
                          <Trash2 className="w-6 h-6 text-white mb-1 drop-shadow-sm" />
                          <span className="text-[11px] font-bold uppercase tracking-wider bg-red-600/90 px-2 py-0.5 rounded">
                            Removed
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="flex items-center justify-between text-[11px] pt-1.5 px-0.5">
                      <span className={`font-mono ${isMarked ? 'text-red-600 font-semibold' : 'text-neutral-500'}`}>
                        Page {i + 1}
                      </span>
                      <span className={`text-[10px] ${isMarked ? 'text-red-500 font-medium' : 'text-neutral-400'}`}>
                        {isMarked ? 'To delete' : 'Keep'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-600 text-center sm:text-left">
              {isNoneSelected ? (
                <span>No pages selected yet. Select at least 1 page to delete.</span>
              ) : isAllSelected ? (
                <span className="text-red-600 font-medium">Please deselect at least 1 page to keep.</span>
              ) : (
                <span>
                  <strong>{selectedForRemoval.size}</strong> page{selectedForRemoval.size === 1 ? '' : 's'} will be removed. New document will contain <strong>{remainingCount}</strong> page{remainingCount === 1 ? '' : 's'}.
                </span>
              )}
            </div>

            <button
              onClick={handleRemove}
              disabled={isNoneSelected || isAllSelected}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-neutral-300 disabled:cursor-not-allowed active:scale-[0.98] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            >
              <Trash2 className="w-4 h-4" />
              <span>
                {selectedForRemoval.size === 0
                  ? 'Select Pages to Remove'
                  : `Remove ${selectedForRemoval.size} Page${selectedForRemoval.size === 1 ? '' : 's'} & Save PDF`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
