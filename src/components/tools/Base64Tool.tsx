import React, { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { ErrorMessage } from '../common/ErrorMessage';
import { formatBytes } from '../../services/pdfEngine';
import { Binary, Copy, Check, Download, FileText, Image as ImageIcon, Eye, RefreshCw } from 'lucide-react';

export const Base64Tool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode');

  // Encode state
  const [encodedFile, setEncodedFile] = useState<File | null>(null);
  const [base64Output, setBase64Output] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Decode state
  const [inputBase64, setInputBase64] = useState<string>('');
  const [decodedBlob, setDecodedBlob] = useState<Blob | null>(null);
  const [decodedPreviewUrl, setDecodedPreviewUrl] = useState<string | null>(null);
  const [decodedMime, setDecodedMime] = useState<string>('');
  const [decodedFilename, setDecodedFilename] = useState<string>('decoded_file');
  const [error, setError] = useState<string | null>(null);

  const handleEncodeFile = (files: File[]) => {
    if (files.length === 0) return;
    setError(null);
    const file = files[0];
    setEncodedFile(file);
    setMimeType(file.type || 'application/octet-stream');

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      setBase64Output(dataUri);
    };
    reader.onerror = () => setError('Failed to read file into Base64.');
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDecode = () => {
    setError(null);
    if (!inputBase64.trim()) {
      setError('Please paste a Base64 string or Data URI.');
      return;
    }

    try {
      let rawBase64 = inputBase64.trim();
      let detectedMime = 'image/png';

      // Check if it has data URI prefix
      const match = rawBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        detectedMime = match[1];
        rawBase64 = match[2];
      } else {
        // Try to infer from first bytes or default to image/png
        if (rawBase64.startsWith('JVBERi0')) detectedMime = 'application/pdf';
        else if (rawBase64.startsWith('/9j/')) detectedMime = 'image/jpeg';
        else if (rawBase64.startsWith('iVBORw0KGgo')) detectedMime = 'image/png';
        else if (rawBase64.startsWith('PHN2Zw')) detectedMime = 'image/svg+xml';
      }

      // Clean whitespace/newlines
      rawBase64 = rawBase64.replace(/\s+/g, '');
      const binaryString = atob(rawBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: detectedMime });
      let ext = 'bin';
      if (detectedMime.includes('pdf')) ext = 'pdf';
      else if (detectedMime.includes('jpeg') || detectedMime.includes('jpg')) ext = 'jpg';
      else if (detectedMime.includes('png')) ext = 'png';
      else if (detectedMime.includes('svg')) ext = 'svg';
      else if (detectedMime.includes('webp')) ext = 'webp';

      setDecodedBlob(blob);
      setDecodedMime(detectedMime);
      setDecodedFilename(`restored_asset.${ext}`);
      setDecodedPreviewUrl(URL.createObjectURL(blob));
    } catch (err: unknown) {
      setError('Invalid Base64 string encoding. Please ensure the string is valid Base64.');
    }
  };

  const handleDownloadDecoded = () => {
    if (!decodedBlob) return;
    const a = document.createElement('a');
    a.href = decodedPreviewUrl || URL.createObjectURL(decodedBlob);
    a.download = decodedFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const rawBase64Only = base64Output.includes(',') ? base64Output.split(',')[1] : base64Output;

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Mode Navigation */}
      <div className="flex border-b border-neutral-200">
        <button
          type="button"
          onClick={() => setActiveTab('encode')}
          className={`py-3 px-6 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'encode'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <Binary className="w-4 h-4 text-neutral-500" />
          File to Base64 (Encode)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('decode')}
          className={`py-3 px-6 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'decode'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <Eye className="w-4 h-4 text-neutral-500" />
          Base64 to File (Decode & Preview)
        </button>
      </div>

      {activeTab === 'encode' ? (
        <div className="space-y-6">
          {!encodedFile ? (
            <FileUploader
              acceptedFiles=".png,.jpg,.jpeg,.svg,.webp,.jfif,.pdf,.ico,.gif"
              maxFiles={1}
              maxSizeMB={25}
              onFilesSelected={handleEncodeFile}
              descriptionText="Select or drop any image (PNG, JPG, SVG, WebP) or PDF to convert into Base64 Data URI strings for web code."
            />
          ) : (
            <div className="space-y-6">
              {/* File Info */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-700">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 truncate max-w-xs sm:max-w-md">
                      {encodedFile.name}
                    </h4>
                    <p className="text-xs text-neutral-500 font-mono">
                      Original: {formatBytes(encodedFile.size)} • Encoded:{' '}
                      {formatBytes(base64Output.length)} (+33% Base64 overhead)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEncodedFile(null);
                    setBase64Output('');
                  }}
                  className="text-xs text-neutral-500 hover:text-neutral-900 underline underline-offset-2"
                >
                  Change File
                </button>
              </div>

              {/* Data Formats */}
              <div className="space-y-4">
                {/* Full Data URI */}
                <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-800">
                      Standard Data URI (Complete with MIME)
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(base64Output, 'dataUri')}
                      className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-xs font-semibold text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedField === 'dataUri' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Data URI
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={base64Output}
                    rows={4}
                    className="w-full p-2.5 font-mono text-[11px] text-neutral-700 bg-neutral-50 rounded-lg border border-neutral-200 focus:outline-none resize-none leading-relaxed select-all"
                  />
                </div>

                {/* HTML Image Tag Snippet */}
                <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-800">
                      HTML &lt;img&gt; Embed Tag
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(`<img src="${base64Output}" alt="${encodedFile.name}" />`, 'html')
                      }
                      className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-xs font-semibold text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedField === 'html' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy HTML
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-2.5 font-mono text-[11px] text-neutral-700 bg-neutral-50 rounded-lg border border-neutral-200 overflow-x-auto whitespace-pre-wrap select-all">
                    {`<img src="${base64Output.slice(0, 100)}..." alt="${encodedFile.name}" />`}
                  </pre>
                </div>

                {/* Raw Base64 string */}
                <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-800">
                      Raw Base64 (Without data: prefix)
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(rawBase64Only, 'raw')}
                      className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-xs font-semibold text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedField === 'raw' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Raw Base64
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={rawBase64Only}
                    rows={3}
                    className="w-full p-2.5 font-mono text-[11px] text-neutral-700 bg-neutral-50 rounded-lg border border-neutral-200 focus:outline-none resize-none leading-relaxed select-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Decode Mode */
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3">
            <label className="block text-xs font-semibold text-neutral-800">
              Paste Base64 or Data URI String
            </label>
            <textarea
              value={inputBase64}
              onChange={(e) => setInputBase64(e.target.value)}
              placeholder="Paste data:image/png;base64,iVBORw0KGgoAAAANSUh... or raw Base64 string here..."
              rows={7}
              className="w-full p-3 font-mono text-xs text-neutral-800 bg-neutral-50 rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-950 resize-y leading-relaxed"
            />
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-neutral-400 font-mono">
                {inputBase64.length} characters
              </span>
              <button
                type="button"
                onClick={handleDecode}
                className="px-5 py-2 bg-neutral-950 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Decode & Preview
              </button>
            </div>
          </div>

          {/* Decoded Result Preview */}
          {decodedBlob && (
            <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900">Decoded Asset</h4>
                  <p className="text-xs text-neutral-500 font-mono">
                    Type: {decodedMime} • Size: {formatBytes(decodedBlob.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadDecoded}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  Download {decodedFilename}
                </button>
              </div>

              {/* Visual preview */}
              <div className="p-4 bg-white rounded-lg border border-neutral-200 flex items-center justify-center min-h-[200px]">
                {decodedMime.startsWith('image/') && decodedPreviewUrl ? (
                  <img
                    src={decodedPreviewUrl}
                    alt="Decoded"
                    className="max-h-72 max-w-full object-contain rounded shadow-xs"
                  />
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <FileText className="w-12 h-12 text-neutral-400 mx-auto" />
                    <p className="text-xs font-medium text-neutral-700">
                      Decoded {decodedMime} document ready for download.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
