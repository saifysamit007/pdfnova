import React, { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { convertJfif, formatBytes } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { CheckCircle2, Sliders, Image, Sparkles, AlertCircle } from 'lucide-react';

interface JfifConverterToolProps {
  defaultTarget?: 'jpg' | 'png';
}

export const JfifConverterTool: React.FC<JfifConverterToolProps> = ({ defaultTarget = 'jpg' }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<'jpg' | 'png'>(defaultTarget);
  const [quality, setQuality] = useState<number>(0.95);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setError(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const res = await convertJfif(file, targetFormat, quality);
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to convert JFIF: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  if (result) {
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Convert Another JFIF" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={`Converting JFIF to standard ${targetFormat.toUpperCase()}...`} subText="Fixing header markers and normalizing color profiles" />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {!file ? (
        <FileUploader
          acceptedFiles=".jfif"
          maxFiles={1}
          maxSizeMB={50}
          onFilesSelected={handleFilesSelected}
          descriptionText="Select or drop your Windows .JFIF file. We will convert it into a standard, universally compatible JPG or lossless PNG."
        />
      ) : (
        <div className="space-y-6">
          {/* File Card with Live Preview */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {previewUrl && (
                <div className="w-24 h-24 rounded-lg bg-neutral-200 overflow-hidden border border-neutral-300 shrink-0 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-100/70 text-amber-800 text-[10px] font-mono font-semibold uppercase mb-1">
                  JFIF Stream Detected
                </div>
                <h4 className="text-sm font-semibold text-neutral-900 truncate" title={file.name}>
                  {file.name}
                </h4>
                <p className="text-xs text-neutral-500 font-mono">
                  Original size: {formatBytes(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-neutral-500 hover:text-neutral-900 underline underline-offset-2 shrink-0"
              >
                Change File
              </button>
            </div>

            {/* Target Format Selector */}
            <div className="pt-3 border-t border-neutral-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Output Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetFormat('jpg')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                      targetFormat === 'jpg'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    Standard JPG
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetFormat('png')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                      targetFormat === 'png'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    Lossless PNG
                  </button>
                </div>
              </div>

              {targetFormat === 'jpg' && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    JPEG Quality: {Math.round(quality * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-neutral-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
                    <span>Balanced (80%)</span>
                    <span>Crisp (95%)</span>
                    <span>Max (100%)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleConvert}
              className="px-6 py-2.5 bg-neutral-950 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Convert to Standard {targetFormat.toUpperCase()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
