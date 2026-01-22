import React, { useState, useEffect } from 'react';
import { useLoading } from '../../../context/LoadingContext';
import { createNavigation } from '../../../utils/navigation';
import { fuzzyMatch } from '../utils';

const BlogSection = ({ cmsData, edit: editModeProp }) => {
  const { blogArticles, currentBlogArticleId, saveCurrentBlogArticleId, addBlogArticle, deleteBlogArticle, updateBlogArticle, isBuilding, settings } = cmsData;
  const { showLoading, hideLoading } = useLoading();
  const navigate = createNavigation(showLoading, hideLoading);
  const [editMode, setEditMode] = useState(editModeProp || false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(null);
  const [saveSuccessModalOpen, setSaveSuccessModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState(settings?.defaultLang || 'en');

  useEffect(() => {
    hideLoading();
  }, []);

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
    navigate('/cms/blog');
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
    // Always use top-level slug, never translation slug
    const translation = article.translations && article.translations[lang] ? article.translations[lang] : {};
    return {
      title: translation.title || article.title || '',
      slug: article.slug || '',
      author: translation.author || article.author || '',
      content: translation.content || article.content || '',
      category: translation.category || article.category || '',
      tags: translation.tags || article.tags || '',
      metaDescription: translation.metaDescription || article.metaDescription || ''
    };
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
      tags: currentArticle.tags || '',
      metaDescription: ''
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
                          
                          cursor: 'pointer',
                          backgroundColor: selectedHistoryIndex === actualIndex ? '#e0e7ff' : '#f1f5f9',
                          border: selectedHistoryIndex === actualIndex ? '2px solid var(--page-button-color)' : '2px solid transparent'
                        }}
                      >
                        <strong>{new Date(item.timestamp).toLocaleString('ja-JP')}</strong>
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
                    backgroundColor: 'var(--page-button-color)',
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
                  borderTopColor: 'var(--page-button-color)',
                  
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
                  
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Slug:</strong>
              <input
                type="text"
                value={currentArticle.slug || ''}
                onChange={e => updateBlogArticle(currentArticle.id, { slug: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
              {/* Full URL: {getArticleUrl(currentArticle, currentLanguage)}*/}
            </p>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Meta Description ({currentLanguage}):</strong>
              <textarea
                value={currentLangContent?.metaDescription || ''}
                onChange={(e) => saveLocalizedContent(currentLanguage, { metaDescription: e.target.value })}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
                  border: '1px solid #cbd5e1',
                  fontFamily: 'inherit'
                }}
                placeholder="Enter a meta description for this article"
              />
            </label>
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
              <th>Last Edited</th>
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
                  <td>{new Date(article.date).toLocaleDateString('ja-JP')}</td>
                  <td>{defaultContent.slug}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={article.highlighted || false}
                      onChange={(e) => updateBlogArticle(article.id, { highlighted: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td>{article.lastEdited ? new Date(article.lastEdited).toLocaleString('ja-JP') : 'Never'}</td>
                  <td>
                    <button onClick={() => navigate(`/cms/blog/edit?id=${article.id}`)}>Edit</button>
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

export default BlogSection;