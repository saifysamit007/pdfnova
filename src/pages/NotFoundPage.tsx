import React from 'react';
import { useRouter } from '../context/RouterContext';
import { SEOHead } from '../components/common/SEOHead';
import { ArrowLeft, Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-neutral-50 px-4 py-16">
      <SEOHead
        title="Page Not Found (404)"
        description="The requested page could not be located on PDFNova."
        canonicalPath="/404"
      />

      <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200/80 p-8 text-center space-y-5 shadow-xs">
        <div className="text-4xl font-extrabold font-mono text-neutral-300">
          404
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold text-neutral-900 font-sans">
            Page not found
          </h1>
          <p className="text-xs text-neutral-500">
            The link you followed may be broken or the page may have moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go to Homepage</span>
          </button>

          <button
            onClick={() => navigate('/tools')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors border border-neutral-200"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Browse All Tools</span>
          </button>
        </div>
      </div>
    </div>
  );
};
