import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeadComponent from '../components/HeadComponent';

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
      <div className="loading-container">
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
      <main className="empty-home-main">
        <div className="empty-home-content">
          <div className="empty-home-icon">
            🏗️
          </div>
          <h1 className="empty-home-title">
            Welcome to {settings?.siteTitle || 'TABLES'}
          </h1>
          <p className="empty-home-desc">
            Your site is ready! Add content through the CMS to get started.
          </p>
          <div className="empty-home-getting-started">
            <p>
              <strong>Getting Started:</strong><br />
              1. Access the CMS at <code>/cms</code><br />
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

  return <HeadComponent fullTitle={fullTitle} description={description} favicon={favicon} />;
};