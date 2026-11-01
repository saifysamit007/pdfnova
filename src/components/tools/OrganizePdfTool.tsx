import React, { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { organizePdf, getPdfInfo, renderPdfPageThumbnail, formatBytes } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { LayoutGrid, ArrowLeft, ArrowRight, Trash2, Undo2, RotateCw, FileText } from 'lucide-react';

interface PageCard {
  originalIndex: number;
  thumbnailUrl: string;
}

export const OrganizePdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [deletedPages, setDeletedPages] = useState<number[]>([]);
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Organizing PDF...');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setResult(null);
    setDeletedPages([]);
    setRotations({});

    try {
      const info = await getPdfInfo(selected);
      const initialOrder = Array.from({ length: info.pageCount }, (_, i) => i);
      setPageOrder(initialOrder);

      const thumbs: Record<number, string> = {};
      for (let i = 0; i < info.pageCount; i++) {
        thumbs[i] = await renderPdfPageThumbnail(selected, i, 0.4);
      }
      setThumbnails(thumbs);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError('Could not read PDF structure: ' + msg);
    }
  };

  const moveLeft = (currPos: number) => {
    if (currPos === 0) return;
    setPageOrder((prev) => {
      const copy = [...prev];
      const temp = copy[currPos];
      copy[currPos] = copy[currPos - 1];
      copy[currPos - 1] = temp;
      return copy;
    });
  };

  const moveRight = (currPos: number) => {
    if (currPos === pageOrder.length - 1) return;
    setPageOrder((prev) => {
      const copy = [...prev];
      const temp = copy[currPos];
      copy[currPos] = copy[currPos + 1];
      copy[currPos + 1] = temp;
      return copy;
    });
  };

  const toggleDelete = (originalIdx: number) => {
    if (deletedPages.includes(originalIdx)) {
      setDeletedPages((prev) => prev.filter((idx) => idx !== originalIdx));
    } else {
      if (deletedPages.length === pageOrder.length - 1) {
        setError('You cannot delete all pages from the document.');
        return;
      }
      setDeletedPages((prev) => [...prev, originalIdx]);
    }
  };

  const rotatePage = (originalIdx: number) => {
    setRotations((prev) => {
      const cur = prev[originalIdx] || 0;
      return { ...prev, [originalIdx]: (cur + 90) % 360 };
    });
  };

  const handleSave = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const res = await organizePdf(file, pageOrder, deletedPages, rotations, (msg) => setProgressMsg(msg));
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
    setThumbnails({});
    setDeletedPages([]);
    setRotations({});
    setResult(null);
    setError(null);
  };

  if (result) {
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Organize Another PDF" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Rebuilding document with updated page sequencing" />;
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
          title="Select or Drop a PDF File to Organize"
          subtitle="Reorder, delete, and rotate pages in an interactive grid"
        />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold text-neutral-900 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-neutral-500 font-mono tabular-nums">
                  {formatBytes(file.size)} &bull; {pageOrder.length - deletedPages.length} active pages ({deletedPages.length} deleted)
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-red-600 rounded-lg transition-colors shrink-0"
            >
              Change File
            </button>
          </div>

          {/* Interactive Page Organizer Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[440px] overflow-y-auto pr-1">
            {pageOrder.map((origIdx, pos) => {
              const isDeleted = deletedPages.includes(origIdx);
              const rot = rotations[origIdx] || 0;

              return (
                <div
                  key={origIdx}
                  className={`bg-white rounded-xl border p-2.5 flex flex-col items-center space-y-2 transition-all shadow-xs ${
                    isDeleted ? 'opacity-40 border-dashed border-red-300 bg-red-50/30' : 'border-neutral-200'
                  }`}
                >
                  <div className="aspect-3/4 w-full bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center relative">
                    <img
                      src={thumbnails[origIdx]}
                      alt={`Page ${origIdx + 1}`}
                      style={{ transform: `rotate(${rot}deg)`, transition: 'transform 0.2s ease' }}
                      className="max-w-full max-h-full object-contain"
                    />
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-neutral-900/80 text-white rounded text-[10px] font-mono font-semibold">
                      #{pos + 1}
                    </span>
                    {isDeleted && (
                      <span className="absolute inset-0 bg-red-900/40 backdrop-blur-[1px] flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                        Deleted
                      </span>
                    )}
                  </div>

                  <div className="w-full flex items-center justify-between text-xs pt-1">
                    <span className="font-mono text-neutral-400 text-[11px]">
                      Orig {origIdx + 1}
                    </span>

                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveLeft(pos)}
                        disabled={pos === 0 || isDeleted}
                        title="Move left"
                        className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-20 rounded"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRight(pos)}
                        disabled={pos === pageOrder.length - 1 || isDeleted}
                        title="Move right"
                        className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-20 rounded"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => rotatePage(origIdx)}
                        disabled={isDeleted}
                        title="Rotate 90°"
                        className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-20 rounded"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleDelete(origIdx)}
                        title={isDeleted ? 'Restore page' : 'Delete page'}
                        className={`p-1 rounded ${
                          isDeleted ? 'text-emerald-600 hover:text-emerald-700' : 'text-neutral-400 hover:text-red-600'
                        }`}
                      >
                        {isDeleted ? <Undo2 className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              {pageOrder.length - deletedPages.length} pages will be compiled in your new order.
            </span>

            <button
              onClick={handleSave}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Save Organized PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
