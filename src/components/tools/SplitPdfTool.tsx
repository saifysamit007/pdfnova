import React, { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { PdfFilePreview } from '../common/PdfFilePreview';
import { splitPdf, getPdfInfo } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { Split, AlertCircle, Layers } from 'lucide-react';

export const SplitPdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [mode, setMode] = useState<'range' | 'all'>('range');
  const [rangeInput, setRangeInput] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Splitting document...');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setResult(null);

    try {
      const info = await getPdfInfo(selected);
      setPageCount(info.pageCount);
      setRangeInput(info.pageCount > 1 ? `1-${Math.min(3, info.pageCount)}` : '1');
    } catch (err: unknown) {
      console.warn('Could not read page count upfront:', err);
      setPageCount(null);
    }
  };

  const handleSplit = async () => {
    if (!file) return;

    if (mode === 'range' && !rangeInput.trim()) {
      setError('Please enter at least one page number or range (e.g. "1-3, 5").');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await splitPdf(file, rangeInput, mode, (msg) => setProgressMsg(msg));
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
    setPageCount(null);
    setResult(null);
    setError(null);
  };

  if (result) {
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Split Another PDF" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Separating document pages in browser memory" />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      {!file ? (
        <FileUploader
          accept=".pdf"
          multiple={false}
          maxFileSizeMB={100}
          onFilesSelected={handleFileSelected}
          title="Select or Drop a PDF File to Split"
          subtitle="Extract selected page ranges or split into individual files"
        />
      ) : (
        <div className="space-y-6">
          {/* File preview with live FileReader thumbnail */}
          <PdfFilePreview
            file={file}
            onChangeFile={handleReset}
            onRemove={handleReset}
          />

          {/* Mode Selection Tabs */}
          <div className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Choose Split Method
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('range')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  mode === 'range'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <Split className="w-4 h-4" />
                  <span>Extract Page Ranges</span>
                </div>
                <p className={`text-xs ${mode === 'range' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Export specific pages or custom range subsets into a single compiled PDF.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('all')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  mode === 'all'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <Layers className="w-4 h-4" />
                  <span>Split Every Page (ZIP)</span>
                </div>
                <p className={`text-xs ${mode === 'all' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Separate every single page into its own individual PDF bundled in a ZIP.
                </p>
              </button>
            </div>

            {/* Range specification input */}
            {mode === 'range' && (
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <label htmlFor="range-input" className="block text-xs font-semibold text-neutral-800">
                  Page Ranges to Extract:
                </label>
                <div className="flex gap-2">
                  <input
                    id="range-input"
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder="e.g. 1-3, 5, 8-10"
                    className="flex-1 px-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
                  />
                </div>
                <p className="text-[11px] text-neutral-500">
                  Example: <code className="bg-neutral-200/70 px-1 py-0.5 rounded">1-4, 7, 9-12</code> will create a new PDF containing only those specified sheets.
                  {pageCount && ` Valid range: 1 to ${pageCount}.`}
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-neutral-200 flex justify-end">
            <button
              onClick={handleSplit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <Split className="w-4 h-4" />
              <span>{mode === 'all' ? 'Split into All Pages' : 'Extract Selected Pages'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
