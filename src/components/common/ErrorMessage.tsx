import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry, onDismiss, className = '' }) => {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-red-200 bg-red-50/70 p-4 text-red-900 transition-all ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-semibold">Processing Error</h4>
          <p className="text-xs text-red-700 leading-relaxed">{message}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-800 bg-red-100 hover:bg-red-200 active:bg-red-300 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 text-red-500 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors cursor-pointer text-xs"
              title="Dismiss error"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
