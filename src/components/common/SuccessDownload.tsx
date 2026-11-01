import React from 'react';
import { CheckCircle2, Download, RotateCcw, FileText, ArrowDownRight } from 'lucide-react';
import { ProcessedResult } from '../../types';
import { formatBytes } from '../../services/pdfEngine';

interface SuccessDownloadProps {
  result: ProcessedResult;
  onReset: () => void;
  resetButtonText?: string;
}

export const SuccessDownload: React.FC<SuccessDownloadProps> = ({
  result,
  onReset,
  resetButtonText = 'Process Another Document',
}) => {
  const handleDownload = () => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const hasOriginal = typeof result.originalSizeBytes === 'number' && result.originalSizeBytes > 0;
  const sizeDiff = hasOriginal ? result.originalSizeBytes! - result.resultSizeBytes : 0;
  const isReduced = sizeDiff > 0;
  const percentageSaved = hasOriginal && isReduced
    ? Math.round((sizeDiff / result.originalSizeBytes!) * 100)
    : 0;

  return (
    <div className="py-8 px-4 sm:px-8 space-y-6">
      {/* Success Badge & Headline */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-xs">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 font-sans">
          Your Document is Ready!
        </h3>
        <p className="text-xs text-neutral-500 max-w-md">
          {result.extraInfo || 'Processing completed successfully with zero server retention.'}
        </p>
      </div>

      {/* Result Metrics & File Card */}
      <div className="max-w-md mx-auto bg-neutral-50 rounded-xl border border-neutral-200/80 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-neutral-900 truncate" title={result.downloadName}>
              {result.downloadName}
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono tabular-nums">
              <span>{formatBytes(result.resultSizeBytes)}</span>
              {result.pageCount && (
                <>
                  <span>&bull;</span>
                  <span>{result.pageCount} page{result.pageCount === 1 ? '' : 's'}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Compression / Size comparison if available */}
        {hasOriginal && isReduced && (
          <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Savings</span>
            <div className="flex items-center gap-1.5 font-semibold text-emerald-700 font-mono tabular-nums">
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
              <span>{percentageSaved}% smaller ({formatBytes(sizeDiff)} saved)</span>
            </div>
          </div>
        )}

        {/* Previews if any */}
        {result.previewUrls && result.previewUrls.length > 0 && (
          <div className="pt-3 border-t border-neutral-200/60">
            <p className="text-xs font-semibold text-neutral-600 mb-2 text-left">Page Previews:</p>
            <div className="grid grid-cols-4 gap-2">
              {result.previewUrls.map((url, idx) => (
                <div key={idx} className="aspect-3/4 rounded-md border border-neutral-200 bg-white overflow-hidden shadow-xs">
                  <img src={url} alt={`Preview page ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={handleDownload}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
        >
          <Download className="w-4 h-4" />
          <span>Download {result.downloadName.endsWith('.zip') ? 'ZIP Archive' : 'File'}</span>
        </button>
        <button
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
        >
          <RotateCcw className="w-4 h-4 text-neutral-500" />
          <span>{resetButtonText}</span>
        </button>
      </div>
    </div>
  );
};
