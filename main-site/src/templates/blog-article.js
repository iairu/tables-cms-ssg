import React from 'react';
import { graphql } from 'gatsby';

const BlogArticleTemplate = ({ data }) => {
  const article = data.blogArticle;
  const settings = data.settings;

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
        maxWidth: '800px',
        margin: '0 auto',
        padding: '3rem 2rem'
      }}>
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
              {article.title}
            </h1>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: '#64748b',
              fontSize: '0.875rem'
            }}>
              {article.author && (
                <span style={{ fontWeight: '600' }}>By {article.author}</span>
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
          </header>

          {/* Article Content */}
          <div style={{
            fontSize: '1.125rem',
            lineHeight: '1.75',
            color: '#334155',
            whiteSpace: 'pre-wrap'
          }}>
            {article.content}
          </div>
        </article>

        {/* Back to Blog Link */}
        <div style={{
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid #e2e8f0'
        }}>
          <a 
            href="/blog"
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
            ← Back to Blog
          </a>
        </div>
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
    blogArticle(id: { eq: $id }) {
      id
      title
      slug
      content
      author
      date
      year
      month
    }
    settings {
      siteTitle
      defaultLang
      theme
    }
  }
`;

export default BlogArticleTemplate;

export const Head = ({ data }) => (
  <>
    <title>{data.blogArticle.title} | {data.settings?.siteTitle || 'TABLES'}</title>
    <meta name="description" content={data.blogArticle.content?.substring(0, 160) || data.blogArticle.title} />
  </>
);