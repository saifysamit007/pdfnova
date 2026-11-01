import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { ShieldCheck, Lock, Cpu, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <footer className="bg-neutral-900 text-neutral-400 border-t border-neutral-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          
          {/* Brand & Mission Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-white text-neutral-900 flex items-center justify-center font-bold text-sm">
                PN
              </div>
              <span className="text-lg font-bold text-white tracking-tight">PDFNova</span>
            </div>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              Professional, private, and high-performance online PDF tools. Engineered with modern client-side processing so your confidential documents never permanently touch external servers.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero permanent document storage</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Client-side in-memory processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hardware-accelerated rendering</span>
              </div>
            </div>
          </div>

          {/* Column 1: Core Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-200 mb-3">Popular Tools</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/tools/merge-pdf')} className="hover:text-white transition-colors">
                  Merge PDF
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/tools/split-pdf')} className="hover:text-white transition-colors">
                  Split PDF
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/tools/compress-pdf')} className="hover:text-white transition-colors">
                  Compress PDF
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/tools/pdf-to-jpg')} className="hover:text-white transition-colors">
                  PDF to JPG
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/tools/jpg-to-pdf')} className="hover:text-white transition-colors">
                  JPG to PDF
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/tools/pdf-to-text')} className="hover:text-white transition-colors">
                  PDF to Text
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Security & Convert */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-200 mb-3">Designer & Dev Tools</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/tools/png-to-pdf')} className="hover:text-white transition-colors">
                  PNG to PDF
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/tools/heic-to-pdf')} className="hover:text-white transition-colors">
                  HEIC to PDF
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/tools/jfif-to-jpg')} className="hover:text-white transition-colors">
                  JFIF to JPG
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/tools/html-to-jpg')} className="hover:text-white transition-colors">
                  HTML to JPG
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/tools/svg-to-image')} className="hover:text-white transition-colors">
                  SVG to PNG & PDF
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/tools/code-to-image')} className="hover:text-white transition-colors">
                  Code to Image
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/tools/color-palette-extractor')} className="hover:text-white transition-colors">
                  Color Palette
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/tools/base64-converter')} className="hover:text-white transition-colors">
                  Base64 Converter
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-200 mb-3">Company & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/pricing')} className="hover:text-white transition-colors">
                  Pricing Plans
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/security')} className="hover:text-white transition-colors">
                  Security Architecture
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/privacy-policy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/faq')} className="hover:text-white transition-colors">
                  FAQ & Documentation
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors">
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-neutral-800 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-2 gap-y-1 text-center lg:text-left">
            <span>&copy; {new Date().getFullYear()} PDFNova Inc. All rights reserved.</span>
            <span className="hidden sm:inline text-neutral-600">&bull;</span>
            <span>
              Developed and managed by{' '}
              <a
                href="https://boostify-alpha.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-300 hover:text-white font-medium underline underline-offset-2 decoration-neutral-600 hover:decoration-white transition-colors"
              >
                Boostify
              </a>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-neutral-400" />
              <span>English (Global)</span>
            </span>
            <span>&bull;</span>
            <button onClick={() => navigate('/privacy-policy')} className="hover:text-neutral-400">
              Privacy
            </button>
            <span>&bull;</span>
            <button onClick={() => navigate('/terms')} className="hover:text-neutral-400">
              Terms
            </button>
            <span>&bull;</span>
            <button onClick={() => navigate('/security')} className="hover:text-neutral-400">
              Security
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
