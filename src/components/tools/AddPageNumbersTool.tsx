import React, { useState, useEffect, useMemo } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import {
  addPageNumbersToPdf,
  getPdfInfo,
  renderPdfPageThumbnail,
  formatBytes,
  PageNumberFormat,
  PageNumberPosition,
  PageNumberOptions,
} from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import {
  Hash,
  FileText,
  ChevronLeft,
  ChevronRight,
  Check,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

const COLOR_PRESETS = [
  { label: 'Charcoal', hex: '#374151' },
  { label: 'Dark Slate', hex: '#0f172a' },
  { label: 'Neutral Gray', hex: '#6b7280' },
  { label: 'Deep Navy', hex: '#1e3a8a' },
  { label: 'Pure Black', hex: '#000000' },
];

export const AddPageNumbersTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [currentPreviewPage, setCurrentPreviewPage] = useState<number>(0);

  // Configuration options
  const [format, setFormat] = useState<PageNumberFormat>('page_n_of_total');
  const [customPattern, setCustomPattern] = useState<string>('Page {n} of {total}');
  const [position, setPosition] = useState<PageNumberPosition>('bottom-center');
  const [fontFamily, setFontFamily] = useState<'Helvetica' | 'TimesRoman' | 'Courier'>('Helvetica');
  const [fontSize, setFontSize] = useState<number>(10);
  const [colorHex, setColorHex] = useState<string>('#374151');
  const [startPageNumber, setStartPageNumber] = useState<number>(1);
  const [firstPageToNumber, setFirstPageToNumber] = useState<number>(1);
  const [lastPageToNumber, setLastPageToNumber] = useState<number | null>(null);
  const [scope, setScope] = useState<'all' | 'odd' | 'even'>('all');
  const [marginVertical, setMarginVertical] = useState<number>(24);
  const [marginHorizontal, setMarginHorizontal] = useState<number>(36);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Adding page numbers...');
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
      setCurrentPreviewPage(0);

      // Preload first 3 page thumbnails for fast preview
      const thumbs: Record<number, string> = {};
      const loadCount = Math.min(info.pageCount, 5);
      for (let i = 0; i < loadCount; i++) {
        thumbs[i] = await renderPdfPageThumbnail(selected, i, 0.6);
      }
      setThumbnails(thumbs);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError('Failed to load PDF: ' + msg);
    }
  };

  // Load preview thumbnail on demand
  useEffect(() => {
    if (!file || thumbnails[currentPreviewPage]) return;
    let isCancelled = false;

    renderPdfPageThumbnail(file, currentPreviewPage, 0.6).then((thumb) => {
      if (!isCancelled) {
        setThumbnails((prev) => ({ ...prev, [currentPreviewPage]: thumb }));
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [file, currentPreviewPage, thumbnails]);

  // Compute preview stamp text for current page
  const previewText = useMemo(() => {
    const pageNum1 = currentPreviewPage + 1;
    const isOdd = pageNum1 % 2 !== 0;
    const shouldNumber =
      pageNum1 >= firstPageToNumber &&
      (!lastPageToNumber || pageNum1 <= lastPageToNumber) &&
      (scope === 'all' || (scope === 'odd' && isOdd) || (scope === 'even' && !isOdd));

    if (!shouldNumber) return null;

    // Calculate number
    let countBefore = 0;
    for (let i = 0; i < currentPreviewPage; i++) {
      const p1 = i + 1;
      const pOdd = p1 % 2 !== 0;
      if (
        p1 >= firstPageToNumber &&
        (!lastPageToNumber || p1 <= lastPageToNumber) &&
        (scope === 'all' || (scope === 'odd' && pOdd) || (scope === 'even' && !pOdd))
      ) {
        countBefore++;
      }
    }

    const currentNum = startPageNumber + countBefore;
    const totalNumbered = Math.max(1, pageCount - (firstPageToNumber - 1));

    switch (format) {
      case 'page_n_of_total':
        return `Page ${currentNum} of ${totalNumbered}`;
      case 'n_slash_total':
        return `${currentNum} / ${totalNumbered}`;
      case 'page_n':
        return `Page ${currentNum}`;
      case 'dash_n_dash':
        return `- ${currentNum} -`;
      case 'bracket_n':
        return `[ ${currentNum} ]`;
      case 'roman': {
        const romanLookup: [number, string][] = [
          [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
          [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
          [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
        ];
        let roman = '';
        let n = currentNum;
        for (const [val, letter] of romanLookup) {
          while (n >= val) {
            roman += letter;
            n -= val;
          }
        }
        return roman || 'I';
      }
      case 'custom':
        return customPattern
          .replace(/\{n\}/g, String(currentNum))
          .replace(/\{total\}/g, String(totalNumbered));
      default:
        return `Page ${currentNum}`;
    }
  }, [currentPreviewPage, firstPageToNumber, lastPageToNumber, scope, startPageNumber, pageCount, format, customPattern]);

  const handleApply = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const options: PageNumberOptions = {
        format,
        customPattern: format === 'custom' ? customPattern : undefined,
        position,
        fontFamily,
        fontSize,
        colorHex,
        marginVertical,
        marginHorizontal,
        startPageNumber,
        firstPageToNumber,
        lastPageToNumber: lastPageToNumber || null,
        scope,
      };

      const res = await addPageNumbersToPdf(file, options, (msg) => setProgressMsg(msg));
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
    setPageCount(0);
    setThumbnails({});
    setCurrentPreviewPage(0);
    setResult(null);
    setError(null);
  };

  if (result) {
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Number Another PDF" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Stamping page numbers and embedding font typography" />;
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
          title="Select or Drop a PDF to Add Page Numbers"
          subtitle="Customize position, typography, numbering formats, and skip cover pages"
        />
      ) : (
        <div className="space-y-6">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold text-neutral-900 truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono tabular-nums">
                  <span>{formatBytes(file.size)}</span>
                  <span>&bull;</span>
                  <span>{pageCount} pages</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-red-600 rounded-lg transition-colors shrink-0"
            >
              Change File
            </button>
          </div>

          {/* Two-Column Workspace: Controls on Left, Live Preview on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Numbering Customization (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* 1. Format Selection */}
              <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Numbering Format
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'page_n_of_total', label: 'Page 1 of 12' },
                    { id: 'n_slash_total', label: '1 / 12' },
                    { id: 'page_n', label: 'Page 1' },
                    { id: 'dash_n_dash', label: '- 1 -' },
                    { id: 'bracket_n', label: '[ 1 ]' },
                    { id: 'roman', label: 'Roman (I, II, III)' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setFormat(fmt.id as PageNumberFormat)}
                      className={`px-3 py-2 text-left font-mono rounded-lg border transition-all ${
                        format === fmt.id
                          ? 'border-neutral-900 bg-neutral-900 text-white font-semibold shadow-xs'
                          : 'border-neutral-200 bg-neutral-50/50 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setFormat('custom')}
                    className={`text-xs font-medium px-2.5 py-1 rounded-md transition-colors ${
                      format === 'custom'
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-600 bg-neutral-100 hover:bg-neutral-200'
                    }`}
                  >
                    Custom Pattern
                  </button>
                  {format === 'custom' && (
                    <div className="mt-2 space-y-1">
                      <input
                        type="text"
                        value={customPattern}
                        onChange={(e) => setCustomPattern(e.target.value)}
                        placeholder="e.g. Document &bull; Page {n} of {total}"
                        className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 font-mono"
                      />
                      <span className="text-[11px] text-neutral-400 block">
                        Use <code>{'{n}'}</code> for page number and <code>{'{total}'}</code> for total pages.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Position Matrix (6-point grid) */}
              <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Placement Position
                  </h3>
                  <span className="text-xs font-mono text-neutral-500 capitalize">
                    {position.replace('-', ' ')}
                  </span>
                </div>

                {/* 6-box matrix representing top and bottom positions */}
                <div className="grid grid-cols-3 gap-2 max-w-sm">
                  {[
                    { pos: 'top-left', label: 'Top Left' },
                    { pos: 'top-center', label: 'Top Center' },
                    { pos: 'top-right', label: 'Top Right' },
                    { pos: 'bottom-left', label: 'Bottom Left' },
                    { pos: 'bottom-center', label: 'Bottom Center' },
                    { pos: 'bottom-right', label: 'Bottom Right' },
                  ].map((p) => {
                    const isSelected = position === p.pos;
                    return (
                      <button
                        key={p.pos}
                        type="button"
                        onClick={() => setPosition(p.pos as PageNumberPosition)}
                        className={`h-12 flex items-center justify-center rounded-lg border text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs font-semibold'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Page Scope & Cover Page Exclusion */}
              <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Page Scope & Offset
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      First page to number:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={pageCount}
                      value={firstPageToNumber}
                      onChange={(e) => setFirstPageToNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 font-mono"
                    />
                    <span className="text-[10px] text-neutral-400 mt-1 block">Set to 2 to skip cover</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Start numbering at:
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={startPageNumber}
                      onChange={(e) => setStartPageNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 font-mono"
                    />
                    <span className="text-[10px] text-neutral-400 mt-1 block">Offset value (e.g. 1)</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Apply numbering to:
                    </label>
                    <select
                      value={scope}
                      onChange={(e) => setScope(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 text-xs"
                    >
                      <option value="all">All Pages</option>
                      <option value="odd">Odd Pages Only</option>
                      <option value="even">Even Pages Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. Typography & Styling */}
              <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Typography & Color
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Font Family</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 text-xs"
                    >
                      <option value="Helvetica">Helvetica (Sans-Serif)</option>
                      <option value="TimesRoman">Times Roman (Serif)</option>
                      <option value="Courier">Courier (Monospace)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Font Size</label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                      className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 text-xs"
                    >
                      <option value={8}>8 pt (Small)</option>
                      <option value={10}>10 pt (Standard)</option>
                      <option value={12}>12 pt (Medium)</option>
                      <option value={14}>14 pt (Large)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Color</label>
                    <div className="flex items-center gap-1.5 pt-1">
                      {COLOR_PRESETS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setColorHex(c.hex)}
                          title={c.label}
                          style={{ backgroundColor: c.hex }}
                          className={`w-6 h-6 rounded-full border transition-transform ${
                            colorHex.toLowerCase() === c.hex.toLowerCase()
                              ? 'ring-2 ring-neutral-900 ring-offset-1 scale-110'
                              : 'border-neutral-300 opacity-80 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Stamping Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="p-4 bg-white rounded-xl border border-neutral-200 flex flex-col items-center">
                <div className="w-full flex items-center justify-between pb-3 text-xs text-neutral-600 border-b border-neutral-100">
                  <span className="font-semibold">Live Preview</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPreviewPage === 0}
                      onClick={() => setCurrentPreviewPage((p) => Math.max(0, p - 1))}
                      className="p-1 rounded text-neutral-600 hover:text-neutral-900 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-[11px]">
                      Page {currentPreviewPage + 1} of {pageCount}
                    </span>
                    <button
                      type="button"
                      disabled={currentPreviewPage >= pageCount - 1}
                      onClick={() => setCurrentPreviewPage((p) => Math.min(pageCount - 1, p + 1))}
                      className="p-1 rounded text-neutral-600 hover:text-neutral-900 disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Simulated Sheet Container with Live Stamped Text */}
                <div className="mt-4 relative bg-white border border-neutral-300 rounded shadow-md overflow-hidden aspect-3/4 w-full max-w-[280px] flex items-center justify-center select-none">
                  {thumbnails[currentPreviewPage] ? (
                    <img
                      src={thumbnails[currentPreviewPage]}
                      alt={`Preview of page ${currentPreviewPage + 1}`}
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  ) : (
                    <div className="text-xs text-neutral-400 font-mono">Rendering page...</div>
                  )}

                  {/* Stamp Overlay Text */}
                  {previewText ? (
                    <div
                      style={{
                        color: colorHex,
                        fontFamily:
                          fontFamily === 'Courier'
                            ? 'monospace'
                            : fontFamily === 'TimesRoman'
                            ? 'serif'
                            : 'sans-serif',
                        fontSize: `${fontSize * 0.9}px`,
                      }}
                      className={`absolute pointer-events-none font-medium px-2 py-0.5 tracking-tight ${
                        position === 'bottom-center'
                          ? 'bottom-3 left-1/2 -translate-x-1/2 text-center'
                          : position === 'bottom-left'
                          ? 'bottom-3 left-3 text-left'
                          : position === 'bottom-right'
                          ? 'bottom-3 right-3 text-right'
                          : position === 'top-center'
                          ? 'top-3 left-1/2 -translate-x-1/2 text-center'
                          : position === 'top-left'
                          ? 'top-3 left-3 text-left'
                          : 'top-3 right-3 text-right'
                      }`}
                    >
                      <span className="bg-white/80 backdrop-blur-[1px] px-1 py-0.5 rounded shadow-2xs">
                        {previewText}
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-x-0 bottom-4 text-center pointer-events-none">
                      <span className="text-[10px] text-neutral-400 italic bg-white/80 px-2 py-0.5 rounded">
                        (Unnumbered page)
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-neutral-400 mt-3 text-center">
                  Preview shows exact visual placement and font style before compilation.
                </p>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-neutral-500">
              Page numbers will be stamped vector-crisp onto your PDF.
            </span>

            <button
              onClick={handleApply}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <Hash className="w-4 h-4" />
              <span>Add Page Numbers & Download</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
