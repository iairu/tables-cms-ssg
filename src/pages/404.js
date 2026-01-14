import React from 'react';
import { Link } from 'gatsby';

const NotFoundPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '2rem'
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
          fontSize: '6rem',
          fontWeight: '700',
          marginBottom: '1rem',
          color: '#2563eb',
          lineHeight: '1'
        }}>
          404
        </h1>
        <h2 style={{
          fontSize: '1.875rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#0f172a'
        }}>
          Page Not Found
        </h2>
        <p style={{
          fontSize: '1.125rem',
          color: '#64748b',
          marginBottom: '2rem',
          lineHeight: '1.75'
        }}>
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link
            to="/"
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
            ← Go Home
          </Link>
          <Link
            to="/cms/"
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
            Open CMS
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

export const Head = () => (
  <>
    <title>404 - Page Not Found | TABLES CMS</title>
    <meta name="description" content="Page not found" />
  </>
);