import React, { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { rotatePdf, getPdfInfo, renderPdfPageThumbnail, formatBytes } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { RotateCw, RotateCcw, FileText } from 'lucide-react';

interface PagePreview {
  index: number;
  rotation: number;
  thumbnailUrl: string;
}

export const RotatePdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Saving rotated PDF...');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setResult(null);
    setRotations({});

    try {
      const info = await getPdfInfo(selected);
      const previews: PagePreview[] = [];
      for (let i = 0; i < info.pageCount; i++) {
        const thumb = await renderPdfPageThumbnail(selected, i, 0.4);
        previews.push({
          index: i,
          rotation: info.pages[i]?.rotation || 0,
          thumbnailUrl: thumb,
        });
      }
      setPages(previews);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError('Could not inspect PDF pages: ' + msg);
    }
  };

  const rotateSingle = (idx: number, delta: number) => {
    setRotations((prev) => {
      const cur = prev[idx] || 0;
      return { ...prev, [idx]: (cur + delta) % 360 };
    });
  };

  const rotateAll = (delta: number) => {
    setRotations((prev) => {
      const updated: Record<number, number> = {};
      pages.forEach((p) => {
        const cur = prev[p.index] || 0;
        updated[p.index] = (cur + delta) % 360;
      });
      return updated;
    });
  };

  const handleSave = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const res = await rotatePdf(file, rotations, (msg) => setProgressMsg(msg));
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
    setPages([]);
    setRotations({});
    setResult(null);
    setError(null);
  };

  if (result) {
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Rotate Another PDF" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Updating page rotation coordinates" />;
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
          title="Select or Drop a PDF File to Rotate"
          subtitle="Rotate all pages together or adjust specific pages"
        />
      ) : (
        <div className="space-y-6">
          {/* Header & Global Rotation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold text-neutral-900 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-neutral-500 font-mono tabular-nums">
                  {formatBytes(file.size)} &bull; {pages.length} pages
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => rotateAll(90)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate All 90°</span>
              </button>

              <button
                type="button"
                onClick={() => rotateAll(180)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>180°</span>
              </button>

              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-red-600 rounded-lg transition-colors ml-2"
              >
                Change File
              </button>
            </div>
          </div>

          {/* Page Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[420px] overflow-y-auto pr-1">
            {pages.map((p) => {
              const userRot = rotations[p.index] || 0;
              const totalRot = (p.rotation + userRot) % 360;

              return (
                <div
                  key={p.index}
                  className="bg-white rounded-xl border border-neutral-200 p-2.5 flex flex-col items-center space-y-2 shadow-xs"
                >
                  <div className="aspect-3/4 w-full bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center relative">
                    <img
                      src={p.thumbnailUrl}
                      alt={`Page ${p.index + 1}`}
                      style={{ transform: `rotate(${userRot}deg)`, transition: 'transform 0.2s ease' }}
                      className="max-w-full max-h-full object-contain"
                    />
                    {userRot !== 0 && (
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-neutral-900/80 text-white rounded text-[10px] font-mono font-semibold">
                        +{userRot}°
                      </span>
                    )}
                  </div>

                  <div className="w-full flex items-center justify-between text-xs pt-1">
                    <span className="font-mono text-neutral-500 font-semibold">
                      Page {p.index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => rotateSingle(p.index, -90)}
                        title="Rotate left 90°"
                        className="p-1 text-neutral-600 hover:text-neutral-900 rounded hover:bg-neutral-100 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => rotateSingle(p.index, 90)}
                        title="Rotate right 90°"
                        className="p-1 text-neutral-600 hover:text-neutral-900 rounded hover:bg-neutral-100 transition-colors"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              Changes will be permanently encoded into the PDF coordinate system.
            </span>

            <button
              onClick={handleSave}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <RotateCw className="w-4 h-4" />
              <span>Apply Rotations & Download</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
