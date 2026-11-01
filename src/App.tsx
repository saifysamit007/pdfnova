import React from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { ToolsDirectoryPage } from './pages/ToolsDirectoryPage';
import { ToolPageWrapper } from './pages/ToolPageWrapper';
import { PricingPage } from './pages/PricingPage';
import { AboutPage } from './pages/AboutPage';
import { SecurityPage } from './pages/SecurityPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';

const AppContent: React.FC = () => {
  const { currentPath } = useRouter();

  // Normalize path by stripping trailing slash (except root) and query params
  const cleanPath = (currentPath.split('?')[0] || '/').replace(/\/+$/, '') || '/';

  const renderCurrentRoute = () => {
    // 1. Home
    if (cleanPath === '/' || cleanPath === '') {
      return <HomePage />;
    }

    // 2. Tools directory
    if (cleanPath === '/tools') {
      return <ToolsDirectoryPage />;
    }

    // 3. Tool specific routes: /tools/:slug
    if (cleanPath.startsWith('/tools/')) {
      const slug = cleanPath.replace('/tools/', '');
      return <ToolPageWrapper slug={slug} />;
    }

    // 4. Pricing
    if (cleanPath === '/pricing') {
      return <PricingPage />;
    }

    // 5. About
    if (cleanPath === '/about') {
      return <AboutPage />;
    }

    // 6. Security
    if (cleanPath === '/security') {
      return <SecurityPage />;
    }

    // 7. Contact
    if (cleanPath === '/contact') {
      return <ContactPage />;
    }

    // 8. FAQ
    if (cleanPath === '/faq') {
      return <FAQPage />;
    }

    // 9. Blog Directory
    if (cleanPath === '/blog') {
      return <BlogPage />;
    }

    // 10. Blog Post: /blog/:slug
    if (cleanPath.startsWith('/blog/')) {
      const slug = cleanPath.replace('/blog/', '');
      return <BlogPostPage slug={slug} />;
    }

    // 11. Legal
    if (cleanPath === '/privacy-policy') {
      return <PrivacyPolicyPage />;
    }
    if (cleanPath === '/terms') {
      return <TermsPage />;
    }

    // Default: 404
    return <NotFoundPage />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      <Navbar />
      <main className="flex-1">
        {renderCurrentRoute()}
      </main>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}

export default App;
