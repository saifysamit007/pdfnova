import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { SEOHead } from '../components/common/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ChevronDown, Search, ArrowRight } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
  category: 'privacy' | 'usage' | 'limits' | 'tools';
}

const FAQS_LIST: FaqItem[] = [
  {
    category: 'privacy',
    q: 'Does PDFNova save or store my uploaded documents?',
    a: 'No. PDFNova executes operations directly inside your web browser’s volatile memory (RAM) utilizing WebAssembly and client-side JavaScript. We do not store, copy, or retain your files on external cloud servers.',
  },
  {
    category: 'privacy',
    q: 'Can anyone else see my files while I process them?',
    a: 'No. Because the processing occurs on your client machine rather than a remote cloud server, your files remain in your private local browser session.',
  },
  {
    category: 'privacy',
    q: 'Is PDFNova compliant with GDPR and HIPAA principles?',
    a: 'Yes. Because PDFNova does not permanently collect, store, or process personal data on external databases, it does not trigger data-retention liabilities standard to legacy cloud converter services.',
  },
  {
    category: 'usage',
    q: 'Do I need to install any desktop software or browser extensions?',
    a: 'No. PDFNova works entirely inside any modern web browser (Chrome, Firefox, Safari, Edge, Brave) across Windows, macOS, Linux, iOS, and Android.',
  },
  {
    category: 'usage',
    q: 'Is an account or credit card required to use the tools?',
    a: 'No. All 14 core tools can be used immediately without registration, logins, or payment details.',
  },
  {
    category: 'limits',
    q: 'What is the maximum file size I can upload for free?',
    a: 'The free Starter tier allows files up to 50 MB per document and up to 25 documents per batch merge. For power users needing up to 500 MB per file, check out our Professional tier.',
  },
  {
    category: 'limits',
    q: 'How many files can I merge at once?',
    a: 'Free users can combine up to 25 PDF documents in a single merge operation.',
  },
  {
    category: 'tools',
    q: 'Why does PDF compression not reduce file size by 90% on every PDF?',
    a: 'Unlike deceptive online tools that compress files by destroying resolution and re-saving at 30% quality, PDFNova uses true structural optimization (deduplicating font programs and xref tables). If a PDF is already optimized or contains high-resolution pre-compressed photos, additional lossless gains are mathematically modest. We report honest numbers.',
  },
  {
    category: 'tools',
    q: 'Can I extract text from scanned images without embedded text?',
    a: 'Our PDF to Text tool extracts embedded digital font streams. Documents created purely from flat scanner imagery without OCR text layers will not output text.',
  },
  {
    category: 'tools',
    q: 'Can PDFNova recover a forgotten PDF password?',
    a: 'No. For security and privacy reasons, decryption algorithms require the authorized user password. Because files are processed in your browser and passwords are never logged, forgotten passwords cannot be recovered.',
  },
];

export const FAQPage: React.FC = () => {
  const { navigate } = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filtered = FAQS_LIST.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <SEOHead
        title="Frequently Asked Questions & Help – PDFNova"
        description="Find answers to common questions about PDFNova in-browser document processing, security, file limits, and tool capabilities."
        canonicalPath="/faq"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <Breadcrumbs items={[{ label: 'FAQ' }]} />

        <div className="space-y-3 mb-10 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight font-sans">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
            Everything you need to know about our privacy-first tools, performance, and supported formats.
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl border border-neutral-200/80 shadow-xs">
              {[
                { id: 'all', label: 'All Questions' },
                { id: 'privacy', label: 'Privacy & Security' },
                { id: 'usage', label: 'General Usage' },
                { id: 'limits', label: 'File Limits' },
                { id: 'tools', label: 'Tool Specifics' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeCategory === tab.id
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Accordion list */}
        <div className="space-y-3">
          {filtered.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-neutral-200/90 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-sm text-neutral-900 hover:text-neutral-700 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Card */}
        <div className="mt-14 p-6 bg-neutral-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold font-sans">Have a question not answered here?</h3>
            <p className="text-xs text-neutral-400">Our support engineers are ready to assist you.</p>
          </div>
          <button
            onClick={() => navigate('/contact')}
            className="whitespace-nowrap px-4 py-2 text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-100 rounded-lg transition-colors shadow-xs"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};
