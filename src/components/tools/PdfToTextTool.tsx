import React, { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { PdfFilePreview } from '../common/PdfFilePreview';
import { pdfToText, formatBytes } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { FileText, Copy, Check, Download, RotateCcw } from 'lucide-react';

export const PdfToTextTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Extracting text content...');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setError(null);
    setResult(null);
    setExtractedText('');
  };

  const handleExtract = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const { text, result: res } = await pdfToText(file, (curr, total) => {
        setProgressMsg(`Extracting text from page ${curr} of ${total}...`);
      });
      setExtractedText(text);
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const handleReset = () => {
    setFile(null);
    setExtractedText('');
    setResult(null);
    setError(null);
  };

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Reading text character streams" />;
  }

  // Once extracted, show preview textarea + action buttons
  if (result && extractedText) {
    const wordCount = extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0;
    const charCount = extractedText.length;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 font-sans">
              Text Extracted Successfully
            </h3>
            <p className="text-xs text-neutral-500 font-mono tabular-nums">
              {wordCount.toLocaleString()} words &bull; {charCount.toLocaleString()} characters &bull; {result.pageCount} pages
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .TXT</span>
            </button>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          readOnly
          value={extractedText}
          rows={14}
          className="w-full p-4 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none resize-y leading-relaxed text-neutral-800"
        />

        <div className="flex justify-end pt-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Extract Another Document</span>
          </button>
        </div>
      </div>
    );
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
          title="Select or Drop a PDF File to Extract Text"
          subtitle="Pull structured text out of digital documents with zero cloud storage"
        />
      ) : (
        <div className="space-y-6">
          {/* File preview with live FileReader thumbnail */}
          <PdfFilePreview
            file={file}
            onChangeFile={handleReset}
            onRemove={handleReset}
          />

          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              Extracts digital text streams directly in browser memory.
            </span>

            <button
              onClick={handleExtract}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <FileText className="w-4 h-4" />
              <span>Extract Text</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
