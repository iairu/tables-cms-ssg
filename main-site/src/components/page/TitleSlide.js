import React from 'react';

const TitleSlide = ({ row }) => {
  const isDark = row.fields.darkTheme || row.fields.darkMode;
  const bgColor = row.fields.backgroundColor || '#ffffff';

  return (
    <div style={{
      minHeight: `${row.fields.minimalHeight || 400}px`,
      background: bgColor,
      color: isDark ? '#ffffff' : '#0f172a',
      padding: '4rem 2rem',
      textAlign: row.fields.alignment || 'center',
      position: 'relative',
      overflow: row.fields.hideOverflow ? 'hidden' : 'visible',
      backgroundImage: row.fields.backgroundImage ? `url(${row.fields.backgroundImage})` : 'none',
      backgroundSize: row.fields.scaleImageToWholeBackground ? 'cover' : 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {row.fields.backgroundTexture && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${row.fields.backgroundTexture})`,
          opacity: 0.3,
          pointerEvents: 'none'
        }} />
      )}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: row.fields.headingSize === 'big' ? '4rem' : '2.5rem',
          fontWeight: '700',
          marginBottom: '1.5rem'
        }}>
          {row.fields.heading}
        </h1>
        {row.fields.text && (
          <div style={{
            fontSize: '1.25rem',
            lineHeight: '1.75',
            marginBottom: '2rem',
            maxWidth: '800px',
            margin: row.fields.alignment === 'center' ? '0 auto 2rem' : '0 0 2rem'
          }} dangerouslySetInnerHTML={{ __html: row.fields.text }} />
        )}
        {row.fields.buttons && row.fields.buttons.length > 0 && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: row.fields.alignment || 'center', flexWrap: 'wrap' }}>
            {row.fields.buttons.map((button, btnIdx) => (
              <a
                key={btnIdx}
                href={button.link}
                target={button.openAsPopup ? '_blank' : '_self'}
                rel={button.openAsPopup ? 'noopener noreferrer' : ''}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: button.showAsButton ? '0.75rem 1.5rem' : '0.5rem',
                  background: button.showAsButton ? '#667eea' : 'transparent',
                  color: button.showAsButton ? 'white' : (isDark ? '#ffffff' : '#667eea'),
                  textDecoration: button.showAsButton ? 'none' : 'underline',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                {button.icon && <span>{button.icon}</span>}
                {button.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TitleSlide;
