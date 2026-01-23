import React, { useState } from 'react';
import { toBase64 } from './cms/utils';

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
const Header = ({
  onVisitDomain,
  onBuildAndDeploy,
  onBuildLocally,
  isBuilding,
  canBuild,
  domain,
  vercelApiKey,
  buildCooldownSeconds
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  let extensions = {};
  try {
    extensions = JSON.parse(localStorage.getItem('extensions') || '{}');
  } catch (e) {
    extensions = {};
  }

  const handleExportData = async () => {
    try {
      // Collect all localStorage data
      const exportData = {
        pages: JSON.parse(localStorage.getItem('pages') || '[]'),
        blogArticles: JSON.parse(localStorage.getItem('blogArticles') || '[]'),
        catRows: JSON.parse(localStorage.getItem('catRows') || '[]'),
        componentRows: JSON.parse(localStorage.getItem('componentRows') || '[]'),
        settings: JSON.parse(localStorage.getItem('settings') || '{"siteTitle":"TABLES","defaultLang":"en","vercelApiKey":"","showBreadcrumbs":false}'),
        acl: JSON.parse(localStorage.getItem('acl') || '{}'),
        extensions: JSON.parse(localStorage.getItem('extensions') || '{}'),
        currentPageId: JSON.parse(localStorage.getItem('currentPageId') || 'null'),
        currentBlogArticleId: JSON.parse(localStorage.getItem('currentBlogArticleId') || 'null')
      };

      // Collect uploads from static/uploads folder
      try {
        const response = await fetch('/api/uploads');
        if (!response.ok) {
          throw new Error('Failed to fetch upload list.');
        }
        const uploadFiles = await response.json();

        const uploads = {};
        for (const file of uploadFiles) {
          try {
            const response = await fetch(`/uploads/${file.name}`);
            if (response.ok) {
              const blob = await response.blob();
              const base64 = await toBase64(blob);
              uploads[file.name] = base64;
            }
          } catch (error) {
            console.warn(`Failed to fetch upload file ${file.name}:`, error);
          }
        }

        exportData.uploads = uploads;
      } catch (error) {
        console.warn('Failed to collect uploads:', error);
      }

      // Create a blob and download it
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tables-cms-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data: ' + error.message);
    }
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target.result);

        // Confirm before overwriting
        if (!window.confirm('⚠️ WARNING: This will overwrite ALL current data. Are you sure you want to continue?')) {
          event.target.value = ''; // Reset file input
          return;
        }

        // Clear all localStorage data first
        const cmsKeys = ['pages', 'blogArticles', 'catRows', 'componentRows', 'settings', 'acl', 'extensions', 'currentPageId', 'currentBlogArticleId'];
        
        // Remove only CMS-related keys
        cmsKeys.forEach(key => {
          localStorage.removeItem(key);
        });

        // Write imported data to localStorage
        if (importData.pages) localStorage.setItem('pages', JSON.stringify(importData.pages));
        if (importData.blogArticles) localStorage.setItem('blogArticles', JSON.stringify(importData.blogArticles));
        if (importData.catRows) localStorage.setItem('catRows', JSON.stringify(importData.catRows));
        if (importData.componentRows) localStorage.setItem('componentRows', JSON.stringify(importData.componentRows));
        if (importData.settings) localStorage.setItem('settings', JSON.stringify(importData.settings));
        if (importData.acl) localStorage.setItem('acl', JSON.stringify(importData.acl));
        if (importData.extensions) localStorage.setItem('extensions', JSON.stringify(importData.extensions));
        if (importData.currentPageId !== undefined) localStorage.setItem('currentPageId', JSON.stringify(importData.currentPageId));
        if (importData.currentBlogArticleId !== undefined) localStorage.setItem('currentBlogArticleId', JSON.stringify(importData.currentBlogArticleId));

        // Handle uploads restoration
        if (importData.uploads && Object.keys(importData.uploads).length > 0) {
          try {
            const response = await fetch('/api/import-uploads', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ uploads: importData.uploads }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to import uploads.');
            }

          } catch (error) {
            alert(`Failed to import uploads: ${error.message}`);
          }
        }

        alert('✅ Data imported successfully! The page will reload to reflect changes.');
        
        // Reload the page to reflect imported data
        window.location.reload();
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to import data: ' + error.message);
      }
      
      // Reset file input
      event.target.value = '';
    };

    reader.onerror = () => {
      alert('Failed to read file');
      event.target.value = '';
    };

    reader.readAsText(file);
  };

  const handleBuildClick = (e, localOnly = false) => {
    e.preventDefault();
    if (onBuildAndDeploy && !isBuilding && canBuild) {
      if (localOnly) {
        onBuildLocally();
      } else {
        onBuildAndDeploy(localOnly);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Placeholder fuzzy search logic
    const placeholderResults = ['Result 1', 'Result 2', 'Result 3'].filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(placeholderResults);
  };

   const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

   // Inline styles
   const styles = {
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 32px 4px 32px',
      background: '#fff',
      borderBottom: '1px solid #eee',
      boxSizing: 'border-box',
      margin: 0,
      position: 'relative'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
    },
    logoImage: {
      height: '40px',
      width: 'auto',
    },
    mobileNavToggle: {
      display: 'none',
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      padding: '8px',
      color: '#333',
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchBar: {
      position: 'relative',
      flex: '1',
      margin: '0 32px',
      maxWidth: '400px',
    },
    searchInput: {
      width: '100%',
      padding: '2px 12px',
      border: '1px solid #ccc',
      fontSize: '16px',
      outline: 'none',
      boxSizing: 'border-box',
    },
    searchResults: {
      position: 'absolute',
      top: '110%',
      left: 0,
      right: 0,
      background: '#fff',
      border: '1px solid #ddd',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      marginTop: '4px',
      zIndex: 10,
      listStyle: 'none',
      padding: '0',
    },
    searchResult: {
      padding: '2px 12px',
      cursor: 'pointer',
      borderBottom: '1px solid #f3f3f3',
    },
    buttons: {
      display: 'flex',
      gap: '12px',
      flexFlow: 'row nowrap',
      alignItems: 'center',
    },
    button: {
      padding: '8px 18px',
      border: 'none',
      background: '#007bff',
      color: '#fff',
      fontWeight: '500',
      fontSize: '15px',
      cursor: 'pointer',
      transition: 'background 0.2s',
      minWidth: '150px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
  };

  return (
    <header style={styles.header}>
       {/* Mobile Navigation Toggle */}
       <button
         style={styles.mobileNavToggle}
         onClick={toggleMobileMenu}
         aria-label="Toggle Mobile Navigation"
       >
         <i className={mobileMenuOpen ? "fa fa-times" : "fa fa-bars"}></i>
       </button>

       {/* Logo Section */}
       <div style={styles.logo}>
        <img src="/assets/tables-logo.svg" alt="Logo" style={styles.logoImage} />
        {/* <b>TABLES</b>&nbsp;CMS Alpha*/}
      </div>

      {/* Search Bar Section */}
      <div style={styles.searchBar}>
        <input
          type="text"
          disabled
          placeholder="Work in progress..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={styles.searchInput}
        />
        {searchQuery && (
          <ul style={styles.searchResults}>
            {searchResults.map((result, index) => (
              <li key={index} style={styles.searchResult}>
                {result}
              </li>
            ))}
          </ul>
        )}
      </div>

       {/* Buttons Section */}
       <div style={{
         ...styles.buttons,
         display: mobileMenuOpen ? 'none' : 'flex'
       }}>
        
        <button
          onClick={handleExportData}
          style={{
            width: '100%',
            background: 'white',
            color: '#2563eb',
            border: '1px solid #2563eb50',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '4px 16px',
            transition: 'all 0.2s'
          }}
        >
          Save
        </button>
        <label style={{
            width: '100%',
            background: 'white',
            color: '#2563eb',
            border: '1px solid #2563eb50',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '4px 16px',
            transition: 'all 0.2s'
        }}>
          Open
          <input
            type="file"
            accept=".json"
            onChange={handleImportData}
            style={{ display: 'none' }}
          />
        </label>

        {/* Build Buttons */}
        {(extensions['pages-extension-enabled'] || extensions['blog-extension-enabled']) && (
          <button
            onClick={(e) => handleBuildClick(e, true)}
            disabled={isBuilding || !canBuild}
            style={{
              width: '100%',
              background: (isBuilding || !canBuild) ? '#e2e8f0' : 'white',
              color: (isBuilding || !canBuild) ? '#94a3b8' : '#475569',
              border: (isBuilding || !canBuild) ? '1px solid #cbd5e1' : '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: '600',
              cursor: (isBuilding || !canBuild) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '4px 16px',
              transition: 'all 0.2s'
            }}
          >
            Local
          </button>
        )}
          {(extensions['pages-extension-enabled'] || extensions['blog-extension-enabled']) && vercelApiKey && (
            <button
              onClick={(e) => handleBuildClick(e, false)}
              disabled={isBuilding || !canBuild}
              style={{
                width: '100%',
                background: (isBuilding || !canBuild) ? '#94a3b8' : '#1d4ed8',
                color: 'white',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: (isBuilding || !canBuild) ? 'not-allowed' : 'pointer',
                display: 'flex',
                flexFlow: 'row nowrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: (isBuilding || !canBuild) ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
                padding: '4px 16px',
                transition: 'all 0.2s',
              }}
            >
              {isBuilding && (
                <div style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: 'white',
                  
                  animation: 'spin 0.8s linear infinite'
                }}></div>
              )}
              {isBuilding ? 'Building...' : (!canBuild ? `${formatTime(buildCooldownSeconds)}` : 'Deploy')}
            </button>
          )}{/* Visit Deployment Button */}
          {(extensions['pages-extension-enabled'] || extensions['blog-extension-enabled']) && domain && (
              <a
                href={domain}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '100%',
                  padding: '0px 16px',
                  background: '#000',
                  color: 'white',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '4px 16px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s',
                  textDecoration: 'none'
                }}
              >
                <span>Visit</span>
                {/* <Icon icon="fa-solid fa-external-link-alt" />*/}
              </a>
          )}
        {/* Mobile Menu Overlay */}
       {mobileMenuOpen && (
         <div
           style={{
             position: 'fixed',
             top: '0',
             left: '0',
             right: '0',
             bottom: '0',
             background: 'rgba(0, 0, 0, 0.5)',
             zIndex: '999',
             display: 'flex',
             flexDirection: 'column',
             padding: '60px 20px 20px'
           }}
           onClick={toggleMobileMenu}
         >
           <div
             style={{
               background: 'white',
               padding: '20px',
               maxWidth: '400px',
               margin: '0 auto',
               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
             }}
             onClick={(e) => e.stopPropagation()}
           >
             <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Menu</h3>
             
             {/* Mobile Build Buttons */}
             {(extensions['pages-extension-enabled'] || extensions['blog-extension-enabled']) && (
               <div style={{ marginBottom: '15px' }}>
                 <button
                   onClick={(e) => {
                     handleBuildClick(e, true);
                     toggleMobileMenu();
                   }}
                   disabled={isBuilding || !canBuild}
                   style={{
                     width: '100%',
                     padding: '12px 20px',
                     background: (isBuilding || !canBuild) ? '#e2e8f0' : '#007bff',
                     color: (isBuilding || !canBuild) ? '#94a3b8' : 'white',
                     border: 'none',
                     fontSize: '16px',
                     fontWeight: '600',
                     cursor: (isBuilding || !canBuild) ? 'not-allowed' : 'pointer',
                     marginBottom: '10px',
                   }}
                 >
                   Local Build
                 </button>
                 {vercelApiKey && (
                   <button
                     onClick={(e) => {
                       handleBuildClick(e, false);
                       toggleMobileMenu();
                     }}
                     disabled={isBuilding || !canBuild}
                     style={{
                       width: '100%',
                       padding: '12px 20px',
                       background: (isBuilding || !canBuild) ? '#94a3b8' : '#28a745',
                       color: 'white',
                       border: 'none',
                       fontSize: '16px',
                       fontWeight: '600',
                       cursor: (isBuilding || !canBuild) ? 'not-allowed' : 'pointer',
                     }}
                   >
                     {isBuilding ? 'Building...' : (!canBuild ? `${formatTime(buildCooldownSeconds)}` : 'Deploy')}
                   </button>
                 )}
               </div>
             )}
             
             {/* Mobile Visit Link */}
             {domain && (
               <a
                 href={domain}
                 target="_blank"
                 rel="noopener noreferrer"
                 style={{
                   display: 'block',
                   width: '100%',
                   padding: '12px 20px',
                   background: '#000',
                   color: 'white',
                   border: 'none',
                   fontSize: '16px',
                   fontWeight: '600',
                   cursor: 'pointer',
                   textDecoration: 'none',
                   textAlign: 'center',
                   marginBottom: '10px'
                 }}
               >
                 Visit Site
               </a>
             )}
             
             <button
               onClick={toggleMobileMenu}
               style={{
                 position: 'absolute',
                 top: '15px',
                 right: '15px',
                 background: 'none',
                 border: 'none',
                 fontSize: '24px',
                 cursor: 'pointer',
                 color: '#666'
               }}
             >
               ×
             </button>
           </div>
         </div>
       )}

       </div>
    </header>
  );
};

export default Header;