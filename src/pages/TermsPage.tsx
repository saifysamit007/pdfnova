import React from 'react';
import { SEOHead } from '../components/common/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <SEOHead
        title="Terms of Service – PDFNova"
        description="Review the terms and conditions governing the use of PDFNova online tools and services."
        canonicalPath="/terms"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <Breadcrumbs items={[{ label: 'Terms of Service' }]} />

        <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 sm:p-12 space-y-8 shadow-xs">
          <div className="space-y-2 border-b border-neutral-100 pb-6">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight font-sans">
              Terms of Service
            </h1>
            <p className="text-xs text-neutral-500">
              Effective Date: September 2026 &bull; Version 2.1
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">1. Acceptance of Terms</h2>
              <p>
                By accessing or using PDFNova, you agree to be bound by these Terms of Service. If you do not agree to these terms, please discontinue using the service immediately.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">2. Ownership of Your Documents</h2>
              <p>
                <strong>You retain full, exclusive intellectual property rights and ownership over all documents and files you process through PDFNova.</strong> PDFNova claims no ownership, copyright, or licensing interest in your files. Because files are processed in-browser, we do not obtain rights or copies of your work.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">3. Acceptable Use</h2>
              <p>
                You agree not to use PDFNova to:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-neutral-600">
                <li>Bypass security controls on documents for which you do not possess legal rights or authorization.</li>
                <li>Attempt to reverse-engineer, inject malware into, or compromise the service infrastructure.</li>
                <li>Embed malicious payloads into PDFs intended for automated phishing or cyberattacks.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">4. Disclaimer of Warranties</h2>
              <p>
                PDFNova is provided on an "AS IS" and "AS AVAILABLE" basis. While we employ rigorous client-side PDF verification standards, we do not warrant that all corrupt or non-standard PDF specifications can be parsed without error. We strongly recommend preserving your original files prior to performing destructive split or delete operations.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">5. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, PDFNova shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our tools.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
