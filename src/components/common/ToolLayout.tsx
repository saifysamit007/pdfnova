import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { Breadcrumbs } from './Breadcrumbs';
import { SEOHead } from './SEOHead';
import { PDFToolInfo } from '../../types';
import { TOOLS_DATA } from '../../data/toolsData';
import { ShieldCheck, ChevronDown, ArrowRight } from 'lucide-react';

interface ToolLayoutProps {
  tool: PDFToolInfo;
  children: React.ReactNode;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({ tool, children }) => {
  const { navigate } = useRouter();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Related tools from same or popular category
  const relatedTools = TOOLS_DATA.filter((t) => t.id !== tool.id).slice(0, 4);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `PDFNova ${tool.name}`,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'All modern web browsers',
    description: tool.longDesc,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <SEOHead
        title={`${tool.name} – Online Free & Secure PDF Tool`}
        description={tool.shortDesc}
        canonicalPath={`/tools/${tool.slug}`}
        schemaJson={schemaData}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <Breadcrumbs
          items={[
            { label: 'Tools', path: '/tools' },
            { label: tool.name },
          ]}
        />

        {/* Hero Section of Tool */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight font-sans">
            {tool.name}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
            {tool.shortDesc}
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted client-side processing &bull; Zero server storage</span>
          </div>
        </div>

        {/* Main Tool Interactive Workspace Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 sm:p-10 mb-14 transition-all">
          {children}
        </div>

        {/* How It Works - 3 Step Editorial Guide */}
        <div className="mb-14 border-t border-neutral-200 pt-12">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 font-sans">
              How to {tool.name.toLowerCase()} in 3 simple steps
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              No software installation, account creation, or watermarks required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tool.howItWorksSteps.map((step) => (
              <div
                key={step.step}
                className="bg-white p-6 rounded-xl border border-neutral-200/70 text-left space-y-2 relative"
              >
                <div className="text-xs font-mono font-bold text-neutral-400">
                  STEP 0{step.step}
                </div>
                <h3 className="text-base font-bold text-neutral-900 font-sans">
                  {step.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Features & Security Matrix */}
        <div className="mb-14 bg-neutral-900 text-white rounded-2xl p-8 sm:p-10 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold font-sans">
              Built for precision, privacy, and speed
            </h2>
            <p className="text-xs text-neutral-400">
              Why professionals choose PDFNova over legacy cloud convert sites
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {tool.features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs Accordion */}
        {tool.faqs && tool.faqs.length > 0 && (
          <div className="mb-14 border-t border-neutral-200 pt-12">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 font-sans">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Everything you need to know about {tool.name}
              </p>
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              {tool.faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-sm text-neutral-900 hover:text-neutral-700 transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-neutral-500 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Related Tools Directory */}
        <div className="border-t border-neutral-200 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-neutral-900 font-sans">
              Explore More PDF Tools
            </h3>
            <button
              onClick={() => navigate('/tools')}
              className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1"
            >
              <span>View all 14 tools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relatedTools.map((rel) => (
              <button
                key={rel.id}
                onClick={() => navigate(`/tools/${rel.slug}`)}
                className="bg-white p-4 rounded-xl border border-neutral-200/80 text-left hover:border-neutral-400 hover:shadow-xs transition-all group"
              >
                <h4 className="text-sm font-bold text-neutral-900 group-hover:text-neutral-950 truncate mb-1">
                  {rel.name}
                </h4>
                <p className="text-xs text-neutral-500 line-clamp-2">
                  {rel.shortDesc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
