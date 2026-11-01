import React, { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { PdfFilePreview } from '../common/PdfFilePreview';
import { protectPdf } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const ProtectPdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Encrypting document...');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setError(null);
    setResult(null);
  };

  const handleProtect = async () => {
    if (!file) return;

    if (!password) {
      setError('Please provide a password to encrypt this document.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await protectPdf(file, password, undefined, (msg) => setProgressMsg(msg));
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
    setConfirmPassword('');
    setResult(null);
    setError(null);
  };

  if (result) {
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Protect Another PDF" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Generating encryption keys in browser memory" />;
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
          title="Select or Drop a PDF File to Protect"
          subtitle="Encrypt your document with password protection"
        />
      ) : (
        <div className="space-y-6">
          {/* File preview with live FileReader thumbnail */}
          <PdfFilePreview
            file={file}
            onChangeFile={handleReset}
            onRemove={handleReset}
          />

          {/* Password Form */}
          <div className="max-w-md mx-auto space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-800">Set Document Password:</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a secure password"
                  className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-800">Confirm Password:</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-neutral-100/70 rounded-lg text-neutral-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Passwords are never stored on our servers. Be sure to remember your password, as locked documents cannot be recovered without it.
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-neutral-200 flex justify-end">
            <button
              onClick={handleProtect}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <Lock className="w-4 h-4" />
              <span>Encrypt & Download PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
