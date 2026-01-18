import React from 'react';

const ExtensionsSection = ({ cmsData }) => {
  const { extensions, saveExtensions } = cmsData;

  const handleToggle = (key) => {
    saveExtensions({ ...extensions, [key]: !extensions[key] });
  };

  const extensionInfo = {
    'pages-extension-enabled': {
      name: 'Pages',
      description: 'Create and manage custom pages with dynamic components like slides, reviews, and galleries.'
    },
    'blog-extension-enabled': {
      name: 'Blog',
      description: 'Write and publish blog articles with support for authors, dates, and rich content.'
    },
    'pedigree-extension-enabled': {
      name: 'Pedigree',
      description: 'Manage a database of cats with information about names, breeds, and owners.'
    },
    'rental-extension-enabled': {
      name: 'Rental',
      description: 'Manage rental solutions including inventory, attendance, contacts, reservations, and a calendar view.'
    }
  };

  return (
    <section className="main-section active" id="extensions">
      <header>
        <h1>Extensions</h1>
      </header>
      <div style={{ padding: '20px' }}>
        <p style={{ marginBottom: '20px', color: '#64748b' }}>
          Enable the features you want to use in your CMS.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {Object.keys(extensions).map(key => (
            <div
              key={key}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '20px',
                background: extensions[key] ? '#f0fdf4' : 'white',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <input
                  type="checkbox"
                  checked={extensions[key]}
                  onChange={() => handleToggle(key)}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    marginTop: '2px'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>
                    {extensionInfo[key]?.name || key}
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                    {extensionInfo[key]?.description || 'No description available'}
                  </p>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: extensions[key] ? '#10b981' : '#cbd5e1',
                  color: 'white'
                }}>
                  {extensions[key] ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExtensionsSection;