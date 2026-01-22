import React from 'react';
import { t } from '../../utils/localization';

const Sitemap = ({ 
  menuPages, 
  currentLanguage, 
  getLocalizedPageTitle, 
  getLocalizedPageSlug,
  settings,
  style = {} 
}) => {
  const containerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
    marginBottom: '2rem',
    ...style
  };

  const sectionStyle = {
    marginBottom: '1rem'
  };

  const sectionTitleStyle = {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: '0.5rem',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '0.25rem'
  };

  const linkStyle = {
    display: 'block',
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.875rem',
    padding: '0.25rem 0',
    transition: 'color 0.2s ease'
  };

  const linkHoverStyle = {
    color: 'var(--page-button-color)'
  };

  // Group pages by navigation dropdown
  const mainPages = menuPages.filter(page => {
    const navDropdown = page.navigationDropdown || 'none';
    return navDropdown === 'main' || navDropdown === 'none';
  });

  const footerPages = menuPages.filter(page => {
    const navDropdown = page.navigationDropdown || 'none';
    return navDropdown === 'footer';
  });

  const createPageLink = (page, isHome = false) => {
    const localizedTitle = getLocalizedPageTitle(page, currentLanguage);
    const href = isHome ? `/${currentLanguage}` : `/${currentLanguage}/${page.slug}`;
    
    return (
      <a
        key={page.id}
        href={href}
        style={linkStyle}
        onMouseEnter={(e) => {
          Object.assign(e.target.style, linkHoverStyle);
        }}
        onMouseLeave={(e) => {
          Object.assign(e.target.style, linkStyle);
        }}
      >
        {localizedTitle}
      </a>
    );
  };

  return (
    <div style={containerStyle}>
      {/* Main Pages */}
      {mainPages.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            {t('mainPages', currentLanguage) || 'Main Pages'}
          </h3>
          {mainPages.map(page => createPageLink(page, page.slug === 'home'))}
        </div>
      )}

      {/* Footer Pages */}
      {footerPages.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            {t('footerPages', currentLanguage) || 'Footer Pages'}
          </h3>
          {footerPages.map(page => createPageLink(page))}
        </div>
      )}

      {/* Blog Section */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>
          {t('blog', currentLanguage) || 'Blog'}
        </h3>
        <a
          href={`/${currentLanguage}/blog`}
          style={linkStyle}
          onMouseEnter={(e) => {
            Object.assign(e.target.style, linkHoverStyle);
          }}
          onMouseLeave={(e) => {
            Object.assign(e.target.style, linkStyle);
          }}
        >
          {t('allArticles', currentLanguage) || 'All Articles'}
        </a>
        <a
          href={`/${currentLanguage}/blog/categories`}
          style={linkStyle}
          onMouseEnter={(e) => {
            Object.assign(e.target.style, linkHoverStyle);
          }}
          onMouseLeave={(e) => {
            Object.assign(e.target.style, linkStyle);
          }}
        >
          {t('categories', currentLanguage) || 'Categories'}
        </a>
      </div>

      {/* Site Info */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>
          {t('siteInfo', currentLanguage) || 'Site Info'}
        </h3>
        <a
          href={`/${currentLanguage}/sitemap`}
          style={linkStyle}
          onMouseEnter={(e) => {
            Object.assign(e.target.style, linkHoverStyle);
          }}
          onMouseLeave={(e) => {
            Object.assign(e.target.style, linkStyle);
          }}
        >
          {t('sitemap', currentLanguage) || 'Sitemap'}
        </a>
        <a
          href={`/${currentLanguage}/privacy`}
          style={linkStyle}
          onMouseEnter={(e) => {
            Object.assign(e.target.style, linkHoverStyle);
          }}
          onMouseLeave={(e) => {
            Object.assign(e.target.style, linkStyle);
          }}
        >
          {t('privacyPolicy', currentLanguage) || 'Privacy Policy'}
        </a>
        <a
          href={`/${currentLanguage}/terms`}
          style={linkStyle}
          onMouseEnter={(e) => {
            Object.assign(e.target.style, linkHoverStyle);
          }}
          onMouseLeave={(e) => {
            Object.assign(e.target.style, linkStyle);
          }}
        >
          {t('termsOfService', currentLanguage) || 'Terms of Service'}
        </a>
        <a
          href="/sitemap.xml"
          style={linkStyle}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={(e) => {
            Object.assign(e.target.style, linkHoverStyle);
          }}
          onMouseLeave={(e) => {
            Object.assign(e.target.style, linkStyle);
          }}
        >
          {t('xmlSitemap', currentLanguage) || 'XML Sitemap'}
        </a>
      </div>
    </div>
  );
};

export default Sitemap;