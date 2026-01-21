import React from 'react';

const Slide = ({ row }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: row.fields.largerSlide ? '1fr' : '1fr 1fr',
      gap: '0',
      minHeight: '400px'
    }}>
      {/* Left Side */}
      <div style={{
        background: row.fields.leftBackgroundColor || '#ffffff',
        color: row.fields.leftDarkTheme ? '#ffffff' : '#0f172a',
        padding: '4rem 2rem',
        minHeight: `${row.fields.minimalLeftHeight || 300}px`,
        backgroundImage: row.fields.leftBackgroundImage ? `url(${row.fields.leftBackgroundImage})` : 'none',
        backgroundSize: row.fields.fitLeftBackground ? 'cover' : 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: row.fields.hideLeftOnMobile ? 'none' : 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        order: row.fields.switchOrderOnMobile ? 2 : 1
      }}>
        {row.fields.leftHeading && (
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>
            {row.fields.leftHeading}
          </h2>
        )}
        {row.fields.leftText && (
          <p style={{ fontSize: '1.125rem', lineHeight: '1.75', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
            {row.fields.leftText}
          </p>
        )}
        {row.fields.leftButtons && row.fields.leftButtons.length > 0 && (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {row.fields.leftButtons.map((button, btnIdx) => (
              <a
                key={btnIdx}
                href={button.link}
                target={button.openAsPopup ? '_blank' : '_self'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: button.showAsButton ? '0.75rem 1.5rem' : '0.5rem',
                  background: button.showAsButton ? '#667eea' : 'transparent',
                  color: button.showAsButton ? 'white' : '#667eea',
                  textDecoration: button.showAsButton ? 'none' : 'underline',
                  fontWeight: '600'
                }}
              >
                {button.icon && <span>{button.icon}</span>}
                {button.title}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Right Side */}
      <div style={{
        background: row.fields.rightBackgroundColor || '#ffffff',
        color: row.fields.rightDarkTheme ? '#ffffff' : '#0f172a',
        padding: '4rem 2rem',
        minHeight: `${row.fields.minimalRightHeight || 300}px`,
        backgroundImage: row.fields.rightBackgroundImage ? `url(${row.fields.rightBackgroundImage})` : 'none',
        backgroundSize: row.fields.fitRightBackground ? 'cover' : 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: row.fields.hideRightOnMobile ? 'none' : 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        order: row.fields.switchOrderOnMobile ? 1 : 2
      }}>
        {row.fields.rightHeading && (
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>
            {row.fields.rightHeading}
          </h2>
        )}
        {row.fields.rightText && (
          <p style={{ fontSize: '1.125rem', lineHeight: '1.75', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
            {row.fields.rightText}
          </p>
        )}
        {row.fields.rightButtons && row.fields.rightButtons.length > 0 && (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {row.fields.rightButtons.map((button, btnIdx) => (
              <a
                key={btnIdx}
                href={button.link}
                target={button.openAsPopup ? '_blank' : '_self'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: button.showAsButton ? '0.75rem 1.5rem' : '0.5rem',
                  background: button.showAsButton ? '#667eea' : 'transparent',
                  color: button.showAsButton ? 'white' : '#667eea',
                  textDecoration: button.showAsButton ? 'none' : 'underline',
                  fontWeight: '600'
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

export default Slide;
