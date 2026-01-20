import React, { useState, useEffect } from 'react';
import { useLoading } from '../../../context/LoadingContext';
import { createNavigation } from '../../../utils/navigation';
import ComponentEditor from '../ComponentEditor';
import { fuzzyMatch } from '../utils';

const PagesSection = ({ cmsData, edit: editModeProp }) => {
  const { pages, currentPageId, saveCurrentPageId, addPage, deletePage, updatePage, settings } = cmsData;
  const { showLoading, hideLoading } = useLoading();
  const navigate = createNavigation(showLoading, hideLoading);
  const [editMode, setEditMode] = useState(editModeProp || false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(null);
  const [saveSuccessModalOpen, setSaveSuccessModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState(settings?.defaultLang || 'en');

  useEffect(() => {
    hideLoading();
  }, []);

  useEffect(() => {
    // Ensure that a page with slug 'home' always exists, but only after data is loaded
    if (cmsData.isDataLoaded && pages && !pages.some(p => p.slug === 'home')) {
      addPage(settings, {
        slug: 'home',
        includeInMenu: true,
      });
    }
  }, [pages, addPage, cmsData.isDataLoaded, settings]);

  const handleAddPage = () => {
    const newId = addPage(settings);
    saveCurrentPageId(newId);
    setCurrentLanguage(settings?.defaultLang || 'en');
    setEditMode(true);
  };

  const handleEditPage = (id) => {
    saveCurrentPageId(id);
    setCurrentLanguage(settings?.defaultLang || 'en');
    setEditMode(true);
  };

  const handleBackToList = () => {
    setEditMode(false);
    saveCurrentPageId(null);
    navigate('/cms/pages');
  };

  const handleDeleteClick = (id) => {
    setPageToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (pageToDelete) {
      deletePage(pageToDelete);
      setDeleteModalOpen(false);
      setPageToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setPageToDelete(null);
  };

  const handleSaveToHistory = () => {
    if (currentPage) {
      const history = currentPage.history || [];
      history.push({
        timestamp: Date.now(),
        rows: JSON.parse(JSON.stringify(currentPage.rows))
      });
      updatePage(currentPage.id, {
        history,
      });
      setSaveSuccessModalOpen(true);
    }
  };

  const handleCloseSaveSuccess = () => {
    setSaveSuccessModalOpen(false);
  };

  const handleShowHistory = () => {
    setHistoryModalOpen(true);
    setSelectedHistoryIndex(null);
  };

  const handleCloseHistory = () => {
    setHistoryModalOpen(false);
    setSelectedHistoryIndex(null);
  };

  const handleRollback = () => {
    if (currentPage && selectedHistoryIndex !== null) {
      const historyItem = currentPage.history[selectedHistoryIndex];
      if (historyItem) {
        updatePage(currentPage.id, { 
          rows: JSON.parse(JSON.stringify(historyItem.rows))
        });
        setHistoryModalOpen(false);
        setSelectedHistoryIndex(null);
      }
    }
  };

  const handleDeleteHistoryEntry = () => {
    if (currentPage && selectedHistoryIndex !== null) {
      const history = [...currentPage.history];
      history.splice(selectedHistoryIndex, 1);
      updatePage(currentPage.id, { history });
      setSelectedHistoryIndex(null);
    }
  };

  const currentPage = pages.find(p => p.id === currentPageId);

  // Get current language content
  const getLocalizedContent = (page, lang) => {
    if (!page.translations || !page.translations[lang]) {
      return {
        title: page.title || '',
        slug: page.slug || '',
        rows: page.rows || []
      };
    }
    // Always use top-level slug, never translation slug
    return {
      ...page.translations[lang],
      slug: page.slug || ''
    };
  };

  const saveLocalizedContent = (lang, updates) => {
    if (!currentPage) return;
    
    const translations = currentPage.translations || {};
    const currentLangData = translations[lang] || {
      title: currentPage.title || '',
      slug: currentPage.slug || '',
      rows: currentPage.rows || []
    };
    
    translations[lang] = { ...currentLangData, ...updates };
    
    // If it's the default language, also update the main fields
    if (lang === settings?.defaultLang) {
      updatePage(currentPage.id, { ...updates, translations });
    } else {
      updatePage(currentPage.id, { translations });
    }
  };

  const currentLangContent = currentPage ? getLocalizedContent(currentPage, currentLanguage) : null;

  // Generate full URL for the page
  const getPageUrl = (page, lang) => {
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    const langContent = getLocalizedContent(page, lang);
    return `${protocol}//${host}${port}/${lang}/${langContent.slug}`;
  };

  // Filter pages based on fuzzy search query
  const filteredPages = pages.filter(page => {
    const defaultContent = getLocalizedContent(page, settings?.defaultLang || 'en');
    return (
      fuzzyMatch(defaultContent.title, searchQuery) ||
      fuzzyMatch(defaultContent.slug, searchQuery)
    );
  });

  if (editMode && currentPage) {
    return (
      <section className="main-section active" id="pages-editor">
        {historyModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.25rem' }}>Page History</h2>
              {!currentPage?.history || currentPage.history.length === 0 ? (
                <p style={{ color: '#64748b' }}>No history yet. Click "Save to History" to create a snapshot.</p>
              ) : (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    {currentPage.history.slice().reverse().map((item, idx) => {
                      const actualIndex = currentPage.history.length - 1 - idx;
                      return (
                        <div
                          key={actualIndex}
                          onClick={() => setSelectedHistoryIndex(actualIndex)}
                          style={{
                            padding: '10px',
                            marginBottom: '8px',
                            
                            cursor: 'pointer',
                            backgroundColor: selectedHistoryIndex === actualIndex ? '#e0e7ff' : '#f1f5f9',
                            border: selectedHistoryIndex === actualIndex ? '2px solid #3b82f6' : '2px solid transparent'
                          }}
                        >
                          <strong>{new Date(item.timestamp).toLocaleString('ja-JP')}</strong>
                        </div>
                      );
                    })}
                  </div>
                  {selectedHistoryIndex !== null && (
                    <div style={{
                      padding: '15px',
                      backgroundColor: '#f9fafb',
                      
                      marginBottom: '15px',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}>
                      <pre style={{ margin: 0, fontSize: '12px' }}>
                        {JSON.stringify(currentPage.history[selectedHistoryIndex].rows, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              )}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                <div>
                  {selectedHistoryIndex !== null && (
                    <button onClick={handleDeleteHistoryEntry} style={{
                      padding: '8px 16px',
                      
                      border: 'none',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      cursor: 'pointer'
                    }}>Delete this entry</button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {selectedHistoryIndex !== null && (
                    <button onClick={handleRollback} style={{
                      padding: '8px 16px',
                      
                      border: 'none',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      cursor: 'pointer'
                    }}>Rollback to this version</button>
                  )}
                  <button onClick={handleCloseHistory} style={{
                    padding: '8px 16px',
                    
                    border: '1px solid #cbd5e1',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
        <header>
          <h1>
            <span>Edit Page</span>
          </h1>
          <div className="adjustment-buttons">
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              style={{
                padding: '8px 12px',
                
                border: '1px solid #cbd5e1',
                marginRight: '10px',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              {(settings?.languages || [{ code: 'en', name: 'English' }]).map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.code})
                </option>
              ))}
            </select>
            <a href="#" onClick={(e) => { e.preventDefault(); handleBackToList(); }}>← Back to Pages</a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleShowHistory(); }}>History</a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleSaveToHistory(); }} className="highlighted">Save to History</a>
          </div>
        </header>

        <div className="component-table-container">

          <div style={{  }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Title ({currentLanguage}):</strong>
              <input
                type="text"
                value={currentLangContent?.title || ''}
                onChange={(e) => saveLocalizedContent(currentLanguage, { title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Slug:</strong>
              <input
                type="text"
                value={currentPage.slug || ''}
                disabled={currentPage.slug === 'home'}
                onChange={e => {
                  const newSlug = e.target.value;
                  updatePage(currentPage.id, { slug: newSlug });
                  if (newSlug === 'home') {
                    updatePage(currentPage.id, { includeInMenu: true });
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
                  border: '1px solid #cbd5e1',
                  background: currentPage.slug === 'home' ? '#f3f4f6' : 'white',
                  cursor: currentPage.slug === 'home' ? 'not-allowed' : 'auto'
                }}
              />
            </label>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
              {/* Full URL: {getPageUrl(currentPage, currentLanguage)}*/}
            </p>
          </div>

          <div style={{ }}>
            <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '10px', cursor: currentPage.slug === 'home' ? 'not-allowed' : 'pointer' }}>
              <input
                type="checkbox"
                checked={currentPage.slug === 'home' ? true : (currentPage.includeInMenu || false)}
                onChange={(e) => updatePage(currentPage.id, { includeInMenu: e.target.checked })}
                disabled={currentPage.slug === 'home'}
                style={{ cursor: currentPage.slug === 'home' ? 'not-allowed' : 'pointer', width: '18px', height: '18px', opacity: currentPage.slug === 'home' ? 0.6 : 1 }}
              />
              <strong style={{ opacity: currentPage.slug === 'home' ? 0.6 : 1 }}>Include in header menu?</strong>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Column 1 */}
            <div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                  <strong>Theme Version Toggle:</strong>
                  <select
                    value={currentPage.themeVersion || 'auto'}
                    onChange={(e) => updatePage(currentPage.id, { themeVersion: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '5px',
                      
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    <option value="auto">Auto (theme-auto-ver)</option>
                    <option value="light">Light (theme-light-ver)</option>
                    <option value="dark">Dark (theme-dark-ver)</option>
                  </select>
                </label>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
                  Adds class to body element for theme styling
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                  <strong>Button and Link Color (page-wide):</strong>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
                    <input
                      type="color"
                      value={currentPage.buttonLinkColor || '#3b82f6'}
                      onChange={(e) => updatePage(currentPage.id, { buttonLinkColor: e.target.value })}
                      style={{
                        width: '60px',
                        height: '40px',
                        
                        border: '1px solid #cbd5e1',
                        cursor: 'pointer'
                      }}
                    />
                    <input
                      type="text"
                      value={currentPage.buttonLinkColor || ''}
                      onChange={(e) => updatePage(currentPage.id, { buttonLinkColor: e.target.value })}
                      placeholder="#3b82f6"
                      style={{
                        flex: 1,
                        padding: '10px',
                        
                        border: '1px solid #cbd5e1'
                      }}
                    />
                  </div>
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                  <strong>Enforced Theme (override global):</strong>
                  <select
                    value={currentPage.enforcedTheme || ''}
                    onChange={(e) => updatePage(currentPage.id, { enforcedTheme: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '5px',
                      
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    <option value="">Use global theme setting</option>
                    <option value="light">Light theme</option>
                    <option value="dark">Dark theme</option>
                    <option value="auto">Auto theme</option>
                  </select>
                </label>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
                  Override the site-wide theme for this page only
                </p>
              </div>
            </div>

            {/* Column 2 */}
            <div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                  <strong>Site Meta Description ({currentLanguage}):</strong>
                  <textarea
                    value={currentLangContent?.metaDescription || currentPage.metaDescription || ''}
                    onChange={(e) => {
                      const updates = { metaDescription: e.target.value };
                      if (currentLanguage === settings.defaultLang) {
                        updatePage(currentPage.id, updates);
                      } else {
                        saveLocalizedContent(currentLanguage, updates);
                      }
                    }}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '5px',
                      
                      border: '1px solid #cbd5e1',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    placeholder="Enter page description for SEO..."
                  />
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                  <strong>Sitemap Page Priority:</strong>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={currentPage.sitemapPriority !== undefined ? currentPage.sitemapPriority : 0.5}
                    onChange={(e) => updatePage(currentPage.id, { sitemapPriority: parseFloat(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '5px',
                      
                      border: '1px solid #cbd5e1'
                    }}
                  />
                </label>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
                  Value between 0.0 and 1.0 (default: 0.5)
                </p>
              </div>
            </div>
          </div>
          <ComponentEditor
            rows={currentLangContent?.rows || []}
            onChange={(newRows) => saveLocalizedContent(currentLanguage, { rows: newRows })}
            currentLanguage={currentLanguage}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="main-section active" id="pages">
      <header>
        <h1>Pages</h1>
        <div className="adjustment-buttons">
          <input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              
              border: '1px solid #cbd5e1',
              marginRight: '10px',
              width: '200px'
            }}
          />
          <a href="#" onClick={(e) => { e.preventDefault(); handleAddPage(); }} className="highlighted">+ Add Page</a>
        </div>
      </header>
      <div className="component-table-container">
        <table className="page-list-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>In Menu?</th>
              <th>Last Edited</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPages.map(page => (
              <tr key={page.id} className={page.id === currentPageId ? 'active' : ''}>
                <td>{getLocalizedContent(page, settings?.defaultLang || 'en').title}</td>
                <td>{getLocalizedContent(page, settings?.defaultLang || 'en').slug}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={page.slug === 'home' ? true : (page.includeInMenu || false)}
                    onChange={(e) => updatePage(page.id, { includeInMenu: e.target.checked })}
                    disabled={page.slug === 'home'}
                    style={{ cursor: page.slug === 'home' ? 'not-allowed' : 'pointer', opacity: page.slug === 'home' ? 0.6 : 1 }}
                  />
                </td>
                <td>{page.lastEdited ? new Date(page.lastEdited).toLocaleString('ja-JP') : 'Never'}</td>
                <td>
                  <button onClick={() => navigate(`/cms/pages/edit?id=${page.id}`)}>Edit</button>
                  <button onClick={() => handleDeleteClick(page.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.25rem' }}>Confirm Delete</h2>
            <p style={{ marginBottom: '25px', color: '#64748b' }}>
              Are you sure you want to delete this page? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={handleCancelDelete} style={{
                padding: '8px 16px',
                
                border: '1px solid #cbd5e1',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={handleConfirmDelete} style={{
                padding: '8px 16px',
                
                border: 'none',
                backgroundColor: '#ef4444',
                color: 'white',
                cursor: 'pointer'
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PagesSection;