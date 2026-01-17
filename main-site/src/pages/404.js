import React from 'react';

const NotFoundPage = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '72px', margin: '0', color: '#333' }}>404</h1>
      <h2 style={{ fontSize: '24px', margin: '20px 0', color: '#666' }}>Page Not Found</h2>
      <p style={{ fontSize: '16px', color: '#999', marginBottom: '30px' }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <a 
        href="/"
        style={{
          padding: '12px 24px',
          background: '#667eea',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: '600'
        }}
      >
        Go Home
      </a>
    </div>
  );
};

export default NotFoundPage;

export const Head = () => <title>404 - Page Not Found</title>;