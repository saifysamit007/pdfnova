import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { Menu, X, Shield, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'All Tools', path: '/tools' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Security', path: '/security' },
    { label: 'Blog', path: '/blog' },
    { label: 'About', path: '/about' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark with domain mark */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNav('/')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded-md py-1"
            aria-label="PDFNova Homepage"
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-base tracking-tighter group-hover:bg-neutral-800 transition-colors shadow-xs">
              PN
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-900 font-sans">
              PDFNova
            </span>
          </button>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path || (link.path === '/tools' && currentPath.startsWith('/tools'));
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded-sm py-1 ${
                  isActive
                    ? 'text-neutral-950 font-semibold border-b-2 border-neutral-900'
                    : 'hover:text-neutral-900 text-neutral-600'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNav('/tools')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-lg transition-all shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 whitespace-nowrap"
          >
            <span>Explore All Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded-lg"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => handleNav(link.path)}
              className="block w-full text-left py-2.5 px-3 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
            <button
              onClick={() => handleNav('/tools')}
              className="w-full text-center py-2.5 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs"
            >
              Explore All Tools
            </button>
            <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 pt-2">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% In-Browser Privacy &bull; Zero Server Storage</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
