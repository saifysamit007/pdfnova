import React, { useState } from 'react';
import { SEOHead } from '../components/common/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Mail, Clock, ShieldCheck, CheckCircle2, Send, AlertCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('support');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please provide a valid email address.');
      return;
    }

    // Process submission state
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <SEOHead
        title="Contact Support & Enterprise Sales – PDFNova"
        description="Get in touch with the PDFNova engineering and customer support team. Inquire about enterprise licensing, billing, or technical features."
        canonicalPath="/contact"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <Breadcrumbs items={[{ label: 'Contact Support' }]} />

        <div className="space-y-3 mb-10 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight font-sans">
            Get in Touch
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
            Have questions about high-volume usage, enterprise deployment, or feedback on our tools? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Contact details & SLA */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-neutral-900 font-sans">
                Support Channels
              </h3>

              <div className="space-y-3 text-xs text-neutral-600">
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-neutral-900 block">Direct Email:</span>
                    <a href="mailto:support@pdfnova.app" className="text-neutral-600 hover:underline">
                      support@pdfnova.app
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-neutral-900 block">Response SLA:</span>
                    <span>Within 24 business hours (Monday – Friday)</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-neutral-900 block">Enterprise Sales:</span>
                    <span>Custom invoicing, NDA terms, and volume seats</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 text-white p-6 rounded-2xl space-y-2">
              <h4 className="text-sm font-bold font-sans">Looking for quick answers?</h4>
              <p className="text-xs text-neutral-400">
                Check our documentation and FAQ page for instant solutions to common questions.
              </p>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-xs">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-neutral-900 font-sans">
                      Thank You, {name}!
                    </h3>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                      Your message has been received. Our team will review your inquiry and reply to <strong>{email}</strong> within 24 hours.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setMessage('');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors border border-neutral-200"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-800">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Elena Vance"
                        className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-800">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="elena@example.com"
                        className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-800">Inquiry Topic</label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full p-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white font-medium"
                    >
                      <option value="support">Technical Support & Troubleshooting</option>
                      <option value="billing">Billing & Subscription Questions</option>
                      <option value="enterprise">Enterprise Licensing & Team Seats</option>
                      <option value="feature">Feature Request or Partnership</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-800">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe your question or requirement in detail..."
                      className="w-full p-3 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white resize-y"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-xl transition-all shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
