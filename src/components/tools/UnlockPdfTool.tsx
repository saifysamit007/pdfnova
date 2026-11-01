import React, { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { PdfFilePreview } from '../common/PdfFilePreview';
import { unlockPdf } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { Unlock, AlertCircle } from 'lucide-react';

export const UnlockPdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Removing document restrictions...');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setError(null);
    setResult(null);
  };

  const handleUnlock = async () => {
    if (!file) return;

    if (!agreedToTerms) {
      setError('You must confirm that you have legitimate rights to access this document.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await unlockPdf(file, password, (msg) => setProgressMsg(msg));
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
    setPassword('');
    setAgreedToTerms(false);
    setResult(null);
    setError(null);
  };

  if (result) {
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Unlock Another PDF" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Decrypting security dictionaries" />;
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
          title="Select or Drop a Password-Protected PDF"
          subtitle="Remove restrictions and encryption with valid credentials"
        />
      ) : (
        <div className="space-y-6">
          {/* File preview with live FileReader thumbnail */}
          <PdfFilePreview
            file={file}
            onChangeFile={handleReset}
            onRemove={handleReset}
          />

          {/* Unlock form */}
          <div className="max-w-md mx-auto space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-800">
                Authorized Document Password (if required):
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
              <p className="text-[11px] text-neutral-500">
                Leave blank if the document only has owner permission restrictions without an open password.
              </p>
            </div>

            {/* Legal / Authorization check */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <label className="flex items-start gap-2 cursor-pointer text-neutral-800">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <span>
                    I confirm that I own this file or have explicit authorization to decrypt and remove its restrictions.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-neutral-200 flex justify-end">
            <button
              onClick={handleUnlock}
              disabled={!agreedToTerms}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-neutral-900 active:scale-[0.98] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
