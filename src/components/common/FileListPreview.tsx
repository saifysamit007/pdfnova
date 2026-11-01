import React, { useState } from 'react';
import { PdfFilePreview } from './PdfFilePreview';
import { formatBytes } from '../../services/pdfEngine';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  LayoutGrid,
  List as ListIcon,
  Layers,
} from 'lucide-react';

export interface FileListPreviewProps {
  files: File[];
  onRemove: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onAddFiles?: (newFiles: File[]) => void;
  onClearAll?: () => void;
  acceptedFiles?: string;
  className?: string;
}

export const FileListPreview: React.FC<FileListPreviewProps> = ({
  files,
  onRemove,
  onReorder,
  onAddFiles,
  onClearAll,
  acceptedFiles = '.pdf',
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const moveUp = (idx: number) => {
    if (!onReorder || idx === 0) return;
    onReorder(idx, idx - 1);
  };

  const moveDown = (idx: number) => {
    if (!onReorder || idx === files.length - 1) return;
    onReorder(idx, idx + 1);
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Action and Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-neutral-900 font-sans">
              {files.length} {files.length === 1 ? 'Document' : 'Documents'} Queued
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-200 text-neutral-700 font-semibold">
              Live Thumbnails
            </span>
          </div>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Total batch size: {formatBytes(totalSize)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-neutral-200 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'list'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="List view with thumbnails"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add more files */}
          {onAddFiles && (
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 rounded-lg transition-colors border border-neutral-300 shadow-2xs">
              <Plus className="w-3.5 h-3.5 text-neutral-600" />
              <span>Add More</span>
              <input
                type="file"
                accept={acceptedFiles}
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) onAddFiles(Array.from(e.target.files));
                  e.target.value = '';
                }}
              />
            </label>
          )}

          {onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="px-2.5 py-1.5 text-xs font-medium text-neutral-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* RENDER LIST VIEW */}
      {viewMode === 'list' ? (
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {files.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="relative group bg-white border border-neutral-200/90 rounded-xl p-2.5 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-between gap-3"
            >
              {/* Order number badge */}
              <div className="w-6 h-6 rounded-md bg-neutral-100 border border-neutral-200 text-neutral-600 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </div>

              {/* PDF Preview Row */}
              <div className="flex-1 min-w-0">
                <PdfFilePreview
                  file={file}
                  variant="compact"
                  className="!border-0 !p-0 !bg-transparent hover:!bg-transparent"
                />
              </div>

              {/* Ordering and remove controls */}
              <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-neutral-200/60">
                {onReorder && (
                  <>
                    <button
                      type="button"
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 rounded hover:bg-neutral-100 transition-colors"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(idx)}
                      disabled={idx === files.length - 1}
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 rounded hover:bg-neutral-100 transition-colors"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                  title="Remove document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* RENDER GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto p-1">
          {files.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="relative bg-white border border-neutral-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between hover:border-neutral-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-5 h-5 rounded bg-neutral-900 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                  #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="p-1 text-neutral-400 hover:text-red-600 rounded hover:bg-red-50"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex justify-center my-1">
                <PdfFilePreview
                  file={file}
                  variant="mini"
                  className="mx-auto"
                />
              </div>

              <div className="mt-2 text-center">
                <p className="text-xs font-semibold text-neutral-800 truncate" title={file.name}>
                  {file.name}
                </p>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {formatBytes(file.size)}
                </span>
              </div>

              {onReorder && (
                <div className="flex items-center justify-center gap-1 mt-2 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 rounded"
                    title="Move left"
                  >
                    <ArrowUp className="w-3 h-3 rotate-[-90deg]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(idx)}
                    disabled={idx === files.length - 1}
                    className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 rounded"
                    title="Move right"
                  >
                    <ArrowDown className="w-3 h-3 rotate-[-90deg]" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
