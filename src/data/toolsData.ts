import { PDFToolInfo, PricingPlan, BlogPost } from '../types';

export const TOOLS_DATA: PDFToolInfo[] = [
  {
    id: 'merge-pdf',
    slug: 'merge-pdf',
    name: 'Merge PDF',
    shortDesc: 'Combine multiple PDF files into a single organized document in seconds.',
    longDesc: 'Merge multiple PDF documents together in your custom order. PDFNova stitches your files client-side without uploading them to persistent cloud storage, preserving document fidelity, bookmarks, and page layouts.',
    category: 'organize',
    iconName: 'Files',
    popular: true,
    acceptedFiles: '.pdf',
    maxFiles: 25,
    maxFileSizeMB: 50,
    features: [
      'Drag-and-drop reordering of input files',
      'Preserves original page geometry and vectors',
      'Automatic metadata consolidation',
      'Fast client-side assembly with zero server retention'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload Files', desc: 'Select or drag two or more PDF documents into the drop zone.' },
      { step: 2, title: 'Arrange Order', desc: 'Drag items or use the arrow controls to set your desired page sequence.' },
      { step: 3, title: 'Merge & Download', desc: 'Click Merge PDF to compile and instantly download your merged file.' }
    ],
    faqs: [
      { question: 'Is there a limit on how many PDFs I can merge?', answer: 'The free tier supports merging up to 25 files at once with up to 50 MB total file size per batch.' },
      { question: 'Will merging reduce the visual quality of my PDF?', answer: 'No. PDFNova uses direct object copying, so all vector curves, embedded fonts, and high-resolution imagery remain intact.' },
      { question: 'Are my confidential documents uploaded or stored?', answer: 'No. The merging is executed in your browser memory. Your files never touch external storage.' }
    ]
  },
  {
    id: 'split-pdf',
    slug: 'split-pdf',
    name: 'Split PDF',
    shortDesc: 'Extract specific pages, custom ranges, or separate all pages into individual files.',
    longDesc: 'Split large PDF documents into manageable segments. Specify discrete page ranges (e.g. 1-4, 7, 10-12) or unpack every single page into a compressed ZIP archive.',
    category: 'organize',
    iconName: 'Split',
    popular: true,
    acceptedFiles: '.pdf',
    maxFiles: 1,
    maxFileSizeMB: 100,
    features: [
      'Extract custom page ranges (e.g., 1-5, 8, 12-14)',
      'Split entire document into individual single-page PDFs',
      'Automatic ZIP bundling for multi-page splits',
      'Page count verification and range boundary check'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Select PDF', desc: 'Upload the PDF file you wish to split.' },
      { step: 2, title: 'Choose Mode', desc: 'Specify custom page ranges or select Split All Pages.' },
      { step: 3, title: 'Download Split Output', desc: 'Download your extracted PDF or the ZIP archive containing each page.' }
    ],
    faqs: [
      { question: 'How do I specify multiple ranges?', answer: 'Separate distinct ranges with commas, for example "1-3, 5, 8-10".' },
      { question: 'Can I extract pages from a password-protected PDF?', answer: 'You must first unlock the PDF using our Unlock PDF tool before splitting.' }
    ]
  },
  {
    id: 'compress-pdf',
    slug: 'compress-pdf',
    name: 'Compress PDF',
    shortDesc: 'Reduce PDF file size while maintaining maximum visual clarity and document readability.',
    longDesc: 'Optimize and compress PDF documents by cleaning redundant structural dictionaries, deduplicating font streams, and consolidating xref tables. Accurate before-and-after byte measurement ensures complete transparency.',
    category: 'security',
    iconName: 'Minimize2',
    popular: true,
    acceptedFiles: '.pdf',
    maxFiles: 1,
    maxFileSizeMB: 100,
    features: [
      'Configurable compression levels (Recommended, Extreme, Light)',
      'Deduplicates embedded fonts and removes orphaned objects',
      'Precise before/after byte count and percentage savings calculation',
      'Never degrades document if file is already optimal'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload PDF', desc: 'Drop your oversized PDF file into the optimizer.' },
      { step: 2, title: 'Select Compression Level', desc: 'Choose between Recommended, Extreme, or Light compression.' },
      { step: 3, title: 'Save Compressed File', desc: 'Inspect the exact bytes saved and download your optimized PDF.' }
    ],
    faqs: [
      { question: 'Why did my PDF only shrink by a small percentage?', answer: 'If a PDF has already been stripped of metadata and compressed by previous tools, additional lossless gains are minimal. We report exact savings without falsification.' },
      { question: 'Does compression alter text clarity?', answer: 'Text and vector lines are preserved mathematically; only structural redundancies and streams are compressed.' }
    ]
  },
  {
    id: 'pdf-to-jpg',
    slug: 'pdf-to-jpg',
    name: 'PDF to JPG',
    shortDesc: 'Convert PDF pages into high-resolution JPG images with adjustable quality settings.',
    longDesc: 'Transform each page of your PDF into crisp JPEG images. For single-page documents, download the JPG immediately; for multi-page documents, download an organized ZIP archive.',
    category: 'convert-from',
    iconName: 'FileImage',
    popular: true,
    acceptedFiles: '.pdf',
    maxFiles: 1,
    maxFileSizeMB: 50,
    features: [
      'High-DPI rendering (up to 200 DPI equivalent)',
      'Multi-page bundling into organized ZIP file',
      'Live thumbnail previews before downloading',
      'Client-side hardware acceleration via HTML5 canvas'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload Document', desc: 'Choose a PDF file containing pages you want to render as images.' },
      { step: 2, title: 'Configure Resolution', desc: 'Set resolution scale and image compression quality.' },
      { step: 3, title: 'Export JPGs', desc: 'Download individual page images or the full ZIP package.' }
    ],
    faqs: [
      { question: 'What resolution are the extracted JPGs?', answer: 'Pages are rendered at 2.0x standard resolution (equivalent to ~150-200 DPI), suitable for printing and presentations.' }
    ]
  },
  {
    id: 'jpg-to-pdf',
    slug: 'jpg-to-pdf',
    name: 'JPG to PDF',
    shortDesc: 'Convert JPG, PNG, and WebP images into a clean, unified PDF document.',
    longDesc: 'Turn image files into professional multi-page PDF documents. Arrange images in your desired order, select standard page formats (Fit, A4, Letter), and configure page margins.',
    category: 'convert-to',
    iconName: 'Image',
    popular: true,
    acceptedFiles: '.jpg,.jpeg,.png,.webp',
    maxFiles: 30,
    maxFileSizeMB: 50,
    features: [
      'Supports JPG, JPEG, PNG, and WebP image formats',
      'Orientation options: Auto-detect, Portrait, or Landscape',
      'Page dimensions: Fit image, Standard A4, or US Letter',
      'Adjustable page margin spacing'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Add Images', desc: 'Upload one or multiple images in JPG or PNG format.' },
      { step: 2, title: 'Adjust Layout', desc: 'Select page sizing (Fit, A4, Letter) and reorder items as desired.' },
      { step: 3, title: 'Create PDF', desc: 'Compile your images into a single unified PDF file.' }
    ],
    faqs: [
      { question: 'Can I combine both JPG and PNG files into the same PDF?', answer: 'Yes, you can mix JPG and PNG files within the same batch seamlessly.' }
    ]
  },
  {
    id: 'webpage-to-pdf',
    slug: 'webpage-to-pdf',
    name: 'Webpage to PDF',
    shortDesc: 'Convert any webpage URL, online article, or HTML/CSS document into a high-res PDF.',
    longDesc: 'Transform web pages, live articles, receipts, and custom HTML/CSS into multi-page PDF documents. Features live preview, responsive device viewports (Desktop, Tablet, Mobile), A4 & Letter page formats, and customizable headers and footers.',
    category: 'convert-to',
    iconName: 'Globe',
    popular: true,
    acceptedFiles: '.html,.htm',
    maxFiles: 1,
    maxFileSizeMB: 20,
    features: [
      'Two modes: Direct URL reader extraction & live HTML/CSS code editor',
      'Presets for tech articles, business invoices, and developer API specs',
      'Page formats: Standard A4, US Letter, and single continuous sheet',
      'Device viewports: Desktop (1200px), Tablet (768px), Mobile (420px)',
      'High-DPI 2x Retina vector rendering engine',
      'Optional header title, timestamp, and page numbers'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Enter URL or HTML', desc: 'Paste a webpage address, select a preset, or write custom HTML/CSS.' },
      { step: 2, title: 'Configure Layout', desc: 'Choose paper size (A4/Letter), orientation, margins, and viewport.' },
      { step: 3, title: 'Download PDF', desc: 'Generate and download your clean, paginated PDF document.' }
    ],
    faqs: [
      { question: 'Can I convert password-protected or internal web pages?', answer: 'Yes! For internal or paywalled pages, simply save the page as HTML (.html) on your computer and upload it directly into the HTML editor.' },
      { question: 'Does it preserve fonts and responsive styling?', answer: 'Yes! The rendering engine captures all inline CSS styles, Flexbox, Grid layouts, and custom web typography with 2x Retina clarity.' }
    ]
  },
  {
    id: 'pdf-to-png',
    slug: 'pdf-to-png',
    name: 'PDF to PNG',
    shortDesc: 'Render PDF pages into lossless, transparent-capable PNG graphic files.',
    longDesc: 'Export PDF documents to pristine, lossless PNG images. Ideal for illustrations, blueprints, and diagrams where crisp edges and zero compression artifacts are critical.',
    category: 'convert-from',
    iconName: 'FileCode2',
    acceptedFiles: '.pdf',
    maxFiles: 1,
    maxFileSizeMB: 50,
    features: [
      'Lossless pixel-perfect rasterization',
      'Preserves crisp typography and fine line vectors',
      'Multi-page ZIP archive packaging',
      'Individual page download support'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload PDF', desc: 'Select the document you wish to convert to PNG.' },
      { step: 2, title: 'Process Pages', desc: 'Our engine renders each page at high resolution.' },
      { step: 3, title: 'Download PNG', desc: 'Download your PNG graphics individually or as a ZIP archive.' }
    ],
    faqs: [
      { question: 'What is the difference between PDF to JPG and PDF to PNG?', answer: 'PNG uses lossless compression, making it superior for text, charts, and technical diagrams, while JPG provides smaller file sizes for photos.' }
    ]
  },
  {
    id: 'rotate-pdf',
    slug: 'rotate-pdf',
    name: 'Rotate PDF',
    shortDesc: 'Permanently rotate PDF pages 90°, 180°, or 270° clockwise or counterclockwise.',
    longDesc: 'Correct orientation issues on scanned or misaligned PDF pages. Rotate specific pages or apply uniform rotation across all pages in the document.',
    category: 'edit',
    iconName: 'RotateCw',
    popular: true,
    acceptedFiles: '.pdf',
    maxFiles: 1,
    maxFileSizeMB: 50,
    features: [
      'Rotate all pages at once or individual pages separately',
      'Clockwise 90°, 180°, and 270° rotation angles',
      'Preserves annotations, links, and text layers',
      'Live visual preview of updated orientation'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload PDF', desc: 'Upload the PDF with orientation issues.' },
      { step: 2, title: 'Set Rotation', desc: 'Click Rotate All or rotate individual pages.' },
      { step: 3, title: 'Save PDF', desc: 'Download the correctly oriented PDF document.' }
    ],
    faqs: [
      { question: 'Is the rotation permanent?', answer: 'Yes, the saved PDF has updated coordinate metadata that persists in all PDF viewers and printers.' }
    ]
  },
  {
    id: 'organize-pdf',
    slug: 'organize-pdf',
    name: 'Organize PDF',
    shortDesc: 'Reorder, delete, rotate, and rearrange pages in an interactive visual grid.',
    longDesc: 'Take full control of your PDF structure. Drag pages to reorder them, delete unwanted sheets, rotate landscape pages, and assemble the perfect document flow.',
    category: 'organize',
    iconName: 'LayoutGrid',
    popular: true,
    acceptedFiles: '.pdf',
    maxFiles: 1,
    maxFileSizeMB: 50,
    features: [
      'Interactive visual thumbnail grid of every page',
      'Drag-and-drop page reordering',
      'One-click page deletion and restoration',
      'Individual page rotation controls'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload Document', desc: 'Select the PDF file you want to organize.' },
      { step: 2, title: 'Rearrange Pages', desc: 'Drag cards to reorder, click trash to delete, or rotate pages.' },
      { step: 3, title: 'Download Result', desc: 'Generate your newly structured document.' }
    ],
    faqs: [
      { question: 'Can I recover a deleted page before downloading?', answer: 'Yes, pages marked for deletion can be restored with a single click before you save the file.' }
    ]
  },
  {
    id: 'remove-pdf-pages',
    slug: 'remove-pdf-pages',
    name: 'Remove PDF Pages',
    shortDesc: 'Delete unwanted pages, blank sheets, or specific page ranges from your PDF document.',
    longDesc: 'Quickly remove unneeded pages from any PDF. Click visual page cards or enter page numbers (e.g. 1, 3-5, 8) to delete sheets, with quick filters for odd/even pages and instant trimmed document export.',
    category: 'organize',
    iconName: 'Trash2',
    popular: true,
    acceptedFiles: '.pdf',
    maxFiles: 1,
    maxFileSizeMB: 50,
    features: [
      'Interactive visual thumbnail selection grid',
      'Flexible range syntax (e.g. 1, 3-5, 8) with two-way sync',
      'One-click quick filters: Odd pages, Even pages, Invert selection',
      'Real-time remaining page counter and safety validation',
      'Zero server upload — 100% private in-browser trimming'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload PDF', desc: 'Select or drop the PDF containing pages you want to delete.' },
      { step: 2, title: 'Mark Pages', desc: 'Click the page thumbnails or type ranges like 2, 4-6 to mark for removal.' },
      { step: 3, title: 'Download Clean PDF', desc: 'Export the trimmed document with all marked pages removed.' }
    ],
    faqs: [
      { question: 'What happens if I accidentally delete the wrong page?', answer: 'You can restore any removed page with one click before downloading, or click Clear Selection to reset.' },
      { question: 'Is the original PDF modified?', answer: 'No, your original file remains untouched. PDFNova creates a new, trimmed PDF in your browser memory.' }
    ]
  },
  {
    id: 'rearrange-pdf-pages',
    slug: 'rearrange-pdf-pages',
    name: 'Rearrange PDF Pages',
    shortDesc: 'Reorder, sort, invert, or shift pages in your PDF with an interactive visual organizer.',
    longDesc: 'Easily reorder pages in multi-page documents. Drag and drop thumbnails, use arrow shift controls, reverse entire document sequence, group odd/even pages, or duplicate pages with lossless vector preservation.',
    category: 'organize',
    iconName: 'ArrowUpDown',
    popular: true,
    acceptedFiles: '.pdf',
    maxFiles: 1,
    maxFileSizeMB: 50,
    features: [
      'Intuitive drag-and-drop & keyboard-friendly shift controls',
      'One-click bulk actions: Reverse order, Odds first, Reset',
      'Individual 90° page rotation & page duplication',
      'Live sequence badges showing new position vs. original page number',
      'Preserves all vector bookmarks, annotations, and form fields'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload Document', desc: 'Select the multi-page PDF you need to reorganize.' },
      { step: 2, title: 'Arrange Sequence', desc: 'Drag thumbnails or click directional arrows to set the new sequence.' },
      { step: 3, title: 'Download PDF', desc: 'Download your newly organized document.' }
    ],
    faqs: [
      { question: 'Can I reverse the entire page order in one click?', answer: 'Yes! The Reverse Order button immediately flips the document from last-to-first (e.g. page 10 becomes page 1).' },
      { question: 'Will text and images remain sharp after reordering?', answer: 'Yes, page objects are copied losslessly with zero recompression or quality degradation.' }
    ]
  },
  {
    id: 'watermark-pdf',
    slug: 'watermark-pdf',
    name: 'Watermark PDF',
    shortDesc: 'Stamp custom text watermarks across PDF pages with precise styling controls.',
    longDesc: 'Brand or protect confidential documents with customized watermarks. Control text, font size, opacity, rotation angle, position, and page range distribution.',
    category: 'edit',
    iconName: 'Stamp',
    acceptedFiles: '.pdf',
    maxFiles: 1,
    maxFileSizeMB: 50,
    features: [
      'Custom text stamping (e.g. CONFIDENTIAL, DRAFT, APPROVED)',
      'Adjustable opacity, rotation angle (-45° to +45°), and size',
      'Position presets: Center diagonal, Top header, Bottom footer',
      'Apply to all pages, odd pages, or even pages'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload File', desc: 'Select the PDF document to watermark.' },
      { step: 2, title: 'Configure Watermark', desc: 'Type your text and adjust opacity, rotation, and placement.' },
      { step: 3, title: 'Apply & Download', desc: 'Stamp the watermark across the document and download.' }
    ],
    faqs: [
      { question: 'Can the watermark be removed easily?', answer: 'The watermark is rendered directly into the PDF content stream, making it non-trivial to remove without PDF editing software.' }
    ]
  },
  {
    id: 'add-page-numbers',
    slug: 'add-page-numbers',
    name: 'Add Page Numbers',
    shortDesc: 'Stamp custom page numbers, Roman numerals, or "Page X of Y" labels onto PDF pages.',
    longDesc: 'Number pages in PDF documents with pixel-perfect positioning and typographic control. Choose from standard formats ("Page 1 of 12", "1/12", "- 1 -"), 6-point layout matrix, start page offsets, and exclude cover sheets with live preview.',
    category: 'edit',
    iconName: 'Hash',
    popular: true,
    acceptedFiles: '.pdf',
    maxFiles: 1,
    maxFileSizeMB: 50,
    features: [
      'Numbering styles: Page {n} of {total}, {n}/{total}, Roman numerals (I, II, III), Custom',
      '6-position placement: Top/Bottom Left, Center, or Right',
      'Cover page skipping: start numbering on page 2 or any custom page',
      'Custom fonts (Helvetica, Times Roman, Courier) and color swatches',
      'Live interactive sheet preview before applying'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload PDF', desc: 'Choose the PDF file you want to number.' },
      { step: 2, title: 'Choose Format & Position', desc: 'Select your preferred numbering style, position, font, and cover skip offset.' },
      { step: 3, title: 'Download Numbered PDF', desc: 'Stamp the page numbers and download your completed file.' }
    ],
    faqs: [
      { question: 'Can I skip numbering the title or cover page?', answer: 'Yes! Simply set "First page to number" to 2. Page 1 will remain unnumbered while page 2 begins as Page 1 or Page 2.' },
      { question: 'Are the page numbers vector sharp?', answer: 'Yes, page numbers are stamped as genuine vector font glyphs directly into the PDF, ensuring crisp print clarity at any zoom.' }
    ]
  },
  {
    id: 'protect-pdf',
    slug: 'protect-pdf',
    name: 'Protect PDF',
    shortDesc: 'Encrypt your PDF with strong password protection and disable unauthorized access.',
    longDesc: 'Safeguard sensitive financial, legal, and personal documents. PDFNova adds robust password authentication and encryption parameters to your files.',
    category: 'security',
    iconName: 'Lock',
    acceptedFiles: '.pdf',
    maxFiles: 1,
    maxFileSizeMB: 50,
    features: [
      'User password encryption required for document opening',
      'Prevents unauthorized viewing and printing',
      'Processed in-memory with zero password logging',
      'Compatible with all Adobe Acrobat and standard PDF readers'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload PDF', desc: 'Select the file you need to secure.' },
      { step: 2, title: 'Set Password', desc: 'Enter and confirm a strong password.' },
      { step: 3, title: 'Encrypt & Save', desc: 'Download your encrypted PDF file.' }
    ],
    faqs: [
      { question: 'Can PDFNova recover my document if I forget my password?', answer: 'No. Because your file is encrypted client-side and passwords are never transmitted or stored, lost passwords cannot be recovered.' }
    ]
  },
  {
    id: 'unlock-pdf',
    slug: 'unlock-pdf',
    name: 'Unlock PDF',
    shortDesc: 'Remove password restrictions and protection flags from PDFs you own.',
    longDesc: 'Remove password prompts from your own documents when restrictions are no longer needed. Only appropriate for files for which you hold valid credentials or authorization.',
    category: 'security',
    iconName: 'Unlock',
    acceptedFiles: '.pdf',
    maxFiles: 1,
    maxFileSizeMB: 50,
    features: [
      'Removes user password restriction flags',
      'Restores unrestricted printing, copying, and editing',
      'Strict client-side operation with zero credential leakage',
      'Validates document integrity upon decryption'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload Protected PDF', desc: 'Select the locked document.' },
      { step: 2, title: 'Enter Password', desc: 'Provide the authorized document password.' },
      { step: 3, title: 'Unlock & Download', desc: 'Download the unrestricted PDF.' }
    ],
    faqs: [
      { question: 'Is unlocking legal?', answer: 'Unlocking is legal and legitimate only for files you own or have explicit authorization to decrypt.' }
    ]
  },
  {
    id: 'pdf-to-text',
    slug: 'pdf-to-text',
    name: 'PDF to Text',
    shortDesc: 'Extract all raw text content from PDF pages into a clean TXT file or clipboard.',
    longDesc: 'Pull clean text out of digital PDF documents without formatting clutter. Search, copy, or download the full text transcripts page by page.',
    category: 'convert-from',
    iconName: 'FileText',
    popular: true,
    acceptedFiles: '.pdf',
    maxFiles: 1,
    maxFileSizeMB: 50,
    features: [
      'Extracts structured text page by page',
      'Live text preview box with one-click clipboard copy',
      'Download as clean .txt transcript',
      'Word and character count metrics'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload PDF', desc: 'Select the document containing text to extract.' },
      { step: 2, title: 'Extract Content', desc: 'Our engine extracts character streams across all pages.' },
      { step: 3, title: 'Copy or Download', desc: 'Review the text in the preview box, copy to clipboard, or save .txt.' }
    ],
    faqs: [
      { question: 'Does this work on scanned paper documents without embedded text?', answer: 'This tool extracts embedded digital text streams. Scanned images without OCR layers will not produce text.' }
    ]
  },
  {
    id: 'pdf-to-word',
    slug: 'pdf-to-word',
    name: 'PDF to Word',
    shortDesc: 'Convert PDF files into editable Microsoft Word (.doc) documents.',
    longDesc: 'Extract text hierarchy and document sections into an editable Microsoft Word-compatible document with page breaks and header formatting preserved.',
    category: 'convert-from',
    iconName: 'FileSpreadsheet',
    popular: true,
    acceptedFiles: '.pdf',
    maxFiles: 1,
    maxFileSizeMB: 50,
    features: [
      'Converts paragraphs, headings, and page boundaries',
      'Produces standard .doc file opening directly in Microsoft Word and Google Docs',
      'Zero server upload required for conversion',
      'Preserves document flow for fast editing'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Select PDF', desc: 'Upload the PDF file you wish to edit in Word.' },
      { step: 2, title: 'Generate Word Document', desc: 'Our engine processes text streams and paragraphs.' },
      { step: 3, title: 'Download .DOC', desc: 'Open and edit your converted file in Word or Docs.' }
    ],
    faqs: [
      { question: 'Can I edit the generated file in Google Docs?', answer: 'Yes. The generated .doc file can be opened directly in Microsoft Word, Google Docs, LibreOffice, or Apple Pages.' }
    ]
  },
  {
    id: 'word-to-pdf',
    slug: 'word-to-pdf',
    name: 'Word to PDF',
    shortDesc: 'Convert Word and rich text files into clean, standardized PDF documents.',
    longDesc: 'Convert your text documents and manuscripts into standardized, universally readable PDF files with clean margins and pagination.',
    category: 'convert-to',
    iconName: 'FileCheck',
    acceptedFiles: '.txt,.doc,.docx',
    maxFiles: 1,
    maxFileSizeMB: 25,
    features: [
      'Standard A4 pagination with proper margins',
      'Embedded clean standard typography',
      'Instant document compilation',
      'Universal compatibility with all PDF viewers'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload File', desc: 'Select the document you want to convert to PDF.' },
      { step: 2, title: 'Format & Paginate', desc: 'The engine parses lines and creates formatted pages.' },
      { step: 3, title: 'Download PDF', desc: 'Get your standardized PDF ready for distribution.' }
    ],
    faqs: [
      { question: 'What text formats are supported?', answer: 'We support .txt, plain text exports, and formatted documents up to 25 MB.' }
    ]
  },
  {
    id: 'png-to-pdf',
    slug: 'png-to-pdf',
    name: 'PNG to PDF',
    shortDesc: 'Convert PNG images with transparency and crisp typography into formatted PDF documents.',
    longDesc: 'Transform PNG illustrations, UI screenshots, and transparent artwork into professional PDF documents. Preserves alpha transparency, supports A4, Letter, or original image fit, and includes configurable margins.',
    category: 'convert-to',
    iconName: 'Image',
    popular: true,
    acceptedFiles: '.png',
    maxFiles: 50,
    maxFileSizeMB: 50,
    features: [
      'Preserves PNG transparent layers and clean alpha channels',
      'Configurable page dimensions (Fit to Image, A4, US Letter)',
      'Adjustable margin padding (None, 15pt, 30pt)',
      'Multi-image batch sorting and drag-and-drop reordering'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload PNGs', desc: 'Select or drag your PNG images into the converter.' },
      { step: 2, title: 'Configure Layout', desc: 'Choose page size (Fit, A4, Letter) and page margins.' },
      { step: 3, title: 'Download PDF', desc: 'Compile your PNG files into a high-resolution PDF.' }
    ],
    faqs: [
      { question: 'Does this preserve PNG transparency?', answer: 'Yes! PDF embeds the PNG alpha channel cleanly, rendering graphics smoothly on both light and dark PDF viewports.' },
      { question: 'Can I combine multiple PNG files into one PDF?', answer: 'Yes, you can upload up to 50 PNG images and arrange their sequence before compilation.' }
    ]
  },
  {
    id: 'heic-to-pdf',
    slug: 'heic-to-pdf',
    name: 'HEIC to PDF',
    shortDesc: 'Convert Apple iPhone HEIC and HEIF photos directly to PDF in your browser.',
    longDesc: 'Turn iOS camera photos (.HEIC / .HEIF) into standard PDF documents. Decoded client-side in browser memory with zero cloud uploads for total privacy.',
    category: 'convert-to',
    iconName: 'Camera',
    popular: true,
    acceptedFiles: '.heic,.heif',
    maxFiles: 30,
    maxFileSizeMB: 50,
    features: [
      'Native in-browser HEIC/HEIF decoding via WebAssembly',
      'No cloud upload required: 100% private iPhone photo processing',
      'Combine multiple camera shots into one organized multi-page PDF',
      'Standard A4, US Letter, or original photo orientation'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload HEIC Photos', desc: 'Select Apple .heic or .heif photos from your iPhone or Mac.' },
      { step: 2, title: 'Adjust Format', desc: 'Select standard A4 or Borderless layout with orientation auto-detection.' },
      { step: 3, title: 'Export PDF', desc: 'Generate a universally shareable PDF document.' }
    ],
    faqs: [
      { question: 'Why does my iPhone save photos as HEIC?', answer: 'Apple devices use High Efficiency Image Container (HEIC) to reduce storage, but many Windows PCs and web portals cannot open HEIC files. Converting to PDF makes them universally viewable.' },
      { question: 'Are my private photos uploaded to a server?', answer: 'Never. Decoding is performed strictly in your device RAM using WebAssembly.' }
    ]
  },
  {
    id: 'pdf-to-heic',
    slug: 'pdf-to-heic',
    name: 'PDF to HEIC',
    shortDesc: 'Export PDF pages into High-Efficiency HEIC images with extreme compression.',
    longDesc: 'Convert vector PDF pages into High-Efficiency modern compressed images. Reduces file weight significantly compared to standard JPEGs while retaining high-DPI text sharpness.',
    category: 'convert-from',
    iconName: 'FileImage',
    acceptedFiles: '.pdf',
    maxFiles: 1,
    maxFileSizeMB: 100,
    features: [
      'High-Efficiency image compression with 2x Retina rendering',
      'Automatic ZIP bundling for multi-page PDF documents',
      'Selectable compression presets (High Fidelity, Balanced, Compact)',
      'Sharp typography and vector curve preservation'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Select PDF', desc: 'Upload the PDF document you wish to convert.' },
      { step: 2, title: 'Choose Compression', desc: 'Select quality mode between High Fidelity (95%) and Compact (70%).' },
      { step: 3, title: 'Download HEIC', desc: 'Download your single HEIC image or multi-page ZIP archive.' }
    ],
    faqs: [
      { question: 'What is the advantage of HEIC over JPG?', answer: 'HEIC delivers equal or superior visual clarity at roughly 40-50% smaller file sizes compared to standard legacy JPEGs.' }
    ]
  },
  {
    id: 'jfif-to-jpg',
    slug: 'jfif-to-jpg',
    name: 'JFIF to JPG',
    shortDesc: 'Fix Windows JFIF downloads by converting them into standard baseline JPG files.',
    longDesc: 'Fix the infamous Windows JFIF image bug. When browsers save images with a .jfif extension, programs like Photoshop, Figma, or file uploaders often reject them. PDFNova normalizes the image stream into a standard, clean JPG file.',
    category: 'developer-designer',
    iconName: 'Image',
    popular: true,
    acceptedFiles: '.jfif',
    maxFiles: 1,
    maxFileSizeMB: 50,
    features: [
      'Fixes Windows JFIF registry issue instantly',
      'Exports clean standard RFC 1314 JPEG baseline files',
      'Adjustable JPEG compression quality (80% to 100%)',
      'Universal compatibility with Photoshop, Figma, and web CMS'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Select JFIF', desc: 'Drop the stubborn .jfif file into the converter.' },
      { step: 2, title: 'Set Quality', desc: 'Fine-tune JPEG quality slider or use default 95% crisp.' },
      { step: 3, title: 'Download JPG', desc: 'Get a clean .jpg file that opens in every program.' }
    ],
    faqs: [
      { question: 'Why does Windows save pictures as JFIF instead of JPG?', answer: 'A common Windows registry glitch causes Chrome and Edge to download standard JPEGs with the .jfif extension. This tool fixes the container and outputs clean standard JPG.' }
    ]
  },
  {
    id: 'jfif-to-png',
    slug: 'jfif-to-png',
    name: 'JFIF to PNG',
    shortDesc: 'Convert JFIF images into lossless, high-quality PNG format.',
    longDesc: 'Transform compressed JFIF images into uncompressed 24-bit PNG files. Ideal for graphic designers and digital artists preparing assets for editing without re-compression degradation.',
    category: 'developer-designer',
    iconName: 'Image',
    acceptedFiles: '.jfif',
    maxFiles: 1,
    maxFileSizeMB: 50,
    features: [
      'Lossless 24-bit color channel export',
      'Eliminates JPEG blocking artifacts on re-saves',
      'Instant in-browser rasterization',
      'Full compatibility with Figma, Illustrator, and Premiere'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload JFIF', desc: 'Drop your .jfif image into the tool.' },
      { step: 2, title: 'Process', desc: 'The engine unpacks pixel data into a lossless PNG stream.' },
      { step: 3, title: 'Download PNG', desc: 'Download your clean .png ready for design projects.' }
    ],
    faqs: [
      { question: 'Does converting JFIF to PNG improve image quality?', answer: 'It prevents any further generational quality loss when you edit, crop, and re-save the asset in design software.' }
    ]
  },
  {
    id: 'webp-to-jpg',
    slug: 'webp-to-jpg',
    name: 'WebP to JPG',
    shortDesc: 'Convert Google WebP images into standard, universally compatible JPG files.',
    longDesc: 'Transform modern WebP web images into universal baseline JPG/JPEG files. Batch convert up to 50 files simultaneously, fine-tune compression quality (70% to 100%), customize background fill color for transparent WebP images, and download individual files or a combined ZIP archive.',
    category: 'developer-designer',
    iconName: 'Image',
    popular: true,
    acceptedFiles: '.webp',
    maxFiles: 50,
    maxFileSizeMB: 50,
    features: [
      'Batch conversion of up to 50 WebP files at once',
      'Configurable JPEG quality slider with presets (Max 98%, High 90%, Balanced 80%, Compact 70%)',
      'Solid background color fill for transparent WebP graphics (White, Black, or Custom)',
      'Optional resolution scaling (100%, 75%, 50%, 25%) and max width constraints',
      '100% private in-browser client-side execution with zero cloud storage',
      'Instant ZIP archive packaging for multi-file batches'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload WebP Images', desc: 'Select or drag & drop single or multiple .webp files.' },
      { step: 2, title: 'Customize Settings', desc: 'Adjust JPEG compression quality, background fill color, and dimensions.' },
      { step: 3, title: 'Download JPGs', desc: 'Download your converted images individually or as a single ZIP archive.' }
    ],
    faqs: [
      { question: 'Why convert WebP to JPG?', answer: 'While WebP provides great compression on the web, many desktop photo editors, older operating systems, email clients, and online forms still require standard JPEG (.jpg) files.' },
      { question: 'How are transparent WebP images handled?', answer: 'Because the JPEG format does not support transparency, PDFNova fills transparent areas with a solid background color (pure white by default, or your custom chosen color).' },
      { question: 'Are my images uploaded to any server?', answer: 'Never. All conversions happen entirely inside your web browser using HTML5 Canvas. Your images remain 100% private on your device.' }
    ]
  },
  {
    id: 'html-to-jpg',
    slug: 'html-to-jpg',
    name: 'HTML to JPG',
    shortDesc: 'Render HTML code, web snippets, and styled DOM trees into high-resolution JPG or PNG.',
    longDesc: 'Convert HTML and CSS code or uploaded .html files into crisp images. Features live preview, responsive viewport simulation (Mobile, Tablet, Desktop), and 2x Retina rendering.',
    category: 'developer-designer',
    iconName: 'Globe',
    popular: true,
    acceptedFiles: '.html,.htm',
    maxFiles: 1,
    maxFileSizeMB: 20,
    features: [
      'Live code editor with instant sandboxed preview',
      'Multi-device viewport presets (Mobile 400px, Tablet 768px, Desktop 1200px)',
      'Crisp 2x Retina rendering engine',
      'Export as high-res JPG or lossless PNG'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Enter HTML', desc: 'Paste HTML & CSS markup or upload a .html file.' },
      { step: 2, title: 'Select Viewport', desc: 'Choose mobile, tablet, or desktop width and resolution scale.' },
      { step: 3, title: 'Export Image', desc: 'Download your rendered high-resolution image.' }
    ],
    faqs: [
      { question: 'Can I include inline CSS styles?', answer: 'Yes! All inline CSS styles, Flexbox, CSS Grid, borders, gradients, and font families are rendered pixel-perfect.' }
    ]
  },
  {
    id: 'svg-to-image',
    slug: 'svg-to-image',
    name: 'SVG to PNG & PDF',
    shortDesc: 'Convert scalable vector SVG graphics into Retina PNGs (up to 8x scale) or vector PDF.',
    longDesc: 'The essential vector converter for UI/UX designers and frontend developers. Rasterize SVG files at custom scales (1x, 2x, 4x, 8x Retina) with transparent or solid backgrounds, or compile into vector PDF.',
    category: 'developer-designer',
    iconName: 'Sparkles',
    popular: true,
    acceptedFiles: '.svg',
    maxFiles: 1,
    maxFileSizeMB: 25,
    features: [
      'Scale up to 8x resolution with mathematical vector crispness',
      'Transparent or custom solid color background support',
      'Export to lossless PNG, high-res JPG, or vector PDF',
      'Live vector preview and SVG code inspector'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Provide SVG', desc: 'Upload an .svg file or paste raw vector code.' },
      { step: 2, title: 'Select Scale & Format', desc: 'Choose between PNG (1x-8x) or PDF document.' },
      { step: 3, title: 'Download Result', desc: 'Get your pin-sharp rasterized or vector asset.' }
    ],
    faqs: [
      { question: 'Will the image be blurry when scaled up?', answer: 'No! Because SVG is pure vector math (paths, curves, shapes), scaling to 4x or 8x produces perfectly crisp curves with zero pixelation.' }
    ]
  },
  {
    id: 'code-to-image',
    slug: 'code-to-image',
    name: 'Code to Image',
    shortDesc: 'Create beautiful, shareable screenshots of code snippets with custom themes and macOS chrome.',
    longDesc: 'Generate presentation-grade code cards for Twitter/X, developer portfolios, technical documentation, and slides. Includes One Dark, Dracula, Cyberpunk themes, macOS window controls, and 2x Retina PNG export.',
    category: 'developer-designer',
    iconName: 'Code2',
    popular: true,
    acceptedFiles: '.js,.ts,.tsx,.jsx,.py,.html,.css,.json,.sql,.rs,.go,.sh,.txt',
    maxFiles: 1,
    maxFileSizeMB: 10,
    features: [
      'Syntax themes: One Dark Pro, Dracula Violet, Cyberpunk, GitHub Dark, Minimal Light',
      'Window styles: macOS traffic lights, Windows chrome, or clean frameless',
      'Configurable padding, line numbers, and file name tab',
      'Crisp 2x Retina PNG and JPG export'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Input Code', desc: 'Paste your code snippet or upload a source code file.' },
      { step: 2, title: 'Customize Card', desc: 'Choose color theme, window frame, padding, and tab title.' },
      { step: 3, title: 'Download Image', desc: 'Download your 2x Retina code screenshot.' }
    ],
    faqs: [
      { question: 'What languages are supported?', answer: 'All common languages: TypeScript, JavaScript, Python, Rust, Go, SQL, HTML, CSS, JSON, Shell, and more.' }
    ]
  },
  {
    id: 'base64-converter',
    slug: 'base64-converter',
    name: 'Base64 Image & PDF Tool',
    shortDesc: 'Convert images & PDFs to Base64 Data URIs, or decode Base64 strings back to files.',
    longDesc: 'The Swiss Army knife for web developers. Convert PNG, JPG, SVG, and PDF documents into Base64 Data URIs to embed directly in HTML, CSS, or JSON payloads. Also decode raw Base64 strings back into downloadable files.',
    category: 'developer-designer',
    iconName: 'Binary',
    popular: true,
    acceptedFiles: '.png,.jpg,.jpeg,.svg,.webp,.jfif,.pdf,.ico,.gif',
    maxFiles: 1,
    maxFileSizeMB: 25,
    features: [
      'Two-way conversion: File to Base64 & Base64 to File',
      'One-click copy for Data URI, raw Base64, and HTML <img> tag',
      'Automatic MIME type detection (PNG, JPEG, SVG, PDF)',
      'Live visual preview for decoded images'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Choose Mode', desc: 'Select Encode (File to Base64) or Decode (Base64 to File).' },
      { step: 2, title: 'Process', desc: 'View encoded byte lengths or visual decoded preview.' },
      { step: 3, title: 'Copy or Download', desc: 'Copy formatted snippets or download the reconstructed file.' }
    ],
    faqs: [
      { question: 'Why use Base64 in web development?', answer: 'Base64 Data URIs allow small icons, logos, and fonts to be inlined directly inside HTML and CSS files, eliminating separate HTTP requests.' }
    ]
  },
  {
    id: 'color-palette-extractor',
    slug: 'color-palette-extractor',
    name: 'Color Palette Extractor',
    shortDesc: 'Extract dominant color palettes from any image or PDF mockup for Tailwind and CSS.',
    longDesc: 'Upload design mockups, UI screenshots, or PDF branding guidelines to automatically extract dominant color swatches. Includes HEX, RGB, HSL values, WCAG luminance contrast indicators, and export to Tailwind CSS config and CSS variables.',
    category: 'developer-designer',
    iconName: 'Palette',
    popular: true,
    acceptedFiles: '.png,.jpg,.jpeg,.svg,.webp,.jfif,.pdf',
    maxFiles: 1,
    maxFileSizeMB: 50,
    features: [
      'Histogram color quantization with diversity filtering',
      'Instant HEX, RGB, and HSL values with 1-click clipboard copy',
      'WCAG luminance contrast calculation for text readability',
      'One-click export to Tailwind CSS config, CSS variables, or JSON'
    ],
    howItWorksSteps: [
      { step: 1, title: 'Upload Asset', desc: 'Drop any image or PDF document to analyze.' },
      { step: 2, title: 'Inspect Palette', desc: 'Click any color swatch to copy its HEX code.' },
      { step: 3, title: 'Export Code', desc: 'Copy Tailwind CSS theme config or CSS custom properties.' }
    ],
    faqs: [
      { question: 'Can I extract colors directly from a PDF?', answer: 'Yes! PDFNova renders the first page of your PDF mockup and samples the exact pixel colors.' }
    ]
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Starter',
    targetAudience: 'For students, designers and occasional tasks',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Essential PDF & design utilities with fast in-browser execution and standard limits.',
    ctaText: 'Start Free',
    features: [
      'Access to all 24+ core PDF, image & designer tools',
      'Up to 50 MB per file limit',
      'Up to 25 files per batch merge',
      'Standard client-side processing speed',
      'Zero permanent cloud storage retention',
      'Community knowledge base support'
    ]
  },
  {
    id: 'pro',
    name: 'Professional',
    targetAudience: 'For freelancers, consultants, and power users',
    monthlyPrice: 9,
    annualPrice: 7,
    popular: true,
    description: 'Higher limits, priority throughput, and batch processing for demanding workflows.',
    ctaText: 'Upgrade to Pro',
    features: [
      'Everything in Starter',
      'Up to 500 MB per file limit',
      'Unlimited batch file operations',
      'High-resolution 300 DPI exports',
      'Priority ticket & email support',
      'Commercial usage rights',
      'Ad-free workspace environment'
    ]
  },
  {
    id: 'business',
    name: 'Team & Business',
    targetAudience: 'For offices, legal practices, and distributed teams',
    monthlyPrice: 24,
    annualPrice: 19,
    description: 'Enterprise governance, centralized billing, and custom compliance terms.',
    ctaText: 'Contact Sales',
    features: [
      'Everything in Professional',
      'Up to 10 user team seats included',
      'Centralized admin billing console',
      'Custom retention policies & NDA support',
      'Dedicated account manager SLA',
      'Audit logging & security reports',
      'Custom enterprise invoicing (ACH/Wire)'
    ]
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'client-side-pdf-processing-privacy',
    title: 'Why Client-Side PDF Processing is the Future of Document Privacy',
    excerpt: 'How browser-based WebAssembly and JavaScript PDF engines eliminate the risks of uploading confidential files to unknown third-party cloud servers.',
    category: 'Privacy & Security',
    readTime: '5 min read',
    date: 'September 2026',
    author: { name: 'Elena Vance', role: 'Security Architect' },
    content: [
      'Every day, millions of confidential tax forms, medical records, and legal briefs are uploaded to online PDF conversion sites. Most users never read the fine print: many legacy web utilities save uploaded files on temporary cloud buckets where they can persist for hours or days.',
      'At PDFNova, we designed our architecture on a foundational principle: zero permanent storage. Using modern WebAssembly and in-browser PDF manipulation engines, your files are processed directly inside your browser memory (RAM).',
      'This means your sensitive documents never traverse external application servers or databases for standard operations like merging, rotating, splitting, or watermarking. When you close your browser tab, the data disappears from memory automatically.',
      'For professionals handling GDPR, HIPAA, or strict confidentiality agreements, in-browser processing delivers true peace of mind without sacrificing conversion speed.'
    ]
  },
  {
    slug: 'guide-to-lossless-pdf-compression',
    title: 'A Technical Guide to PDF Compression: Lossy vs. Lossless',
    excerpt: 'Understanding how xref stream deduplication, font subsetting, and object cleanup reduce PDF size without blurring text or diagrams.',
    category: 'Technical Deep Dive',
    readTime: '6 min read',
    date: 'September 2026',
    author: { name: 'Marcus Chen', role: 'Lead PDF Systems Engineer' },
    content: [
      'PDF files are not simple image files; they are complex document containers containing PostScript vectors, embedded TrueType/OpenType font programs, color profile ICC streams, metadata dictionaries, and raster images.',
      'Often, a 20-page document grows to 40 MB not because of its text content, but because multiple software tools have repeatedly embedded identical font subsets or orphaned historical revision dictionaries into the file.',
      'Lossless compression focuses on cleaning these structural inefficiencies: consolidating cross-reference tables into compressed object streams (PDF 1.5+ standard), purging unreferenced metadata, and eliminating duplicate stream definitions.',
      'When image downsampling is required, applying bicubic resampling at target 150 DPI maintains pin-sharp rendering on Retina displays while reducing file weight by up to 75%.'
    ]
  },
  {
    slug: 'securing-sensitive-documents-before-sharing',
    title: 'Best Practices for Securing Sensitive PDF Documents Before Emailing',
    excerpt: 'Practical steps to protect confidential contracts, financial models, and research before sharing over public communication channels.',
    category: 'Best Practices',
    readTime: '4 min read',
    date: 'August 2026',
    author: { name: 'Sarah Lin', role: 'Compliance Specialist' },
    content: [
      'Email remains one of the most vulnerable communication mediums in modern business. Once a PDF attachment leaves your outbox, you lose control over its distribution, forwarding, and print history.',
      'First, always apply password encryption with standard AES cipher parameters to sensitive files. A user password prevents casual snooping, while permission restrictions prevent unauthorized copying and printing.',
      'Second, inspect metadata. PDF files often preserve author names, internal company server paths, and revision timestamps that should never be exposed to clients or counterparties.',
      'Third, utilize visible diagonal watermarks specifying the recipient organization (e.g., "CONFIDENTIAL - PREPARED FOR ACME CORP"). This simple visual friction discourages unauthorized leaks and screenshots.'
    ]
  }
];

export const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Tools',
  'developer-designer': 'Designer & Coder Tools',
  organize: 'Organize & Manage',
  'convert-from': 'Convert from PDF',
  'convert-to': 'Convert to PDF',
  security: 'Security & Optimization',
  edit: 'Edit & Annotate'
};
