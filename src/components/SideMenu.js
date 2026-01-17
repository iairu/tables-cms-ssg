import React from 'react';
import { Link } from 'gatsby';

const SideMenu = ({ currentSection, onSectionChange, isBuilding, lastSaved, onBuildClick, canBuild, buildCooldownSeconds }) => {
  const handleClick = (e, sectionId) => {
    e.preventDefault();
    onSectionChange(sectionId);
  };

  const handleBuildClick = (e) => {
    e.preventDefault();
    if (onBuildClick && !isBuilding && canBuild) {
      onBuildClick();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <aside className="side-menu">
      <h2>CMS</h2>
      
      {/* Build Button */}
      <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0' }}>
        <button
          onClick={handleBuildClick}
          disabled={isBuilding || !canBuild}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: (isBuilding || !canBuild) ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            transition: 'all 0.2s'
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
          {isBuilding ? 'Building...' : (!canBuild ? `Wait ${formatTime(buildCooldownSeconds)}` : 'Build and Deploy')}
        </button>
        
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
          let extensions = {};
          try {
            extensions = JSON.parse(localStorage.getItem('extensions') || '{}');
          } catch (e) {
            extensions = {};
          }
          return (
            <>
              {extensions['pages-extension-enabled'] && (
                <a 
                  href="#pages" 
                  onClick={(e) => handleClick(e, 'pages')}
                  className={currentSection === 'pages' ? 'active' : ''}
                >
                  Pages
                </a>
              )}
              {extensions['blog-extension-enabled'] && (
                <a 
                  href="#blog" 
                  onClick={(e) => handleClick(e, 'blog')}
                  className={currentSection === 'blog' ? 'active' : ''}
                >
                  Blog
                </a>
              )}
              {extensions['pedigree-extension-enabled'] && (
                <a 
                  href="#cats" 
                  onClick={(e) => handleClick(e, 'cats')}
                  className={currentSection === 'cats' ? 'active' : ''}
                >
                  Cats
                </a>
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
        <a 
          href="#settings" 
          onClick={(e) => handleClick(e, 'settings')}
          className={currentSection === 'settings' ? 'active' : ''}
        >
          Settings
        </a>
        {/* <a 
          href="#acl" 
          onClick={(e) => handleClick(e, 'acl')}
          className={currentSection === 'acl' ? 'active' : ''}
        >
          ACL
        </a>*/}
        <a 
          href="#extensions" 
          onClick={(e) => handleClick(e, 'extensions')}
          className={currentSection === 'extensions' ? 'active' : ''}
        >
          Extensions
        </a>
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