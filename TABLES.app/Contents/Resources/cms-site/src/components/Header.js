import React, { useState, useEffect } from 'react';
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
  const [allSearchableItems, setAllSearchableItems] = useState([]);

  let extensions = {};
  try {
    extensions = JSON.parse(localStorage.getItem('extensions') || '{}');
  } catch (e) {
    extensions = {};
  }

  // Build searchable items from localStorage
  useEffect(() => {
    const items = [];
    
    // Add side menu links
    const menuItems = [
      { type: 'menu', icon: 'fa-file', label: 'Pages', path: '/cms/pages/', section: 'pages' },
      { type: 'menu', icon: 'fa-blog', label: 'Blog', path: '/cms/blog/', section: 'blog' },
      { type: 'menu', icon: 'fa-paw', label: 'Pedigree', path: '/cms/pedigree/', section: 'cats' },
      { type: 'menu', icon: 'fa-box', label: 'Inventory', path: '/cms/inventory/', section: 'rental-inventory' },
      { type: 'menu', icon: 'fa-calendar-check', label: 'Attendance', path: '/cms/attendance/', section: 'rental-attendance' },
      { type: 'menu', icon: 'fa-users', label: 'Customers', path: '/cms/customers/', section: 'rental-customers' },
      { type: 'menu', icon: 'fa-user-tie', label: 'Employees', path: '/cms/employees/', section: 'rental-employees' },
      { type: 'menu', icon: 'fa-clipboard-list', label: 'Reservations', path: '/cms/reservations/', section: 'rental-reservations' },
      { type: 'menu', icon: 'fa-calendar', label: 'Calendar', path: '/cms/calendar/', section: 'rental-calendar' },
      { type: 'menu', icon: 'fa-puzzle-piece', label: 'Extensions', path: '/cms/extensions/', section: 'extensions' },
      { type: 'menu', icon: 'fa-cog', label: 'Settings', path: '/cms/settings/', section: 'settings' },
      { type: 'menu', icon: 'fa-upload', label: 'Uploads', path: '/cms/uploads/', section: 'uploads' },
    ];
    items.push(...menuItems);

    // Add pages
    try {
      const pages = JSON.parse(localStorage.getItem('pages') || '[]');
      pages.forEach(page => {
        items.push({
          type: 'page',
          icon: 'fa-file-alt',
          label: page.title || 'Untitled Page',
          path: `/cms/pages/?id=${page.id}`,
          section: 'pages',
          meta: page.route || ''
        });
      });
    } catch (e) {}

    // Add blog articles
    try {
      const articles = JSON.parse(localStorage.getItem('blogArticles') || '[]');
      articles.forEach(article => {
        items.push({
          type: 'blog',
          icon: 'fa-newspaper',
          label: article.title || 'Untitled Article',
          path: `/cms/blog/?id=${article.id}`,
          section: 'blog',
          meta: article.date || ''
        });
      });
    } catch (e) {}

    setAllSearchableItems(items);
  }, []);

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
        if (!window.confirm('⚠️ WARNING: This will overwrite ALL current data and DELETE all uploads. Are you sure you want to continue?')) {
          event.target.value = ''; // Reset file input
          return;
        }

        // First, purge all existing uploads
        try {
          const purgeResponse = await fetch('/api/purge-uploads', {
            method: 'POST',
          });
          
          if (!purgeResponse.ok) {
            console.warn('Failed to purge existing uploads');
          }
        } catch (error) {
          console.warn('Error purging uploads:', error);
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
    const query = e.target.value.trim();
    setSearchQuery(query);

    if (!query) {
      setSearchResults([]);
      return;
    }

    // Fuzzy search implementation
    const fuzzyMatch = (str, pattern) => {
      const patternLower = pattern.toLowerCase();
      const strLower = str.toLowerCase();
      
      // Simple contains check
      if (strLower.includes(patternLower)) {
        return { score: 100, matches: true };
      }
      
      // Fuzzy matching - check if all characters in pattern exist in order
      let patternIdx = 0;
      let lastMatchIdx = -1;
      
      for (let i = 0; i < strLower.length && patternIdx < patternLower.length; i++) {
        if (strLower[i] === patternLower[patternIdx]) {
          lastMatchIdx = i;
          patternIdx++;
        }
      }
      
      if (patternIdx === patternLower.length) {
        // All characters matched - calculate score based on distance
        const score = Math.max(0, 50 - (lastMatchIdx - patternIdx));
        return { score, matches: true };
      }
      
      return { score: 0, matches: false };
    };

    // Search through all items
    const results = allSearchableItems
      .map(item => {
        const labelMatch = fuzzyMatch(item.label, query);
        const metaMatch = item.meta ? fuzzyMatch(item.meta, query) : { score: 0, matches: false };
        const maxScore = Math.max(labelMatch.score, metaMatch.score);
        
        return {
          ...item,
          score: maxScore,
          matches: labelMatch.matches || metaMatch.matches
        };
      })
      .filter(item => item.matches)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setSearchResults(results);
  };

  const handleSearchResultClick = (result) => {
    window.location.href = result.path;
    setSearchQuery('');
    setSearchResults([]);
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
      position: 'relative',
      zIndex: 2000
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
      flex: '1 1 auto',
      margin: '0 16px',
      maxWidth: '500px',
      zIndex: 2000,
      display: 'none' // search doesn't have proper filtering by enabled extensions, zindex on results and parsing of items from enabled extensions
    },
    searchInput: {
      width: '100%',
      padding: '8px 36px 8px 12px',
      border: '1px solid #d2d2d7',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box',
      borderRadius: '6px',
      transition: 'all 0.2s'
    },
    searchInputIcon: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#86868b',
      pointerEvents: 'none'
    },
    searchResults: {
      position: 'absolute',
      top: '100%',
      left: '0',
      right: '0',
      background: '#fff',
      border: '1px solid #d2d2d7',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      marginTop: '8px',
      zIndex: '1000',
      listStyle: 'none',
      padding: '8px',
      borderRadius: '8px',
      maxHeight: '400px',
      overflowY: 'auto',
      zIndex: 2001
    },
    searchResult: {
      padding: '10px 12px',
      cursor: 'pointer',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: 'all 0.2s',
      marginBottom: '2px',
      zIndex: 2001
    },
    searchResultIcon: {
      width: '20px',
      textAlign: 'center',
      color: '#06c',
      fontSize: '14px',
      zIndex: 2001
    },
    searchResultContent: {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      zIndex: 2001
    },
    searchResultLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#1d1d1f',
      zIndex: 2001
    },
    searchResultMeta: {
      fontSize: '12px',
      color: '#86868b',
      zIndex: 2001
    },
    searchResultType: {
      fontSize: '11px',
      color: '#86868b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontWeight: '600',
      zIndex: 2001
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
          placeholder="Search pages, posts, menu..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={styles.searchInput}
        />
        <i className="fa fa-search" style={styles.searchInputIcon}></i>
        {searchQuery && searchResults.length > 0 && (
          <ul style={styles.searchResults}>
            {searchResults.map((result, index) => (
              <li 
                key={index} 
                style={{
                  ...styles.searchResult,
                  background: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f7'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => handleSearchResultClick(result)}
              >
                <div style={styles.searchResultIcon}>
                  <i className={`fa ${result.icon}`}></i>
                </div>
                <div style={styles.searchResultContent}>
                  <div style={styles.searchResultLabel}>{result.label}</div>
                  {result.meta && <div style={styles.searchResultMeta}>{result.meta}</div>}
                </div>
                <div style={styles.searchResultType}>{result.type}</div>
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
          <i className="fa fa-download"></i>
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
          <i className="fa fa-upload"></i>
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
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '4px 16px',
              transition: 'all 0.2s'
            }}
          >
            <i className="fa fa-hammer"></i>
            (Dev) Local-Only
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
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }}></div>
              )}
              {!isBuilding && <i className="fa fa-rocket"></i>}
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