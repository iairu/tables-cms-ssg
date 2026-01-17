import React, { useState, useEffect } from 'react';
import SideMenu from '../components/SideMenu';
import useCMSData from '../hooks/useCMSData';
import ComponentEditor from '../components/cms/ComponentEditor';
import { fuzzyMatch } from '../components/cms/utils';
import '../styles/cms.css';

const CMSPage = () => {
  const [currentSection, setCurrentSection] = useState('pages');
  const [disableFurtherNavigation, setDisableFurtherNavigation] = useState(false);
  const [hasRunInitialNavigation, setHasRunInitialNavigation] = useState(false);
  const cmsData = useCMSData();

  // Navigation logic on mount - only runs once when data is loaded
  useEffect(() => {
    if (typeof window === 'undefined' || hasRunInitialNavigation || !cmsData.isDataLoaded) {
      return;
    }
    
    // Mark that we've run the initial navigation check
    setHasRunInitialNavigation(true);
    
    // Check settings first - if siteTitle or vercelApiKey is empty, navigate to settings
    if (!cmsData.settings.siteTitle || cmsData.settings.siteTitle === '' ||
        !cmsData.settings.vercelApiKey || cmsData.settings.vercelApiKey === '') {
      setCurrentSection('settings');
      setDisableFurtherNavigation(true);
      return;
    }

    // Check if any extension is enabled
    const extensions = cmsData.extensions;
    const hasEnabledExtension =
      extensions['pages-extension-enabled'] ||
      extensions['blog-extension-enabled'] ||
      extensions['pedigree-extension-enabled'];

    if (!hasEnabledExtension) {
      // No extensions enabled, navigate to extensions page
      setCurrentSection('extensions');
      setDisableFurtherNavigation(true);
      return;
    }

    // Navigate to first enabled extension
    if (extensions['pages-extension-enabled']) {
      setCurrentSection('pages');
    } else if (extensions['blog-extension-enabled']) {
      setCurrentSection('blog');
    } else if (extensions['pedigree-extension-enabled']) {
      setCurrentSection('cats');
    }
  }, [cmsData.isDataLoaded, hasRunInitialNavigation, cmsData.settings.siteTitle, cmsData.settings.vercelApiKey, cmsData.extensions]);

  if (typeof window === 'undefined') {
    return null;
  }

  const handleSectionChange = (sectionId) => {
    setCurrentSection(sectionId);
  };

  const handleManualBuild = (localOnly = false) => {
    if (cmsData.manualTriggerBuild) {
      cmsData.manualTriggerBuild(localOnly);
    }
  };

  return (
    <div className="cms-container">
      <SideMenu
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        isBuilding={cmsData.isBuilding}
        lastSaved={cmsData.lastSaved}
        onBuildClick={handleManualBuild}
        canBuild={cmsData.canBuild}
        buildCooldownSeconds={cmsData.buildCooldownSeconds}
        domain={cmsData.settings.domain}
        vercelApiKey={cmsData.settings.vercelApiKey}
      />
      <main>

        {currentSection === 'pages' && <PagesSection cmsData={cmsData} />}
        {currentSection === 'blog' && <BlogSection cmsData={cmsData} />}
        {currentSection === 'cats' && <CatsSection cmsData={cmsData} />}
        {currentSection === 'components' && <ComponentsSection cmsData={cmsData} />}
        {currentSection === 'settings' && <SettingsSection cmsData={cmsData} />}
        {currentSection === 'acl' && <ACLSection cmsData={cmsData} />}
        {currentSection === 'extensions' && <ExtensionsSection cmsData={cmsData} />}
        {currentSection === 'display-if' && <DisplayIfSection />}
      </main>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};



// Pages Section Component
const PagesSection = ({ cmsData }) => {
  const { pages, currentPageId, saveCurrentPageId, addPage, deletePage, updatePage, settings } = cmsData;
  const [editMode, setEditMode] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(null);
  const [saveSuccessModalOpen, setSaveSuccessModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState(settings?.defaultLang || 'en');

  const handleAddPage = () => {
    const newId = addPage();
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
        lastPublished: Date.now()
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
    return page.translations[lang];
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
              borderRadius: '8px',
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
                            borderRadius: '4px',
                            cursor: 'pointer',
                            backgroundColor: selectedHistoryIndex === actualIndex ? '#e0e7ff' : '#f1f5f9',
                            border: selectedHistoryIndex === actualIndex ? '2px solid #3b82f6' : '2px solid transparent'
                          }}
                        >
                          <strong>{new Date(item.timestamp).toLocaleString()}</strong>
                        </div>
                      );
                    })}
                  </div>
                  {selectedHistoryIndex !== null && (
                    <div style={{
                      padding: '15px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '4px',
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
                      borderRadius: '4px',
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
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      cursor: 'pointer'
                    }}>Rollback to this version</button>
                  )}
                  <button onClick={handleCloseHistory} style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
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
                borderRadius: '4px',
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

          <div style={{ marginBottom: '20px' }}>
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
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Slug ({currentLanguage}):</strong>
              <input
                type="text"
                value={currentLangContent?.slug || ''}
                onChange={(e) => {
                  const newSlug = e.target.value;
                  const updates = { slug: newSlug };
                  // Auto-enable includeInMenu if slug is set to 'home'
                  if (newSlug === 'home') {
                    updates.includeInMenu = true;
                  }
                  saveLocalizedContent(currentLanguage, updates);
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
              Full URL: {getPageUrl(currentPage, currentLanguage)}
            </p>
          </div>
          <div style={{ marginBottom: '20px' }}>
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
          <ComponentEditor
            rows={currentLangContent?.rows || []}
            onChange={(newRows) => saveLocalizedContent(currentLanguage, { rows: newRows })}
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
              borderRadius: '4px',
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
              <th>Last Published</th>
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
                <td>{page.lastPublished ? new Date(page.lastPublished).toLocaleString() : 'Never'}</td>
                <td>
                  <button onClick={() => handleEditPage(page.id)}>Edit</button>
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
            borderRadius: '8px',
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
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={handleConfirmDelete} style={{
                padding: '8px 16px',
                borderRadius: '4px',
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

// Blog Section Component
const BlogSection = ({ cmsData }) => {
  const { blogArticles, currentBlogArticleId, saveCurrentBlogArticleId, addBlogArticle, deleteBlogArticle, updateBlogArticle, isBuilding, settings } = cmsData;
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(null);
  const [saveSuccessModalOpen, setSaveSuccessModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState(settings?.defaultLang || 'en');

  const handleAddArticle = () => {
    const newId = addBlogArticle();
    saveCurrentBlogArticleId(newId);
    setCurrentLanguage(settings?.defaultLang || 'en');
    setEditMode(true);
  };

  const handleEditArticle = (id) => {
    saveCurrentBlogArticleId(id);
    setCurrentLanguage(settings?.defaultLang || 'en');
    setEditMode(true);
  };

  const handleBackToList = () => {
    setEditMode(false);
    saveCurrentBlogArticleId(null);
  };

  const handleUpdateArticle = (id, updates) => {
    setIsSaving(true);
    updateBlogArticle(id, updates);
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleDeleteClick = (id) => {
    setArticleToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (articleToDelete) {
      deleteBlogArticle(articleToDelete);
      setDeleteModalOpen(false);
      setArticleToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setArticleToDelete(null);
  };

  const handleSaveToHistory = () => {
    if (currentArticle) {
      const history = currentArticle.history || [];
      history.push({
        timestamp: Date.now(),
        content: currentArticle.content,
        title: currentArticle.title,
        author: currentArticle.author,
        slug: currentArticle.slug
      });
      updateBlogArticle(currentArticle.id, { history });
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
    if (currentArticle && selectedHistoryIndex !== null) {
      const historyItem = currentArticle.history[selectedHistoryIndex];
      if (historyItem) {
        updateBlogArticle(currentArticle.id, {
          content: historyItem.content,
          title: historyItem.title,
          author: historyItem.author,
          slug: historyItem.slug
        });
        setHistoryModalOpen(false);
        setSelectedHistoryIndex(null);
      }
    }
  };

  const handleDeleteHistoryEntry = () => {
    if (currentArticle && selectedHistoryIndex !== null) {
      const history = [...currentArticle.history];
      history.splice(selectedHistoryIndex, 1);
      updateBlogArticle(currentArticle.id, { history });
      setSelectedHistoryIndex(null);
    }
  };

  const currentArticle = blogArticles.find(a => a.id === currentBlogArticleId);

  // Get current language content
  const getLocalizedContent = (article, lang) => {
    if (!article.translations || !article.translations[lang]) {
      return {
        title: article.title || '',
        slug: article.slug || '',
        author: article.author || '',
        content: article.content || '',
        category: article.category || '',
        tags: article.tags || ''
      };
    }
    return article.translations[lang];
  };

  const saveLocalizedContent = (lang, updates) => {
    if (!currentArticle) return;
    
    setIsSaving(true);
    
    const translations = currentArticle.translations || {};
    const currentLangData = translations[lang] || {
      title: currentArticle.title || '',
      slug: currentArticle.slug || '',
      author: currentArticle.author || '',
      content: currentArticle.content || '',
      category: currentArticle.category || '',
      tags: currentArticle.tags || ''
    };
    
    translations[lang] = { ...currentLangData, ...updates };
    
    // If it's the default language, also update the main fields
    if (lang === settings?.defaultLang) {
      updateBlogArticle(currentArticle.id, { ...updates, translations });
    } else {
      updateBlogArticle(currentArticle.id, { translations });
    }
    
    setTimeout(() => setIsSaving(false), 800);
  };

  const currentLangContent = currentArticle ? getLocalizedContent(currentArticle, currentLanguage) : null;

  // Generate full URL for the article (/{lang}/{year}/{month}/{slug})
  const getArticleUrl = (article, lang) => {
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    const langContent = getLocalizedContent(article, lang);
    const date = new Date(article.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${protocol}//${host}${port}/${lang}/${year}/${month}/${langContent.slug}`;
  };

  // Filter blog articles based on fuzzy search query
  const filteredBlogArticles = blogArticles.filter(article => {
    const defaultContent = getLocalizedContent(article, settings?.defaultLang || 'en');
    return (
      fuzzyMatch(defaultContent.title, searchQuery) ||
      fuzzyMatch(defaultContent.author, searchQuery) ||
      fuzzyMatch(defaultContent.slug, searchQuery)
    );
  });

  if (editMode && currentArticle) {
    return (
      <section className="main-section active" id="blog-editor">
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
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.25rem' }}>Article History</h2>
            {!currentArticle?.history || currentArticle.history.length === 0 ? (
              <p style={{ color: '#64748b' }}>No history yet. Click "Save to History" to create a snapshot.</p>
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                  {currentArticle.history.slice().reverse().map((item, idx) => {
                    const actualIndex = currentArticle.history.length - 1 - idx;
                    return (
                      <div
                        key={actualIndex}
                        onClick={() => setSelectedHistoryIndex(actualIndex)}
                        style={{
                          padding: '10px',
                          marginBottom: '8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          backgroundColor: selectedHistoryIndex === actualIndex ? '#e0e7ff' : '#f1f5f9',
                          border: selectedHistoryIndex === actualIndex ? '2px solid #3b82f6' : '2px solid transparent'
                        }}
                      >
                        <strong>{new Date(item.timestamp).toLocaleString()}</strong>
                        <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                          {item.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {selectedHistoryIndex !== null && (
                  <div style={{
                    padding: '15px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    maxHeight: '200px',
                    overflow: 'auto'
                  }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Title:</strong> {currentArticle.history[selectedHistoryIndex].title}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Author:</strong> {currentArticle.history[selectedHistoryIndex].author}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Slug:</strong> {currentArticle.history[selectedHistoryIndex].slug}
                    </div>
                    <div>
                      <strong>Content:</strong>
                      <pre style={{
                        margin: '8px 0 0 0',
                        fontSize: '12px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {currentArticle.history[selectedHistoryIndex].content}
                      </pre>
                    </div>
                  </div>
                )}
              </>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <div>
                {selectedHistoryIndex !== null && (
                  <button onClick={handleDeleteHistoryEntry} style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
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
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    cursor: 'pointer'
                  }}>Rollback to this version</button>
                )}
                <button onClick={handleCloseHistory} style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
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
            <span>Edit Article</span>
            {isSaving && (
              <span style={{
                marginLeft: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#64748b'
              }}>
                <div className="spinner" style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid #e2e8f0',
                  borderTopColor: '#3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }}></div>
                Saving...
              </span>
            )}
          </h1>
          <div className="adjustment-buttons">
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
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
            <a href="#" onClick={(e) => { e.preventDefault(); handleBackToList(); }}>← Back to Blog</a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleShowHistory(); }}>History</a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleSaveToHistory(); }} className="highlighted">Save to History</a>
          </div>
        </header>

        <div style={{ padding: '20px' }}>

          <div style={{ marginBottom: '20px' }}>
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
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Slug ({currentLanguage}):</strong>
              <input
                type="text"
                value={currentLangContent?.slug || ''}
                onChange={(e) => saveLocalizedContent(currentLanguage, { slug: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
              Full URL: {getArticleUrl(currentArticle, currentLanguage)}
            </p>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Author ({currentLanguage}):</strong>
              <input
                type="text"
                value={currentLangContent?.author || ''}
                onChange={(e) => saveLocalizedContent(currentLanguage, { author: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Category ({currentLanguage}):</strong>
              <input
                type="text"
                value={currentLangContent?.category || ''}
                onChange={(e) => saveLocalizedContent(currentLanguage, { category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
                placeholder="e.g., Technology, News, Tutorial"
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Tags ({currentLanguage}):</strong>
              <input
                type="text"
                value={currentLangContent?.tags || ''}
                onChange={(e) => saveLocalizedContent(currentLanguage, { tags: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
                placeholder="e.g., javascript, react, web-development (comma-separated)"
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={currentArticle.highlighted || false}
                onChange={(e) => handleUpdateArticle(currentArticle.id, { highlighted: e.target.checked })}
                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
              />
              <strong>Highlight (Pin on Top)?</strong>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Content ({currentLanguage}):</strong>
              <textarea
                value={currentLangContent?.content || ''}
                onChange={(e) => saveLocalizedContent(currentLanguage, { content: e.target.value })}
                rows="15"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  fontFamily: 'monospace'
                }}
              />
            </label>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="main-section active" id="blog">
      <header>
        <h1>Blog</h1>
        <div className="adjustment-buttons">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              marginRight: '10px',
              width: '200px'
            }}
          />
          <a href="#" onClick={(e) => { e.preventDefault(); handleAddArticle(); }} className="highlighted">+ Add Article</a>
        </div>
      </header>
      <div className="component-table-container">
        <table className="page-list-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Date</th>
              <th>Slug</th>
              <th>Pinned?</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlogArticles
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(article => {
                const defaultContent = getLocalizedContent(article, settings?.defaultLang || 'en');
                return (
                <tr key={article.id}>
                  <td>{defaultContent.title}</td>
                  <td>{defaultContent.author}</td>
                  <td>{new Date(article.date).toLocaleDateString()}</td>
                  <td>{defaultContent.slug}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={article.highlighted || false}
                      onChange={(e) => updateBlogArticle(article.id, { highlighted: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleEditArticle(article.id)}>Edit</button>
                    <button onClick={() => handleDeleteClick(article.id)}>Delete</button>
                  </td>
                </tr>
              );
              })}
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
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.25rem' }}>Confirm Delete</h2>
            <p style={{ marginBottom: '25px', color: '#64748b' }}>
              Are you sure you want to delete this article? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={handleCancelDelete} style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={handleConfirmDelete} style={{
                padding: '8px 16px',
                borderRadius: '4px',
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

// Cats Section Component
const CatsSection = ({ cmsData }) => {
  const { catRows, saveCatRows } = cmsData;
  const [editingCatIndex, setEditingCatIndex] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultCat = {
    titlesBeforeName: '',
    fullName: '',
    titlesAfterName: '',
    emsColor: '',
    breed: '',
    gender: '',
    dateOfBirth: '',
    geneticTests: '',
    breedingStation: '',
    countryCode: '',
    alternativeName: '',
    printNameLine1: '',
    printNameLine2: '',
    dateOfDeath: '',
    originalRegNo: '',
    lastRegNo: '',
    regNo2: '',
    regNo3: '',
    notes: '',
    breeder: '',
    currentOwner: '',
    countryOfOrigin: '',
    countryOfCurrentResidence: '',
    ownershipNotes: '',
    personalInfo: '',
    dateOfLastOwnershipChange: ''
  };

  const handleAddCat = () => {
    saveCatRows([defaultCat, ...catRows]);
  };

  const handleRemoveCat = (index) => {
    const newRows = catRows.filter((_, i) => i !== index);
    saveCatRows(newRows);
  };

  const handleUpdateCat = (index, field, value) => {
    const newRows = [...catRows];
    newRows[index][field] = value;
    saveCatRows(newRows);
  };

  const handleExpandCat = (index) => {
    setEditingCatIndex(index);
  };

  const handleCloseModal = () => {
    setEditingCatIndex(null);
  };

  const handleDeleteClick = (index) => {
    setCatToDelete(index);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (catToDelete !== null) {
      handleRemoveCat(catToDelete);
      setDeleteModalOpen(false);
      setCatToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setCatToDelete(null);
  };

  const editingCat = editingCatIndex !== null ? catRows[editingCatIndex] : null;

  // Filter cats based on fuzzy search query
  const filteredCatRows = catRows.filter(cat => {
    return (
      fuzzyMatch(cat.fullName || '', searchQuery) ||
      fuzzyMatch(cat.titlesBeforeName || '', searchQuery) ||
      fuzzyMatch(cat.titlesAfterName || '', searchQuery) ||
      fuzzyMatch(cat.breed || '', searchQuery) ||
      fuzzyMatch(cat.emsColor || '', searchQuery)
    );
  });

  if (editingCat) {
    return (
      <section className="main-section active" id="cats-editor">
        <header style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 100, borderBottom: '1px solid #e5e7eb' }}>
          <h1>
            <span>Editing cat {editingCat.fullName || '(Unnamed)'}</span>
          </h1>
          <div className="adjustment-buttons">
            <a href="#" onClick={(e) => { e.preventDefault(); handleCloseModal(); }}>← Back to Cats registry</a>
          </div>
        </header>
        <div style={{ padding: '20px', maxWidth: '800px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Titles Before Name:</strong>
              <input
                type="text"
                value={editingCat.titlesBeforeName || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'titlesBeforeName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Full Name: <span style={{ color: '#ef4444' }}>*</span></strong>
              <input
                type="text"
                value={editingCat.fullName || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'fullName', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Titles After Name:</strong>
              <input
                type="text"
                value={editingCat.titlesAfterName || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'titlesAfterName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>EMS Color:</strong>
              <input
                type="text"
                value={editingCat.emsColor || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'emsColor', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Breed:</strong>
              <input
                type="text"
                value={editingCat.breed || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'breed', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Gender: <span style={{ color: '#ef4444' }}>*</span></strong>
              <select
                value={editingCat.gender || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'gender', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Date of Birth:</strong>
              <input
                type="date"
                value={editingCat.dateOfBirth || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'dateOfBirth', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Genetic Tests:</strong>
              <textarea
                value={editingCat.geneticTests || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'geneticTests', e.target.value)}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Breeding Station:</strong>
              <input
                type="text"
                value={editingCat.breedingStation || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'breedingStation', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Country Code:</strong>
              <input
                type="text"
                value={editingCat.countryCode || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'countryCode', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Alternative Name:</strong>
              <input
                type="text"
                value={editingCat.alternativeName || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'alternativeName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Print Name Line 1:</strong>
              <input
                type="text"
                value={editingCat.printNameLine1 || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'printNameLine1', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Print Name Line 2:</strong>
              <input
                type="text"
                value={editingCat.printNameLine2 || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'printNameLine2', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Date of Death:</strong>
              <input
                type="date"
                value={editingCat.dateOfDeath || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'dateOfDeath', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Original Reg No:</strong>
              <input
                type="text"
                value={editingCat.originalRegNo || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'originalRegNo', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Last Reg No:</strong>
              <input
                type="text"
                value={editingCat.lastRegNo || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'lastRegNo', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Reg No 2:</strong>
              <input
                type="text"
                value={editingCat.regNo2 || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'regNo2', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Reg No 3:</strong>
              <input
                type="text"
                value={editingCat.regNo3 || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'regNo3', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Notes:</strong>
              <textarea
                value={editingCat.notes || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'notes', e.target.value)}
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Breeder:</strong>
              <input
                type="text"
                value={editingCat.breeder || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'breeder', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Current Owner:</strong>
              <input
                type="text"
                value={editingCat.currentOwner || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'currentOwner', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Country of Origin:</strong>
              <input
                type="text"
                value={editingCat.countryOfOrigin || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'countryOfOrigin', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Country of Current Residence:</strong>
              <input
                type="text"
                value={editingCat.countryOfCurrentResidence || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'countryOfCurrentResidence', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Ownership Notes:</strong>
              <textarea
                value={editingCat.ownershipNotes || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'ownershipNotes', e.target.value)}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Personal Info:</strong>
              <textarea
                value={editingCat.personalInfo || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'personalInfo', e.target.value)}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Date of Last Ownership Change:</strong>
              <input
                type="date"
                value={editingCat.dateOfLastOwnershipChange || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'dateOfLastOwnershipChange', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="main-section active" id="cats">
      <header>
        <h1>Cats</h1>
        <div className="adjustment-buttons">
          <input
            type="text"
            placeholder="Search cats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              marginRight: '10px',
              width: '200px'
            }}
          />
          <a href="#" onClick={(e) => { e.preventDefault(); handleAddCat(); }} className="highlighted">+ Add Cat</a>
        </div>
      </header>
      <div className="component-table-container">
        <table className="page-list-table">
          <thead>
            <tr>
              <th>Titles Before Name</th>
              <th>Full Name <span style={{ color: '#ef4444' }}>*</span></th>
              <th>Titles After Name</th>
              <th>EMS Color</th>
              <th>Breed</th>
              <th>Gender <span style={{ color: '#ef4444' }}>*</span></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCatRows.map((cat, index) => {
              // Find the actual index in the original catRows array
              const actualIndex = catRows.indexOf(cat);
              return (
              <tr key={actualIndex}>
                <td>
                  <input
                    type="text"
                    value={cat.titlesBeforeName || ''}
                    onChange={(e) => handleUpdateCat(actualIndex, 'titlesBeforeName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={cat.fullName || ''}
                    onChange={(e) => handleUpdateCat(actualIndex, 'fullName', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={cat.titlesAfterName || ''}
                    onChange={(e) => handleUpdateCat(actualIndex, 'titlesAfterName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={cat.emsColor || ''}
                    onChange={(e) => handleUpdateCat(actualIndex, 'emsColor', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={cat.breed || ''}
                    onChange={(e) => handleUpdateCat(actualIndex, 'breed', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                </td>
                <td>
                  <select
                    value={cat.gender || ''}
                    onChange={(e) => handleUpdateCat(actualIndex, 'gender', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => handleExpandCat(actualIndex)} style={{ marginRight: '5px' }}>Expand</button>
                  <button onClick={() => handleDeleteClick(actualIndex)}>Delete</button>
                </td>
              </tr>
              );
            })}
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
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.25rem' }}>Confirm Delete</h2>
            <p style={{ marginBottom: '25px', color: '#64748b' }}>
              Are you sure you want to delete this cat entry? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={handleCancelDelete} style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={handleConfirmDelete} style={{
                padding: '8px 16px',
                borderRadius: '4px',
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

// Components Section Component
const ComponentsSection = ({ cmsData }) => {
  const { componentRows, saveComponentRows } = cmsData;

  const handleAddComponent = () => {
    saveComponentRows([...componentRows, {
      name: '',
      description: '',
      type: 'repeatable',
      fields: [{ label: '', type: 'text', placeholder: '' }]
    }]);
  };

  const handleRemoveComponent = (index) => {
    const newRows = componentRows.filter((_, i) => i !== index);
    saveComponentRows(newRows);
  };

  return (
    <section className="main-section active" id="components">
      <header>
        <h1>Component Library</h1>
      </header>
      <div className="component-table-container">
        <table className="component-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {componentRows.map((component, index) => (
              <tr key={index}>
                <td>{component.name}</td>
                <td>{component.description}</td>
                <td>{component.type}</td>
                <td>
                  <button onClick={() => handleRemoveComponent(index)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="add-component-btn" onClick={handleAddComponent}>+ Add Component</button>
      </div>
    </section>
  );
};

// Settings Section Component
const SettingsSection = ({ cmsData }) => {
  const { settings, saveSettings } = cmsData;

  const handleChange = (field, value) => {
    saveSettings({ ...settings, [field]: value });
  };

  const handleAddLanguage = () => {
    const langCode = window.prompt('Enter language code (e.g., en, sk, de):');
    if (!langCode) return;
    
    const langName = window.prompt('Enter language name (e.g., English, Slovak, German):');
    if (!langName) return;
    
    const currentLanguages = settings.languages || [];
    const newLanguage = { code: langCode.toLowerCase(), name: langName };
    
    // Check if language already exists
    if (currentLanguages.some(lang => lang.code === newLanguage.code)) {
      alert('Language already exists!');
      return;
    }
    
    saveSettings({ ...settings, languages: [...currentLanguages, newLanguage] });
  };

  const handleRemoveLanguage = (langCode) => {
    if (!window.confirm(`Are you sure you want to remove this language? This will not delete existing content.`)) {
      return;
    }
    
    const currentLanguages = settings.languages || [];
    const updatedLanguages = currentLanguages.filter(lang => lang.code !== langCode);
    saveSettings({ ...settings, languages: updatedLanguages });
  };

  const handleExportData = () => {
    try {
      // Collect all localStorage data
      const exportData = {
        pages: JSON.parse(localStorage.getItem('pages') || '[]'),
        blogArticles: JSON.parse(localStorage.getItem('blogArticles') || '[]'),
        catRows: JSON.parse(localStorage.getItem('catRows') || '[]'),
        componentRows: JSON.parse(localStorage.getItem('componentRows') || '[]'),
        settings: JSON.parse(localStorage.getItem('settings') || '{"siteTitle":"TABLES","defaultLang":"en","theme":"light","vercelApiKey":""}'),
        acl: JSON.parse(localStorage.getItem('acl') || '{}'),
        extensions: JSON.parse(localStorage.getItem('extensions') || '{}'),
        currentPageId: JSON.parse(localStorage.getItem('currentPageId') || 'null'),
        currentBlogArticleId: JSON.parse(localStorage.getItem('currentBlogArticleId') || 'null')
      };

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

      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data: ' + error.message);
    }
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);

        // Confirm before overwriting
        if (!window.confirm('⚠️ WARNING: This will overwrite ALL current data in localStorage. Are you sure you want to continue?')) {
          event.target.value = ''; // Reset file input
          return;
        }

        // Clear all localStorage data first
        const keysToPreserve = [];
        const allKeys = Object.keys(localStorage);
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

  return (
    <section className="main-section active" id="settings">
      <header>
        <h1>Settings</h1>
      </header>
      {(!settings.siteTitle || settings.siteTitle === '' || !settings.vercelApiKey || settings.vercelApiKey === '') && (
        <div style={{
          margin: '20px',
          padding: '15px 20px',
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          color: '#92400e',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <strong>Action Required:</strong>
            {(!settings.siteTitle || settings.siteTitle === '') && ' Please fill out the Site Title.'}
            {(!settings.vercelApiKey || settings.vercelApiKey === '') && ' Please add your Vercel Deploy API Key.'}
          </div>
        </div>
      )}
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Data Management</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>
            Export your CMS data to a JSON file for backup, or import data from a previous export.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportData}
              style={{
                padding: '10px 20px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              📥 Export Data
            </button>
            <label style={{
              padding: '10px 20px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              display: 'inline-block'
            }}>
              📤 Import Data
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '10px', fontWeight: '500' }}>
            ⚠️ Warning: Importing will overwrite all existing data. Make sure to export first!
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            <strong>Site Title:</strong>
            <input
              type="text"
              value={settings.siteTitle}
              onChange={(e) => handleChange('siteTitle', e.target.value)}
              placeholder="Enter your site title"
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1'
              }}
            />
          </label>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
            This will appear on the homepage
          </p>
        </div>
        <div style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Languages</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>
            Manage available languages for your content. The default language will be used for editing new content.
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Default Language:</strong>
              <select
                value={settings.defaultLang || 'en'}
                onChange={(e) => handleChange('defaultLang', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              >
                {(settings.languages || [{ code: 'en', name: 'English' }]).map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name} ({lang.code})</option>
                ))}
              </select>
            </label>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
              Default language for editing new content
            </p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong style={{ display: 'block', marginBottom: '10px' }}>Available Languages:</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(settings.languages || [{ code: 'en', name: 'English' }]).map(lang => (
                <div key={lang.code} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 15px',
                  background: 'white',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div>
                    <strong>{lang.name}</strong>
                    <span style={{ color: '#64748b', marginLeft: '10px' }}>({lang.code})</span>
                    {lang.code === settings.defaultLang && (
                      <span style={{
                        marginLeft: '10px',
                        padding: '2px 8px',
                        background: '#10b981',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>DEFAULT</span>
                    )}
                  </div>
                  {lang.code !== 'en' && (
                    <button
                      onClick={() => handleRemoveLanguage(lang.code)}
                      style={{
                        padding: '5px 10px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddLanguage}
            style={{
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            + Add Language
          </button>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            <strong>Theme:</strong>
            <select
              value={settings.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1'
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            <strong>Vercel Deploy API Key:</strong>
            <input
              type="password"
              value={settings.vercelApiKey || ''}
              onChange={(e) => handleChange('vercelApiKey', e.target.value)}
              placeholder="Enter your Vercel deploy token"
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1'
              }}
            />
          </label>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
            Get your deploy token from <a href="https://vercel.com/account/tokens">https://vercel.com/account/tokens</a>
          </p>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            <strong>Domain:</strong>
            <input
              type="text"
              value={settings.domain || ''}
              onChange={(e) => handleChange('domain', e.target.value)}
              placeholder="e.g., https://yourdomain.vercel.app"
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1'
              }}
            />
          </label>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
            Your deployment URL (used for the "Visit Deployment" button)
          </p>
        </div>
      </div>
    </section>
  );
};

// ACL Section Component
const ACLSection = ({ cmsData }) => {
  const { acl, saveAcl } = cmsData;

  const handleToggle = (key) => {
    saveAcl({ ...acl, [key]: !acl[key] });
  };

  return (
    <section className="main-section active" id="acl">
      <header>
        <h1>Access Control List</h1>
      </header>
      <div>
        <table className="page-list-table">
          <thead>
            <tr>
              <th>Permission</th>
              <th>Enabled</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(acl).map(key => (
              <tr key={key}>
                <td>{key}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={acl[key]}
                    onChange={() => handleToggle(key)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

// Extensions Section Component
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

// Display-If Section Component
const DisplayIfSection = () => {
  return (
    <section className="main-section active" id="display-if">
      <header>
        <h1>Display-If Rules</h1>
      </header>
      <div>
        <p>Display-if conditional rendering rules would be configured here.</p>
        <ul>
          <li>Rule 1: Example condition</li>
          <li>Rule 2: Example condition</li>
          <li>Rule 3: Example condition</li>
        </ul>
      </div>
    </section>
  );
};

export default CMSPage;

export const Head = () => (
  <>
    <title>CMS - TABLES</title>
    <meta name="description" content="TABLES Content Management System" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </>
);
