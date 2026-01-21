import React from 'react';

const Ranking = ({ row }) => {
  const isDark = row.fields.darkTheme || row.fields.darkMode;

  return (
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
  );
};

export default Ranking;
