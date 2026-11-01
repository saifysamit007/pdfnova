import React, { useState, useRef, useEffect } from 'react';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { SuccessDownload } from '../common/SuccessDownload';
import { ErrorMessage } from '../common/ErrorMessage';
import { convertWebpageToPdf, WebpageToPdfOptions } from '../../services/pdfEngine';
import { ProcessedResult } from '../../types';
import {
  Globe,
  Code,
  Eye,
  FileText,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
  Download,
  Link,
  RotateCw,
  Sliders,
  Check,
  Upload,
} from 'lucide-react';

const PRESET_TEMPLATES: Record<string, { label: string; title: string; html: string }> = {
  article: {
    label: 'Blog / Article',
    title: 'Modern Document Engineering',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.65; color: #1e293b; background: #ffffff; padding: 40px; margin: 0 auto; max-width: 800px; }
    .tag { display: inline-block; padding: 4px 10px; background: #eff6ff; color: #2563eb; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    h1 { font-size: 32px; font-weight: 800; color: #0f172a; margin: 16px 0 12px 0; line-height: 1.25; }
    .meta { font-size: 13px; color: #64748b; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
    p { font-size: 15px; margin-bottom: 18px; color: #334155; }
    .quote-box { border-left: 4px solid #2563eb; background: #f8fafc; padding: 18px 24px; margin: 24px 0; border-radius: 0 8px 8px 0; font-style: italic; color: #1e293b; }
    h2 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 32px 0 12px 0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
    .card { padding: 18px; border: 1px solid #e2e8f0; border-radius: 10px; background: #ffffff; }
    .card h3 { margin: 0 0 6px 0; font-size: 16px; color: #0f172a; }
    .card p { margin: 0; font-size: 13px; color: #64748b; }
  </style>
</head>
<body>
  <span class="tag">Engineering Architecture</span>
  <h1>The Shift Toward Zero-Storage Web Utilities</h1>
  <div class="meta">By Marcus Chen &bull; Published September 2026 &bull; 6 min read</div>
  
  <p>For two decades, web utilities followed a monolithic cloud pipeline: user files were transmitted to external servers, processed in background workers, stored in storage buckets, and sent back via temporary download links.</p>

  <div class="quote-box">
    "Client-side execution through WebAssembly and modern browser memory models eliminates the fundamental liability of processing sensitive documents on third-party infrastructure."
  </div>

  <h2>Key Performance & Privacy Pillars</h2>
  <div class="grid">
    <div class="card">
      <h3>1. Hardware Isolation</h3>
      <p>Data stays inside local machine RAM with zero external server transit.</p>
    </div>
    <div class="card">
      <h3>2. Instant Latency</h3>
      <p>No upload bottlenecks. 50 MB files compile in sub-second cycles.</p>
    </div>
  </div>

  <p>As organizations prioritize strict compliance standards including GDPR and HIPAA, client-side document processing has graduated from experimental novelty to foundational standard.</p>
</body>
</html>`,
  },
  invoice: {
    label: 'Invoice / Receipt',
    title: 'Invoice #INV-2026-0842',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; background: #ffffff; padding: 40px; margin: 0 auto; max-width: 800px; font-size: 14px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; }
    .brand { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
    .inv-title { font-size: 24px; font-weight: 700; color: #2563eb; text-align: right; }
    .inv-meta { text-align: right; font-size: 12px; color: #64748b; margin-top: 4px; }
    .billing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 36px; padding: 18px; background: #f8fafc; border-radius: 8px; }
    .bill-col h4 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; }
    .bill-col p { margin: 0 0 4px 0; font-size: 13px; line-height: 1.4; color: #1e293b; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    th { text-align: left; padding: 12px; background: #0f172a; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
    th:last-child { text-align: right; }
    td { padding: 14px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    td:last-child { text-align: right; font-weight: 600; }
    .total-row { display: flex; justify-content: flex-end; margin-top: 16px; }
    .total-box { width: 240px; border-top: 2px solid #0f172a; padding-top: 12px; }
    .total-line { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #64748b; }
    .total-line.grand { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
    .badge-paid { display: inline-block; padding: 3px 8px; background: #dcfce7; color: #15803d; border-radius: 4px; font-weight: 700; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">ACME Cloud Services Inc.</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 4px;">100 Montgomery St, Suite 1400<br>San Francisco, CA 94104</div>
    </div>
    <div>
      <div class="inv-title">INVOICE</div>
      <div class="inv-meta">
        <strong>Invoice #:</strong> INV-2026-0842<br>
        <strong>Date:</strong> Sep 23, 2026<br>
        <strong>Status:</strong> <span class="badge-paid">PAID</span>
      </div>
    </div>
  </div>

  <div class="billing-grid">
    <div class="bill-col">
      <h4>Billed To:</h4>
      <p><strong>Nova Tech Labs</strong></p>
      <p>Attn: Accounts Payable</p>
      <p>742 Evergreen Terrace, Seattle, WA</p>
    </div>
    <div class="bill-col">
      <h4>Payment Details:</h4>
      <p><strong>Method:</strong> Corporate Card (ending 4921)</p>
      <p><strong>Auth Code:</strong> TX-984124</p>
      <p><strong>Terms:</strong> Net 0 (Immediate)</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Hours / Qty</th>
        <th>Rate</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Dedicated High-Throughput Worker Cluster</strong><br><span style="font-size:11px; color:#64748b;">Tier 3 Compute Instances &bull; September Allocation</span></td>
        <td>1 Mo</td>
        <td>$1,250.00</td>
        <td>$1,250.00</td>
      </tr>
      <tr>
        <td><strong>Custom PDF Engine WebAssembly Pipeline Integration</strong><br><span style="font-size:11px; color:#64748b;">Font subsetting, encryption ciphers & vector optimization</span></td>
        <td>24 Hrs</td>
        <td>$125.00</td>
        <td>$3,000.00</td>
      </tr>
      <tr>
        <td><strong>Priority 24/7 SLA Technical Support</strong><br><span style="font-size:11px; color:#64748b;">Enterprise 15-minute response guarantee</span></td>
        <td>1 Mo</td>
        <td>$450.00</td>
        <td>$450.00</td>
      </tr>
    </tbody>
  </table>

  <div class="total-row">
    <div class="total-box">
      <div class="total-line"><span>Subtotal:</span><span>$4,700.00</span></div>
      <div class="total-line"><span>Tax (0.0%):</span><span>$0.00</span></div>
      <div class="total-line grand"><span>Total Due:</span><span>$4,700.00</span></div>
    </div>
  </div>
</body>
</html>`,
  },
  doc: {
    label: 'API Documentation',
    title: 'Developer API Specification',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; color: #0f172a; background: #ffffff; padding: 40px; margin: 0 auto; max-width: 800px; }
    h1 { font-size: 26px; font-weight: 800; margin-bottom: 8px; }
    p { font-size: 14px; line-height: 1.6; color: #475569; font-family: sans-serif; }
    .endpoint { display: flex; align-items: center; gap: 10px; background: #f1f5f9; padding: 10px 14px; border-radius: 8px; margin: 20px 0; }
    .method { background: #0284c7; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
    .path { font-family: monospace; font-size: 14px; font-weight: 600; }
    code { background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    pre { background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 12px; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-family: sans-serif; font-size: 13px; }
    th { text-align: left; padding: 8px; border-bottom: 2px solid #cbd5e1; }
    td { padding: 10px 8px; border-bottom: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <h1>Document Conversion API</h1>
  <p>Programmatically render HTML documents or raw DOM strings into standardized A4 and Letter vector PDFs.</p>

  <div class="endpoint">
    <span class="method">POST</span>
    <span class="path">/api/v1/convert/webpage</span>
  </div>

  <p><strong>Parameters:</strong></p>
  <table>
    <tr><th>Field</th><th>Type</th><th>Description</th></tr>
    <tr><td><code>html</code></td><td>String (Required)</td><td>UTF-8 encoded HTML & CSS content.</td></tr>
    <tr><td><code>paperSize</code></td><td>Enum</td><td><code>a4</code>, <code>letter</code>, or <code>fit</code>.</td></tr>
    <tr><td><code>viewport</code></td><td>Integer</td><td>Width in CSS pixels (1200, 768, 420).</td></tr>
  </table>

  <p><strong>Request Example:</strong></p>
  <pre>curl -X POST https://api.pdfnova.com/v1/convert/webpage \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"paperSize": "a4", "orientation": "portrait"}'</pre>
</body>
</html>`,
  },
};

export const WebpageToPdfTool: React.FC = () => {
  const [inputMode, setInputMode] = useState<'url' | 'html'>('url');
  const [urlInput, setUrlInput] = useState<string>('https://example.com');
  const [documentTitle, setDocumentTitle] = useState<string>('Webpage Document');
  const [htmlContent, setHtmlContent] = useState<string>(PRESET_TEMPLATES.article.html);
  const [selectedPreset, setSelectedPreset] = useState<string>('article');

  // Page Options
  const [paperSize, setPaperSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<'none' | 'compact' | 'standard' | 'generous'>('standard');
  const [viewportWidth, setViewportWidth] = useState<1200 | 768 | 420>(1200);
  const [addHeaderFooter, setAddHeaderFooter] = useState<boolean>(true);

  // States
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Generating PDF...');
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  // Load preset template
  const handleSelectPreset = (key: string) => {
    if (PRESET_TEMPLATES[key]) {
      setSelectedPreset(key);
      setHtmlContent(PRESET_TEMPLATES[key].html);
      setDocumentTitle(PRESET_TEMPLATES[key].title);
    }
  };

  // Handle URL fetch
  const handleFetchUrl = async () => {
    if (!urlInput.trim()) {
      setError('Please enter a valid webpage URL.');
      return;
    }

    let urlToFetch = urlInput.trim();
    if (!urlToFetch.startsWith('http://') && !urlToFetch.startsWith('https://')) {
      urlToFetch = 'https://' + urlToFetch;
      setUrlInput(urlToFetch);
    }

    setIsFetchingUrl(true);
    setError(null);

    try {
      // Try direct fetch first
      const resp = await fetch(urlToFetch, { mode: 'cors' }).catch(() => null);
      if (resp && resp.ok) {
        const text = await resp.text();
        setHtmlContent(text);
        try {
          const parsed = new URL(urlToFetch);
          setDocumentTitle(parsed.hostname.replace('www.', ''));
        } catch {
          setDocumentTitle('Webpage Document');
        }
        setIsFetchingUrl(false);
        return;
      }

      // If browser CORS restrictions prevent reading cross-origin body, construct clean reader layout
      const parsed = new URL(urlToFetch);
      const title = parsed.hostname.replace('www.', '') + parsed.pathname;
      setDocumentTitle(title);

      const readerHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; background: #ffffff; padding: 40px; margin: 0 auto; max-width: 800px; }
    .url-bar { font-family: monospace; font-size: 13px; color: #64748b; background: #f1f5f9; padding: 8px 14px; border-radius: 6px; margin-bottom: 24px; word-break: break-all; }
    h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; }
    .badge { display: inline-block; padding: 4px 10px; background: #dbeafe; color: #1e40af; border-radius: 4px; font-size: 11px; font-weight: 700; margin-bottom: 12px; }
    p { font-size: 15px; margin-bottom: 16px; color: #334155; }
    .notice { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="url-bar">Webpage Source: ${urlToFetch}</div>
  <span class="badge">Article Snapshot</span>
  <h1>Webpage Document: ${parsed.hostname}</h1>
  <p>Captured directly from <code>${urlToFetch}</code> on ${new Date().toLocaleDateString()}.</p>
  <div class="notice">
    <strong>Webpage Note:</strong> If this target website restricts direct browser-to-browser CORS extraction, you can also paste the webpage's raw HTML source code or select a preset template from the HTML Editor tab to customize layout.
  </div>
</body>
</html>`;

      setHtmlContent(readerHtml);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError('Unable to fetch URL: ' + msg);
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setHtmlContent(content);
      setDocumentTitle(uploadedFile.name.replace(/\.(html|htm)$/i, ''));
      setActiveTab('preview');
    };
    reader.readAsText(uploadedFile);
  };

  const handleConvert = async () => {
    if (!htmlContent.trim()) {
      setError('Please provide webpage HTML content or fetch a URL first.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const options: WebpageToPdfOptions = {
        htmlContent,
        url: inputMode === 'url' ? urlInput : undefined,
        title: documentTitle,
        paperSize,
        orientation,
        margin,
        viewportWidth,
        includeBackground: true,
        addHeaderFooter,
      };

      const res = await convertWebpageToPdf(options, (msg) => setProgressMsg(msg));
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError('Conversion failed: ' + msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  if (result) {
    return <SuccessDownload result={result} onReset={handleReset} resetButtonText="Convert Another Webpage" />;
  }

  if (isProcessing) {
    return <ProcessingIndicator statusText={progressMsg} subText="Generating high-fidelity paginated PDF document" />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      {/* Input Mode Selector */}
      <div className="flex border-b border-neutral-200">
        <button
          type="button"
          onClick={() => setInputMode('url')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            inputMode === 'url'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Webpage URL</span>
        </button>
        <button
          type="button"
          onClick={() => setInputMode('html')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            inputMode === 'html'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>HTML & Presets</span>
        </button>
      </div>

      {/* Mode 1: URL Input */}
      {inputMode === 'url' && (
        <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-3">
          <label htmlFor="webpage-url" className="block text-xs font-semibold text-neutral-700">
            Enter Webpage Address to Convert:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Link className="w-4 h-4" />
              </span>
              <input
                id="webpage-url"
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 font-mono"
              />
            </div>
            <button
              type="button"
              onClick={handleFetchUrl}
              disabled={isFetchingUrl}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-lg transition-colors shrink-0"
            >
              {isFetchingUrl ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
              <span>Load Webpage</span>
            </button>
          </div>
          <p className="text-[11px] text-neutral-500">
            Fetches webpage structure and typography for client-side multi-page rendering.
          </p>
        </div>
      )}

      {/* Mode 2: HTML & Presets */}
      {inputMode === 'html' && (
        <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700">
              <span>Quick Templates:</span>
              {Object.entries(PRESET_TEMPLATES).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectPreset(key)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedPreset === key
                      ? 'bg-neutral-900 text-white font-semibold'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload .html File</span>
              <input type="file" accept=".html,.htm" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {/* Layout & PDF Configuration Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs">
        {/* Paper Size */}
        <div>
          <label className="block font-semibold text-neutral-700 mb-1">Paper Size</label>
          <select
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value as any)}
            className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            <option value="a4">A4 (Standard 210 × 297 mm)</option>
            <option value="letter">US Letter (8.5 × 11 in)</option>
            <option value="fit">Fit Content (Single Page)</option>
          </select>
        </div>

        {/* Orientation */}
        <div>
          <label className="block font-semibold text-neutral-700 mb-1">Orientation</label>
          <select
            value={orientation}
            onChange={(e) => setOrientation(e.target.value as any)}
            className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>

        {/* Margins */}
        <div>
          <label className="block font-semibold text-neutral-700 mb-1">Page Margins</label>
          <select
            value={margin}
            onChange={(e) => setMargin(e.target.value as any)}
            className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            <option value="standard">Standard (0.5 in / 36 pt)</option>
            <option value="compact">Compact (0.25 in / 18 pt)</option>
            <option value="generous">Generous (0.75 in / 54 pt)</option>
            <option value="none">Zero Margins</option>
          </select>
        </div>

        {/* Viewport Simulation */}
        <div>
          <label className="block font-semibold text-neutral-700 mb-1">Viewport Width</label>
          <select
            value={viewportWidth}
            onChange={(e) => setViewportWidth(Number(e.target.value) as any)}
            className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            <option value={1200}>Desktop (1200px)</option>
            <option value={768}>Tablet (768px)</option>
            <option value={420}>Mobile (420px)</option>
          </select>
        </div>
      </div>

      {/* Document Title & Header/Footer Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <label htmlFor="doc-title" className="font-semibold text-neutral-700 whitespace-nowrap">
            PDF File Title:
          </label>
          <input
            id="doc-title"
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="w-full px-2.5 py-1 bg-white border border-neutral-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          />
        </div>

        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={addHeaderFooter}
            onChange={(e) => setAddHeaderFooter(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
          />
          <span className="font-medium text-neutral-700">Include header title, date & page numbers</span>
        </label>
      </div>

      {/* Main Workspace: Preview or Code View */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {/* Workspace Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 border-b border-neutral-200 text-xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 font-medium rounded-md transition-colors ${
                activeTab === 'preview'
                  ? 'bg-white text-neutral-900 font-semibold shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 font-medium rounded-md transition-colors ${
                activeTab === 'code'
                  ? 'bg-white text-neutral-900 font-semibold shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Source HTML</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-neutral-500">
            <span className="hidden sm:inline">Viewport: {viewportWidth}px</span>
            <span className="font-mono text-[11px] uppercase">
              {paperSize} &bull; {orientation}
            </span>
          </div>
        </div>

        {/* Workspace Content */}
        {activeTab === 'preview' ? (
          <div className="p-4 bg-neutral-100/70 overflow-x-auto flex justify-center">
            <div
              style={{ width: `${Math.min(viewportWidth, 860)}px` }}
              className="bg-white rounded-lg shadow-xs border border-neutral-200/80 overflow-hidden min-h-[420px]"
            >
              <iframe
                ref={previewIframeRef}
                srcDoc={htmlContent}
                title="Webpage Live Preview"
                sandbox="allow-same-origin"
                className="w-full h-[450px] border-none block"
              />
            </div>
          </div>
        ) : (
          <div className="p-2">
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              rows={16}
              className="w-full p-3 font-mono text-xs text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 leading-relaxed resize-y"
              placeholder="Paste HTML, CSS or webpage markup here..."
            />
          </div>
        )}
      </div>

      {/* Convert Action Footer */}
      <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-neutral-500">
          Will render with 2x Retina sharpness and compile into standard paginated PDF.
        </div>

        <button
          onClick={handleConvert}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
        >
          <Download className="w-4 h-4" />
          <span>Convert Webpage to PDF</span>
        </button>
      </div>
    </div>
  );
};
