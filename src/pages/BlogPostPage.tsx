import React from 'react';
import { useRouter } from '../context/RouterContext';
import { SEOHead } from '../components/common/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { BLOG_POSTS } from '../data/toolsData';
import { Clock, ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import { NotFoundPage } from './NotFoundPage';

interface BlogPostPageProps {
  slug: string;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug }) => {
  const { navigate } = useRouter();
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return <NotFoundPage />;
  }

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'PDFNova',
    },
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <SEOHead
        title={`${post.title} – PDFNova Engineering`}
        description={post.excerpt}
        canonicalPath={`/blog/${post.slug}`}
        schemaJson={blogSchema}
      />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        <Breadcrumbs
          items={[
            { label: 'Blog', path: '/blog' },
            { label: post.title },
          ]}
        />

        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-12 space-y-8 shadow-xs">
          {/* Header */}
          <div className="space-y-4 border-b border-neutral-100 pb-8">
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

            <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight font-sans leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                {post.author.name.charAt(0)}
              </div>
              <div className="text-xs">
                <p className="font-bold text-neutral-900">{post.author.name}</p>
                <p className="text-neutral-500">{post.author.role}</p>
              </div>
            </div>
          </div>

          {/* Body Paragraphs */}
          <div className="prose prose-neutral max-w-none text-xs sm:text-sm text-neutral-700 leading-relaxed space-y-5 font-sans">
            {post.content.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {/* Footer Navigation */}
          <div className="pt-8 border-t border-neutral-100 flex items-center justify-between">
            <button
              onClick={() => navigate('/blog')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all articles</span>
            </button>

            <button
              onClick={() => navigate('/tools')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:underline"
            >
              <span>Explore tools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};
