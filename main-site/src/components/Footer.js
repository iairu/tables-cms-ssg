import React from 'react';
import { t } from '../utils/localization';

const Footer = ({
  settings,
  menuPages,
  currentLanguage,
  getLocalizedPageTitle,
  getLocalizedPageSlug,
  simplified = false,
}) => {
  if (simplified) {
    return (
      <footer style={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
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
    );
  }

  return (
    <footer style={{
      backdropFilter: 'blur(10px)',
      padding: '1.5rem',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {menuPages.filter(menuPage => {
          const navDropdown = menuPage.navigationDropdown || 'none';
          return navDropdown === 'footer';
        }).length > 0 && (
          <nav style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            {menuPages.filter(menuPage => {
              const navDropdown = menuPage.navigationDropdown || 'none';
              return navDropdown === 'footer';
            }).map(menuPage => {
              const localizedSlug = getLocalizedPageSlug(menuPage, currentLanguage);
              const localizedTitle = getLocalizedPageTitle(menuPage, currentLanguage);
              const isHome = menuPage.slug === 'home' || localizedSlug === 'home';
              const href = isHome ? `/${currentLanguage}` : `/${currentLanguage}/${localizedSlug}`;
              
              return (
                <a 
                  key={menuPage.id}
                  href={href}
                  style={{ 
                    color: '#64748b', 
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s'
                  }}
                >
                  {localizedTitle}
                </a>
              );
            })}
          </nav>
        )}
        
        <div style={{
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.875rem'
        }}>
          <p>© {new Date().getFullYear()} {settings?.siteTitle || 'TABLES'}. {t('builtWith', currentLanguage)}.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
