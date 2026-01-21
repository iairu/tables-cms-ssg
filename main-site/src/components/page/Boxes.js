import React from 'react';

const Boxes = ({ row }) => {
  const isDark = row.fields.darkTheme || row.fields.darkMode;

  return (
    <div style={{
      background: isDark ? '#1e293b' : '#f8fafc',
      padding: '4rem 2rem',
      backgroundImage: row.fields.backgroundImage ? `url(${row.fields.backgroundImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gap: '2rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
        }}>
          {row.fields.boxes && row.fields.boxes.map((box, boxIdx) => (
            <div key={boxIdx} style={{
              background: 'white',
              padding: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              transform: `translate(${box.horizontalAdjustment || 0}px, ${box.verticalAdjustment || 0}px)`
            }}>
              {box.icon && (
                <img src={box.icon} alt={box.heading} style={{ width: '60px', height: '60px', marginBottom: '1rem' }} />
              )}
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: '#0f172a' }}>
                {box.heading}
              </h3>
              {box.subheading && (
                <p style={{ fontSize: '1rem', color: '#64748b', marginBottom: '1rem' }}>{box.subheading}</p>
              )}
              {box.text && (
                <div style={{ fontSize: '1rem', lineHeight: '1.6', color: '#475569' }} dangerouslySetInnerHTML={{ __html: box.text }} />
              )}
              {box.lowerCornerText && (
                <p style={{ position: 'absolute', bottom: '1rem', right: '1rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                  {box.lowerCornerText}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Boxes;
