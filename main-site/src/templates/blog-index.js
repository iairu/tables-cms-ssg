import React, { useState, useEffect } from 'react';
import { navigate } from 'gatsby';
import { t, formatDate, getMonthName } from '../utils/localization';
import Breadcrumbs from '../components/Breadcrumbs';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BlogIndexTemplate = ({ pageContext }) => {
  const { lang = 'en' } = pageContext;
  const [articles, setArticles] = useState(pageContext.articlesData || []);
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
    return lang;
  });
  const [loading, setLoading] = useState(!pageContext.articlesData);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // If data is already in pageContext (production SSG), use it directly
    if (pageContext.articlesData && pageContext.settings) {
      const sortedArticles = pageContext.articlesData.sort((a, b) => {
        // Sort highlighted articles first, then by date
        if (a.highlighted && !b.highlighted) return -1;
        if (!a.highlighted && b.highlighted) return 1;
        return new Date(b.date) - new Date(a.date);
      });
      setArticles(sortedArticles);
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
            setCurrentLanguage(lang);
            localStorage.setItem('currentlang', lang);
          }
        }
      } else {
        setCurrentLanguage(lang);
      }
      
      setLoading(false);
      return;
    }

    // Otherwise fetch at runtime (development hot reload)
    
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
              setCurrentLanguage(lang);
              localStorage.setItem('currentlang', lang);
            }
          })
          .catch(() => {
            localStorage.setItem('currentlang', lang);
          });
      }
    }
    
    fetch('/data/blog.json')
      .then(res => res.json())
      .then(blogData => {
        // Sort by highlighted first, then by date descending
        const sortedArticles = blogData.sort((a, b) => {
          // Sort highlighted articles first, then by date
          if (a.highlighted && !b.highlighted) return -1;
          if (!a.highlighted && b.highlighted) return 1;
          return new Date(b.date) - new Date(a.date);
        });
        setArticles(sortedArticles);
        
        // Fetch pages data for menu
        return fetch('/data/pages.json');
      })
      .then(res => {
        console.log('[Blog Index] Fetched /data/pages.json');
        return res.json();
      })
      .then(pagesData => {
        // Set menu pages (pages with includeInMenu or slug === 'home')
        const menu = pagesData.filter(p => p.includeInMenu || p.slug === 'home');
        setMenuPages(menu);
        
        // Fetch settings data
        return fetch('/data/settings.json');
      })
      .then(res => res.json())
      .then(settingsData => {
        setSettings(settingsData);
        setLanguages(settingsData.languages || [{ code: 'en', name: 'English' }]);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, [pageContext.articlesData, pageContext.settings]);

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
    };
  };

  // Filter articles to ensure they have content in at least one language
  const filteredArticles = articles.filter(article => {
    const defaultContent = article.title && article.slug && article.content && article.content.trim() !== '';
    if (defaultContent) {
      return true;
    }
    // Check if there is at least one translation with content
    if (article.translations) {
      return Object.values(article.translations).some(t => t.title && t.slug && t.content && t.content.trim() !== '');
    }
    return false;
  });

  // Handle language change
  const handleLanguageChange = (newLang) => {
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentlang', newLang);
    }
    
    // Navigate to the new language blog index
    navigate(`/${newLang}/blog`);
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

  // Pagination logic
  const articlesPerPage = 10;
  const pinnedArticles = filteredArticles.filter(article => article.highlighted);
  const regularArticles = filteredArticles.filter(article => !article.highlighted);

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentRegularArticles = regularArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(regularArticles.length / articlesPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderArticle = (article) => {
    const localizedContent = getLocalizedContent(article, currentLanguage);
    return (
      <a
        key={article.id}
        href={`/${currentLanguage}/blog/${article.year}/${article.month}/${localizedContent.slug}`}
        style={{
          display: 'block',
          background: article.highlighted ? '#fefce8' : 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s',
          border: article.highlighted ? '2px solid #facc15' : '1px solid #e2e8f0',
          position: 'relative'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = '#667eea';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = article.highlighted ? '#facc15' : '#e2e8f0';
        }}
      >
        {article.highlighted && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: '#fbbf24',
            color: '#78350f',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            {t('pinned', currentLanguage)}
          </div>
        )}
        <h4 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          marginBottom: '0.5rem',
          color: '#0f172a',
          paddingRight: article.highlighted ? '6rem' : '0'
        }}>
          {localizedContent.title}
        </h4>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          color: '#64748b',
          fontSize: '0.875rem'
        }}>
          {(localizedContent.author || article.author) && (
            <span>{t('by', currentLanguage)} {localizedContent.author || article.author}</span>
          )}
          {article.date && (
            <span>
              {formatDate(article.date, currentLanguage, 'long')}
            </span>
          )}
        </div>
        
        {((localizedContent.category || article.category) || (localizedContent.tags || article.tags)) && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            alignItems: 'center',
            marginTop: '0.75rem'
          }}>
            {(localizedContent.category || article.category) && (
              <span style={{
                background: '#e0e7ff',
                color: '#3730a3',
                padding: '0.25rem 0.5rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {localizedContent.category || article.category}
              </span>
            )}
            {(localizedContent.tags || article.tags) && (localizedContent.tags || article.tags).split(',').map((tag, idx) => (
              <span 
                key={idx}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem'
                }}
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
        
        {(localizedContent.content || article.content) && (
          <p style={{
            marginTop: '1rem',
            color: '#475569',
            lineHeight: '1.6',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {localizedContent.content || article.content}
          </p>
        )}
      </a>
    );
  };

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
      />

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 2rem'
      }}>
        {/* Breadcrumbs */}
        {settings?.showBreadcrumbs && (
          <Breadcrumbs
            items={[
              { label: t('home', currentLanguage), href: `/${currentLanguage}` },
              { label: t('blog', currentLanguage), href: null }
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
          Blog
        </h1>

        {pinnedArticles.length === 0 && currentRegularArticles.length === 0 ? (
          <div style={{
            background: '#f8fafc',
            padding: '3rem',
            borderRadius: '1rem',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <p>{t('noBlogPosts', currentLanguage)}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {pinnedArticles.map(article => renderArticle(article))}
            {currentRegularArticles.map(article => renderArticle(article))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: '1px solid #cbd5e1',
                background: currentPage === 1 ? '#f8fafc' : 'white',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                color: currentPage === 1 ? '#94a3b8' : '#334155'
              }}
            >
              {t('previous', currentLanguage)}
            </button>
            <span style={{ color: '#475569', fontSize: '0.875rem' }}>
              {t('page', currentLanguage)} {currentPage} {t('of', currentLanguage)} {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: '1px solid #cbd5e1',
                background: currentPage === totalPages ? '#f8fafc' : 'white',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                color: currentPage === totalPages ? '#94a3b8' : '#334155'
              }}
            >
              {t('next', currentLanguage)}
            </button>
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
  );
};

export default BlogIndexTemplate;

export const Head = ({ pageContext }) => {
  const siteTitle = pageContext.settings?.siteTitle || 'TABLES';
  
  return (
    <>
      <title>Blog | {siteTitle}</title>
      <meta name="description" content="Blog articles and updates" />
      {pageContext.settings?.siteFavicon && <link rel="icon" href={pageContext.settings?.siteFavicon} />}
      {/* FontAwesome CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    </>
  );
};