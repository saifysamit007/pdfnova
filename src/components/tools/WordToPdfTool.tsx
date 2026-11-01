import React, { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { wordToPdf, formatBytes } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { FileCheck, FileText } from 'lucide-react';

export const WordToPdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Formatting document into PDF...');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setError(null);
    setResult(null);
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const res = await wordToPdf(file, (msg) => setProgressMsg(msg));
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
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Convert Another File" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Typesetting paragraphs and calculating A4 pagination" />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      {!file ? (
        <FileUploader
          accept=".txt,.doc,.docx"
          multiple={false}
          maxFileSizeMB={25}
          onFilesSelected={handleFileSelected}
          title="Select or Drop a Document to Convert to PDF"
          subtitle="Supports text manuscripts, exports, and document files"
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold text-neutral-900 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-neutral-500 font-mono tabular-nums">
                  {formatBytes(file.size)}
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

          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              Output follows standard ISO 32000-1 PDF document structure.
            </span>

            <button
              onClick={handleConvert}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <FileCheck className="w-4 h-4" />
              <span>Convert to PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
