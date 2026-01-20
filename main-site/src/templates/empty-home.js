import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Head from '../components/Head';

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
      <div className="loading-container" style={{
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
    <div className="page-container" style={{
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <Header
        simplified
        settings={settings}
        menuPages={menuPages}
      />

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
                fontFamily: 'monospace'
              }}>/cms</code><br />
              2. Create a page with slug "home" to replace this page<br />
              3. Build your site to see the changes
            </p>
          </div>
        </div>
      </main>

      <Footer
        simplified
        settings={settings}
      />
    </div>
  );
};

export default EmptyHomeTemplate;

export const Head = ({ pageContext }) => {
  const siteTitle = pageContext.settings?.siteTitle || 'TABLES';
  const fullTitle = siteTitle;
  const description = "Welcome to your new site. Add content through the CMS to get started.";
  const favicon = pageContext.settings?.siteFavicon;

  return <Head fullTitle={fullTitle} description={description} favicon={favicon} />;
};