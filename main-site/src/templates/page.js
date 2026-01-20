import React, { useState, useEffect } from 'react';
import { navigate } from 'gatsby';
import { t } from '../utils/localization';
import Breadcrumbs from '../components/Breadcrumbs';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeadComponent from '../components/HeadComponent';

const PageTemplate = ({ pageContext, location }) => {
  const [page, setPage] = useState(pageContext.pageData || null);
  const [settings, setSettings] = useState(pageContext.settings || null);
  const [menuPages, setMenuPages] = useState(pageContext.menuPages || []);
  const [languages, setLanguages] = useState(pageContext.languages || [{ code: 'en', name: 'English' }]);
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Initialize from localStorage if available, otherwise use pageContext
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('currentlang');
      if (savedLang) {
        return savedLang;
      }
    }
    return pageContext.language || 'en';
  });
  const [loading, setLoading] = useState(!pageContext.pageData);
  const [showCatalogLink, setShowCatalogLink] = useState(false);

  useEffect(() => {
    fetch('/data/inventory.json')
      .then(res => res.json())
      .then(data => {
        const hasPublicItems = data.some(item => item.public);
        if (hasPublicItems) {
          setShowCatalogLink(true);
        }
      })
      .catch(error => {
        console.error('Error fetching inventory data for catalog link:', error);
      });
  }, []);

  // Apply theme version class to body
  useEffect(() => {
    if (typeof document !== 'undefined' && page) {
      // Remove any existing theme version classes
      document.body.classList.remove('theme-auto-ver', 'theme-light-ver', 'theme-dark-ver');
      
      // Apply theme version class
      const themeVersion = page.themeVersion || 'auto';
      document.body.classList.add(`theme-${themeVersion}-ver`);
      
      // Apply button/link color as CSS variable if set
      if (page.buttonLinkColor) {
        document.documentElement.style.setProperty('--page-button-color', page.buttonLinkColor);
      } else {
        document.documentElement.style.removeProperty('--page-button-color');
      }
      
      // Cleanup on unmount
      return () => {
        document.body.classList.remove('theme-auto-ver', 'theme-light-ver', 'theme-dark-ver');
        document.documentElement.style.removeProperty('--page-button-color');
      };
    }
  }, [page]);

  useEffect(() => {
    // If data is already in pageContext (production SSG), use it directly
    if (pageContext.pageData && pageContext.settings) {
      console.log('[Page] Using prerendered data from pageContext (production mode)');
      setPage(pageContext.pageData);
      setSettings(pageContext.settings);
      setMenuPages(pageContext.menuPages || []);
      setLanguages(pageContext.languages || [{ code: 'en', name: 'English' }]);
      
      // Read currentLanguage from localStorage
      if (typeof window !== 'undefined') {
        const savedLang = localStorage.getItem('currentlang');
        if (savedLang) {
          setCurrentLanguage(savedLang);
        } else {
          // Initialize with browser default if supported
          const browserLang = navigator.language.split('-')[0];
          const supportedLanguages = ['sk', 'en'];
          const availableCodes = (pageContext.languages || []).map(l => l.code);
          
          if (supportedLanguages.includes(browserLang) && availableCodes.includes(browserLang)) {
            setCurrentLanguage(browserLang);
            localStorage.setItem('currentlang', browserLang);
          } else {
            setCurrentLanguage(pageContext.language || 'en');
            localStorage.setItem('currentlang', pageContext.language || 'en');
          }
        }
      } else {
        setCurrentLanguage(pageContext.language || 'en');
      }
      
      setLoading(false);
      return;
    }

    // Otherwise fetch at runtime (development hot reload)
    console.log('[Page] Fetching data at runtime from /data/*.json (development mode)');
    
    // Extract language and slug from URL
    let lang = pageContext.language;
    let slug = pageContext.slug;
    
    if (!lang && location && location.pathname) {
      const pathParts = location.pathname.split('/').filter(Boolean);
      lang = pathParts[0] || 'en'; // First part is language
      slug = pathParts[1] || 'home'; // Second part is slug (or 'home' if at /{lang})
      console.log('[Page] Extracted from URL - lang:', lang, 'slug:', slug);
    }
    
    // Read currentLanguage from localStorage or initialize it
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('currentlang');
      if (savedLang) {
        setCurrentLanguage(savedLang);
      } else {
        // Initialize with browser default if supported
        const browserLang = navigator.language.split('-')[0];
        const supportedLanguages = ['sk', 'en'];
        
        setCurrentLanguage(lang);
        
        // Will update with browser default after fetching languages
        fetch('/data/settings.json')
          .then(res => res.json())
          .then(settingsData => {
            const availableCodes = (settingsData.languages || []).map(l => l.code);
            if (supportedLanguages.includes(browserLang) && availableCodes.includes(browserLang)) {
              setCurrentLanguage(browserLang);
              localStorage.setItem('currentlang', browserLang);
            } else {
              localStorage.setItem('currentlang', lang);
            }
          })
          .catch(() => {
            localStorage.setItem('currentlang', lang);
          });
      }
    }

    // Fetch settings first to get languages
    fetch('/data/settings.json')
      .then(res => res.json())
      .then(settingsData => {
        console.log('[Page] Loaded settings:', settingsData.siteTitle);
        setSettings(settingsData);
        setLanguages(settingsData.languages || [{ code: 'en', name: 'English' }]);
        
        // Fetch pages data
        return fetch('/data/pages.json');
      })
      .then(res => {
        console.log('[Page] Fetched /data/pages.json');
        return res.json();
      })
      .then(pagesData => {
        // Find page by ID or slug
        let foundPage = null;
        
        if (pageContext.pageId) {
          foundPage = pagesData.find(p => p.id === pageContext.pageId);
        } else {
          // Search in default content or translations
          foundPage = pagesData.find(p => {
            if (p.slug === slug) return true;
            if (p.translations && p.translations[lang] && p.translations[lang].slug === slug) return true;
            return false;
          });
        }
        
        if (foundPage) {
          // Get localized content
          const localizedContent = foundPage.translations && foundPage.translations[lang]
            ? foundPage.translations[lang]
            : { title: foundPage.title, slug: foundPage.slug, rows: foundPage.rows };
          
          setPage({
            ...foundPage,
            title: localizedContent.title,
            slug: localizedContent.slug,
            rows: localizedContent.rows
          });
        } else {
          console.log('[Page] Page not found');
          setPage(null);
        }
        
        // Set menu pages
        const menu = pagesData.filter(p => p.includeInMenu || p.slug === 'home');
        setMenuPages(menu);
        
        setLoading(false);
      })
      .catch(error => {
        console.error('[Page] Error fetching data:', error);
        setLoading(false);
      });
  }, [pageContext.slug, pageContext.pageData, pageContext.settings, pageContext.language, pageContext.pageId, location]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div>{t('loading', currentLanguage)}</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div>{t('notFound', currentLanguage)}</div>
      </div>
    );
  }

  const rows = page.rows || [];
  
  // Handle language change
  const handleLanguageChange = (newLang) => {
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentlang', newLang);
    }
    
    // Get localized slug for current page
    let targetSlug = page.slug;
    if (page.translations && page.translations[newLang]) {
      targetSlug = page.translations[newLang].slug;
    }
    
    // Navigate to the new language version
    const isHome = page.slug === 'home' || targetSlug === 'home';
    const newPath = isHome ? `/${newLang}` : `/${newLang}/${targetSlug}`;
    navigate(newPath);
  };
  
  // Get localized menu page title
  const getLocalizedPageTitle = (menuPage, lang) => {
    if (menuPage.translations && menuPage.translations[lang]) {
      return menuPage.translations[lang].title;
    }
    return menuPage.title;
  };
  
  // Get localized menu page slug
  const getLocalizedPageSlug = (menuPage, lang) => {
    if (menuPage.translations && menuPage.translations[lang]) {
      return menuPage.translations[lang].slug;
    }
    return menuPage.slug;
  };

  // Get localized meta description
  const metaDescription = page.translations && page.translations[currentLanguage]?.metaDescription 
    ? page.translations[currentLanguage].metaDescription 
    : page.metaDescription || '';

  return (
    <>
      {/* Meta tags */}
      {typeof document !== 'undefined' && metaDescription && (
        <meta name="description" content={metaDescription} />
      )}
      
      <div className="page-container" style={{
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <Header 
          settings={settings}
          menuPages={menuPages}
          currentLanguage={currentLanguage}
          languages={languages}
          handleLanguageChange={handleLanguageChange}
          getLocalizedPageTitle={getLocalizedPageTitle}
          getLocalizedPageSlug={getLocalizedPageSlug}
          showCatalogLink={showCatalogLink}
        />

        {/* Main Content */}
        <main style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '3rem 2rem'
        }}>
          {/* Breadcrumbs */}
          {settings?.showBreadcrumbs && page.slug !== 'home' && (
            <Breadcrumbs
              items={[
                { label: t('home', currentLanguage), href: `/${currentLanguage}` },
                { label: page.title, href: null }
              ]}
              currentLanguage={currentLanguage}
            />
          )}
          
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '2rem',
            color: '#0f172a'
          }}>
            {page.title}
          </h1>

          {/* Render page components */}
          {rows && rows.map((row, index) => {
            const isDark = row.fields.darkTheme || row.fields.darkMode;
            const bgColor = row.fields.backgroundColor || '#ffffff';
            
            return (
              <div key={index} style={{
                marginBottom: '0',
                position: 'relative'
              }}>
                {/* TitleSlide Component */}
                {row.component === 'TitleSlide' && (
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
                )}

                {/* Boxes Component */}
                {row.component === 'Boxes' && (
                  <div style={{
                    background: isDark ? '#1e293b' : '#f8fafc',
                    padding: '4rem 2rem',
                    backgroundImage: row.fields.backgroundImage ? `url(${row.fields.backgroundImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                      <div style={{
                        display: 'grid',
                        gap: '2rem',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
                      }}>
                        {row.fields.boxes && row.fields.boxes.map((box, boxIdx) => (
                          <div key={boxIdx} style={{
                            background: 'white',
                            padding: '2rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            position: 'relative',
                            transform: `translate(${box.horizontalAdjustment || 0}px, ${box.verticalAdjustment || 0}px)`
                          }}>
                            {box.icon && (
                              <img src={box.icon} alt={box.heading} style={{ width: '60px', height: '60px', marginBottom: '1rem' }} />
                            )}
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: '#0f172a' }}>
                              {box.heading}
                            </h3>
                            {box.subheading && (
                              <p style={{ fontSize: '1rem', color: '#64748b', marginBottom: '1rem' }}>{box.subheading}</p>
                            )}
                            {box.text && (
                              <div style={{ fontSize: '1rem', lineHeight: '1.6', color: '#475569' }} dangerouslySetInnerHTML={{ __html: box.text }} />
                            )}
                            {box.lowerCornerText && (
                              <p style={{ position: 'absolute', bottom: '1rem', right: '1rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                                {box.lowerCornerText}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Infobar Component */}
                {row.component === 'Infobar' && (
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
                )}

                {/* Flies Component */}
                {row.component === 'Flies' && (
                  <div style={{
                    position: 'relative',
                    minHeight: '400px',
                    overflow: row.fields.hideOverflow ? 'hidden' : 'visible'
                  }}>
                    {row.fields.flies && row.fields.flies.map((fly, flyIdx) => (
                      <img
                        key={flyIdx}
                        src={fly.backgroundImage}
                        alt={`Fly ${flyIdx + 1}`}
                        style={{
                          position: 'absolute',
                          [fly.stickToRightSide ? 'right' : 'left']: `${fly.marginFromEdge || 0}%`,
                          top: `${fly.marginFromTop || 0}%`,
                          transform: `rotate(${fly.rotation || 0}deg) scale(${fly.scalingFactor || 1})`,
                          opacity: (fly.transparency || 100) / 100,
                          mixBlendMode: row.fields.blendMode || 'normal',
                          display: fly.showOnMobile ? 'block' : 'none',
                          maxWidth: '200px',
                          pointerEvents: 'none'
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Slide Component (two-column) */}
                {row.component === 'Slide' && (
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
                )}

                {/* Video Component */}
                {row.component === 'Video' && (
                  <div style={{
                    padding: row.fields.specialTheme === 'autoplay-fullwidth' ? '0' : '2rem',
                    background: '#000000',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      maxWidth: row.fields.specialTheme === 'autoplay-fullwidth' ? '100%' : '800px',
                      width: '100%',
                      position: 'relative',
                      paddingBottom: row.fields.specialTheme === 'iphone' ? '0' : '56.25%',
                      height: row.fields.specialTheme === 'iphone' ? '600px' : '0',
                      borderRadius: row.fields.specialTheme.includes('iphone') ? '30px' : '0',
                      overflow: 'hidden',
                      border: row.fields.specialTheme.includes('iphone') ? '8px solid #1e293b' : 'none'
                    }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${row.fields.youtubeUrl.split('v=')[1]?.split('&')[0] || row.fields.youtubeUrl}${row.fields.specialTheme.includes('autoplay') ? '?autoplay=1&mute=1' : ''}`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none'
                        }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* Ranking Component */}
                {row.component === 'Ranking' && (
                  <div style={{
                    background: isDark ? '#1e293b' : '#f8fafc',
                    color: isDark ? '#ffffff' : '#0f172a',
                    padding: '4rem 2rem',
                    backgroundImage: row.fields.backgroundImage ? `url(${row.fields.backgroundImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {row.fields.ranks && row.fields.ranks.map((rank, rankIdx) => (
                          <div key={rankIdx} style={{
                            background: isDark ? '#334155' : 'white',
                            padding: '2rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem'
                          }}>
                            <div style={{
                              fontSize: '3rem',
                              fontWeight: '900',
                              color: '#667eea',
                              minWidth: '60px',
                              textAlign: 'center'
                            }}>
                              #{rankIdx + 1}
                            </div>
                            <div>
                              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                                {rank.heading}
                              </h3>
                              {rank.subheading && (
                                <p style={{ fontSize: '1rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                  {rank.subheading}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* References Component */}
                {row.component === 'References' && (
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
                )}

                {/* Reviews Component */}
                {row.component === 'Reviews' && (
                  <div style={{
                    background: isDark ? '#1e293b' : '#f8fafc',
                    color: isDark ? '#ffffff' : '#0f172a',
                    padding: '4rem 2rem'
                  }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                      <h2 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        marginBottom: '2rem',
                        textAlign: 'center'
                      }}>
                        Reviews
                      </h2>
                      <div style={{
                        display: 'grid',
                        gap: '2rem',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
                      }}>
                        {row.fields.reviews && row.fields.reviews.map((review, reviewIdx) => (
                          <div key={reviewIdx} style={{
                            background: isDark ? '#334155' : 'white',
                            padding: '2rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}>
                            <p style={{
                              fontSize: '1.125rem',
                              lineHeight: '1.75',
                              marginBottom: '1.5rem',
                              fontStyle: 'italic',
                              color: isDark ? '#e2e8f0' : '#475569'
                            }}>
                              "{review.text}"
                            </p>
                            <p style={{
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              color: isDark ? '#94a3b8' : '#64748b'
                            }}>
                              — {review.author}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {(!rows || rows.length === 0) && (
            <div className='no-content' style={{
              padding: '3rem',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <p>{t('noContent', currentLanguage)}</p>
            </div>
          )}
        </main>

        <Footer
          settings={settings}
          menuPages={menuPages}
          currentLanguage={currentLanguage}
          getLocalizedPageTitle={getLocalizedPageTitle}
          getLocalizedPageSlug={getLocalizedPageSlug}
        />
      </div>
    </>
  );
};

export default PageTemplate;

export const Head = ({ pageContext }) => {
  const page = pageContext.pageData;
  const title = page?.title || pageContext.slug;
  const siteTitle = pageContext.settings?.siteTitle || 'TABLES';
  const language = pageContext.language || 'en';

  // Get localized meta description
  const metaDescription = page.translations && page.translations[language]?.metaDescription 
    ? page.translations[language].metaDescription 
    : page.metaDescription || '';

  const fullTitle = `${title} | ${siteTitle}`;
  const favicon = pageContext.settings?.siteFavicon;

  return <HeadComponent fullTitle={fullTitle} description={metaDescription} favicon={favicon} />;
};