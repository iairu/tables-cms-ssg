import React, { useState, useEffect } from 'react';

const BlogIndexTemplate = () => {
  const [articles, setArticles] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch blog articles data
    fetch('/data/blog.json')
      .then(res => res.json())
      .then(blogData => {
        // Sort by date descending
        const sortedArticles = blogData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setArticles(sortedArticles);
        
        // Fetch settings data
        return fetch('/data/settings.json');
      })
      .then(res => res.json())
      .then(settingsData => {
        setSettings(settingsData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

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

  // Group articles by year and month
  const groupedArticles = {};
  articles.forEach(article => {
    const year = article.year;
    const month = article.month;
    if (!groupedArticles[year]) groupedArticles[year] = {};
    if (!groupedArticles[year][month]) groupedArticles[year][month] = [];
    groupedArticles[year][month].push(article);
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
          <nav>
            <a href="/" style={{ color: 'white', marginRight: '1.5rem', textDecoration: 'none' }}>Home</a>
            <a href="/blog" style={{ color: 'white', marginRight: '1.5rem', textDecoration: 'none' }}>Blog</a>
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
                    {groupedArticles[year][month].map(article => (
                      <a 
                        key={article.id}
                        href={`/blog/${article.year}/${article.month}/${article.slug}`}
                        style={{
                          display: 'block',
                          background: 'white',
                          padding: '1.5rem',
                          borderRadius: '0.5rem',
                          textDecoration: 'none',
                          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.2s',
                          border: '1px solid #e2e8f0'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.borderColor = '#667eea';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                      >
                        <h4 style={{
                          fontSize: '1.25rem',
                          fontWeight: '600',
                          marginBottom: '0.5rem',
                          color: '#0f172a'
                        }}>
                          {article.title}
                        </h4>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          color: '#64748b',
                          fontSize: '0.875rem'
                        }}>
                          {article.author && (
                            <span>By {article.author}</span>
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
                        
                        {article.content && (
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
                            {article.content}
                          </p>
                        )}
                      </a>
                    ))}
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

export const Head = () => (
  <>
    <title>Blog | TABLES</title>
    <meta name="description" content="Blog articles and updates" />
  </>
);