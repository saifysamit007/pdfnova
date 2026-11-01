export type ToolCategory = 'organize' | 'convert-from' | 'convert-to' | 'security' | 'edit' | 'developer-designer';

export interface PDFToolInfo {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  longDesc: string;
  category: ToolCategory;
  badge?: string;
  iconName: string;
  popular?: boolean;
  acceptedFiles: string; // e.g., '.pdf' or '.jpg,.jpeg,.png'
  maxFiles: number;
  maxFileSizeMB: number;
  features: string[];
  howItWorksSteps: { step: number; title: string; desc: string }[];
  faqs: { question: string; answer: string }[];
}

export interface ProcessedResult {
  blob: Blob;
  downloadName: string;
  originalSizeBytes?: number;
  resultSizeBytes: number;
  mimeType: string;
  pageCount?: number;
  extraInfo?: string;
  previewUrls?: string[];
}

export interface PlanFeature {
  name: string;
  free: string | boolean;
  pro: string | boolean;
  business: string | boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  targetAudience: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  ctaText: string;
  popular?: boolean;
  features: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: {
    name: string;
    role: string;
  };
  content: string[];
}
