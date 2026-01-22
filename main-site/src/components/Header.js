import React, { useState, useEffect, useRef } from 'react';
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
  currentPageThemeVersion,
  simplified = false,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [actualCurrentLanguage, setActualCurrentLanguage] = useState(currentLanguage);
  const headerRef = useRef(null);

  // Function to get current language from URI
  const getLanguageFromURI = () => {
    if (typeof window === 'undefined') return currentLanguage;
    
    const pathname = window.location.pathname;
    const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
    
    // Check if first path segment is a language code
    if (pathSegments.length > 0) {
      const firstSegment = pathSegments[0];
      const supportedLanguages = languages.map(lang => lang.code);
      
      if (supportedLanguages.includes(firstSegment)) {
        return firstSegment;
      }
    }
    
    // Default to first supported language or passed currentLanguage
    return languages.length > 0 ? languages[0].code : currentLanguage;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent;
      const safari = (ua.includes('Safari') && (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('Macintosh')) && !ua.includes('Chrome'));
      setIsSafari(safari);
      
      // Update actual current language from URI
      const languageFromURI = getLanguageFromURI();
      if (languageFromURI !== actualCurrentLanguage) {
        setActualCurrentLanguage(languageFromURI);
      }
    }
  }, [currentLanguage, languages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent;
      const safari = (ua.includes('Safari') && (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('Macintosh')) && !ua.includes('Chrome'));
      setIsSafari(safari);
    }
  }, []);

  const toggleNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  const isDark = (() => {
    // Use currentPageThemeVersion from props instead of window/body classes
    if (currentPageThemeVersion) {
      if (currentPageThemeVersion.includes('dark')) {
        return true;
      }
      if (currentPageThemeVersion.includes('light')) {
        return false;
      }
      if (currentPageThemeVersion.includes('auto')) {
        if (typeof window !== 'undefined') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
      }
    }
    // Fallback to settings if no theme version provided
    return settings?.headerDarkTheme || false;
  })();
  
  const scheme = isDark ? 'dark' : 'light';

  const styles = {
    header: {
      display: 'flex',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '60px',
      padding: '10px 15px',
      boxSizing: 'border-box',
      flexFlow: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderTop: 'none',
      borderBottom: isDark ? '1px solid rgb(66, 66, 66)' : '1px solid lightgray',
      zIndex: 999,
      background: isDark ? 'black' : 'white',
      backdropFilter: isSafari ? 'blur(25px)' : 'none',
      WebkitBackdropFilter: isSafari ? 'blur(25px)' : 'none',
    },
    headerSafari: {
      background: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.75)',
    },
    headerMarginFix: {
      height: '60px',
      width: '100%',
      background: isDark ? 'black' : 'white',
    },
    content: {
      width: '100%',
      maxWidth: '1200px',
      height: '90%',
      justifyContent: 'space-between',
      display: 'flex',
      alignItems: 'center',
      flexFlow: 'row',
      position: 'relative',
      maxHeight: '100%',
      animation: 'slideindown 0.75s',
    },
    logo: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '240px',
      height: '40px',
      textDecoration: 'none',
      color: isDark ? 'white' : 'black',
    },
    logoImg: {
      position: 'relative',
      boxSizing: 'border-box',
      maxHeight: '40px',
      maxWidth: '100%',
    },
    mobileNavToggle: {
      display: 'none',
      marginRight: '1em',
      border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)',
      color: '#0083FF',
      background: 'transparent',
      outline: 'none',
      cursor: 'pointer',
      padding: '10px',
      fontSize: '20px',
    },
    navWrapper: {
      display: 'flex',
      flexFlow: 'row',
      alignItems: 'center',
      position: 'relative',
    },
    nav: {
      display: 'flex',
      justifyContent: 'center',
      position: 'relative',
      height: '100%',
      padding: '0 15px',
      alignItems: 'center',
    },
    navLink: {
      position: 'relative',
      padding: '5px 15px',
      textDecoration: 'none',
      outline: 'none',
      textTransform: 'uppercase',
      color: isDark ? 'white' : 'black',
      fontWeight: '300',
    },
    navLinkActive: {
      fontWeight: 'bold',
    },
    right: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    socialNav: {
      display: 'flex',
      flexFlow: 'row',
      alignItems: 'center',
      gap: '0.5rem',
    },
    socialLink: {
      color: '#0083FF',
      textDecoration: 'none',
      padding: '5px 10px',
    },
    langSelector: {
      background: 'rgba(255, 255, 255, 0.2)',
      color: isDark ? 'white' : 'black',
      border: isDark ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.3)',
      padding: '5px 10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      outline: 'none',
    },
  };

  if (simplified) {
    return (
      <>
        <header style={{...styles.header, ...(isSafari ? styles.headerSafari : {})}}>
          <div style={styles.content}>
            <a style={styles.logo} href="/">
              {(isDark && settings?.siteLogoWhite) || settings?.siteLogo ? (
                <img
                  src={isDark && settings?.siteLogoWhite ? settings.siteLogoWhite : settings.siteLogo}
                  alt={settings.siteTitle}
                  style={styles.logoImg}
                />
              ) : (
                <span style={{fontSize: '1.5rem', fontWeight: '300'}}>
                  {settings?.siteTitle || 'TABLES'}
                </span>
              )}
            </a>
          </div>
        </header>
        <div style={styles.headerMarginFix}></div>
      </>
    );
  }

  return (
    <>
      <header
        ref={headerRef}
        style={{...styles.header, ...(isSafari ? styles.headerSafari : {})}}
        className={`header ${scheme}${isSafari ? ' safari' : ''}`}
      >
        <div style={styles.content}>
          {/* Mobile Navigation Toggle */}
          {menuPages.length > 0 && (
            <button
              style={styles.mobileNavToggle}
              className="mobileNavToggle"
              onClick={toggleNav}
              aria-label="Toggle Mobile Navigation"
            >
              <i className="fa fa-bars"></i>
            </button>
          )}

          {/* Logo */}
          <a style={styles.logo} href={`/${actualCurrentLanguage}`}>
            {(isDark && settings?.siteLogoWhite) || settings?.siteLogo ? (
              <img
                src={isDark && settings?.siteLogoWhite ? settings.siteLogoWhite : settings.siteLogo}
                alt={settings.siteTitle}
                style={styles.logoImg}
              />
            ) : (
              <span style={{fontSize: '1.5rem', fontWeight: '300'}}>
                <i className="fa fa-arrow-left" style={{marginRight: '10px'}}></i>
                {settings?.siteTitle || 'TABLES'}
              </span>
            )}
          </a>

          {/* Navigation */}
          {menuPages.length > 0 && (
            <div
              className={`nav-wrapper${mobileNavOpen ? ' open' : ''}`}
              style={{
                ...styles.navWrapper,
              }}
            >
              <nav style={styles.nav} className="pages">
                {menuPages.filter(menuPage => {
                  const navDropdown = menuPage.navigationDropdown || 'none';
                  return navDropdown === 'none' || navDropdown === 'header';
                }).map(menuPage => {
                  const localizedTitle = getLocalizedPageTitle(menuPage, actualCurrentLanguage);
                  const slug = getLocalizedPageSlug(menuPage);
                  const isHomePage = menuPage.slug === 'home';
                  const href = isHomePage ? `/${actualCurrentLanguage}` : `/${actualCurrentLanguage}/${slug}`;
                  const isActive = typeof window !== 'undefined' && window.location.pathname === href;

                  return (
                    <a
                      key={menuPage.id}
                      href={href}
                      style={{
                        ...styles.navLink,
                        ...(isActive ? styles.navLinkActive : {}),
                      }}
                      className={isActive ? 'active' : ''}
                    >
                      {localizedTitle}
                    </a>
                  );
                })}
                {settings?.hasBlogArticles && (
                  <a
                    href={`/${actualCurrentLanguage}/blog`}
                    style={styles.navLink}
                  >
                    {t('blog', actualCurrentLanguage)}
                  </a>
                )}
                {showCatalogLink && (
                  <a
                    href="/catalog"
                    style={styles.navLink}
                  >
                    Catalog
                  </a>
                )}
              </nav>
              <div
                className="bg-close hide_d"
                onClick={toggleNav}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 997,
                  background: 'rgba(94, 94, 94, 0.712)',
                  display: mobileNavOpen ? 'block' : 'none',
                }}
              ></div>
            </div>
          )}

          {/* Right Section */}
          {(settings?.socialMedia || languages.length > 0) && (
            <div style={styles.right}>
              {/* Social Navigation */}
              {settings?.socialMedia && settings.socialMedia.length > 0 && (
                <nav style={styles.socialNav} className="social">
                  {settings.socialMedia.map(social => (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.platform}
                      style={styles.socialLink}
                    >
                      <i className={`fab fa-${social.platform.toLowerCase()}`} aria-hidden="true"></i>
                    </a>
                  ))}
                </nav>
              )}

              {/* Language Selector */}
              {languages.length > 0 && (
                <select
                  value={actualCurrentLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  style={styles.langSelector}
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code} style={{ color: '#000' }}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Header Margin Fix */}
      <div style={styles.headerMarginFix} className={`header-margin-fix ${scheme}`}></div>

      <style>{`
        @keyframes slideindown {
          from {
            transform: translateY(-30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        header a:hover {
          text-decoration: none;
        }

        header .mobileNavToggle:hover,
        header .mobileNavToggle:focus {
          background: transparent;
        }

        header .mobileNavToggle:focus {
          box-shadow: 0 0 0 2px inset ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
        }

        @media (max-width: 550px) {
          header nav.social {
            display: none;
          }
        }

        @media (max-width: 600px) {
          header .mobileNavToggle {
            padding: 10px;
          }
        }

        @media (min-width: 1201px) {
          header .hide_d {
            display: none;
          }
        }

        @media (max-width: 1200px) {
          header {
            flex-flow: row;
          }

          header .mobileNavToggle {
            display: flex;
          }

          header .nav-wrapper {
            position: absolute;
            visibility: hidden;
            pointer-events: none;
            width: auto;
            height: 100vh;
            top: calc(100% + 10px);
            left: -30px;
            right: -30px;
            padding: 0;
          }

          header .nav-wrapper.open {
            visibility: visible;
            pointer-events: all;
          }

          header .nav-wrapper.open .bg-close {
            -webkit-backdrop-filter: blur(10px);
            backdrop-filter: blur(10px);
          }

          header nav.pages {
            display: flex;
            position: absolute;
            top: 0;
            left: 30px;
            padding: 0;
            width: calc(100% - 60px);
            justify-content: flex-start;
            height: auto;
            flex-flow: column;
            border: ${isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)'};
            background: ${isDark ? 'black' : 'white'};
            z-index: 998;
          }

          header nav.pages a {
            color: ${isDark ? 'white' : 'black'};
            width: 100%;
            margin: 0 !important;
            text-align: center;
            padding: 1em 0;
          }

          header nav.pages a:not(:last-of-type) {
            border-bottom: ${isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)'};
          }

          header nav.social a:not(.button):not(:first-of-type) {
            margin-left: 0;
          }

          header nav.social a {
            padding: 5px 10px;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
