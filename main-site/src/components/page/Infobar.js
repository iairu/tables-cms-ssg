import React from 'react';

const Infobar = ({ row }) => {
  const isDark = row.fields.darkTheme || row.fields.darkMode;

  return (
    <div style={{
      background: isDark ? '#1e293b' : '#f8fafc',
      color: isDark ? '#ffffff' : '#0f172a',
      padding: '2rem',
      borderBottom: '1px solid #e2e8f0'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {row.fields.logo ? (
            <img src={row.fields.logo} alt="Logo" style={{ height: '40px' }} />
          ) : row.fields.alternativeIcon ? (
            <span style={{ fontSize: '2rem' }}>{row.fields.alternativeIcon}</span>
          ) : null}
          <span style={{ fontSize: '1.125rem', fontWeight: '500' }}>{row.fields.text}</span>
        </div>
        {row.fields.buttons && row.fields.buttons.length > 0 && (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
                  padding: button.showAsButton ? '0.5rem 1rem' : '0.25rem',
                  background: button.showAsButton ? '#667eea' : 'transparent',
                  color: button.showAsButton ? 'white' : '#667eea',
                  textDecoration: button.showAsButton ? 'none' : 'underline',
                  fontWeight: '500',
                  fontSize: '0.875rem'
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

export default Infobar;
