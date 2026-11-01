import React from 'react';
import { useRouter } from '../context/RouterContext';
import { SEOHead } from '../components/common/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ShieldCheck, Cpu, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <SEOHead
        title="About PDFNova – Privacy-First Document Utilities"
        description="Learn about the engineering philosophy, mission, and client-first architecture behind PDFNova."
        canonicalPath="/about"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <Breadcrumbs items={[{ label: 'About PDFNova' }]} />

        {/* Hero */}
        <div className="space-y-4 mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-700">
            <span>Our Mission & Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight font-sans">
            Rethinking Document Privacy on the Web
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            We built PDFNova because the modern internet needed PDF utilities that respect confidential data rather than harvesting documents on cloud servers.
          </p>
        </div>

        {/* Main Content Blocks */}
        <div className="space-y-10">
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 space-y-4 shadow-xs">
            <h2 className="text-xl font-bold text-neutral-900 font-sans">
              The Problem with Legacy PDF Sites
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              When you search for online PDF converters today, the majority of top results ask you to upload your sensitive contracts, tax filings, and medical histories to unknown third-party cloud buckets. Many of these services retain temporary copies on disk for hours, expose documents to unauthenticated URLs, or train external machine-learning models on user documents.
            </p>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              For lawyers, doctors, accountants, educators, and everyday privacy-conscious individuals, that model is fundamentally broken.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-neutral-200/80 p-6 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 font-sans">Zero Storage</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Core manipulation tasks run directly inside your browser memory (RAM) via WebAssembly. Nothing is permanently stored.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200/80 p-6 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900">
                <Cpu className="w-5 h-5 text-neutral-800" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 font-sans">Raw Speed</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                No latency waiting for gigabyte files to bounce across round-trip networks. Processing starts the instant you drop your file.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200/80 p-6 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 font-sans">Open & Honest</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                No deceptive compression percentages, fake paywalls, forced subscriptions, or unexpected software downloads.
              </p>
            </div>
          </div>

          <div className="bg-neutral-900 text-white rounded-2xl p-8 space-y-4">
            <h3 className="text-xl font-bold font-sans">Engineering Principles</h3>
            <ul className="space-y-3 text-xs text-neutral-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Minimal Dependencies:</strong> We utilize audited, standards-compliant PDF specification libraries (PDF-lib and PDF.js).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Accessible by Design:</strong> High contrast, full keyboard navigation, ARIA semantics, and screen-reader compatibility.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>No Telemetry on Document Content:</strong> We never log document text, file names, or metadata.</span>
              </li>
            </ul>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => navigate('/tools')}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-xs"
            >
              <span>Explore the PDF Toolkit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
