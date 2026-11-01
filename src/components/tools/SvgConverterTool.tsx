import React, { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { svgToRasterOrPdf } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { Sparkles, Sliders, CheckCircle2, Code, Eye, FileText, Image } from 'lucide-react';

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="300" rx="20" fill="#0f172a" />
  <circle cx="200" cy="130" r="60" fill="url(#grad1)" />
  <polygon points="200,90 235,170 165,170" fill="#ffffff" opacity="0.9" />
  <text x="200" y="240" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="#ffffff" text-anchor="middle">
    VECTOR EMBED
  </text>
  <text x="200" y="265" font-family="system-ui, sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">
    High Precision Rendering
  </text>
</svg>`;

export const SvgConverterTool: React.FC = () => {
  const [svgContent, setSvgContent] = useState<string>(SAMPLE_SVG);
  const [format, setFormat] = useState<'png' | 'jpeg' | 'pdf'>('png');
  const [scale, setScale] = useState<number>(2);
  const [background, setBackground] = useState<string>('transparent');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setSvgContent(text);
        setError(null);
      }
    };
    reader.onerror = () => setError('Failed to read SVG file.');
    reader.readAsText(file);
  };

  const handleConvert = async () => {
    if (!svgContent.trim()) {
      setError('Please provide an SVG vector markup or file.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await svgToRasterOrPdf(svgContent, {
        format,
        scale,
        background: format === 'jpeg' && background === 'transparent' ? '#ffffff' : background,
      });
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to convert SVG: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  if (result) {
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Convert Another SVG" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={`Rendering SVG vector to ${format.toUpperCase()}...`} subText="Rasterizing paths and Bézier curves with anti-aliasing" />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Control settings */}
      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Target Output Format
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'png', label: 'PNG' },
                { id: 'jpeg', label: 'JPG' },
                { id: 'pdf', label: 'PDF' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFormat(item.id as any)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all ${
                    format === item.id
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-700 border-neutral-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Export Scale Factor
            </label>
            <select
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              disabled={format === 'pdf'}
              className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-800 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-neutral-950"
            >
              <option value={1}>1x Standard (Original Size)</option>
              <option value={2}>2x Retina (Sharper UI)</option>
              <option value={4}>4x Ultra High-Res (Print Ready)</option>
              <option value={8}>8x Maximum Density (Large Scale)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Background Color
            </label>
            <select
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              disabled={format === 'jpeg'}
              className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-800 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-neutral-950"
            >
              <option value="transparent">Transparent Background</option>
              <option value="#ffffff">Solid White (#FFFFFF)</option>
              <option value="#0f172a">Solid Dark Slate (#0F172A)</option>
              <option value="#000000">Solid Black (#000000)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Editor & Preview Split View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col shadow-xs">
          <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-neutral-500" />
              SVG Code Markup
            </span>
            <label className="text-[11px] font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer">
              Upload .svg
              <input
                type="file"
                accept=".svg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFileUpload(Array.from(e.target.files));
                }}
              />
            </label>
          </div>
          <textarea
            value={svgContent}
            onChange={(e) => setSvgContent(e.target.value)}
            rows={12}
            className="w-full flex-1 p-3.5 font-mono text-xs text-neutral-800 bg-neutral-50/40 focus:bg-white focus:outline-none resize-none leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Live Vector Preview */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col shadow-xs">
          <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-neutral-500" />
              Realtime Vector Preview
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              Vector paths active
            </span>
          </div>
          <div className="flex-1 min-h-[260px] p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px] bg-neutral-50 flex items-center justify-center overflow-auto">
            <div
              className="max-w-full max-h-full drop-shadow-xs"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleConvert}
          className="px-6 py-2.5 bg-neutral-950 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Export SVG to {format.toUpperCase()} ({scale}x Scale)
        </button>
      </div>
    </div>
  );
};
