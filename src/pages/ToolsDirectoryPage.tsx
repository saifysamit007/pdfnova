import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { SEOHead } from '../components/common/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { TOOLS_DATA, CATEGORY_LABELS } from '../data/toolsData';
import {
  Search,
  ArrowRight,
  Files,
  Split,
  Minimize2,
  FileImage,
  Image,
  FileText,
  RotateCw,
  LayoutGrid,
  Stamp,
  Lock,
  Unlock,
  FileSpreadsheet,
  FileCheck,
  Camera,
  Globe,
  Code2,
  Binary,
  Palette,
  Sparkles,
  Trash2,
  ArrowUpDown,
  Hash,
} from 'lucide-react';

export const ToolsDirectoryPage: React.FC = () => {
  const { navigate } = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getToolIcon = (name: string) => {
    switch (name) {
      case 'Files': return <Files className="w-5 h-5" />;
      case 'Split': return <Split className="w-5 h-5" />;
      case 'Minimize2': return <Minimize2 className="w-5 h-5" />;
      case 'FileImage': return <FileImage className="w-5 h-5" />;
      case 'Image': return <Image className="w-5 h-5" />;
      case 'RotateCw': return <RotateCw className="w-5 h-5" />;
      case 'LayoutGrid': return <LayoutGrid className="w-5 h-5" />;
      case 'Trash2': return <Trash2 className="w-5 h-5" />;
      case 'ArrowUpDown': return <ArrowUpDown className="w-5 h-5" />;
      case 'Hash': return <Hash className="w-5 h-5" />;
      case 'Stamp': return <Stamp className="w-5 h-5" />;
      case 'Lock': return <Lock className="w-5 h-5" />;
      case 'Unlock': return <Unlock className="w-5 h-5" />;
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-5 h-5" />;
      case 'FileCheck': return <FileCheck className="w-5 h-5" />;
      case 'Camera': return <Camera className="w-5 h-5" />;
      case 'Globe': return <Globe className="w-5 h-5" />;
      case 'Code2': return <Code2 className="w-5 h-5" />;
      case 'Binary': return <Binary className="w-5 h-5" />;
      case 'Palette': return <Palette className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const filteredTools = TOOLS_DATA.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <SEOHead
        title="All PDF & Designer Tools – Complete In-Browser Toolkit"
        description="Browse all 24+ PDF, image, and developer tools: merge, convert PNG/HEIC/JFIF, HTML to JPG, SVG to PNG, code cards, and color palette extraction directly in your browser."
        canonicalPath="/tools"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs items={[{ label: 'Tools Directory' }]} />

        {/* Page Header */}
        <div className="space-y-3 mb-8 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight font-sans">
            Complete PDF Toolkit
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            All 14 essential PDF utilities in one fast, private workspace. Built for students, professionals, and teams.
          </p>
        </div>

        {/* Controls Bar: Category Filters & Search */}
        <div className="space-y-4 mb-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Category selection */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl border border-neutral-200/80 shadow-xs">
              {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === catKey
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/60'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tools by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 p-8 space-y-2">
            <p className="text-sm font-semibold text-neutral-800">No tools found</p>
            <p className="text-xs text-neutral-500">
              Try adjusting your search query or switching category filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => navigate(`/tools/${tool.slug}`)}
                className="bg-white rounded-2xl border border-neutral-200/80 p-6 hover:border-neutral-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white flex items-center justify-center text-neutral-800 transition-colors border border-neutral-200/60">
                      {getToolIcon(tool.iconName)}
                    </div>
                    {tool.popular && (
                      <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[10px] font-semibold uppercase tracking-wider">
                        Popular
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-neutral-900 group-hover:text-neutral-950 font-sans">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                      {tool.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600 font-medium">
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Max {tool.maxFileSizeMB} MB
                  </span>
                  <span className="inline-flex items-center gap-1 text-neutral-900 font-semibold group-hover:translate-x-0.5 transition-transform">
                    Open
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
