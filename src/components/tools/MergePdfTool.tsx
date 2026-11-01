import React, { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { FileListPreview } from '../common/FileListPreview';
import { mergePdfs } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { Layers } from 'lucide-react';

export const MergePdfTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Stitching documents...');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setError(null);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const copy = [...prev];
      const item = copy.splice(fromIndex, 1)[0];
      copy.splice(toIndex, 0, item);
      return copy;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please add at least 2 PDF documents to merge.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await mergePdfs(files, (msg) => setProgressMsg(msg));
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
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
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Merge More PDFs" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Assembling your documents client-side in browser RAM" />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      {files.length === 0 ? (
        <FileUploader
          accept=".pdf"
          multiple={true}
          maxFiles={25}
          maxFileSizeMB={50}
          onFilesSelected={handleFilesSelected}
          title="Select or Drop PDF Files to Merge"
          subtitle="Choose 2 or more PDFs to combine into one file"
        />
      ) : (
        <div className="space-y-6">
          <FileListPreview
            files={files}
            onRemove={removeFile}
            onReorder={handleReorder}
            onAddFiles={handleFilesSelected}
            onClearAll={handleReset}
          />

          {/* Merge Trigger Button */}
          <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-neutral-500">
              {files.length < 2 ? 'Add at least 1 more PDF to merge' : 'Ready to merge in the order listed above'}
            </span>

            <button
              onClick={handleMerge}
              disabled={files.length < 2}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-neutral-900 active:scale-[0.98] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <Layers className="w-4 h-4" />
              <span>Merge {files.length} PDFs</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
