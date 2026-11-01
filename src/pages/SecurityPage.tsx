import React from 'react';
import { useRouter } from '../context/RouterContext';
import { SEOHead } from '../components/common/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ShieldCheck, Lock, HardDrive, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';

export const SecurityPage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <SEOHead
        title="Security & Data Privacy Architecture – PDFNova"
        description="Comprehensive technical overview of PDFNova security architecture, client-side memory lifecycle, and zero-retention policies."
        canonicalPath="/security"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <Breadcrumbs items={[{ label: 'Security Architecture' }]} />

        {/* Hero */}
        <div className="space-y-3 mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Security Architecture & Whitepaper</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight font-sans">
            How PDFNova Protects Your Files
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            A transparent technical explanation of our browser-based document processing lifecycle and zero-retention guarantee.
          </p>
        </div>

        {/* Core Principles Matrix */}
        <div className="space-y-8">
          
          {/* Section 1: In-Memory Processing */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900 font-sans">
                  1. Local Ephemeral Memory Lifecycle
                </h2>
                <span className="text-xs text-neutral-500 font-medium">In-Browser Execution Only</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              When you drop a document into any of PDFNova’s tools (including Merge, Split, Compress, Rotate, Protect, or Watermark), the raw bytes of the file are loaded into typed JavaScript arrays (<code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-xs">Uint8Array</code> and <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-xs">ArrayBuffer</code>) allocated solely in your device’s local volatile RAM.
            </p>

            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs text-neutral-700 space-y-2">
              <span className="font-semibold text-neutral-900">What this means in practice:</span>
              <ul className="space-y-1.5 list-disc list-inside text-neutral-600">
                <li>Your files are never transmitted to backend file storage buckets (e.g. AWS S3 or Google Cloud Storage).</li>
                <li>No database records of your document contents, text, or file names are created.</li>
                <li>As soon as you close your browser tab or click "Process Another Document," the garbage collector immediately purges the memory buffers.</li>
              </ul>
            </div>
          </div>

          {/* Section 2: Zero Cloud Retention Statement */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900 font-sans">
                  2. Zero Cloud Retention Policy
                </h2>
                <span className="text-xs text-neutral-500 font-medium">No Temporary or Permanent Server Disks</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Unlike competitors that claim "Files are deleted after 1 hour," PDFNova takes an architectural stance: <strong>we cannot delete what we never store.</strong> By design, our application infrastructure does not maintain a server disk storage subsystem for user files.
            </p>
          </div>

          {/* Section 3: Encryption in Transit & TLS */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900 font-sans">
                  3. Transport Layer Security (TLS 1.3)
                </h2>
                <span className="text-xs text-neutral-500 font-medium">End-to-End Cryptographic Protection</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              All web assets, web-worker scripts, and communication with PDFNova domain endpoints are strictly encrypted using TLS 1.3 with modern HSTS headers enforced, preventing man-in-the-middle tampering.
            </p>
          </div>

          {/* Section 4: Compliance & Guidelines */}
          <div className="bg-neutral-900 text-white rounded-2xl p-8 space-y-4">
            <h3 className="text-lg font-bold font-sans">Regulatory & Compliance Considerations</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Because user documents are not retained or transferred to external processors, organizations navigating <strong>GDPR</strong> (General Data Protection Regulation) and <strong>HIPAA</strong> (Health Insurance Portability and Accountability Act) guidelines can leverage PDFNova without triggering data-transfer processing agreements for standard local transformations.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-neutral-400">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Note: Enterprise administrators should ensure their local organization endpoint security policies and browser configurations comply with their specific internal regulations.
              </span>
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => navigate('/tools')}
              className="px-6 py-3 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-xs"
            >
              Start Using Secure PDF Tools
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
