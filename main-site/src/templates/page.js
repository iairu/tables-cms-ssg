import React, { useState, useEffect } from 'react';
import { navigate } from 'gatsby';
import { t } from '../utils/localization';
import Breadcrumbs from '../components/Breadcrumbs';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeadComponent from '../components/HeadComponent';
import Loading from '../components/common/Loading';
import NotFound from '../components/common/NotFound';
import PageComponent from '../components/page';

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
    return <Loading language={currentLanguage} />;
  }

  if (!page) {
    return <NotFound language={currentLanguage} />;
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
          {rows && rows.map((row, index) => (
            <div key={index} style={{
              marginBottom: '0',
              position: 'relative'
            }}>
              <PageComponent row={row} />
            </div>
          ))}

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