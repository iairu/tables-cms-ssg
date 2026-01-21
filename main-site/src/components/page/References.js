import React from 'react';

const References = ({ row }) => {
  const isDark = row.fields.darkTheme || row.fields.darkMode;

  return (
    <div style={{
      background: isDark ? '#1e293b' : '#f8fafc',
      padding: '4rem 2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '2rem',
          textAlign: 'center',
          color: isDark ? '#ffffff' : '#0f172a'
        }}>
          References
        </h2>
        <div style={{
          display: 'grid',
          gap: '2rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          alignItems: 'center',
          justifyItems: 'center'
        }}>
          {row.fields.images && row.fields.images.map((image, imgIdx) => (
            <img
              key={imgIdx}
              src={image.imageUrl}
              alt={`Reference ${imgIdx + 1}`}
              style={{
                maxWidth: '150px',
                maxHeight: '80px',
                objectFit: 'contain',
                filter: isDark ? 'brightness(0) invert(1)' : 'none',
                opacity: 0.7,
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default References;
