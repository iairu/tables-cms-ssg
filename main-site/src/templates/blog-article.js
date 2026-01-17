import React, { useState, useEffect } from 'react';

const BlogArticleTemplate = ({ pageContext, location }) => {
  const [article, setArticle] = useState(pageContext.articleData || null);
  const [settings, setSettings] = useState(pageContext.settings || null);
  const [menuPages, setMenuPages] = useState(pageContext.menuPages || []);
  const [loading, setLoading] = useState(!pageContext.articleData);

  useEffect(() => {
    // If data is already in pageContext (production SSG), use it directly
    if (pageContext.articleData && pageContext.settings) {
      console.log('[Blog Article] Using prerendered data from pageContext (production mode)');
      setArticle(pageContext.articleData);
      setSettings(pageContext.settings);
      setMenuPages(pageContext.menuPages || []);
      setLoading(false);
      return;
    }

    // Otherwise fetch at runtime (development hot reload)
    console.log('[Blog Article] Fetching data at runtime from /data/*.json (development mode)');
    // Extract slug from URL if not in pageContext (client-side routing)
    let slug = pageContext.slug;
    if (!slug && location && location.pathname) {
      // Extract slug from URL path like /blog/2026/1/my-article
      const pathParts = location.pathname.split('/').filter(Boolean);
      slug = pathParts[pathParts.length - 1];
    }

    // Fetch blog articles data
    fetch('/data/blog.json')
      .then(res => {
        console.log('[Blog Article] Fetched /data/blog.json');
        return res.json();
      })
      .then(blogData => {
        const foundArticle = blogData.find(a => a.slug === slug);
        console.log('[Blog Article] Found article:', foundArticle ? foundArticle.title : 'NOT FOUND');
        setArticle(foundArticle);
        
        // Fetch pages data for menu
        return fetch('/data/pages.json');
      })
      .then(res => {
        console.log('[Blog Article] Fetched /data/pages.json');
        return res.json();
      })
      .then(pagesData => {
        // Set menu pages (pages with includeInMenu or slug === 'home')
        const menu = pagesData.filter(p => p.includeInMenu || p.slug === 'home');
        setMenuPages(menu);
        
        // Fetch settings data
        return fetch('/data/settings.json');
      })
      .then(res => {
        console.log('[Blog Article] Fetched /data/settings.json');
        return res.json();
      })
      .then(settingsData => {
        console.log('[Blog Article] Loaded settings:', settingsData.siteTitle);
        setSettings(settingsData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, [pageContext.slug, pageContext.articleData, pageContext.settings, location]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div>Article not found</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
            {settings?.siteTitle || 'TABLES'}
          </h1>
          <nav>
            {menuPages.map(menuPage => (
              <a 
                key={menuPage.id}
                href={menuPage.slug === 'home' ? '/' : `/${menuPage.slug}`}
                style={{ color: 'white', marginRight: '1.5rem', textDecoration: 'none' }}
              >
                {menuPage.title}
              </a>
            ))}
            <a href="/blog" style={{ color: 'white', marginRight: '1.5rem', textDecoration: 'none' }}>Blog</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '3rem 2rem'
      }}>
        {/* Article Header */}
        <article>
          <header style={{
            marginBottom: '2rem',
            paddingBottom: '2rem',
            borderBottom: '2px solid #e2e8f0'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '1rem',
              color: '#0f172a',
              lineHeight: '1.2'
            }}>
              {article.title}
            </h1>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: '#64748b',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              {article.author && (
                <span style={{ fontWeight: '600' }}>By {article.author}</span>
              )}
              {article.date && (
                <span>
                  {new Date(article.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              )}
            </div>
            
            {(article.category || article.tags) && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                alignItems: 'center'
              }}>
                {article.category && (
                  <span style={{
                    background: '#e0e7ff',
                    color: '#3730a3',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {article.category}
                  </span>
                )}
                {article.tags && article.tags.split(',').map((tag, idx) => (
                  <span 
                    key={idx}
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem'
                    }}
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Article Content */}
          <div style={{
            fontSize: '1.125rem',
            lineHeight: '1.75',
            color: '#334155',
            whiteSpace: 'pre-wrap'
          }}>
            {article.content}
          </div>
        </article>

        {/* Back to Blog Link */}
        <div style={{
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid #e2e8f0'
        }}>
          <a 
            href="/blog"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              transition: 'background 0.2s'
            }}
          >
            ← Back to Blog
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: '#f8fafc',
        padding: '2rem',
        marginTop: '4rem',
        borderTop: '1px solid #e2e8f0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.875rem'
        }}>
          <p>© {new Date().getFullYear()} {settings?.siteTitle || 'TABLES'}. Built with Gatsby.</p>
        </div>
      </footer>
    </div>
  );
};

export default BlogArticleTemplate;

export const Head = ({ pageContext }) => {
  const title = pageContext.articleData?.title || pageContext.slug;
  const siteTitle = pageContext.settings?.siteTitle || 'TABLES';
  
  return (
    <>
      <title>{title} | {siteTitle}</title>
      <meta name="description" content={pageContext.articleData?.content?.substring(0, 160) || title} />
    </>
  );
};