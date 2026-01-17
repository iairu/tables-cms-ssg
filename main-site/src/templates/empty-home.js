import React, { useState, useEffect } from 'react';

const EmptyHomeTemplate = ({ pageContext }) => {
  const [settings, setSettings] = useState(pageContext.settings || null);
  const [menuPages, setMenuPages] = useState(pageContext.menuPages || []);
  const [loading, setLoading] = useState(!pageContext.settings);

  useEffect(() => {
    // If data is already in pageContext (production SSG), use it directly
    if (pageContext.settings) {
      setSettings(pageContext.settings);
      setMenuPages(pageContext.menuPages || []);
      setLoading(false);
      return;
    }

    // Otherwise fetch at runtime (development hot reload)
    fetch('/data/pages.json')
      .then(res => res.json())
      .then(pagesData => {
        // Set menu pages (pages with includeInMenu or slug === 'home')
        const menu = pagesData.filter(p => p.includeInMenu || p.slug === 'home');
        setMenuPages(menu);
        
        // Fetch settings data
        return fetch('/data/settings.json');
      })
      .then(res => res.json())
      .then(settingsData => {
        setSettings(settingsData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching settings:', error);
        setLoading(false);
      });
  }, [pageContext.settings]);

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

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
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
        padding: '4rem 2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          padding: '4rem 3rem',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>
            🏗️
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            lineHeight: '1.2'
          }}>
            Welcome to {settings?.siteTitle || 'TABLES'}
          </h1>
          <p style={{
            fontSize: '1.25rem',
            lineHeight: '1.75',
            marginBottom: '2rem',
            opacity: 0.9
          }}>
            Your site is ready! Add content through the CMS to get started.
          </p>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            marginTop: '2rem'
          }}>
            <p style={{
              fontSize: '0.875rem',
              margin: 0,
              lineHeight: '1.6'
            }}>
              <strong>Getting Started:</strong><br />
              1. Access the CMS at <code style={{ 
                background: 'rgba(0, 0, 0, 0.2)', 
                padding: '2px 8px', 
                borderRadius: '4px',
                fontFamily: 'monospace'
              }}>/cms</code><br />
              2. Create a page with slug "home" to replace this page<br />
              3. Build your site to see the changes
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          color: 'white',
          fontSize: '0.875rem',
          opacity: 0.8
        }}>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} {settings?.siteTitle || 'TABLES'}. Built with Gatsby.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default EmptyHomeTemplate;

export const Head = ({ pageContext }) => {
  const siteTitle = pageContext.settings?.siteTitle || 'TABLES';
  
  return (
    <>
      <title>{siteTitle}</title>
      <meta name="description" content="Welcome to your new site. Add content through the CMS to get started." />
    </>
  );
};