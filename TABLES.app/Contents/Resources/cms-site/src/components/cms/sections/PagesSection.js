import React, { useState, useEffect } from 'react';
import { useLoading } from '../../../context/LoadingContext';
import { createNavigation } from '../../../utils/navigation';
import ComponentEditor from '../ComponentEditor';
import { fuzzyMatch } from '../utils';
import LockedInputWrapper from '../LockedInputWrapper';
import '../../../styles/MassActions.css';

const PagesSection = ({ cmsData, edit: editModeProp }) => {
  const { pages, savePages, currentPageId, saveCurrentPageId, addPage, deletePage, updatePage, settings, pageGroups, savePageGroups } = cmsData;
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
  const [selectedPages, setSelectedPages] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default', langCode: null });
  const [massActionsOpen, setMassActionsOpen] = useState(false);
  const [assignGroupModalOpen, setAssignGroupModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importError, setImportError] = useState('');
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [pageToDuplicate, setPageToDuplicate] = useState(null);
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [bulkEditField, setBulkEditField] = useState('includeInMenu');
  const [bulkEditValue, setBulkEditValue] = useState(true);

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

  const handleAssignToGroup = () => {
    if (!selectedGroup) return;

    const updatedPageGroups = pageGroups.map(group => {
      // Remove selected pages from their current groups
      return {
        ...group,
        pageIds: group.pageIds.filter(id => !selectedPages.includes(id)),
      };
    });

    const targetGroup = updatedPageGroups.find(group => group.id === selectedGroup);
    if (targetGroup) {
      // Add selected pages to the new group, avoiding duplicates
      targetGroup.pageIds = [...new Set([...targetGroup.pageIds, ...selectedPages])];
    }

    savePageGroups(updatedPageGroups);
    setAssignGroupModalOpen(false);
    setSelectedPages([]);
  };

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
    if (selectedPages.length > 0) {
      const updatedPages = pages.filter(p => !selectedPages.includes(p.id));
      savePages(updatedPages);
      setSelectedPages([]);
    } else if (pageToDelete) {
      deletePage(pageToDelete);
      setPageToDelete(null);
    }
    setDeleteModalOpen(false);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setPageToDelete(null);
  };

  const handleSaveToHistory = () => {
    if (currentPage) {
      const history = currentPage.history || [];
      const translations = {};
      settings.languages.forEach(lang => {
        translations[lang.code] = getLocalizedContent(currentPage, lang.code);
      });

      history.push({
        timestamp: Date.now(),
        translations: JSON.parse(JSON.stringify(translations))
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
        const updates = {};
        if (historyItem.translations) {
          // New history format with translations
          updates.translations = JSON.parse(JSON.stringify(historyItem.translations));
          // also update the top-level rows for the current language to update the UI
          updates.rows = updates.translations[currentLanguage]?.rows || [];
        } else {
          // Old history format
          updates.rows = JSON.parse(JSON.stringify(historyItem.rows));
        }

        updatePage(currentPage.id, updates);
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

  const handleDownloadHistoryEntry = () => {
    if (currentPage && selectedHistoryIndex !== null) {
      const historyItem = currentPage.history[selectedHistoryIndex];
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(historyItem));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `history-entry-${historyItem.timestamp}.json`);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };

  const handleLabelHistoryEntry = () => {
    if (currentPage && selectedHistoryIndex !== null) {
      const labelInput = document.getElementById('history-label-input');
      if (labelInput && labelInput.value) {
        const history = [...currentPage.history];
        history[selectedHistoryIndex].label = labelInput.value;
        updatePage(currentPage.id, { history });
        labelInput.value = '';
      }
    }
  };

  const handleImportHistory = () => {
    if (!currentPage) {
      alert('Please select a page first.');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedHistoryItem = JSON.parse(event.target.result);
          importedHistoryItem.label = 'Imported';
          const history = currentPage.history || [];
          history.push(importedHistoryItem);
          updatePage(currentPage.id, { history });
        } catch (error) {
          console.error('Error parsing imported history file:', error);
          alert('Error parsing imported history file. Please make sure it is a valid JSON file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Export selected pages as JSON
  const handleExportPages = () => {
    let exportPages;
    if (selectedPages.length > 0) {
      exportPages = pages.filter(p => selectedPages.includes(p.id));
    } else {
      exportPages = pages;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPages, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `pages-export-${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setExportModalOpen(false);
  };

  // Import pages from JSON
  const handleImportPages = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedPages = JSON.parse(e.target.result);
        if (!Array.isArray(importedPages)) throw new Error("Invalid format: not an array");
        // Assign new IDs to imported pages to avoid conflicts
        const existingIds = new Set(pages.map(p => p.id));
        let maxId = Math.max(0, ...pages.map(p => parseInt(p.id, 10)).filter(n => !isNaN(n)));
        const newPages = importedPages.map((p, idx) => {
          let newId = p.id;
          if (existingIds.has(p.id)) {
            newId = (maxId + idx + 1).toString();
          }
          return { ...p, id: newId };
        });
        savePages([...pages, ...newPages]);
        setImportModalOpen(false);
        setImportError('');
      } catch (err) {
        setImportError('Error importing pages: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Duplicate a page
  const handleDuplicatePage = (page) => {
    setPageToDuplicate(page);
    setDuplicateModalOpen(true);
  };

  const confirmDuplicatePage = () => {
    if (!pageToDuplicate) return;
    // Generate a new unique id and slug
    let maxId = Math.max(0, ...pages.map(p => parseInt(p.id, 10)).filter(n => !isNaN(n)));
    let newId = (maxId + 1).toString();
    let newSlug = pageToDuplicate.slug + '-copy';
    let slugExists = pages.some(p => p.slug === newSlug);
    let slugCounter = 2;
    while (slugExists) {
      newSlug = pageToDuplicate.slug + '-copy' + slugCounter;
      slugExists = pages.some(p => p.slug === newSlug);
      slugCounter++;
    }
    const duplicatedPage = {
      ...pageToDuplicate,
      id: newId,
      slug: newSlug,
      title: pageToDuplicate.title + ' (Copy)',
      lastEdited: new Date().toISOString(),
      // Remove history from duplicated page
      history: [],
    };
    savePages([...pages, duplicatedPage]);
    setDuplicateModalOpen(false);
    setPageToDuplicate(null);
  };

  // Bulk edit selected pages
  const handleBulkEdit = () => {
    if (selectedPages.length === 0) return;
    let updatedPages = pages.map(p => {
      if (selectedPages.includes(p.id)) {
        if (bulkEditField === 'includeInMenu') {
          return { ...p, includeInMenu: bulkEditValue };
        }
        if (bulkEditField === 'sitemapPriority') {
          return { ...p, sitemapPriority: bulkEditValue };
        }
        // Add more bulk-editable fields here as needed
      }
      return p;
    });
    savePages(updatedPages);
    setBulkEditModalOpen(false);
    setSelectedPages([]);
  };

  // Quick copy page URL to clipboard
  const handleCopyUrl = (page, lang) => {
    const url = getPageUrl(page, lang);
    navigator.clipboard.writeText(url);
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

  const getLocalizedGroupName = (group, lang) => {
    if (group.id === 'direct-pages') {
      return 'Direct pages';
    }
    if (lang === settings?.defaultLang) {
      return group.name || '';
    }
    return group.translations?.[lang]?.name || group.name || ''; // Fallback to default name
  };

  const handleGroupChange = (newGroupId) => {
    let updatedPageGroups = (pageGroups || []).map(group => ({
      ...group,
      pageIds: group.pageIds.filter(id => id !== currentPage.id)
    }));

    if (newGroupId) {
      const targetGroup = updatedPageGroups.find(g => g.id === newGroupId);
      if (targetGroup) {
        targetGroup.pageIds.push(currentPage.id);
      }
    }
    savePageGroups(updatedPageGroups);
  };

  const handleSort = (key, langCode = null) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.langCode === langCode && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.langCode === langCode && sortConfig.direction === 'desc') {
      direction = 'default';
    }
    setSortConfig({ key, direction, langCode });
  };

  // Filter pages based on fuzzy search query
  const filteredPages = pages.filter(page => {
    const defaultContent = getLocalizedContent(page, settings?.defaultLang || 'en');
    return (
      fuzzyMatch(defaultContent.title, searchQuery) ||
      fuzzyMatch(defaultContent.slug, searchQuery)
    );
  });

  const pageIdToGroupNames = React.useMemo(() => {
    const map = new Map();
    if (!pageGroups) return map;
    for (const group of pageGroups) {
      if (group.pageIds) {
        for (const pageId of group.pageIds) {
          if (!map.has(pageId)) {
            map.set(pageId, []);
          }
          map.get(pageId).push(getLocalizedGroupName(group, settings?.defaultLang || 'en'));
        }
      }
    }
    return map;
  }, [pageGroups, settings?.defaultLang]);

  const sortedPages = React.useMemo(() => {
    let sortablePages = [...filteredPages];
    if (sortConfig.direction !== 'default') {
      sortablePages.sort((a, b) => {
        if (sortConfig.key === 'title') {
          const titleA = getLocalizedContent(a, sortConfig.langCode).title.toLowerCase();
          const titleB = getLocalizedContent(b, sortConfig.langCode).title.toLowerCase();
          if (titleA < titleB) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (titleA > titleB) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
        if (sortConfig.key === 'pageGroup') {
          const groupA = pageIdToGroupNames.get(a.id)?.join(', ') || '';
          const groupB = pageIdToGroupNames.get(b.id)?.join(', ') || '';
          if (groupA < groupB) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (groupA > groupB) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
        if (sortConfig.key === 'lastEdited') {
          const dateA = a.lastEdited ? new Date(a.lastEdited).getTime() : 0;
          const dateB = b.lastEdited ? new Date(b.lastEdited).getTime() : 0;
          if (dateA < dateB) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (dateA > dateB) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
        return 0;
      });
    }
    return sortablePages;
  }, [filteredPages, sortConfig, getLocalizedContent, pageIdToGroupNames]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPages(filteredPages.map(p => p.id));
    } else {
      setSelectedPages([]);
    }
  };

  const handleSelectPage = (e, id) => {
    if (e.target.checked) {
      setSelectedPages([...selectedPages, id]);
    } else {
      setSelectedPages(selectedPages.filter(pId => pId !== id));
    }
  };

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
            zIndex: 2000
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
                            border: selectedHistoryIndex === actualIndex ? '2px solid #1d4ed8' : '2px solid transparent'
                          }}
                        >
                          <strong>{new Date(item.timestamp).toLocaleString('ja-JP')}</strong>
                          {item.label && <span style={{ marginLeft: '10px', padding: '2px 5px', backgroundColor: '#e5e7eb', fontSize: '12px' }}>{item.label}</span>}
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
                        {JSON.stringify(currentPage.history[selectedHistoryIndex].translations ? currentPage.history[selectedHistoryIndex].translations[currentLanguage]?.rows : currentPage.history[selectedHistoryIndex].rows, null, 2)}
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
                  {selectedHistoryIndex !== null && (
                    <button onClick={handleDownloadHistoryEntry} style={{
                      padding: '8px 16px',

                      border: 'none',
                      backgroundColor: '#22c55e',
                      color: 'white',
                      cursor: 'pointer',
                      marginLeft: '10px'
                    }}>Download</button>
                  )}
                  <button onClick={handleImportHistory} style={{
                    padding: '8px 16px',
                    border: 'none',
                    backgroundColor: '#f97316',
                    color: 'white',
                    cursor: 'pointer',
                    marginLeft: '10px'
                  }}>Import</button>
                  {selectedHistoryIndex !== null && (
                    <div style={{ marginLeft: '10px', display: 'flex' }}>
                      <input type="text" id="history-label-input" placeholder="Enter label" style={{ padding: '8px', border: '1px solid #cbd5e1' }} />
                      <button onClick={handleLabelHistoryEntry} style={{
                        padding: '8px 16px',
                        border: 'none',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        cursor: 'pointer',
                        marginLeft: '5px'
                      }}>Label</button>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {selectedHistoryIndex !== null && (
                    <button onClick={handleRollback} style={{
                      padding: '8px 16px',

                      border: 'none',
                      backgroundColor: '#1d4ed8',
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
        {saveSuccessModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2100
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              maxWidth: '350px',
              width: '90%',
              textAlign: 'center'
            }}>
              <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.1rem' }}>History Saved!</h2>
              <p style={{ marginBottom: '25px', color: '#64748b' }}>
                This page version was saved to history.
              </p>
              <button onClick={handleCloseSaveSuccess} style={{
                padding: '8px 16px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}>OK</button>
            </div>
          </div>
        )}
        <header style={{ zIndex: 1001 }}>
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
            <a href="#" onClick={(e) => { e.preventDefault(); handleDuplicatePage(currentPage); }} style={{ marginLeft: '10px' }}>Duplicate</a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleCopyUrl(currentPage, currentLanguage); }} style={{ marginLeft: '10px' }}>Copy URL</a>
          </div>
        </header>

        <div className="component-table-container">

          <div style={{}}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Title ({currentLanguage}):</strong>
              <LockedInputWrapper fieldId={`page-${currentPage.id}-title-${currentLanguage}`} cmsData={cmsData}>
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
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <strong>Slug:</strong>
                <LockedInputWrapper fieldId={`page-${currentPage.id}-slug`} cmsData={cmsData}>
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
                </LockedInputWrapper>
              </label>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
                Full URL: <span style={{ fontFamily: 'monospace' }}>{getPageUrl(currentPage, currentLanguage)}</span>
                <button onClick={() => handleCopyUrl(currentPage, currentLanguage)} style={{ marginLeft: '8px', fontSize: '12px' }}>Copy</button>
              </p>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <strong>Page Group:</strong>
                <LockedInputWrapper fieldId={`page-${currentPage.id}-group`} cmsData={cmsData}>
                  <select
                    value={(pageGroups || []).find(g => g.pageIds.includes(currentPage.id))?.id || ''}
                    onChange={e => handleGroupChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '5px',
                      border: '1px solid #cbd5e1',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">No Group</option>
                    {(pageGroups || []).map(group => (
                      <option key={group.id} value={group.id}>{getLocalizedGroupName(group, currentLanguage)}</option>
                    ))}
                  </select>
                </LockedInputWrapper>
              </label>
            </div>
          </div>

          <div style={{}}>
            <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '10px', cursor: currentPage.slug === 'home' ? 'not-allowed' : 'pointer' }}>
              <LockedInputWrapper fieldId={`page-${currentPage.id}-includeInMenu`} cmsData={cmsData}>
                <input
                  type="checkbox"
                  checked={currentPage.slug === 'home' ? true : (currentPage.includeInMenu || false)}
                  onChange={(e) => updatePage(currentPage.id, { includeInMenu: e.target.checked })}
                  disabled={currentPage.slug === 'home'}
                  style={{ cursor: currentPage.slug === 'home' ? 'not-allowed' : 'pointer', width: '18px', height: '18px', opacity: currentPage.slug === 'home' ? 0.6 : 1 }}
                />
              </LockedInputWrapper>
              <strong style={{ opacity: currentPage.slug === 'home' ? 0.6 : 1 }}>Include in header menu?</strong>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Column 1 */}
            <div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                  <strong>Theme Version Toggle:</strong>
                  <LockedInputWrapper fieldId={`page-${currentPage.id}-themeVersion`} cmsData={cmsData}>
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
                  </LockedInputWrapper>
                </label>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
                  Adds class to body element for theme styling
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                  <strong>Button and Link Color (page-wide):</strong>
                  <LockedInputWrapper fieldId={`page-${currentPage.id}-buttonLinkColor`} cmsData={cmsData}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
                      <input
                        type="color"
                        value={currentPage.buttonLinkColor || '#1d4ed8'}
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
                        placeholder="#1d4ed8"
                        style={{
                          flex: 1,
                          padding: '10px',

                          border: '1px solid #cbd5e1'
                        }}
                      />
                    </div>
                  </LockedInputWrapper>
                </label>
              </div>

              <div>
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
                  <LockedInputWrapper fieldId={`page-${currentPage.id}-metaDescription-${currentLanguage}`} cmsData={cmsData}>
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
                  </LockedInputWrapper>
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                  <strong>Sitemap Page Priority:</strong>
                  <LockedInputWrapper fieldId={`page-${currentPage.id}-sitemapPriority`} cmsData={cmsData}>
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
                  </LockedInputWrapper>
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
            cmsData={cmsData}
          />
        </div>
        {duplicateModalOpen && (
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
            zIndex: 2100
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              maxWidth: '400px',
              width: '90%'
            }}>
              <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.25rem' }}>Duplicate Page</h2>
              <p style={{ marginBottom: '25px', color: '#64748b' }}>
                Are you sure you want to duplicate this page? The new page will have a unique slug and ID.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setDuplicateModalOpen(false)} style={{
                  padding: '8px 16px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}>Cancel</button>
                <button onClick={confirmDuplicatePage} style={{
                  padding: '8px 16px',
                  border: 'none',
                  backgroundColor: '#1d4ed8',
                  color: 'white',
                  cursor: 'pointer'
                }}>Duplicate</button>
              </div>
            </div>
          </div>
        )}
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
          {selectedPages.length > 0 && (
            <div className="mass-actions-container">
              <button onClick={() => setMassActionsOpen(!massActionsOpen)} className="mass-actions-button">
                Mass Actions ({selectedPages.length})
              </button>
              {massActionsOpen && (
                <div className="mass-actions-dropdown">
                  <button onClick={() => { setDeleteModalOpen(true); setMassActionsOpen(false); }} className="mass-actions-dropdown-button">
                    Delete Selected
                  </button>
                  <button onClick={() => { setAssignGroupModalOpen(true); setMassActionsOpen(false); }} className="mass-actions-dropdown-button">
                    Assign to Group
                  </button>
                  <button onClick={() => { setBulkEditModalOpen(true); setMassActionsOpen(false); }} className="mass-actions-dropdown-button">
                    Bulk Edit
                  </button>
                  <button onClick={() => { setExportModalOpen(true); setMassActionsOpen(false); }} className="mass-actions-dropdown-button">
                    Export Selected
                  </button>
                </div>
              )}
            </div>
          )}
          <button onClick={() => setExportModalOpen(true)} style={{ marginRight: '10px' }}>Export All</button>
          <button onClick={() => setImportModalOpen(true)} style={{ marginRight: '10px' }}>Import</button>
          <a href="#" onClick={(e) => { e.preventDefault(); handleAddPage(); }} className="highlighted">+ Add Page</a>
        </div>
      </header>
      <div className="component-table-container">
        <table className="page-list-table">
          <thead>
            <tr>
              <th><input type="checkbox" onChange={handleSelectAll} checked={selectedPages.length === filteredPages.length && filteredPages.length > 0} /></th>
              {(settings?.languages || [{ code: 'en', name: 'English' }]).map(lang => (
                <th key={lang.code} onClick={() => handleSort('title', lang.code)} style={{ cursor: 'pointer' }}>
                  Title ({lang.code})
                  {sortConfig.key === 'title' && sortConfig.langCode === lang.code && (
                    <span style={{ marginLeft: '5px' }}>{sortConfig.direction === 'asc' ? '🔼' : sortConfig.direction === 'desc' ? '🔽' : ''}</span>
                  )}
                </th>
              ))}
              <th>Slug</th>
              <th>In Menu?</th>
              <th onClick={() => handleSort('pageGroup')} style={{ cursor: 'pointer' }}>
                Page Group
                {sortConfig.key === 'pageGroup' && (
                  <span style={{ marginLeft: '5px' }}>{sortConfig.direction === 'asc' ? '🔼' : sortConfig.direction === 'desc' ? '🔽' : ''}</span>
                )}
              </th>
              <th onClick={() => handleSort('lastEdited')} style={{ cursor: 'pointer' }}>
                Last Edited
                {sortConfig.key === 'lastEdited' && (
                  <span style={{ marginLeft: '5px' }}>{sortConfig.direction === 'asc' ? '🔼' : sortConfig.direction === 'desc' ? '🔽' : ''}</span>
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedPages.map(page => (
              <tr key={page.id} className={page.id === currentPageId ? 'active' : ''}>
                <td><input type="checkbox" onChange={(e) => handleSelectPage(e, page.id)} checked={selectedPages.includes(page.id)} /></td>
                {(settings?.languages || [{ code: 'en', name: 'English' }]).map(lang => (
                  <td key={lang.code}>
                    {getLocalizedContent(page, lang.code).title}
                    <button
                      onClick={() => handleCopyUrl(page, lang.code)}
                      style={{ marginLeft: '5px', fontSize: '11px' }}
                      title="Copy page URL"
                    >🔗</button>
                  </td>
                ))}
                <td>{page.slug}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={page.slug === 'home' ? true : (page.includeInMenu || false)}
                    onChange={(e) => updatePage(page.id, { includeInMenu: e.target.checked })}
                    disabled={page.slug === 'home'}
                    style={{ cursor: page.slug === 'home' ? 'not-allowed' : 'pointer', opacity: page.slug === 'home' ? 0.6 : 1 }}
                  />
                </td>
                <td>{pageIdToGroupNames.get(page.id)?.join(', ') || ''}</td>
                <td>{page.lastEdited ? new Date(page.lastEdited).toLocaleString('ja-JP') : 'Never'}</td>
                <td>
                  <button onClick={() => navigate(`/cms/pages/edit?id=${page.id}`)}>Edit</button>
                  <button onClick={() => handleDeleteClick(page.id)}>Delete</button>
                  <button onClick={() => handleDuplicatePage(page)}>Duplicate</button>
                  <button onClick={() => handleExportPages([page])}>Export</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {assignGroupModalOpen && (
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
            <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.25rem' }}>Assign to Group</h2>
            <p style={{ marginBottom: '25px', color: '#64748b' }}>
              Select a group to assign {selectedPages.length} selected page(s) to.
            </p>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
            >
              <option value="">Select a group</option>
              {pageGroups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setAssignGroupModalOpen(false)} style={{
                padding: '8px 16px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={handleAssignToGroup} style={{
                padding: '8px 16px',
                border: 'none',
                backgroundColor: '#1d4ed8',
                color: 'white',
                cursor: 'pointer'
              }}>Assign</button>
            </div>
          </div>
        </div>
      )}

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
              {selectedPages.length > 0 ? `Are you sure you want to delete ${selectedPages.length} selected pages?` : 'Are you sure you want to delete this page?'} This action cannot be undone.
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

      {exportModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '350px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.1rem' }}>Export Pages</h2>
            <p style={{ marginBottom: '25px', color: '#64748b' }}>
              {selectedPages.length > 0
                ? `Export ${selectedPages.length} selected page(s) as JSON?`
                : 'Export all pages as JSON?'}
            </p>
            <button onClick={handleExportPages} style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: '#1d4ed8',
              color: 'white',
              cursor: 'pointer',
              marginRight: '10px'
            }}>Export</button>
            <button onClick={() => setExportModalOpen(false)} style={{
              padding: '8px 16px',
              border: '1px solid #cbd5e1',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}>Cancel</button>
          </div>
        </div>
      )}

      {importModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '350px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.1rem' }}>Import Pages</h2>
            <p style={{ marginBottom: '25px', color: '#64748b' }}>
              Import pages from a JSON file. Existing pages will not be overwritten.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImportPages}
              style={{ marginBottom: '10px' }}
            />
            {importError && <div style={{ color: 'red', marginBottom: '10px' }}>{importError}</div>}
            <button onClick={() => setImportModalOpen(false)} style={{
              padding: '8px 16px',
              border: '1px solid #cbd5e1',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}>Close</button>
          </div>
        </div>
      )}

      {duplicateModalOpen && (
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
          zIndex: 2100
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.25rem' }}>Duplicate Page</h2>
            <p style={{ marginBottom: '25px', color: '#64748b' }}>
              Are you sure you want to duplicate this page? The new page will have a unique slug and ID.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDuplicateModalOpen(false)} style={{
                padding: '8px 16px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={confirmDuplicatePage} style={{
                padding: '8px 16px',
                border: 'none',
                backgroundColor: '#1d4ed8',
                color: 'white',
                cursor: 'pointer'
              }}>Duplicate</button>
            </div>
          </div>
        </div>
      )}

      {bulkEditModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '350px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.1rem' }}>Bulk Edit Pages</h2>
            <p style={{ marginBottom: '25px', color: '#64748b' }}>
              Set a field for {selectedPages.length} selected page(s).
            </p>
            <div style={{ marginBottom: '15px' }}>
              <label>
                Field:&nbsp;
                <select value={bulkEditField} onChange={e => setBulkEditField(e.target.value)}>
                  <option value="includeInMenu">Include in Menu</option>
                  <option value="sitemapPriority">Sitemap Priority</option>
                  {/* Add more bulk-editable fields here */}
                </select>
              </label>
            </div>
            {bulkEditField === 'includeInMenu' && (
              <div style={{ marginBottom: '15px' }}>
                <label>
                  Value:&nbsp;
                  <select value={bulkEditValue ? 'true' : 'false'} onChange={e => setBulkEditValue(e.target.value === 'true')}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </label>
              </div>
            )}
            {bulkEditField === 'sitemapPriority' && (
              <div style={{ marginBottom: '15px' }}>
                <label>
                  Value:&nbsp;
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={bulkEditValue}
                    onChange={e => setBulkEditValue(parseFloat(e.target.value))}
                  />
                </label>
              </div>
            )}
            <button onClick={handleBulkEdit} style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: '#1d4ed8',
              color: 'white',
              cursor: 'pointer',
              marginRight: '10px'
            }}>Apply</button>
            <button onClick={() => setBulkEditModalOpen(false)} style={{
              padding: '8px 16px',
              border: '1px solid #cbd5e1',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}>Cancel</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default PagesSection;
