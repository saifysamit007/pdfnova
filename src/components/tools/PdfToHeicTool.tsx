import React, { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { pdfToHeic } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { FileImage, Sliders, CheckCircle2 } from 'lucide-react';

export const PdfToHeicTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(0.9);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Rendering PDF pages...');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const res = await pdfToHeic(file, quality, (msg) => setProgressMsg(msg));
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to convert PDF to HEIC: ${msg}`);
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
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Convert Another PDF" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Rendering vector PDF streams into High-Efficiency Image format" />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {!file ? (
        <FileUploader
          acceptedFiles=".pdf"
          maxFiles={1}
          maxSizeMB={100}
          onFilesSelected={handleFilesSelected}
          descriptionText="Upload a PDF document to convert each page into a High-Efficiency HEIC image."
        />
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-800">
                  <FileImage className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </h4>
                  <p className="text-xs text-neutral-500 font-mono">
                    Ready for High-Efficiency 2x Retina rendering
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-neutral-500 hover:text-neutral-900 underline underline-offset-2"
              >
                Change PDF
              </button>
            </div>

            {/* Quality Presets */}
            <div className="pt-3 border-t border-neutral-200/60 space-y-2">
              <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-neutral-500" />
                Image Quality & Compression Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'High Fidelity', val: 0.95, desc: 'Maximum 2x clarity' },
                  { label: 'Balanced', val: 0.85, desc: 'Standard compression' },
                  { label: 'Compact', val: 0.7, desc: 'Smallest file size' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setQuality(item.val)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      quality === item.val
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div
                      className={`text-[10px] ${
                        quality === item.val ? 'text-neutral-300' : 'text-neutral-400'
                      }`}
                    >
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleConvert}
              className="px-6 py-2.5 bg-neutral-950 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Convert to High-Efficiency HEIC
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
