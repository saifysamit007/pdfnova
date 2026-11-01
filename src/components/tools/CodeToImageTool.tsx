import React, { useState } from 'react';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { renderCodeSnippetToImage, CodeSnippetConfig } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import { Code2, Palette, Sliders, CheckCircle2, Upload, FileCode } from 'lucide-react';

const SAMPLE_CODE = `// High-performance client-side image processing
import { PDFDocument } from 'pdf-lib';

export async function processDocument(file: File): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(buffer);
  
  // Clean redundant cross-reference streams
  const optimizedBytes = await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  return new Blob([optimizedBytes], { type: 'application/pdf' });
}`;

export const CodeToImageTool: React.FC = () => {
  const [code, setCode] = useState<string>(SAMPLE_CODE);
  const [fileName, setFileName] = useState<string>('documentProcessor.ts');
  const [language, setLanguage] = useState<string>('typescript');
  const [theme, setTheme] = useState<CodeSnippetConfig['theme']>('one-dark');
  const [windowStyle, setWindowStyle] = useState<CodeSnippetConfig['windowStyle']>('mac');
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [padding, setPadding] = useState<number>(32);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'js' || ext === 'jsx') setLanguage('javascript');
    else if (ext === 'ts' || ext === 'tsx') setLanguage('typescript');
    else if (ext === 'py') setLanguage('python');
    else if (ext === 'html') setLanguage('html');
    else if (ext === 'css') setLanguage('css');
    else if (ext === 'json') setLanguage('json');
    else if (ext === 'sql') setLanguage('sql');
    else if (ext === 'rs') setLanguage('rust');
    else if (ext === 'go') setLanguage('go');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCode(text);
        setError(null);
      }
    };
    reader.onerror = () => setError('Failed to read code file.');
    reader.readAsText(file);
  };

  const handleExport = async () => {
    if (!code.trim()) {
      setError('Please provide code to render.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await renderCodeSnippetToImage({
        code,
        fileName: fileName.trim() || undefined,
        language,
        theme,
        windowStyle,
        showLineNumbers,
        padding,
        format,
      });
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to render code image: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  if (result) {
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Render Another Code Snippet" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText="Rendering 2x Retina code card..." subText="Synthesizing themes, typography, and macOS window chrome" />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Options Bar */}
      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Theme */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-neutral-500" />
              Color Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-950"
            >
              <option value="one-dark">One Dark Pro</option>
              <option value="dracula">Dracula Violet</option>
              <option value="cyberpunk">Cyberpunk Neon</option>
              <option value="github-dark">GitHub Dark</option>
              <option value="minimal-light">Minimal Clean Light</option>
            </select>
          </div>

          {/* Window Frame */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Window Chrome
            </label>
            <select
              value={windowStyle}
              onChange={(e) => setWindowStyle(e.target.value as any)}
              className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-950"
            >
              <option value="mac">macOS Traffic Lights</option>
              <option value="windows">Windows Header</option>
              <option value="none">Frameless (Clean)</option>
            </select>
          </div>

          {/* Padding */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Outer Padding
            </label>
            <select
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value))}
              className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-950"
            >
              <option value={16}>Tight (16px)</option>
              <option value={32}>Balanced (32px)</option>
              <option value={48}>Spacious (48px)</option>
              <option value={64}>Hero Shot (64px)</option>
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  format === 'png'
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-700 border-neutral-200'
                }`}
              >
                Retina PNG
              </button>
              <button
                type="button"
                onClick={() => setFormat('jpeg')}
                className={`py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  format === 'jpeg'
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-700 border-neutral-200'
                }`}
              >
                High JPG
              </button>
            </div>
          </div>
        </div>

        {/* Second Row: File Title & Upload */}
        <div className="pt-3 border-t border-neutral-200/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g. index.ts, main.py"
              className="text-xs bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-neutral-800 font-mono w-48 focus:outline-none focus:ring-1 focus:ring-neutral-950"
            />
            <label className="flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
                className="rounded text-neutral-900 focus:ring-0"
              />
              Show line numbers
            </label>
          </div>

          <label className="text-xs font-medium px-3 py-1.5 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 cursor-pointer flex items-center gap-1.5 transition-colors text-neutral-700">
            <Upload className="w-3.5 h-3.5 text-neutral-500" />
            Upload Code File
            <input
              type="file"
              accept=".js,.ts,.tsx,.jsx,.py,.html,.css,.json,.sql,.rs,.go,.sh,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Code Editor */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-4 py-2 bg-neutral-900 text-neutral-400 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
            <span className="text-neutral-200 font-bold ml-2">{fileName || 'snippet'}</span>
          </div>
          <span>{code.split('\n').length} lines</span>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={14}
          className="w-full p-4 font-mono text-xs text-neutral-100 bg-[#1e1e24] focus:outline-none resize-y leading-relaxed"
          spellCheck={false}
        />
      </div>

      {/* Action */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleExport}
          className="px-6 py-2.5 bg-neutral-950 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Export Code Image ({format.toUpperCase()} 2x Retina)
        </button>
      </div>
    </div>
  );
};
