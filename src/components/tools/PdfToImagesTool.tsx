import React, { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { PdfFilePreview } from '../common/PdfFilePreview';
import { pdfToImages, getPdfInfo } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { FileImage, Check } from 'lucide-react';

interface PdfToImagesToolProps {
  defaultFormat?: 'jpeg' | 'png';
}

export const PdfToImagesTool: React.FC<PdfToImagesToolProps> = ({ defaultFormat = 'jpeg' }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [format, setFormat] = useState<'jpeg' | 'png'>(defaultFormat);
  const [scale, setScale] = useState<number>(2.0); // 2x for sharp 150-200 DPI
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Rendering pages to images...');
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
    } catch (err) {
      console.warn('Could not read page count upfront:', err);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const res = await pdfToImages(
        file,
        format,
        scale,
        0.92,
        (curr, total) => setProgressMsg(`Rendering page ${curr} of ${total}...`)
      );
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
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Convert Another PDF" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Rendering vector pages on HTML5 canvas" />;
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
          title={`Select or Drop a PDF to Convert to ${format === 'png' ? 'PNG' : 'JPG'}`}
          subtitle="Renders pages into standalone high-definition graphics"
        />
      ) : (
        <div className="space-y-6">
          {/* File preview with live FileReader thumbnail */}
          <PdfFilePreview
            file={file}
            onChangeFile={handleReset}
            onRemove={handleReset}
          />

          {/* Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Format choice */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Image Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('jpeg')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    format === 'jpeg'
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm">
                    <span>JPG</span>
                    {format === 'jpeg' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className={`text-[11px] ${format === 'jpeg' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Smaller file size, ideal for photos and web sharing.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('png')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    format === 'png'
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm">
                    <span>PNG</span>
                    {format === 'png' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className={`text-[11px] ${format === 'png' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Lossless clarity, ideal for diagrams, text, and graphics.
                  </p>
                </button>
              </div>
            </div>

            {/* Resolution scale */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Resolution Quality
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScale(1.5)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    scale === 1.5
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm">
                    <span>Standard</span>
                    {scale === 1.5 && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className={`text-[11px] ${scale === 1.5 ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Fast export, standard screen viewing (~110 DPI).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setScale(2.0)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    scale === 2.0
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm">
                    <span>High (2x)</span>
                    {scale === 2.0 && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className={`text-[11px] ${scale === 2.0 ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Sharp Retina clarity, suitable for print (~200 DPI).
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              {pageCount && pageCount > 1
                ? `${pageCount} pages will be packaged into a ZIP archive`
                : '1 page will download directly as an image'}
            </span>

            <button
              onClick={handleConvert}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <FileImage className="w-4 h-4" />
              <span>Convert to {format === 'png' ? 'PNG' : 'JPG'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
