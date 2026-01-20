import React, { useState, useEffect } from 'react';
import { navigate } from 'gatsby';
import { t, formatDate } from '../utils/localization';
import Breadcrumbs from '../components/Breadcrumbs';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Head from '../components/Head';

const BlogArticleTemplate = ({ pageContext, location }) => {
  const [article, setArticle] = useState(pageContext.articleData || null);
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
  const [loading, setLoading] = useState(!pageContext.articleData);
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

  useEffect(() => {
    // If data is already in pageContext (production SSG), use it directly
    if (pageContext.articleData && pageContext.settings) {
      console.log('[Blog Article] Using prerendered data from pageContext (production mode)');
      setArticle(pageContext.articleData);
      setSettings(pageContext.settings);
      setMenuPages(pageContext.menuPages || []);
      setLanguages(pageContext.languages || [{ code: 'en', name: 'English' }]);
      
      // Read currentLanguage from localStorage or initialize it
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
    console.log('[Blog Article] Fetching data at runtime from /data/*.json (development mode)');
    // Extract slug from URL if not in pageContext (client-side routing)
    let slug = pageContext.slug;
    if (!slug && location && location.pathname) {
      // Extract slug from URL path like /blog/2026/1/my-article
      const pathParts = location.pathname.split('/').filter(Boolean);
      slug = pathParts[pathParts.length - 1];
    }

    // Read currentLanguage from localStorage or initialize it
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('currentlang');
      if (savedLang) {
        setCurrentLanguage(savedLang);
      } else {
        // Initialize with browser default if supported (will be validated after fetching settings)
        const browserLang = navigator.language.split('-')[0];
        const supportedLanguages = ['sk', 'en'];
        
        // Fetch settings first to validate
        fetch('/data/settings.json')
          .then(res => res.json())
          .then(settingsData => {
            const availableCodes = (settingsData.languages || []).map(l => l.code);
            if (supportedLanguages.includes(browserLang) && availableCodes.includes(browserLang)) {
              setCurrentLanguage(browserLang);
              localStorage.setItem('currentlang', browserLang);
            } else {
              setCurrentLanguage(pageContext.language || 'en');
              localStorage.setItem('currentlang', pageContext.language || 'en');
            }
          })
          .catch(() => {
            localStorage.setItem('currentlang', pageContext.language || 'en');
          });
      }
    }

    // Fetch blog articles data
    fetch('/data/blog.json')
      .then(res => {
        console.log('[Blog Article] Fetched /data/blog.json');
        return res.json();
      })
      .then(blogData => {
        // Search by base slug or localized slug in translations
        const foundArticle = blogData.find(a => {
          if (a.slug === slug) return true;
          // Check if slug matches any translation
          if (a.translations) {
            for (const lang in a.translations) {
              if (a.translations[lang].slug === slug) return true;
            }
          }
          return false;
        });
        console.log('[Blog Article] Found article:', foundArticle ? foundArticle.title : 'NOT FOUND');
        setArticle(foundArticle);
        
        // Fetch pages data for menu
        return fetch('/data/pages.json');
      })
      .then(res => {
        console.log('[Blog Article] Fetched /data/pages.json');
        return res.json();
      })
      .then(pagesData => {
        // Set menu pages (pages with includeInMenu or slug === 'home')
        const menu = pagesData.filter(p => p.includeInMenu || p.slug === 'home');
        setMenuPages(menu);
        
        // Fetch settings data
        return fetch('/data/settings.json');
      })
      .then(res => {
        console.log('[Blog Article] Fetched /data/settings.json');
        return res.json();
      })
      .then(settingsData => {
        console.log('[Blog Article] Loaded settings:', settingsData.siteTitle);
        setSettings(settingsData);
        setLanguages(settingsData.languages || [{ code: 'en', name: 'English' }]);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, [pageContext.slug, pageContext.articleData, pageContext.settings, location]);

  // Helper function to get localized content
  const getLocalizedContent = (article, lang) => {
    if (article.translations && article.translations[lang]) {
      return article.translations[lang];
    }
    return {
      title: article.title,
      slug: article.slug,
      author: article.author,
      content: article.content,
      category: article.category,
      tags: article.tags,
      metaDescription: article.metaDescription,
    };
  };

  // Handle language change
  const handleLanguageChange = (newLang) => {
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentlang', newLang);
    }
    
    // Get localized slug for current article
    let targetSlug = article.slug;
    if (article.translations && article.translations[newLang]) {
      targetSlug = article.translations[newLang].slug;
    }
    
    // Navigate to the new language version
    const date = new Date(article.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    navigate(`/${newLang}/blog/${year}/${month}/${targetSlug}`);
  };

  // Get localized menu page title
  const getLocalizedPageTitle = (menuPage, lang) => {
    if (menuPage.translations && menuPage.translations[lang]) {
      return menuPage.translations[lang].title || menuPage.title;
    }
    return menuPage.title;
  };

  // Get localized menu page slug
  const getLocalizedPageSlug = (menuPage, lang) => {
    if (menuPage.translations && menuPage.translations[lang]) {
      return menuPage.translations[lang].slug || menuPage.slug;
    }
    return menuPage.slug;
  };

  const articleContent = article ? getLocalizedContent(article, currentLanguage) : {};

  if (loading) {
    return (
      <div className="loading-container" style={{
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

  if (!article) {
    return (
      <div className="not-found-container" style={{
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

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
        maxWidth: '800px',
        margin: '0 auto',
        padding: '3rem 2rem'
      }}>
        {/* Breadcrumbs */}
        {settings?.showBreadcrumbs && (
          <Breadcrumbs
            items={[
              { label: t('home', currentLanguage), href: `/${currentLanguage}` },
              { label: t('blog', currentLanguage), href: `/${currentLanguage}/blog` },
              { label: articleContent.title || article.title, href: null }
            ]}
            currentLanguage={currentLanguage}
          />
        )}
        
        {/* Article Header */}
        <article>
          <header style={{
            marginBottom: '2rem',
            paddingBottom: '2rem',
            borderBottom: '2px solid #e2e8f0'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '1rem',
              color: '#0f172a',
              lineHeight: '1.2'
            }}>
              {articleContent.title || article.title}
            </h1>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: '#64748b',
              fontSize: '0.875rem',
              marginTop: '0.5rem'
            }}>
              {(articleContent.author || article.author) && (
                <span>{t('by', currentLanguage)} {articleContent.author || article.author}</span>
              )}
              {article.date && (
                <span>
                  {formatDate(article.date, currentLanguage, 'long')}
                </span>
              )}
            </div>
            
            {((articleContent.category || article.category) || (articleContent.tags || article.tags)) && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                alignItems: 'center',
                marginTop: '1rem'
              }}>
                {(articleContent.category || article.category) && (
                  <span style={{
                    background: '#e0e7ff',
                    color: '#3730a3',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {articleContent.category || article.category}
                  </span>
                )}
                {(articleContent.tags || article.tags) && (articleContent.tags || article.tags).split(',').map((tag, idx) => (
                  <span 
                    key={idx}
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem'
                    }}
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Article Content */}
          <div style={{
            fontSize: '1.125rem',
            lineHeight: '1.75',
            color: '#334155',
            whiteSpace: 'pre-wrap'
          }}>
            {articleContent.content || article.content}
          </div>
        </article>

        {/* Back to Blog Link */}
        <div style={{
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid #e2e8f0'
        }}>
          <a 
            href={`/${currentLanguage}/blog`}
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              transition: 'background 0.2s'
            }}
          >
            {t('backToBlog', currentLanguage)}
          </a>
        </div>
      </main>

      <Footer
        settings={settings}
        menuPages={menuPages}
        currentLanguage={currentLanguage}
        getLocalizedPageTitle={getLocalizedPageTitle}
        getLocalizedPageSlug={getLocalizedPageSlug}
      />
    </div>
  );
};

export default BlogArticleTemplate;

export const Head = ({ pageContext }) => {
  const article = pageContext.articleData;
  const language = pageContext.language || 'en';
  const settings = pageContext.settings;

  const localizedContent = article?.translations?.[language] || article;

  const title = localizedContent?.title || pageContext.slug;
  const siteTitle = settings?.siteTitle || 'TABLES';

  const metaDescription = localizedContent?.metaDescription
    || settings?.defaultMetaDescription
    || article?.content?.substring(0, 160)
    || title;

  const fullTitle = `${title} | ${siteTitle}`;
  const favicon = pageContext.settings?.siteFavicon;

  return <Head fullTitle={fullTitle} description={metaDescription} favicon={favicon} lang={language} />;
};