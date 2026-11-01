import React, { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { PdfFilePreview } from '../common/PdfFilePreview';
import { watermarkPdf, WatermarkOptions } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { Stamp } from 'lucide-react';

export const WatermarkPdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<WatermarkOptions>({
    text: 'CONFIDENTIAL',
    fontSize: 48,
    opacity: 0.35,
    rotation: -45,
    color: 'gray',
    position: 'center',
    pages: 'all',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Applying watermark...');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setError(null);
    setResult(null);
  };

  const handleApply = async () => {
    if (!file) return;
    if (!options.text.trim()) {
      setError('Please enter watermark text.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await watermarkPdf(file, options, (msg) => setProgressMsg(msg));
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
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Watermark Another PDF" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Stamping vector watermark onto PDF pages" />;
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
          title="Select or Drop a PDF to Watermark"
          subtitle="Add custom text stamps across your document pages"
        />
      ) : (
        <div className="space-y-6">
          {/* File preview with live FileReader thumbnail */}
          <PdfFilePreview
            file={file}
            onChangeFile={handleReset}
            onRemove={handleReset}
          />

          {/* Configuration & Live Preview Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Options Controls */}
            <div className="md:col-span-2 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Watermark Text:
                </label>
                <input
                  type="text"
                  value={options.text}
                  onChange={(e) => setOptions({ ...options, text: e.target.value })}
                  placeholder="e.g. CONFIDENTIAL, DRAFT, SAMPLE"
                  className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Font Size: {options.fontSize}pt
                  </label>
                  <input
                    type="range"
                    min="18"
                    max="72"
                    step="2"
                    value={options.fontSize}
                    onChange={(e) => setOptions({ ...options, fontSize: Number(e.target.value) })}
                    className="w-full accent-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Opacity: {Math.round(options.opacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={options.opacity}
                    onChange={(e) => setOptions({ ...options, opacity: Number(e.target.value) })}
                    className="w-full accent-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Rotation:</label>
                  <select
                    value={options.rotation}
                    onChange={(e) => setOptions({ ...options, rotation: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-neutral-300 rounded-lg font-medium"
                  >
                    <option value={-45}>-45° (Diagonal)</option>
                    <option value={0}>0° (Horizontal)</option>
                    <option value={45}>+45° (Diagonal)</option>
                    <option value={90}>90° (Vertical)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Color:</label>
                  <select
                    value={options.color}
                    onChange={(e) => setOptions({ ...options, color: e.target.value as any })}
                    className="w-full p-2 bg-white border border-neutral-300 rounded-lg font-medium"
                  >
                    <option value="gray">Muted Gray</option>
                    <option value="red">Warning Red</option>
                    <option value="blue">Corporate Blue</option>
                    <option value="black">Deep Black</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Position:</label>
                  <select
                    value={options.position}
                    onChange={(e) => setOptions({ ...options, position: e.target.value as any })}
                    className="w-full p-2 bg-white border border-neutral-300 rounded-lg font-medium"
                  >
                    <option value="center">Center</option>
                    <option value="top">Top Header</option>
                    <option value="bottom">Bottom Footer</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Live Simulated Preview Card */}
            <div className="flex flex-col items-center justify-center p-4 bg-neutral-100/60 rounded-xl border border-neutral-200">
              <span className="text-[11px] font-semibold text-neutral-500 mb-2">Simulated Layout</span>
              <div className="w-36 h-48 bg-white border border-neutral-300 rounded shadow-xs relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-x-2 top-3 space-y-1 opacity-20">
                  <div className="h-1.5 bg-neutral-800 rounded w-3/4" />
                  <div className="h-1.5 bg-neutral-800 rounded w-full" />
                  <div className="h-1.5 bg-neutral-800 rounded w-5/6" />
                  <div className="h-1.5 bg-neutral-800 rounded w-2/3" />
                </div>

                <div
                  style={{
                    transform: `rotate(${options.rotation}deg)`,
                    opacity: options.opacity,
                    color:
                      options.color === 'red'
                        ? '#dc2626'
                        : options.color === 'blue'
                        ? '#2563eb'
                        : options.color === 'black'
                        ? '#18181b'
                        : '#71717a',
                  }}
                  className="font-bold tracking-wider text-center text-xs pointer-events-none select-none px-2 truncate max-w-full font-mono"
                >
                  {options.text || 'WATERMARK'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              The stamp will be embedded into the page graphics stream.
            </span>

            <button
              onClick={handleApply}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <Stamp className="w-4 h-4" />
              <span>Apply Watermark & Download</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
