import React from 'react';
import { useRouter } from '../context/RouterContext';
import { ToolLayout } from '../components/common/ToolLayout';
import { TOOLS_DATA } from '../data/toolsData';

// Tool Components
import { MergePdfTool } from '../components/tools/MergePdfTool';
import { SplitPdfTool } from '../components/tools/SplitPdfTool';
import { CompressPdfTool } from '../components/tools/CompressPdfTool';
import { JpgToPdfTool } from '../components/tools/JpgToPdfTool';
import { PdfToImagesTool } from '../components/tools/PdfToImagesTool';
import { RotatePdfTool } from '../components/tools/RotatePdfTool';
import { OrganizePdfTool } from '../components/tools/OrganizePdfTool';
import { WatermarkPdfTool } from '../components/tools/WatermarkPdfTool';
import { ProtectPdfTool } from '../components/tools/ProtectPdfTool';
import { UnlockPdfTool } from '../components/tools/UnlockPdfTool';
import { PdfToTextTool } from '../components/tools/PdfToTextTool';
import { PdfToWordTool } from '../components/tools/PdfToWordTool';
import { WordToPdfTool } from '../components/tools/WordToPdfTool';
import { PngToPdfTool } from '../components/tools/PngToPdfTool';
import { HeicToPdfTool } from '../components/tools/HeicToPdfTool';
import { PdfToHeicTool } from '../components/tools/PdfToHeicTool';
import { JfifConverterTool } from '../components/tools/JfifConverterTool';
import { HtmlToJpgTool } from '../components/tools/HtmlToJpgTool';
import { SvgConverterTool } from '../components/tools/SvgConverterTool';
import { CodeToImageTool } from '../components/tools/CodeToImageTool';
import { Base64Tool } from '../components/tools/Base64Tool';
import { ColorPaletteTool } from '../components/tools/ColorPaletteTool';
import { RemovePdfPagesTool } from '../components/tools/RemovePdfPagesTool';
import { RearrangePdfPagesTool } from '../components/tools/RearrangePdfPagesTool';
import { WebpageToPdfTool } from '../components/tools/WebpageToPdfTool';
import { AddPageNumbersTool } from '../components/tools/AddPageNumbersTool';
import { WebpToJpgTool } from '../components/tools/WebpToJpgTool';
import { NotFoundPage } from './NotFoundPage';

interface ToolPageWrapperProps {
  slug: string;
}

export const ToolPageWrapper: React.FC<ToolPageWrapperProps> = ({ slug }) => {
  const tool = TOOLS_DATA.find((t) => t.slug === slug);

  if (!tool) {
    return <NotFoundPage />;
  }

  const renderToolComponent = () => {
    switch (tool.id) {
      case 'merge-pdf':
        return <MergePdfTool />;
      case 'split-pdf':
        return <SplitPdfTool />;
      case 'compress-pdf':
        return <CompressPdfTool />;
      case 'pdf-to-jpg':
        return <PdfToImagesTool defaultFormat="jpeg" />;
      case 'pdf-to-png':
        return <PdfToImagesTool defaultFormat="png" />;
      case 'jpg-to-pdf':
        return <JpgToPdfTool />;
      case 'png-to-pdf':
        return <PngToPdfTool />;
      case 'heic-to-pdf':
        return <HeicToPdfTool />;
      case 'pdf-to-heic':
        return <PdfToHeicTool />;
      case 'jfif-to-jpg':
        return <JfifConverterTool defaultTarget="jpg" />;
      case 'jfif-to-png':
        return <JfifConverterTool defaultTarget="png" />;
      case 'webp-to-jpg':
      case 'webp-to-jpeg':
        return <WebpToJpgTool />;
      case 'html-to-jpg':
        return <HtmlToJpgTool />;
      case 'svg-to-image':
        return <SvgConverterTool />;
      case 'code-to-image':
        return <CodeToImageTool />;
      case 'base64-converter':
        return <Base64Tool />;
      case 'color-palette-extractor':
        return <ColorPaletteTool />;
      case 'rotate-pdf':
        return <RotatePdfTool />;
      case 'organize-pdf':
        return <OrganizePdfTool />;
      case 'remove-pdf-pages':
      case 'remove-pages':
        return <RemovePdfPagesTool />;
      case 'rearrange-pdf-pages':
      case 'rearrange-pages':
      case 'reorder-pdf-pages':
        return <RearrangePdfPagesTool />;
      case 'webpage-to-pdf':
      case 'url-to-pdf':
      case 'html-to-pdf':
        return <WebpageToPdfTool />;
      case 'add-page-numbers':
      case 'page-numbers':
        return <AddPageNumbersTool />;
      case 'watermark-pdf':
        return <WatermarkPdfTool />;
      case 'protect-pdf':
        return <ProtectPdfTool />;
      case 'unlock-pdf':
        return <UnlockPdfTool />;
      case 'pdf-to-text':
        return <PdfToTextTool />;
      case 'pdf-to-word':
        return <PdfToWordTool />;
      case 'word-to-pdf':
        return <WordToPdfTool />;
      default:
        return <div>Tool coming soon.</div>;
    }
  };

  return <ToolLayout tool={tool}>{renderToolComponent()}</ToolLayout>;
};
