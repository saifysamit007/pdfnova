import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { SEOHead } from '../components/common/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { PRICING_PLANS } from '../data/toolsData';
import { Check, HelpCircle, ShieldCheck, Sparkles, X, ArrowRight } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { navigate } = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlanModal, setSelectedPlanModal] = useState<string | null>(null);

  const pricingSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'PDFNova Subscription Plans',
    description: 'Freemium and Pro plans for PDFNova online PDF suite with high-capacity limits.',
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        name: 'Starter Plan',
      },
      {
        '@type': 'Offer',
        price: '9',
        priceCurrency: 'USD',
        name: 'Professional Monthly',
      },
      {
        '@type': 'Offer',
        price: '7',
        priceCurrency: 'USD',
        name: 'Professional Annual',
      },
    ],
  };

  const comparisonRows = [
    { feature: 'Core In-Browser Tools (14 utilities)', starter: 'Included', pro: 'Included', business: 'Included' },
    { feature: 'Maximum File Size Limit', starter: '50 MB', pro: '500 MB', business: '2 GB+' },
    { feature: 'Batch Merge Files Limit', starter: '25 files', pro: 'Unlimited', business: 'Unlimited' },
    { feature: 'Image Rendering Resolution', starter: '150-200 DPI', pro: 'Up to 300 DPI', business: 'Custom DPI & Vector' },
    { feature: 'Client-Side Zero Storage Retention', starter: 'Yes', pro: 'Yes', business: 'Yes + Audit Log' },
    { feature: 'Support Level', starter: 'Community FAQ', pro: 'Priority Email & Ticket', business: 'Dedicated Account SLA' },
    { feature: 'Commercial License', starter: 'Individual', pro: 'Yes (Single User)', business: 'Yes (Full Team)' },
    { feature: 'Team Seats', starter: '1 User', pro: '1 User', business: '10 Users (Expandable)' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <SEOHead
        title="Transparent Pricing Plans – PDFNova"
        description="Simple, transparent pricing for individuals and teams. Access fast in-browser PDF tools with generous free limits or upgrade to Pro."
        canonicalPath="/pricing"
        schemaJson={pricingSchema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs items={[{ label: 'Pricing' }]} />

        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight font-sans">
            Simple, Transparent Pricing
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            Free forever for everyday tasks. Upgrade to Pro when you need higher file size allowances and team governance.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center p-1 bg-white border border-neutral-200/90 rounded-xl shadow-xs">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  billingCycle === 'annual'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PRICING_PLANS.map((plan) => {
            const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl bg-white border p-8 flex flex-col justify-between transition-all relative ${
                  isPopular
                    ? 'border-neutral-900 shadow-md ring-1 ring-neutral-900'
                    : 'border-neutral-200/80 shadow-xs'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-neutral-900 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-neutral-900 font-sans">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-neutral-500 min-h-[32px]">
                      {plan.targetAudience}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-neutral-950 font-mono">
                      ${price}
                    </span>
                    <span className="text-xs text-neutral-500 font-medium">
                      / month {billingCycle === 'annual' && plan.monthlyPrice > 0 ? '(billed annually)' : ''}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="space-y-2.5 pt-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      What's Included:
                    </span>
                    <ul className="space-y-2 text-xs text-neutral-700">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8 mt-6 border-t border-neutral-100">
                  <button
                    onClick={() => {
                      if (plan.id === 'free') {
                        navigate('/tools');
                      } else {
                        setSelectedPlanModal(plan.name);
                      }
                    }}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                      isPopular
                        ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                        : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200'
                    }`}
                  >
                    {plan.ctaText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-10 mb-16 shadow-xs">
          <div className="mb-6 space-y-1">
            <h3 className="text-xl font-bold text-neutral-900 font-sans">
              Plan Feature Comparison
            </h3>
            <p className="text-xs text-neutral-500">
              Concrete technical parameters across tiers.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 font-mono text-[11px]">
                  <th className="pb-3 font-semibold">Capability</th>
                  <th className="pb-3 font-semibold">Starter</th>
                  <th className="pb-3 font-semibold text-neutral-900">Professional</th>
                  <th className="pb-3 font-semibold">Team & Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3 font-medium text-neutral-800">{row.feature}</td>
                    <td className="py-3 text-neutral-600">{row.starter}</td>
                    <td className="py-3 font-semibold text-neutral-900">{row.pro}</td>
                    <td className="py-3 text-neutral-600">{row.business}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust & Guarantee Banner */}
        <div className="bg-neutral-900 text-white rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>30-Day Money-Back Guarantee</span>
            </div>
            <h4 className="text-lg font-bold font-sans">
              Need custom volume billing or custom NDA terms?
            </h4>
            <p className="text-xs text-neutral-400">
              Our enterprise engineers help legal, healthcare, and educational institutions deploy secure PDF pipelines.
            </p>
          </div>

          <button
            onClick={() => navigate('/contact')}
            className="whitespace-nowrap px-5 py-2.5 text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-100 rounded-xl transition-colors shadow-xs"
          >
            Contact Sales Team
          </button>
        </div>
      </div>

      {/* Upgrade / Subscription Modal (Honest SaaS pattern) */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-md w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-neutral-900 font-sans">
                  Upgrade to {selectedPlanModal}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlanModal(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              You selected the <strong>{selectedPlanModal}</strong> ({billingCycle} cycle). In this preview environment, live payment processing gateways (such as Stripe or LemonSqueezy) are in sandbox evaluation mode.
            </p>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2 text-xs">
              <span className="font-semibold text-neutral-800">Production Integration Guide:</span>
              <p className="text-neutral-500">
                To connect your live payment provider in production, configure your webhook endpoint in <code className="bg-neutral-200/70 px-1 py-0.5 rounded font-mono">/api/billing/webhook</code>.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2">
              <button
                onClick={() => setSelectedPlanModal(null)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedPlanModal(null);
                  navigate('/tools');
                }}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
              >
                Continue to Toolkit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
