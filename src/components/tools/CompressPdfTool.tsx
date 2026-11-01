import React, { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { PdfFilePreview } from '../common/PdfFilePreview';
import { compressPdf, formatBytes } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { Minimize2, Check } from 'lucide-react';

export const CompressPdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<'recommended' | 'extreme' | 'less'>('recommended');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Compressing document...');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setError(null);
    setResult(null);
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const res = await compressPdf(file, level, (msg) => setProgressMsg(msg));
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
    setResult(null);
    setError(null);
  };

  if (result) {
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Compress Another PDF" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Optimizing streams and removing redundant object tables" />;
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
          title="Select or Drop a PDF to Compress"
          subtitle="Reduce file size with lossless structural optimization"
        />
      ) : (
        <div className="space-y-6">
          {/* File preview with live FileReader thumbnail */}
          <PdfFilePreview
            file={file}
            onChangeFile={handleReset}
            onRemove={handleReset}
          />

          {/* Compression Preset Selection */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Select Compression Strength
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Recommended */}
              <button
                type="button"
                onClick={() => setLevel('recommended')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  level === 'recommended'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-sm mb-1">
                  <span>Recommended</span>
                  {level === 'recommended' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className={`text-xs ${level === 'recommended' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Balanced reduction. Cleans unused font programs and compacts xref streams while maintaining full visual fidelity.
                </p>
              </button>

              {/* Extreme */}
              <button
                type="button"
                onClick={() => setLevel('extreme')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  level === 'extreme'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-sm mb-1">
                  <span>Extreme</span>
                  {level === 'extreme' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className={`text-xs ${level === 'extreme' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Maximum size reduction. Purges all unreferenced metadata, revision histories, and structural tags.
                </p>
              </button>

              {/* Less / Light */}
              <button
                type="button"
                onClick={() => setLevel('less')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  level === 'less'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-sm mb-1">
                  <span>Light</span>
                  {level === 'less' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className={`text-xs ${level === 'less' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Gentle compression. Preserves all metadata dictionaries and high-definition raster images.
                </p>
              </button>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              Safe compression: text sharpness and print dimensions are 100% preserved.
            </span>

            <button
              onClick={handleCompress}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Compress PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
