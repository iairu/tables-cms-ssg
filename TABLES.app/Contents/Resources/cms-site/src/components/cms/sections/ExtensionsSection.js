import React from 'react';

const ExtensionsSection = ({ cmsData }) => {
  const { extensions, saveExtensions } = cmsData;

  const handleToggle = (key) => {
    saveExtensions({ ...extensions, [key]: !extensions[key] });
  };

  const extensionInfo = {
    'pages-extension-enabled': {
      name: 'Pages',
      description: 'Create and manage custom pages with dynamic components like slides, reviews, and galleries.',
      permaDisabled: false
    },
    'blog-extension-enabled': {
      name: 'Blog',
      description: 'Write and publish blog articles with support for authors, dates, and rich content.',
      permaDisabled: false
    },
    'pedigree-extension-enabled': {
      name: 'Pedigree',
      description: 'Manage a database of cats with information about names, breeds, and owners.',
      permaDisabled: false
    },
    'rental-extension-enabled': {
      name: 'Rental',
      description: 'Manage rental solutions including inventory, attendance, contacts, reservations, and a calendar view.',
      permaDisabled: false
    },
    'biometric-extension-enabled': {
        name: 'Biometric',
        description: "An non-secure database demo of users with fingerprints, face mugshots, and sensitive data.",
        permaDisabled: true
    },
    'medical-extension-enabled': {
        name: 'Medical',
        description: "An non-secure database demo of users with medical records, allergies, and health history.",
        permaDisabled: true
    },
    'financial-extension-enabled': {
        name: 'Financial',
        description: "An non-secure database demo of users with financial information, income, and assets.",
        permaDisabled: true
    },
    'legal-extension-enabled': {
        name: 'Legal',
        description: "An non-secure database demo of users with legal information, criminal records, and court cases.",
        permaDisabled: true
    },
    'personal-extension-enabled': {
        name: 'Personal',
        description: "An non-secure database demo of users with personal information, hobbies, and preferences.",
        permaDisabled: true
    }
  };

  const coreExtensions = ['pages-extension-enabled', 'blog-extension-enabled', 'pedigree-extension-enabled', 'rental-extension-enabled'];
  const userDatabaseExtensions = ['biometric-extension-enabled', 'medical-extension-enabled', 'financial-extension-enabled', 'legal-extension-enabled', 'personal-extension-enabled'];

  const cardStyle = {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  const buttonStyle = {
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    width: '100%',
    marginTop: '15px'
  };

  const enabledButtonStyle = {
    ...buttonStyle,
    background: '#ef4444',
    color: 'white',
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    background: 'rgb(37, 99, 235)',
    color: 'white',
  };


  const renderExtension = (key) => (
    <div
      key={key}
      style={{
        ...cardStyle,
        opacity: extensionInfo[key]?.permaDisabled ? 0.6 : 1,
        background: extensions[key] ? '#f0fdf4' : '#f8fafc',
      }}
    >
      <div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>
          {extensionInfo[key]?.name || key}
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
          {extensionInfo[key]?.description || 'No description available'}
        </p>
      </div>
      <button
        onClick={() => handleToggle(key)}
        disabled={extensionInfo[key]?.permaDisabled}
        style={extensions[key] ? enabledButtonStyle : disabledButtonStyle}
      >
        {extensions[key] ? 'Disable' : 'Enable'}
      </button>
    </div>
  );

  return (
    <section className="main-section active" id="extensions">
      <header>
        <h1>Extensions</h1>
      </header>
      <div style={{ padding: '20px' }}>
        <p style={{ marginBottom: '20px', color: '#64748b' }}>
          Enable the features you want to use in your CMS.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {coreExtensions.map(renderExtension)}
        </div>
        
        <h2 style={{ marginTop: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', fontSize: '24px', fontWeight: '600' }}>User Databases</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {userDatabaseExtensions.map(renderExtension)}
        </div>
      </div>
    </section>
  );
};

export default ExtensionsSection;