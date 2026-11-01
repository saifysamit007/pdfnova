import React from 'react';
import { SEOHead } from '../components/common/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Shield, Lock, FileText } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <SEOHead
        title="Privacy Policy – PDFNova"
        description="Learn how PDFNova protects your personal privacy and processes documents with zero permanent cloud storage."
        canonicalPath="/privacy-policy"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />

        <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 sm:p-12 space-y-8 shadow-xs">
          <div className="space-y-2 border-b border-neutral-100 pb-6">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight font-sans">
              Privacy Policy
            </h1>
            <p className="text-xs text-neutral-500">
              Effective Date: September 2026 &bull; Version 2.4
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">1. Architectural Privacy Guarantee</h2>
              <p>
                PDFNova was founded on a client-first privacy philosophy. When you use any tool on our platform (including Merge PDF, Split PDF, Compress PDF, PDF to Images, Rotate PDF, Protect PDF, and others), the processing logic executes directly within your browser’s volatile memory (RAM) utilizing client-side WebAssembly and JavaScript engines.
              </p>
              <p>
                Your document files are <strong>not written to or stored upon persistent external servers, cloud databases, or storage buckets</strong> by default. When you close the browser tab, the memory allocated for your document is released.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">2. Information We Do Not Collect</h2>
              <p>
                We do not collect, read, analyze, index, or sell:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-neutral-600">
                <li>The text content or graphical objects inside your documents</li>
                <li>Your file metadata (original creation authors, software versions, or revision tags)</li>
                <li>Document passwords entered into our Protect or Unlock utilities</li>
                <li>Personally identifiable financial, medical, or legal documents</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">3. Analytics & Network Data</h2>
              <p>
                To maintain uptime and detect network anomalies, our web delivery infrastructure may collect non-identifiable network headers (e.g. browser type, operating system family, and approximate country code). No document payloads are linked to these technical telemetry records.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">4. Cookies & Local Storage</h2>
              <p>
                PDFNova does not use third-party behavioral advertising cookies. Local storage may be utilized strictly to persist user interface preferences (such as tool view modes or theme parameters) across visits on your own browser.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">5. Contact & Inquiries</h2>
              <p>
                For questions regarding this policy or to request custom data protection agreements for enterprise teams, please contact our privacy compliance officer at <a href="mailto:privacy@pdfnova.app" className="text-neutral-900 font-semibold underline">privacy@pdfnova.app</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
