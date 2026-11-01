import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { SEOHead } from '../components/common/SEOHead';
import { TOOLS_DATA } from '../data/toolsData';
import {
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Files,
  Split,
  Minimize2,
  FileImage,
  Image,
  FileText,
  RotateCw,
  LayoutGrid,
  Check,
  ChevronDown,
  Sparkles,
  Camera,
  Globe,
  Code2,
  Binary,
  Palette,
  Trash2,
  ArrowUpDown,
  Hash,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigate } = useRouter();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const popularTools = TOOLS_DATA.filter((t) => t.popular).slice(0, 8);

  const getToolIcon = (name: string) => {
    switch (name) {
      case 'Files': return <Files className="w-5 h-5" />;
      case 'Split': return <Split className="w-5 h-5" />;
      case 'Minimize2': return <Minimize2 className="w-5 h-5" />;
      case 'FileImage': return <FileImage className="w-5 h-5" />;
      case 'Image': return <Image className="w-5 h-5" />;
      case 'RotateCw': return <RotateCw className="w-5 h-5" />;
      case 'LayoutGrid': return <LayoutGrid className="w-5 h-5" />;
      case 'Trash2': return <Trash2 className="w-5 h-5" />;
      case 'ArrowUpDown': return <ArrowUpDown className="w-5 h-5" />;
      case 'Hash': return <Hash className="w-5 h-5" />;
      case 'Camera': return <Camera className="w-5 h-5" />;
      case 'Globe': return <Globe className="w-5 h-5" />;
      case 'Code2': return <Code2 className="w-5 h-5" />;
      case 'Binary': return <Binary className="w-5 h-5" />;
      case 'Palette': return <Palette className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const homeSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PDFNova',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'All modern browsers',
    description: 'Fast, secure, and simple online PDF tools. Merge, compress, convert, split, rotate, and manage PDF documents directly in your browser with zero permanent storage.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const homeFaqs = [
    {
      q: 'How does PDFNova protect my document privacy?',
      a: 'Unlike legacy PDF sites that upload your confidential files to remote cloud buckets, PDFNova performs core PDF operations directly inside your browser memory (RAM) using WebAssembly and client-side processing. Your files never touch permanent cloud storage.',
    },
    {
      q: 'Is PDFNova free to use?',
      a: 'Yes. All 14 core tools are completely free to use with generous file size limits up to 50 MB per file. No watermark, account creation, or email address is required.',
    },
    {
      q: 'What happens to my files after I close the tab?',
      a: 'Because documents are processed in ephemeral browser memory, all buffers and objects are immediately purged from memory as soon as you refresh or close the browser tab.',
    },
    {
      q: 'Will compressing my PDF reduce text quality?',
      a: 'No. Our compression engine optimizes cross-reference tables, deduplicates embedded font programs, and purges orphaned objects while mathematically preserving text vectors.',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <SEOHead
        title="PDFNova – Powerful PDF Tools. Simple, Fast, and Secure."
        description="Merge, compress, convert, and manage your PDF files with easy-to-use online tools. Client-first processing with zero permanent storage."
        canonicalPath="/"
        schemaJson={homeSchema}
      />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden border-b border-neutral-200/80 bg-linear-to-b from-white to-neutral-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
          
          {/* Subtle announcement badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Privacy-First Architecture &bull; In-Browser Execution</span>
          </div>

          {/* Marquee Headline */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-neutral-950 tracking-tight leading-[1.1] font-sans">
              Powerful PDF Tools. <br className="hidden sm:inline" />
              <span className="text-neutral-600">Simple, Fast, and Secure.</span>
            </h1>
            <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Merge, compress, convert, and manage your PDF files with easy-to-use online tools. No software installation, no accounts, and zero permanent cloud storage.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/tools')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-neutral-950 hover:bg-neutral-800 active:scale-[0.98] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
            >
              <span>Explore All PDF Tools</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/tools/compress-pdf')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-100 active:scale-[0.98] border border-neutral-300 rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 shadow-xs"
            >
              <Minimize2 className="w-4 h-4 text-neutral-500" />
              <span>Compress PDF</span>
            </button>
          </div>

          {/* Proof & Trust Markers */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero permanent document storage</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Instant browser memory processing</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Strict client-side encryption</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-sans tracking-tight">
              Most Popular PDF Tools
            </h2>
            <p className="text-sm text-neutral-500 max-w-lg">
              Every tool is engineered for high performance and built to run directly on your device.
            </p>
          </div>

          <button
            onClick={() => navigate('/tools')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:text-neutral-700 transition-colors"
          >
            <span>View all 14 tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => navigate(`/tools/${tool.slug}`)}
              className="bg-white rounded-2xl border border-neutral-200/80 p-6 hover:border-neutral-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white flex items-center justify-center text-neutral-800 transition-colors border border-neutral-200/60">
                  {getToolIcon(tool.iconName)}
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-neutral-900 group-hover:text-neutral-950 font-sans">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                    {tool.shortDesc}
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600 font-medium">
                <span className="text-[11px] text-neutral-400 font-mono">
                  Up to {tool.maxFileSizeMB} MB
                </span>
                <span className="inline-flex items-center gap-1 text-neutral-900 font-semibold group-hover:translate-x-0.5 transition-transform">
                  Launch Tool
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works - 3 Step Flow */}
      <section className="py-20 bg-white border-y border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-sans">
              How PDFNova Works
            </h2>
            <p className="text-sm text-neutral-500">
              Process documents in three straightforward steps without installing complex software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3">
              <span className="text-xs font-mono font-bold text-neutral-400">01. SELECT</span>
              <h3 className="text-lg font-bold text-neutral-900 font-sans">Choose Your Files</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Drag and drop your PDF or image files directly into the tool drop zone. We validate file signatures instantly.
              </p>
            </div>

            <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3">
              <span className="text-xs font-mono font-bold text-neutral-400">02. CONFIGURE</span>
              <h3 className="text-lg font-bold text-neutral-900 font-sans">Adjust Parameters</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Reorder pages, set compression levels, type watermarks, or configure output resolution with interactive controls.
              </p>
            </div>

            <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3">
              <span className="text-xs font-mono font-bold text-neutral-400">03. DOWNLOAD</span>
              <h3 className="text-lg font-bold text-neutral-900 font-sans">Instant Download</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Receive your processed document or ZIP archive immediately. Memory buffers are purged automatically upon completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architectural Security & Privacy Proposition */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-900 text-white rounded-3xl p-8 sm:p-14 overflow-hidden relative">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Storage Architecture</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
              Why client-side processing is better for your business
            </h2>

            <p className="text-sm text-neutral-400 leading-relaxed">
              Traditional online converters upload your tax documents, contracts, and personal records to unmonitored cloud servers. PDFNova breaks this mold: our tools execute directly on your local device, keeping your proprietary data private and compliant with international standards.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-800 text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-neutral-200">Zero Cloud Retention</h4>
                <p className="text-neutral-400">Files are never written to permanent disk storage or shared with third parties.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-neutral-200">Sub-Second Execution</h4>
                <p className="text-neutral-400">No slow upload wait times for standard documents; processing happens in RAM.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate('/security')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-neutral-300 transition-colors"
              >
                <span>Read our full security whitepaper</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white border-t border-neutral-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-sans">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-neutral-500">
              Clear answers to how our tools operate and protect your data.
            </p>
          </div>

          <div className="space-y-3">
            {homeFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-sm text-neutral-900 hover:text-neutral-700 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-neutral-200/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center pt-8">
            <button
              onClick={() => navigate('/faq')}
              className="text-xs font-semibold text-neutral-900 hover:underline"
            >
              Have more questions? Visit our complete FAQ page &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Final Conversion CTA */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 font-sans tracking-tight">
          Ready to manage your PDF files faster?
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 max-w-lg mx-auto">
          Start using PDFNova today. 100% free for individual use with zero registration hurdles.
        </p>
        <div>
          <button
            onClick={() => navigate('/tools')}
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-sm"
          >
            <span>Launch PDF Toolkit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
