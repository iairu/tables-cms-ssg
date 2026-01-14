import React from 'react';
import { graphql } from 'gatsby';

const PageTemplate = ({ data }) => {
  const page = data.page;
  const settings = data.settings;
  
  // Parse rows from JSON string
  const rows = page.rows ? JSON.parse(page.rows) : [];

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
          {page.title}
        </h1>

        {/* Render page components */}
        {rows && rows.map((row, index) => (
          <div key={index} style={{
            marginBottom: '3rem',
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            {row.component === 'Slide' && (
              <div>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: '#1e293b'
                }}>
                  {row.fields['Slide heading']}
                </h2>
                <div style={{
                  fontSize: '1.125rem',
                  lineHeight: '1.75',
                  color: '#475569',
                  whiteSpace: 'pre-wrap'
                }}>
                  {row.fields['Slide content']}
                </div>
              </div>
            )}

            {row.component === 'Reviews' && (
              <div>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '600',
                  marginBottom: '1.5rem',
                  color: '#1e293b'
                }}>
                  Reviews
                </h2>
                <div style={{
                  display: 'grid',
                  gap: '1.5rem',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
                }}>
                  {row.fields.reviews && row.fields.reviews.map((review, reviewIndex) => (
                    <div key={reviewIndex} style={{
                      background: '#f8fafc',
                      padding: '1.5rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #e2e8f0'
                    }}>
                      {review['Review logo'] && (
                        <img 
                          src={review['Review logo']} 
                          alt="Review logo"
                          style={{
                            maxWidth: '100px',
                            marginBottom: '1rem'
                          }}
                        />
                      )}
                      <p style={{
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        color: '#475569',
                        marginBottom: '1rem',
                        fontStyle: 'italic'
                      }}>
                        "{review['Review content']}"
                      </p>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#64748b'
                      }}>
                        — {review['Review author']}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {row.component === 'Text' && (
              <div style={{
                fontSize: '1.125rem',
                lineHeight: '1.75',
                color: '#475569',
                whiteSpace: 'pre-wrap'
              }}>
                {row.fields.content}
              </div>
            )}

            {row.component === 'Gallery' && (
              <div>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '600',
                  marginBottom: '1.5rem',
                  color: '#1e293b'
                }}>
                  Gallery
                </h2>
                <div style={{
                  display: 'grid',
                  gap: '1rem',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))'
                }}>
                  {row.fields.images && row.fields.images.map((image, imgIndex) => (
                    <img 
                      key={imgIndex}
                      src={image}
                      alt={`Gallery item ${imgIndex + 1}`}
                      style={{
                        width: '100%',
                        height: '250px',
                        objectFit: 'cover',
                        borderRadius: '0.5rem'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {(!rows || rows.length === 0) && (
          <div style={{
            background: '#f8fafc',
            padding: '3rem',
            borderRadius: '1rem',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <p>No content added yet. Please add components in the CMS.</p>
          </div>
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

export const query = graphql`
  query($id: String!) {
    page(id: { eq: $id }) {
      id
      title
      slug
      rows
    }
    settings {
      siteTitle
      defaultLang
      theme
    }
  }
`;

export default PageTemplate;

export const Head = ({ data }) => (
  <>
    <title>{data.page.title} | {data.settings?.siteTitle || 'TABLES'}</title>
    <meta name="description" content={data.page.title} />
  </>
);