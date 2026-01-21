import React from 'react';
import { t } from '../utils/localization';

const Header = ({
  settings,
  menuPages,
  currentLanguage,
  languages,
  handleLanguageChange,
  getLocalizedPageTitle,
  getLocalizedPageSlug,
  showCatalogLink,
  simplified = false,
}) => {
  if (simplified) {
    return (
      <header style={{
        // background set in .css file
        backdropFilter: 'blur(10px)',
        color: 'white',
        padding: '1rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {settings.siteLogo ? (
            <img src={settings.siteLogo} alt={settings.siteTitle} style={{ maxHeight: '40px' }} />
          ) : (
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
              {settings?.siteTitle || 'TABLES'}
            </h1>
          )}
          <nav>
            {menuPages.map(menuPage => (
              <a 
                key={menuPage.id}
                href={menuPage.slug === 'home' ? '/' : `/${menuPage.slug}`}
                style={{ color: 'white', marginRight: '1.5rem', textDecoration: 'none' }}
              >
                {menuPage.title}
              </a>
            ))}
            <a href="/blog" style={{ color: 'white', marginRight: '1.5rem', textDecoration: 'none' }}>Blog</a>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header
      style={{
        // background set in .css file
        backdropFilter: 'blur(10px)',
        color: 'white',
        padding: '1rem'
      }}
    >
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {settings.siteLogo ? (
          <img src={settings.siteLogo} alt={settings.siteTitle} style={{ maxHeight: '40px' }} />
        ) : (
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
            {settings?.siteTitle || 'TABLES'}
          </h1>
        )}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {menuPages.filter(menuPage => {
            const navDropdown = menuPage.navigationDropdown || 'none';
            return navDropdown === 'none' || navDropdown === 'header';
          }).map(menuPage => {
            const localizedTitle = getLocalizedPageTitle(menuPage, currentLanguage);
            const isHomePage = menuPage.slug === 'home';
            const href = isHomePage ? `/${currentLanguage}` : `/${currentLanguage}/${menuPage.slug}`;
            
            return (
              <a 
                key={menuPage.id}
                href={href}
                style={{ color: 'white', textDecoration: 'none' }}
              >
                {localizedTitle}
              </a>
            );
          })}
          {settings?.hasBlogArticles && <a href={`/${currentLanguage}/blog`} style={{ color: 'white', textDecoration: 'none' }}>{t('blog', currentLanguage)}</a>}
          {showCatalogLink && <a href="/catalog" style={{ color: 'white', textDecoration: 'none' }}>Catalog</a>}
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {settings.socialMedia && settings.socialMedia.map(social => (
              <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" title={social.platform} style={{ color: 'white', textDecoration: 'none' }}>
                <i className={`fab fa-${social.platform.toLowerCase()}`} aria-hidden="true"></i>
              </a>
            ))}
          </div>

          <select
            value={currentLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '5px 10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code} style={{ color: '#000' }}>
                {lang.name}
              </option>
            ))}
          </select>
        </nav>
      </div>
    </header>
  );
};

export default Header;
