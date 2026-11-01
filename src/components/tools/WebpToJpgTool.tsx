import React, { useState, useEffect } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { ErrorMessage } from '../common/ErrorMessage';
import {
  batchConvertWebpToJpg,
  ConvertedWebpItem,
  formatBytes,
  WebpToJpgOptions,
} from '../../services/pdfEngine';
import {
  Download,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Image as ImageIcon,
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  Trash2,
  Plus,
  Archive,
  Maximize2,
  X,
  FileCheck,
  TrendingDown,
  Info,
} from 'lucide-react';

interface UploadedWebpFile {
  file: File;
  id: string;
  previewUrl: string;
  width?: number;
  height?: number;
}

export const WebpToJpgTool: React.FC = () => {
  const [files, setFiles] = useState<UploadedWebpFile[]>([]);
  const [quality, setQuality] = useState<number>(0.90);
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [scale, setScale] = useState<number>(1.0);
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Converting WebP images...');
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const [convertedItems, setConvertedItems] = useState<ConvertedWebpItem[]>([]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [zipDownloadName, setZipDownloadName] = useState<string>('converted_jpg_images.zip');
  const [error, setError] = useState<string | null>(null);

  // Modal inspection
  const [inspectItem, setInspectItem] = useState<ConvertedWebpItem | null>(null);

  // Clean up object URLs on unmount or reset
  useEffect(() => {
    return () => {
      files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
      convertedItems.forEach((c) => URL.revokeObjectURL(c.previewUrl));
    };
  }, []);

  const handleFilesSelected = (newFiles: File[]) => {
    const webpFiles = newFiles.filter((f) =>
      f.name.toLowerCase().endsWith('.webp') || f.type === 'image/webp'
    );

    if (webpFiles.length === 0) {
      setError('Please select valid WebP image files (.webp).');
      return;
    }

    const items: UploadedWebpFile[] = webpFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      const item: UploadedWebpFile = {
        file,
        id: `${file.name}-${file.size}-${Math.random().toString(36).substring(2, 7)}`,
        previewUrl,
      };

      // Probe image dimensions
      const img = new Image();
      img.onload = () => {
        setFiles((curr) =>
          curr.map((c) =>
            c.id === item.id ? { ...c, width: img.naturalWidth, height: img.naturalHeight } : c
          )
        );
      };
      img.src = previewUrl;

      return item;
    });

    setFiles((prev) => [...prev, ...items]);
    setError(null);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleClearAll = () => {
    files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setError(null);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setProgressPercent(0);

    const options: WebpToJpgOptions = {
      quality,
      backgroundColor,
      scale: scale !== 1.0 ? scale : undefined,
      maxWidth: maxWidth && maxWidth > 0 ? maxWidth : undefined,
    };

    try {
      const result = await batchConvertWebpToJpg(
        files.map((f) => f.file),
        options,
        (curr, total, fileName) => {
          const pct = Math.round((curr / total) * 100);
          setProgressPercent(pct);
          setProgressMsg(`Processing ${curr} of ${total}: ${fileName}`);
        }
      );

      setConvertedItems(result.items);
      if (result.zipBlob) {
        setZipBlob(result.zipBlob);
        setZipDownloadName(result.zipDownloadName || 'converted_jpg_images.zip');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Conversion failed: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    convertedItems.forEach((c) => URL.revokeObjectURL(c.previewUrl));
    setFiles([]);
    setConvertedItems([]);
    setZipBlob(null);
    setError(null);
    setInspectItem(null);
  };

  const handleDownloadSingle = (item: ConvertedWebpItem) => {
    const url = URL.createObjectURL(item.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const handleDownloadZip = () => {
    if (!zipBlob) return;
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipDownloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  // Compute aggregated stats
  const totalOriginalBytes = convertedItems.reduce((acc, it) => acc + it.originalSize, 0);
  const totalResultBytes = convertedItems.reduce((acc, it) => acc + it.resultSize, 0);
  const diffBytes = totalOriginalBytes - totalResultBytes;
  const isReduced = diffBytes > 0;
  const pctChange = totalOriginalBytes > 0
    ? Math.round(Math.abs(diffBytes) / totalOriginalBytes * 100)
    : 0;

  // Processing View
  if (isProcessing) {
    return (
      <div className="py-12 px-4 max-w-lg mx-auto text-center space-y-6">
        <ProcessingIndicator
          statusText={progressMsg}
          subText={`Standardizing WebP image streams into universal baseline JPG (${Math.round(quality * 100)}% quality)`}
        />
        <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-neutral-900 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-neutral-500 font-mono">{progressPercent}% complete</p>
      </div>
    );
  }

  // Results View
  if (convertedItems.length > 0) {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Success Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs mb-1">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 font-sans tracking-tight">
            WebP to JPG Conversion Complete!
          </h3>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
            {convertedItems.length === 1
              ? 'Your WebP image has been converted to a standard baseline JPG file.'
              : `All ${convertedItems.length} WebP images have been converted to high-quality JPGs.`}
          </p>
        </div>

        {/* Aggregate Stats Card */}
        <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-5 max-w-3xl mx-auto shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white rounded-xl border border-neutral-200/60">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">Images</span>
              <span className="text-lg font-bold text-neutral-900 font-mono">{convertedItems.length}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-neutral-200/60">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">Original Size</span>
              <span className="text-lg font-bold text-neutral-700 font-mono">{formatBytes(totalOriginalBytes)}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-neutral-200/60">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">JPG Total</span>
              <span className="text-lg font-bold text-neutral-900 font-mono">{formatBytes(totalResultBytes)}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-neutral-200/60">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">Quality / Size</span>
              <span className="text-lg font-bold font-mono text-emerald-600">
                {Math.round(quality * 100)}% ({isReduced ? `-${pctChange}%` : `+${pctChange}%`})
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {convertedItems.length > 1 && zipBlob ? (
              <button
                type="button"
                onClick={handleDownloadZip}
                className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Archive className="w-4 h-4" />
                Download All as ZIP ({convertedItems.length} JPGs)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleDownloadSingle(convertedItems[0])}
                className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Converted JPG ({formatBytes(convertedItems[0].resultSize)})
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-3 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-neutral-500" />
              Convert More WebP Files
            </button>
          </div>
        </div>

        {/* Converted Items Grid */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Converted Images ({convertedItems.length})
            </h4>
            <span className="text-xs text-neutral-500">Click any card to inspect or preview</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {convertedItems.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-neutral-200/80 hover:border-neutral-300 p-3.5 shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail */}
                  <div
                    onClick={() => setInspectItem(item)}
                    className="relative w-full h-40 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200/60 mb-3 cursor-pointer flex items-center justify-center group-hover:opacity-95"
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.downloadName}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                      <span className="text-xs font-medium bg-black/60 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </span>
                    </div>
                    <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[10px]">
                      {item.width} × {item.height}
                    </span>
                  </div>

                  {/* Title & Info */}
                  <h5 className="text-xs font-semibold text-neutral-900 truncate mb-1" title={item.downloadName}>
                    {item.downloadName}
                  </h5>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono mb-3">
                    <span>WebP: {formatBytes(item.originalSize)}</span>
                    <ArrowRight className="w-3 h-3 text-neutral-400" />
                    <span className="font-semibold text-neutral-800">JPG: {formatBytes(item.resultSize)}</span>
                  </div>
                </div>

                {/* Card Download Button */}
                <button
                  type="button"
                  onClick={() => handleDownloadSingle(item)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download JPG
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Inspection Popover */}
        {inspectItem && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scaleUp">
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 truncate max-w-md">
                    {inspectItem.downloadName}
                  </h4>
                  <p className="text-xs text-neutral-500 font-mono">
                    {inspectItem.width} × {inspectItem.height} px • {formatBytes(inspectItem.resultSize)} (JPG)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(inspectItem)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectItem(null)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-neutral-900 flex items-center justify-center">
                <img
                  src={inspectItem.previewUrl}
                  alt={inspectItem.downloadName}
                  className="max-h-[65vh] object-contain rounded shadow"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Pre-Conversion Upload & Config View
  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* File Upload Zone */}
      {files.length === 0 ? (
        <FileUploader
          acceptedFiles=".webp"
          maxFiles={50}
          maxSizeMB={50}
          onFilesSelected={handleFilesSelected}
          descriptionText="Select or drag and drop single or multiple WebP (.webp) images. Convert them into standard, universally compatible JPG files with customizable quality and background color."
        />
      ) : (
        <div className="space-y-6">
          {/* Header controls for uploaded batch */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-xs">
                WEBP
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-900">
                  {files.length} WebP Image{files.length === 1 ? '' : 's'} Selected
                </h4>
                <p className="text-xs text-neutral-500 font-mono">
                  Total Size: {formatBytes(files.reduce((a, b) => a + b.file.size, 0))}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-medium rounded-lg cursor-pointer transition-colors shadow-2xs">
                <Plus className="w-3.5 h-3.5" />
                Add More
                <input
                  type="file"
                  multiple
                  accept=".webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFilesSelected(Array.from(e.target.files));
                    }
                  }}
                />
              </label>
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            </div>
          </div>

          {/* Uploaded Thumbnails Reel */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-72 overflow-y-auto p-1">
            {files.map((item) => (
              <div
                key={item.id}
                className="relative bg-white border border-neutral-200 rounded-xl p-2 group shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="w-full h-24 bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center mb-1.5">
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[11px] font-medium text-neutral-800 truncate" title={item.file.name}>
                  {item.file.name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                  <span>{formatBytes(item.file.size)}</span>
                  {item.width && item.height && (
                    <span>{item.width}×{item.height}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(item.id)}
                  title="Remove file"
                  className="absolute top-1 right-1 p-1 bg-neutral-900/70 hover:bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Conversion Configuration Settings Panel */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 space-y-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-200">
              <Sliders className="w-4 h-4 text-neutral-700" />
              <h4 className="text-sm font-bold text-neutral-900">
                Conversion & Quality Settings
              </h4>
            </div>

            {/* Quality Slider & Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-neutral-900 block">
                    JPEG Compression Quality
                  </label>
                  <p className="text-[11px] text-neutral-500">
                    Controls image compression and photographic fidelity
                  </p>
                </div>
                <span className="text-sm font-mono font-bold px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded text-neutral-800">
                  {Math.round(quality * 100)}%
                </span>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Compact', val: 0.70, desc: 'Small file' },
                  { label: 'Balanced', val: 0.80, desc: 'Recommended' },
                  { label: 'High', val: 0.90, desc: 'Sharp text' },
                  { label: 'Max', val: 0.98, desc: 'Lossless look' },
                ].map((preset) => {
                  const isSelected = Math.abs(quality - preset.val) < 0.02;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setQuality(preset.val)}
                      className={`py-2 px-2 rounded-xl text-center border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs font-semibold'
                          : 'border-neutral-200 bg-neutral-50/70 hover:bg-neutral-100 text-neutral-700 text-xs'
                      }`}
                    >
                      <div className="text-xs font-medium">{preset.label}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
                        {Math.round(preset.val * 100)}%
                      </div>
                    </button>
                  );
                })}
              </div>

              <input
                type="range"
                min="0.10"
                max="1.00"
                step="0.02"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-neutral-900 cursor-pointer"
              />
            </div>

            {/* Background Color for Transparency */}
            <div className="space-y-3 pt-3 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                    Background Color for Transparent Areas
                    <span className="text-[10px] font-normal text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      Transparency Fix
                    </span>
                  </label>
                  <p className="text-[11px] text-neutral-500">
                    JPG doesn't support transparency. Transparent WebP areas will be filled with this color.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { name: 'Pure White', hex: '#ffffff' },
                  { name: 'Off-White', hex: '#f8fafc' },
                  { name: 'Pure Black', hex: '#000000' },
                  { name: 'Dark Slate', hex: '#0f172a' },
                ].map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setBackgroundColor(color.hex)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      backgroundColor.toLowerCase() === color.hex.toLowerCase()
                        ? 'border-neutral-900 bg-neutral-100 font-semibold shadow-2xs'
                        : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-2xs"
                      style={{ backgroundColor: color.hex }}
                    />
                    {color.name}
                  </button>
                ))}

                {/* Custom Color Input */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-200 rounded-lg text-xs">
                  <span className="text-neutral-500">Custom:</span>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                    title="Choose custom background color"
                  />
                  <span className="font-mono text-[11px] text-neutral-600 uppercase">
                    {backgroundColor}
                  </span>
                </div>
              </div>
            </div>

            {/* Resolution Scaling & Constraint Options */}
            <div className="space-y-3 pt-3 border-t border-neutral-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-900 block mb-1">
                    Image Scale Factor
                  </label>
                  <select
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
                  >
                    <option value={1.0}>100% Original Resolution</option>
                    <option value={0.75}>75% Scale (Balanced)</option>
                    <option value={0.50}>50% Half Dimensions</option>
                    <option value={0.25}>25% Quarter Dimensions</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-900 block mb-1">
                    Max Width Constraint
                  </label>
                  <select
                    value={maxWidth || 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setMaxWidth(val > 0 ? val : undefined);
                    }}
                    className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
                  >
                    <option value={0}>No Constraint (Original Width)</option>
                    <option value={1920}>Max 1920px (Full HD Web)</option>
                    <option value={1280}>Max 1280px (Standard HD)</option>
                    <option value={800}>Max 800px (Blog / Thumbnail)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Privacy & Conversion Note */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 text-neutral-600 text-xs border border-neutral-200/60">
              <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
              <p>
                <strong>Client-Side Engine:</strong> Your images are processed directly in browser memory via HTML5 Canvas. No images are sent to external servers or stored in the cloud.
              </p>
            </div>
          </div>

          {/* Primary Convert Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleConvert}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Convert {files.length} WebP Image{files.length === 1 ? '' : 's'} to JPG
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
