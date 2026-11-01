import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingIndicatorProps {
  statusText?: string;
  subText?: string;
}

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  statusText = 'Processing your document...',
  subText = 'This runs safely in your browser memory without cloud storage.',
}) => {
  return (
    <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center border border-neutral-200">
          <Loader2 className="w-7 h-7 text-neutral-900 animate-spin" />
        </div>
      </div>
      <div className="space-y-1 max-w-md">
        <h4 className="text-base font-semibold text-neutral-900 font-sans">
          {statusText}
        </h4>
        <p className="text-xs text-neutral-500 font-medium">
          {subText}
        </p>
      </div>
    </div>
  );
};
