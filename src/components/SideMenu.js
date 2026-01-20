import React, { useState } from 'react';
import { Link } from 'gatsby';

const pathFromSection = {
  pages: 'pages',
  blog: 'blog',
  cats: 'pedigree',
  'rental-inventory': 'inventory',
  'rental-attendance': 'attendance',
  'rental-customers': 'customers',
  'rental-employees': 'employees',
  'rental-reservations': 'reservations',
  'rental-calendar': 'calendar',
  settings: 'settings',
  extensions: 'extensions'
};

const SideMenu = ({ currentSection, isBuilding, lastSaved, onBuildClick, canBuild, buildCooldownSeconds, domain, vercelApiKey }) => {
  const [isRentalSubMenuOpen, setIsRentalSubMenuOpen] = useState(false);
  let extensions = {};
  try {
    extensions = JSON.parse(localStorage.getItem('extensions') || '{}');
  } catch (e) {
    extensions = {};
  }

  const handleBuildClick = (e, localOnly = false) => {
    e.preventDefault();
    if (onBuildClick && !isBuilding && canBuild) {
      onBuildClick(localOnly);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRentalSubMenu = (e) => {
    e.preventDefault();
    setIsRentalSubMenuOpen(!isRentalSubMenuOpen);
  };

  return (
    <aside className="side-menu">      
      {/* Visit Deployment Button */}
      {(extensions['pages-extension-enabled'] || extensions['blog-extension-enabled']) && domain && (
        <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <a
            href={domain}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
              textDecoration: 'none'
            }}
          >
            <span>Visit Domain</span>
            {/* <Icon icon="fa-solid fa-external-link-alt" />*/}
          </a>
        </div>
      )}
      
      {/* Build Buttons */}
      <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0' }}>
        {(extensions['pages-extension-enabled'] || extensions['blog-extension-enabled']) && vercelApiKey && (
          <button
            onClick={(e) => handleBuildClick(e, false)}
            disabled={isBuilding || !canBuild}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: (isBuilding || !canBuild) ? '#94a3b8' : 'linear-gradient(135deg, #333333 0%, #000000 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: (isBuilding || !canBuild) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: (isBuilding || !canBuild) ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
              marginBottom: '10px'
            }}
          >
            {isBuilding && (
              <div style={{
                width: '14px',
                height: '14px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}></div>
            )}
            {isBuilding ? 'Building...' : (!canBuild ? `Wait ${formatTime(buildCooldownSeconds)}` : '▲ Build and Deploy')}
          </button>
        )}
        {(extensions['pages-extension-enabled'] || extensions['blog-extension-enabled']) && (
        <button
          onClick={(e) => handleBuildClick(e, true)}
          disabled={isBuilding || !canBuild}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: (isBuilding || !canBuild) ? '#e2e8f0' : 'white',
            color: (isBuilding || !canBuild) ? '#94a3b8' : '#475569',
            border: (isBuilding || !canBuild) ? '1px solid #cbd5e1' : '1px solid #cbd5e1',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: (isBuilding || !canBuild) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          Build Locally Only
        </button>
        )}
        
        {lastSaved && !isBuilding && (
          <div style={{
            marginTop: '10px',
            background: '#10b981',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            textAlign: 'center'
          }}>
            ✓ Built Successfully
          </div>
        )}
      </div>
      <div>
        <h3>Content</h3>
        {(() => {
          
          return (
            <>
              {extensions['pages-extension-enabled'] && (
                <Link
                  to={`/cms/${pathFromSection.pages}`}
                  className={currentSection === 'pages' ? 'active' : ''}
                >
                  Pages
                </Link>
              )}
              {extensions['blog-extension-enabled'] && (
                <Link
                  to={`/cms/${pathFromSection.blog}`}
                  className={currentSection === 'blog' ? 'active' : ''}
                >
                  Blog
                </Link>
              )}
              {extensions['pedigree-extension-enabled'] && (
                <Link
                  to={`/cms/${pathFromSection.cats}`}
                  className={currentSection === 'cats' ? 'active' : ''}
                >
                  Pedigree
                </Link>
              )}
              {extensions['rental-extension-enabled'] && (
                <div>
                      <Link to={`/cms/${pathFromSection['rental-inventory']}`} className={currentSection === 'rental-inventory' ? 'active' : ''}>
                        Inventory
                      </Link>
                      <Link to={`/cms/${pathFromSection['rental-attendance']}`} className={currentSection === 'rental-attendance' ? 'active' : ''}>
                        Attendance
                      </Link>
                      <Link to={`/cms/${pathFromSection['rental-customers']}`} className={currentSection === 'rental-customers' ? 'active' : ''}>
                        Customers
                      </Link>
                      <Link to={`/cms/${pathFromSection['rental-employees']}`} className={currentSection === 'rental-employees' ? 'active' : ''}>
                        Employees
                      </Link>
                      <Link to={`/cms/${pathFromSection['rental-reservations']}`} className={currentSection === 'rental-reservations' ? 'active' : ''}>
                        Reservations
                      </Link>
                      <Link to={`/cms/${pathFromSection['rental-calendar']}`} className={currentSection === 'rental-calendar' ? 'active' : ''}>
                        Calendar
                      </Link>
                    </div>
              )}
            </>
          );
        })()}
        {/* <a 
          href="#components" 
          onClick={(e) => handleClick(e, 'components')}
          className={currentSection === 'components' ? 'active' : ''}
        >
          Components
        </a>*/}
      </div>
      <div>
        <h3>Configuration</h3>
        <Link
          to={`/cms/${pathFromSection.settings}`}
          className={currentSection === 'settings' ? 'active' : ''}
        >
          Settings
        </Link>
        {/* <a 
          href="#acl" 
          onClick={(e) => handleClick(e, 'acl')}
          className={currentSection === 'acl' ? 'active' : ''}
        >
          ACL
        </a>*/}
        <Link
          to={`/cms/${pathFromSection.extensions}`}
          className={currentSection === 'extensions' ? 'active' : ''}
        >
          Extensions
        </Link>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </aside>
  );
};

export default SideMenu;