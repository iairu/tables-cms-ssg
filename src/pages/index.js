import React, { useState, useEffect } from 'react';
import { Link } from 'gatsby';

const IndexPage = () => {
  const [siteTitle, setSiteTitle] = useState('TABLES CMS');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const settings = localStorage.getItem('settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        if (parsedSettings.siteTitle) {
          setSiteTitle(parsedSettings.siteTitle);
        }
      }
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem 4rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '1rem',
          color: '#0f172a'
        }}>
          {siteTitle}
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: '#64748b',
          marginBottom: '2rem',
          lineHeight: '1.75'
        }}>
          Welcome to the TABLES Content Management System built with Gatsby and React.
        </p>
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link
            to="/cms/"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              transition: 'background 0.2s',
              fontSize: '1rem'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
          >
            Open CMS
          </Link>
          <a
            href="/cms/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#f1f5f9',
              color: '#334155',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              transition: 'background 0.2s',
              fontSize: '1rem'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
            onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
          >
            View Original Template
          </a>
        </div>
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#f8fafc',
          borderRadius: '0.5rem',
          textAlign: 'left'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '0.75rem',
            color: '#0f172a'
          }}>
            Features
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            color: '#475569'
          }}>
            <li style={{ marginBottom: '0.5rem' }}>✓ Pages management with component-based structure</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Blog articles with chronological organization</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Component library for reusable content blocks</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Settings, ACL, and Extensions configuration</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Static site generation with Gatsby</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ React-based routing for seamless navigation</li>
          </ul>
        </div>
      </div>
      <footer style={{
        marginTop: '2rem',
        color: '#94a3b8',
        fontSize: '0.875rem'
      }}>
        <p>Built with Gatsby + React • Original template preserved at /cms/</p>
      </footer>
    </div>
  );
};

export default IndexPage;

export const Head = () => (
  <>
    <title>TABLES CMS - Home</title>
    <meta name="description" content="TABLES Content Management System built with Gatsby and React" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </>
);