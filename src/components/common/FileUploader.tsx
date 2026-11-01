import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, AlertCircle, Shield } from 'lucide-react';
import { formatBytes } from '../../services/pdfEngine';

interface FileUploaderProps {
  accept?: string;
  acceptedFiles?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSizeMB?: number;
  maxSizeMB?: number;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  subtitle?: string;
  descriptionText?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  accept,
  acceptedFiles,
  multiple,
  maxFiles = 10,
  maxFileSizeMB,
  maxSizeMB,
  onFilesSelected,
  title,
  subtitle,
  descriptionText,
}) => {
  const effectiveAccept = accept || acceptedFiles || '.pdf';
  const effectiveMultiple = multiple !== undefined ? multiple : maxFiles > 1;
  const effectiveMaxFileSizeMB = maxFileSizeMB || maxSizeMB || 50;
  const effectiveSubtitle = subtitle || descriptionText || 'or drag and drop your document here';
  const effectiveTitle = title || (effectiveMultiple ? 'Choose files to upload' : 'Choose a file to upload');

  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndEmit = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setValidationError(null);

    const filesArray = Array.from(fileList);

    // 1. Max count check
    if (!effectiveMultiple && filesArray.length > 1) {
      setValidationError('Please select a single file for this operation.');
      return;
    }
    if (effectiveMultiple && filesArray.length > maxFiles) {
      setValidationError(`Maximum of ${maxFiles} files allowed at once.`);
      return;
    }

    // 2. Format & size checks
    const acceptedExtensions = effectiveAccept
      .split(',')
      .map((ext) => ext.trim().toLowerCase());

    const validFiles: File[] = [];

    for (const file of filesArray) {
      const fileNameLower = file.name.toLowerCase();
      const isExtMatch = acceptedExtensions.some((ext) => {
        if (ext.startsWith('.')) {
          return fileNameLower.endsWith(ext);
        }
        return file.type.toLowerCase().includes(ext);
      });

      if (!isExtMatch && effectiveAccept !== '*') {
        setValidationError(`Invalid file format: "${file.name}". Supported formats: ${effectiveAccept}`);
        return;
      }

      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > effectiveMaxFileSizeMB) {
        setValidationError(
          `"${file.name}" (${formatBytes(file.size)}) exceeds the maximum limit of ${effectiveMaxFileSizeMB} MB.`
        );
        return;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    validateAndEmit(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndEmit(e.target.files);
    // Reset so same file can be chosen again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Upload document drop zone"
        className={`group relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 ${
          isDragOver
            ? 'border-neutral-900 bg-neutral-100/70 scale-[0.99]'
            : 'border-neutral-300 hover:border-neutral-400 bg-white/70 hover:bg-neutral-50/50 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={effectiveAccept}
          multiple={effectiveMultiple}
          onChange={handleInputChange}
          className="hidden"
          aria-hidden="true"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 group-hover:bg-neutral-200/80 flex items-center justify-center text-neutral-800 transition-colors border border-neutral-200/80">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 font-sans group-hover:text-neutral-950">
              {effectiveTitle}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium">
              {effectiveSubtitle}
            </p>
          </div>

          <button
            type="button"
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-900 bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white rounded-lg transition-colors border border-neutral-200 group-hover:border-neutral-900"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Select {effectiveMultiple ? 'Files' : 'File'}</span>
          </button>

          <div className="pt-3 border-t border-neutral-200/60 w-full max-w-xs mx-auto flex items-center justify-center gap-3 text-[11px] text-neutral-400 font-medium">
            <span>Formats: {effectiveAccept.toUpperCase()}</span>
            <span>&bull;</span>
            <span>Max: {effectiveMaxFileSizeMB} MB</span>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Trust & Privacy badge */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
        <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Files are processed in-browser. Zero permanent storage.</span>
      </div>
    </div>
  );
};
