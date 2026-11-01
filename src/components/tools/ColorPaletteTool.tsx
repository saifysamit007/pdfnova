import React, { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { ErrorMessage } from '../common/ErrorMessage';
import { extractPaletteFromFile, ExtractedColor } from '../../services/pdfEngine';
import { Palette, Copy, Check, Download, Sparkles, RefreshCw, FileText } from 'lucide-react';

export const ColorPaletteTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<ExtractedColor[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'tailwind' | 'css' | 'json'>('tailwind');
  const [copiedCode, setCopiedCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setIsProcessing(true);

    if (selected.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }

    try {
      const colors = await extractPaletteFromFile(selected, 8);
      setPalette(colors);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to extract palette: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const generateExportCode = () => {
    if (palette.length === 0) return '';

    if (exportFormat === 'tailwind') {
      const colorsObj = palette.reduce((acc, c, idx) => {
        const name = idx === 0 ? 'primary' : idx === 1 ? 'secondary' : idx === 2 ? 'accent' : `brand-${idx + 1}`;
        acc[name] = c.hex;
        return acc;
      }, {} as Record<string, string>);

      return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(colorsObj, null, 8).replace(/"([^"]+)":/g, '$1:')}\n    }\n  }\n};`;
    }

    if (exportFormat === 'css') {
      const lines = palette.map((c, idx) => {
        const name = idx === 0 ? 'primary' : idx === 1 ? 'secondary' : idx === 2 ? 'accent' : `color-${idx + 1}`;
        return `  --${name}: ${c.hex}; /* ${c.rgb} */`;
      });
      return `:root {\n${lines.join('\n')}\n}`;
    }

    return JSON.stringify(
      palette.map((c) => ({
        hex: c.hex,
        rgb: c.rgb,
        hsl: c.hsl,
        isLight: c.isLight,
      })),
      null,
      2
    );
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateExportCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setPalette([]);
    setError(null);
  };

  if (isProcessing) {
    return <ProcessingIndicator statusText="Sampling color quantization..." subText="Analyzing image histogram and dominant hue distribution" />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {!file ? (
        <FileUploader
          acceptedFiles=".png,.jpg,.jpeg,.svg,.webp,.jfif,.pdf"
          maxFiles={1}
          maxSizeMB={50}
          onFilesSelected={handleFilesSelected}
          descriptionText="Select or drop any image (PNG, JPG, SVG, WebP, JFIF) or PDF mockup to extract its complete design color palette."
        />
      ) : (
        <div className="space-y-6">
          {/* Header Info */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {previewUrl ? (
                <div className="w-12 h-12 rounded-lg bg-neutral-200 overflow-hidden border border-neutral-300 shrink-0">
                  <img src={previewUrl} alt="Analyzed" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shrink-0">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 truncate max-w-xs sm:max-w-md">
                  {file.name}
                </h4>
                <p className="text-xs text-neutral-500 font-mono">
                  Extracted {palette.length} dominant colors
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-neutral-500 hover:text-neutral-900 underline underline-offset-2"
            >
              Analyze Another Asset
            </button>
          </div>

          {/* Color Swatches Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {palette.map((color, idx) => (
              <div
                key={color.hex + idx}
                onClick={() => copyHex(color.hex)}
                className="group relative bg-white border border-neutral-200 rounded-xl overflow-hidden p-2 shadow-xs hover:border-neutral-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div
                  className="w-full aspect-[4/3] rounded-lg shadow-inner flex items-center justify-center relative transition-transform group-hover:scale-[1.02]"
                  style={{ backgroundColor: color.hex }}
                >
                  <div
                    className={`opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold px-2 py-1 rounded shadow-xs flex items-center gap-1 ${
                      color.isLight ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900'
                    }`}
                  >
                    {copiedHex === color.hex ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Hex
                      </>
                    )}
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-neutral-900">
                      {color.hex}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      #{idx + 1}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 font-mono truncate">
                    {color.rgb}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-mono truncate">
                    {color.hsl}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Export Code Box */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'tailwind', label: 'Tailwind Config' },
                  { id: 'css', label: 'CSS Variables' },
                  { id: 'json', label: 'JSON Palette' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setExportFormat(item.id as any)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      exportFormat === item.id
                        ? 'bg-neutral-900 text-white'
                        : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1 bg-white border border-neutral-300 rounded-md text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 font-mono text-xs text-neutral-800 bg-neutral-50/50 overflow-x-auto leading-relaxed">
              {generateExportCode()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
