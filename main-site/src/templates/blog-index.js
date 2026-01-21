import React, { useState, useEffect } from 'react';
import { navigate } from 'gatsby';
import { t, formatDate, getMonthName } from '../utils/localization';
import Breadcrumbs from '../components/Breadcrumbs';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeadComponent from '../components/HeadComponent';
import Loading from '../components/common/Loading';
import ArticleCard from '../components/blog/ArticleCard';

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
    return <Loading language={currentLanguage} />;
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
  const getPageSlug = (menuPage, lang) => {
    if (menuPage.translations && menuPage.translations[lang]) {
      return menuPage.slug;
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

  return (
    <div className="page-container">
      <Header
        settings={settings}
        menuPages={menuPages}
        currentLanguage={currentLanguage}
        languages={languages}
        handleLanguageChange={handleLanguageChange}
        getLocalizedPageTitle={getLocalizedPageTitle}
        getPageSlug={getPageSlug}
      />

      {/* Main Content */}
      <main className="blog-index-main-content">
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
        
        <h1 className="blog-index-title">
          Blog
        </h1>

        {pinnedArticles.length === 0 && currentRegularArticles.length === 0 ? (
          <div className="blog-index-empty">
            <p>{t('noBlogPosts', currentLanguage)}</p>
          </div>
        ) : (
          <div className="blog-index-articles-grid">
            {pinnedArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                currentLanguage={currentLanguage}
                getLocalizedContent={getLocalizedContent}
              />
            ))}
            {currentRegularArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                currentLanguage={currentLanguage}
                getLocalizedContent={getLocalizedContent}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="blog-index-pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="blog-index-pagination-btn"
            >
              {t('previous', currentLanguage)}
            </button>
            <span className="blog-index-pagination-info">
              {t('page', currentLanguage)} {currentPage} {t('of', currentLanguage)} {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="blog-index-pagination-btn"
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
        getPageSlug={getPageSlug}
      />
    </div>
  );
};

export default BlogIndexTemplate;

export const Head = ({ pageContext }) => {
  const siteTitle = pageContext.settings?.siteTitle || 'TABLES';
  const fullTitle = `Blog | ${siteTitle}`;
  const description = "Blog articles and updates";
  const favicon = pageContext.settings?.siteFavicon;

  return <HeadComponent fullTitle={fullTitle} description={description} favicon={favicon} />;
};