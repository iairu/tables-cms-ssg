import React, { useState, useEffect } from 'react';
import { navigate } from 'gatsby';

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
        <div>Loading...</div>
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

  // Filter articles by current language
  const filteredArticles = articles.filter(article => {
    const localizedContent = getLocalizedContent(article, currentLanguage);
    // Only show articles that have content in the current language
    return localizedContent.title && localizedContent.slug;
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

  // Group articles by year and month
  const groupedArticles = {};
  filteredArticles.forEach(article => {
    const year = article.year;
    const month = article.month;
    if (!groupedArticles[year]) groupedArticles[year] = {};
    if (!groupedArticles[year][month]) groupedArticles[year][month] = [];
    groupedArticles[year][month].push(article);
  });

  // Sort articles within each month by highlighted first, then date descending
  Object.keys(groupedArticles).forEach(year => {
    Object.keys(groupedArticles[year]).forEach(month => {
      groupedArticles[year][month].sort((a, b) => {
        // Sort highlighted articles first, then by date
        if (a.highlighted && !b.highlighted) return -1;
        if (!a.highlighted && b.highlighted) return 1;
        return new Date(b.date) - new Date(a.date);
      });
    });
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
            {settings?.siteTitle || 'TABLES'}
          </h1>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {menuPages.map(menuPage => {
              const localizedSlug = getLocalizedPageSlug(menuPage, currentLanguage);
              const localizedTitle = getLocalizedPageTitle(menuPage, currentLanguage);
              const isHome = menuPage.slug === 'home' || localizedSlug === 'home';
              const href = isHome ? `/${currentLanguage}` : `/${currentLanguage}/${localizedSlug}`;
              
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
            <a href={`/${currentLanguage}/blog`} style={{ color: 'white', textDecoration: 'none' }}>Blog</a>
            
            {/* Language Switcher */}
            <select
              value={currentLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                padding: '5px 10px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {languages.map(language => (
                <option key={language.code} value={language.code} style={{ color: '#333' }}>
                  {language.name}
                </option>
              ))}
            </select>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 2rem'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '2rem',
          color: '#0f172a'
        }}>
          Blog
        </h1>

        {Object.keys(groupedArticles).length === 0 ? (
          <div style={{
            background: '#f8fafc',
            padding: '3rem',
            borderRadius: '1rem',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <p>No blog articles yet. Create your first article in the CMS!</p>
          </div>
        ) : (
          Object.keys(groupedArticles).sort((a, b) => b - a).map(year => (
            <div key={year} style={{
              marginBottom: '3rem'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
                color: '#1e293b',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid #e2e8f0'
              }}>
                {year}
              </h2>
              
              {Object.keys(groupedArticles[year]).sort((a, b) => b - a).map(month => (
                <div key={month} style={{
                  marginBottom: '2rem'
                }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    color: '#475569'
                  }}>
                    {monthNames[month - 1]}
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gap: '1rem'
                  }}>
                    {groupedArticles[year][month].map(article => {
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
                            📌 Pinned
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
                            <span>By {localizedContent.author || article.author}</span>
                          )}
                          {article.date && (
                            <span>
                              {new Date(article.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
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
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: '#f8fafc',
        padding: '2rem',
        marginTop: '4rem',
        borderTop: '1px solid #e2e8f0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.875rem'
        }}>
          <p>© {new Date().getFullYear()} {settings?.siteTitle || 'TABLES'}. Built with Gatsby.</p>
        </div>
      </footer>
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
    </>
  );
};