import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

export const Breadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  const { navigate } = useRouter();

  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1 hover:text-neutral-900 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-sm"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Home</span>
      </button>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
            {isLast || !item.path ? (
              <span className="text-neutral-800 font-semibold truncate max-w-[200px] sm:max-w-none">
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => navigate(item.path!)}
                className="hover:text-neutral-900 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 rounded-sm truncate max-w-[150px] sm:max-w-none"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
