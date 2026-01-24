import React, { useState } from 'react';
import { t } from '../utils/localization';
import AccessibilityControls from './common/AccessibilityControls';
import Sitemap from './common/Sitemap';

const Footer = ({
  settings,
  menuPages,
  currentLanguage,
  getLocalizedPageTitle,
  getLocalizedPageSlug,
  simplified = false,
}) => {
  const [showSitemap, setShowSitemap] = useState(false);
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
              const localizedTitle = getLocalizedPageTitle(menuPage, currentLanguage);
              const isHome = menuPage.slug === 'home';
              const href = isHome ? `/${currentLanguage}` : `/${currentLanguage}/${menuPage.slug}`;

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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{
            textAlign: 'center',
            color: '#64748b',
            fontSize: '0.875rem'
          }}>
            <p style={{ margin: 0 }}>
              © {new Date().getFullYear()} {settings?.siteTitle || 'TABLES'}. {t('builtWith', currentLanguage)}.
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setShowSitemap(!showSitemap)}
              style={{
                background: 'none',
                border: '1px solid #64748b',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#64748b',
                transition: 'all 0.2s ease'
              }}
              title={showSitemap ? 'Hide sitemap' : 'Show sitemap'}
            >
              {showSitemap ? t('hideSitemap', currentLanguage) || 'Hide Sitemap' : t('showSitemap', currentLanguage) || 'Show Sitemap'}
            </button>
            
            <AccessibilityControls />
          </div>
        </div>

        {/* Sitemap Section */}
        {showSitemap && (
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.125rem',
              fontWeight: 'bold',
              color: '#334155'
            }}>
              {t('sitemap', currentLanguage) || 'Sitemap'}
            </h3>
            <Sitemap
              menuPages={menuPages}
              currentLanguage={currentLanguage}
              getLocalizedPageTitle={getLocalizedPageTitle}
              getLocalizedPageSlug={getLocalizedPageSlug}
              settings={settings}
            />
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
