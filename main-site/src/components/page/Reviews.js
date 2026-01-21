import React from 'react';

const Reviews = ({ row }) => {
  const isDark = row.fields.darkTheme || row.fields.darkMode;

  return (
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
  );
};

export default Reviews;
