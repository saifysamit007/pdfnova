import React, { useState } from 'react';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { htmlToImage } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { Code, Eye, Monitor, Tablet, Smartphone, Sparkles, Upload, FileCheck } from 'lucide-react';

const DEFAULT_SAMPLE_HTML = `<div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="display: inline-block; padding: 6px 12px; background: #e0f2fe; color: #0369a1; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 16px;">
    🚀 Featured Release
  </div>
  <h1 style="font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; letter-spacing: -0.02em;">
    Client-First Document Engine
  </h1>
  <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
    Build high-performance web applications with zero cloud storage dependencies. Render, convert, and transform assets with WebAssembly speed.
  </p>
  <div style="display: flex; gap: 12px;">
    <button style="padding: 10px 20px; background: #0f172a; color: white; border-radius: 8px; border: none; font-weight: 600; font-size: 14px; cursor: pointer;">
      Get Started
    </button>
    <button style="padding: 10px 20px; background: #f1f5f9; color: #334155; border-radius: 8px; border: 1px solid #cbd5e1; font-weight: 600; font-size: 14px; cursor: pointer;">
      Documentation
    </button>
  </div>
</div>`;

export const HtmlToJpgTool: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>(DEFAULT_SAMPLE_HTML);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [viewportWidth, setViewportWidth] = useState<number>(800);
  const [scale, setScale] = useState<number>(2);
  const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Rendering HTML to image...');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setHtmlContent(content);
        setError(null);
      }
    };
    reader.onerror = () => setError('Failed to read uploaded HTML file.');
    reader.readAsText(file);
  };

  const handleRender = async () => {
    if (!htmlContent.trim()) {
      setError('Please provide HTML content to render.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await htmlToImage(
        htmlContent,
        {
          width: viewportWidth,
          scale,
          format,
          quality: 0.95,
        },
        (msg) => setProgressMsg(msg)
      );
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to render HTML: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  if (result) {
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Render Another HTML" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Generating pixel-perfect canvas rasterization from DOM" />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Top Configuration Bar */}
      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'editor'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              HTML / CSS Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'preview'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Live Preview
            </button>
          </div>

          <label className="text-xs font-semibold px-3 py-1.5 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 cursor-pointer flex items-center gap-1.5 transition-colors text-neutral-700">
            <Upload className="w-3.5 h-3.5 text-neutral-500" />
            Upload .html File
            <input
              type="file"
              accept=".html,.htm"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Viewport & Quality Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-neutral-200/60">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Viewport Width
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: 'Mobile', width: 400, icon: Smartphone },
                { label: 'Tablet', width: 768, icon: Tablet },
                { label: 'Desktop', width: 1200, icon: Monitor },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setViewportWidth(item.width)}
                  className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium flex items-center justify-center gap-1 transition-all ${
                    viewportWidth === item.width
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <item.icon className="w-3 h-3" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Resolution Scale
            </label>
            <select
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-950"
            >
              <option value={1}>1x Standard DPI (Web)</option>
              <option value={2}>2x Retina Crisp (Recommended)</option>
              <option value={3}>3x Ultra-sharp (High Print)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Output Format
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setFormat('jpeg')}
                className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all ${
                  format === 'jpeg'
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-700 border-neutral-200'
                }`}
              >
                High-Res JPG
              </button>
              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all ${
                  format === 'png'
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-700 border-neutral-200'
                }`}
              >
                Lossless PNG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace (Editor or Live Preview) */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
        {activeTab === 'editor' ? (
          <div>
            <div className="px-4 py-2 bg-neutral-100/70 border-b border-neutral-200 flex items-center justify-between text-xs text-neutral-600 font-mono">
              <span>HTML & CSS Markup</span>
              <span>{htmlContent.length} characters</span>
            </div>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="Paste <div>, <h1>, <style>, or full HTML structure here..."
              rows={14}
              className="w-full p-4 font-mono text-xs text-neutral-800 bg-neutral-50/50 focus:bg-white focus:outline-none resize-y leading-relaxed"
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="p-6 bg-neutral-100 min-h-[380px] overflow-auto flex items-center justify-center">
            <div
              className="bg-white border border-neutral-200 shadow-sm rounded-lg overflow-hidden transition-all duration-200"
              style={{ width: `${Math.min(viewportWidth, 900)}px` }}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        )}
      </div>

      {/* Render Action */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleRender}
          className="px-6 py-2.5 bg-neutral-950 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <FileCheck className="w-4 h-4 text-emerald-400" />
          Render HTML to {format.toUpperCase()} ({scale}x Retina)
        </button>
      </div>
    </div>
  );
};
