import React from 'react';
import { useRouter } from '../context/RouterContext';
import { SEOHead } from '../components/common/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { BLOG_POSTS } from '../data/toolsData';
import { ArrowRight, Clock, Calendar } from 'lucide-react';

export const BlogPage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <SEOHead
        title="Engineering & Document Security Blog – PDFNova"
        description="Technical articles, document privacy whitepapers, and guides on PDF compression and encryption."
        canonicalPath="/blog"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <Breadcrumbs items={[{ label: 'Blog & Articles' }]} />

        <div className="space-y-3 mb-10 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight font-sans">
            PDF Insights & Engineering
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
            Deep dives on client-side WebAssembly, document security standards, and compression algorithms.
          </p>
        </div>

        <div className="space-y-6">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 hover:border-neutral-400 hover:shadow-xs transition-all cursor-pointer group space-y-3"
            >
              <div className="flex items-center gap-3 text-xs text-neutral-500">
                <span className="px-2.5 py-0.5 rounded-md bg-neutral-100 font-semibold text-neutral-800">
                  {post.category}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{post.readTime}</span>
                </span>
                <span>&bull;</span>
                <span>{post.date}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 group-hover:text-neutral-950 font-sans tracking-tight leading-snug">
                {post.title}
              </h2>

              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {post.excerpt}
              </p>

              <div className="pt-3 flex items-center justify-between border-t border-neutral-100 text-xs font-semibold text-neutral-900">
                <span>By {post.author.name}, {post.author.role}</span>
                <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Read Article
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
