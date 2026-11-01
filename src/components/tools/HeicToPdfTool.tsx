import React, { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { heicToPdf, formatBytes } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { FileCheck, Smartphone, Plus, Trash2, Info } from 'lucide-react';

export const HeicToPdfTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<'fit' | 'a4' | 'letter'>('a4');
  const [margin, setMargin] = useState<number>(15);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Decoding HEIC files...');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setError(null);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      setError('Please select at least one HEIC or HEIF image.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await heicToPdf(files, pageSize, margin, (msg) => setProgressMsg(msg));
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to convert HEIC: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
  };

  if (result) {
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Convert More HEIC Photos" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Decoding Apple High Efficiency Image Container in browser memory" />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {files.length === 0 ? (
        <FileUploader
          acceptedFiles=".heic,.heif"
          maxFiles={30}
          maxSizeMB={50}
          onFilesSelected={handleFilesSelected}
          descriptionText="Select or drag Apple iPhone .HEIC or .HEIF photos. Converted directly in your browser without cloud upload."
        />
      ) : (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-800">
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900">
                    {files.length} HEIC {files.length > 1 ? 'Photos' : 'Photo'} Queued
                  </h4>
                  <p className="text-xs text-neutral-500 font-mono">
                    Total: {formatBytes(files.reduce((a, b) => a + b.size, 0))}
                  </p>
                </div>
              </div>

              <label className="text-xs font-semibold px-3 py-2 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 cursor-pointer flex items-center gap-1.5 transition-colors">
                <Plus className="w-3.5 h-3.5 text-neutral-600" />
                Add More HEIC
                <input
                  type="file"
                  accept=".heic,.heif"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                  }}
                />
              </label>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-200/60">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Output Page Format
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                >
                  <option value="a4">Standard A4 Document</option>
                  <option value="letter">US Letter Format</option>
                  <option value="fit">Original Photo Geometry (Fit)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Document Margins
                </label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  disabled={pageSize === 'fit'}
                  className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-800 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                >
                  <option value={0}>Borderless (Full Bleed)</option>
                  <option value={15}>Small Margin (15 pt)</option>
                  <option value={30}>Generous Margin (30 pt)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-900">
            <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
            <p>
              Your iPhone HEIC photos are decoded locally on your device via in-browser WebAssembly. No photos are sent to cloud servers.
            </p>
          </div>

          {/* Files List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded bg-neutral-100 text-neutral-600 text-xs font-mono flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-800 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {formatBytes(file.size)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 rounded hover:bg-neutral-100 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
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
              Convert {files.length} HEIC to PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
