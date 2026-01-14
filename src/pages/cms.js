import React, { useState, useEffect } from 'react';
import SideMenu from '../components/SideMenu';
import useCMSData from '../hooks/useCMSData';
import '../styles/cms.css';

const CMSPage = () => {
  const [currentSection, setCurrentSection] = useState('pages');
  const cmsData = useCMSData();

  if (typeof window === 'undefined') {
    return null;
  }

  const handleSectionChange = (sectionId) => {
    setCurrentSection(sectionId);
  };

  const handleManualBuild = () => {
    if (cmsData.manualTriggerBuild) {
      cmsData.manualTriggerBuild();
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

// Component Editor for Page Rows
const ComponentEditor = ({ rows, onChange }) => {
  const handleAddComponent = () => {
    const newRows = [...rows, { component: 'Slide', fields: { 'Slide heading': '', 'Slide content': '' } }];
    onChange(newRows);
  };

  const handleRemoveComponent = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    onChange(newRows);
  };

  const handleChangeComponentType = (index, newType) => {
    const newRows = [...rows];
    if (newType === 'Slide') {
      newRows[index] = { component: 'Slide', fields: { 'Slide heading': '', 'Slide content': '' } };
    } else if (newType === 'Reviews') {
      newRows[index] = { component: 'Reviews', fields: { reviews: [{ 'Review logo': '', 'Review content': '', 'Review author': '' }] } };
    } else if (newType === 'Gallery') {
      newRows[index] = { component: 'Gallery', fields: { images: [] } };
    } else if (newType === 'Text') {
      newRows[index] = { component: 'Text', fields: { content: '' } };
    }
    onChange(newRows);
  };

  const handleFieldChange = (rowIndex, fieldName, value) => {
    const newRows = [...rows];
    newRows[rowIndex].fields[fieldName] = value;
    onChange(newRows);
  };

  const handleAddReview = (rowIndex) => {
    const newRows = [...rows];
    if (!newRows[rowIndex].fields.reviews) {
      newRows[rowIndex].fields.reviews = [];
    }
    newRows[rowIndex].fields.reviews.push({ 'Review logo': '', 'Review content': '', 'Review author': '' });
    onChange(newRows);
  };

  const handleRemoveReview = (rowIndex, reviewIndex) => {
    const newRows = [...rows];
    newRows[rowIndex].fields.reviews.splice(reviewIndex, 1);
    onChange(newRows);
  };

  const handleReviewFieldChange = (rowIndex, reviewIndex, fieldName, value) => {
    const newRows = [...rows];
    newRows[rowIndex].fields.reviews[reviewIndex][fieldName] = value;
    onChange(newRows);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Page Components</h3>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} style={{
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '15px',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <label>
              Component Type: 
              <select 
                value={row.component} 
                onChange={(e) => handleChangeComponentType(rowIndex, e.target.value)}
                style={{ marginLeft: '10px', padding: '5px 10px' }}
              >
                <option value="Slide">Slide</option>
                <option value="Reviews">Reviews</option>
                <option value="Gallery">Gallery</option>
                <option value="Text">Text</option>
              </select>
            </label>
            <button 
              onClick={() => handleRemoveComponent(rowIndex)}
              style={{
                padding: '5px 15px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Remove
            </button>
          </div>

          {row.component === 'Slide' && (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Slide Heading:</label>
                <input 
                  type="text"
                  value={row.fields['Slide heading'] || ''}
                  onChange={(e) => handleFieldChange(rowIndex, 'Slide heading', e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Slide Content:</label>
                <textarea 
                  value={row.fields['Slide content'] || ''}
                  onChange={(e) => handleFieldChange(rowIndex, 'Slide content', e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '80px' }}
                />
              </div>
            </div>
          )}

          {row.component === 'Reviews' && (
            <div>
              <h4 style={{ marginBottom: '10px' }}>Reviews</h4>
              {row.fields.reviews && row.fields.reviews.map((review, reviewIndex) => (
                <div key={reviewIndex} style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong>Review {reviewIndex + 1}</strong>
                    <button 
                      onClick={() => handleRemoveReview(rowIndex, reviewIndex)}
                      style={{
                        padding: '3px 10px',
                        background: '#f87171',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove Review
                    </button>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Logo URL:</label>
                    <input 
                      type="text"
                      value={review['Review logo'] || ''}
                      onChange={(e) => handleReviewFieldChange(rowIndex, reviewIndex, 'Review logo', e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '3px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Content:</label>
                    <textarea 
                      value={review['Review content'] || ''}
                      onChange={(e) => handleReviewFieldChange(rowIndex, reviewIndex, 'Review content', e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '3px', border: '1px solid #cbd5e1', minHeight: '60px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Author:</label>
                    <input 
                      type="text"
                      value={review['Review author'] || ''}
                      onChange={(e) => handleReviewFieldChange(rowIndex, reviewIndex, 'Review author', e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '3px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              ))}
              <button 
                onClick={() => handleAddReview(rowIndex)}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                + Add Review
              </button>
            </div>
          )}

          {row.component === 'Text' && (
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Content:</label>
              <textarea 
                value={row.fields.content || ''}
                onChange={(e) => handleFieldChange(rowIndex, 'content', e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', minHeight: '100px' }}
              />
            </div>
          )}

          {row.component === 'Gallery' && (
            <div>
              <p style={{ color: '#64748b' }}>Gallery component (images array)</p>
            </div>
          )}
        </div>
      ))}
      <button 
        onClick={handleAddComponent}
        style={{
          padding: '10px 20px',
          background: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        + Add Component
      </button>
    </div>
  );
};

// Pages Section Component
const PagesSection = ({ cmsData }) => {
  const { pages, currentPageId, saveCurrentPageId, addPage, deletePage, updatePage } = cmsData;
  const [editMode, setEditMode] = useState(false);

  const handleAddPage = () => {
    const newId = addPage();
    saveCurrentPageId(newId);
    setEditMode(true);
  };

  const handleEditPage = (id) => {
    saveCurrentPageId(id);
    setEditMode(true);
  };

  const handleBackToList = () => {
    setEditMode(false);
    saveCurrentPageId(null);
  };

  const currentPage = pages.find(p => p.id === currentPageId);

  if (editMode && currentPage) {
    return (
      <section className="main-section active" id="pages-editor">
        <header>
          <h1>
            <span>Edit Page</span>
          </h1>
          <div className="adjustment-buttons">
            <a href="#" onClick={(e) => { e.preventDefault(); handleBackToList(); }}>← Back to Pages</a>
            <a href="#" onClick={(e) => e.preventDefault()}>History</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Publish</a>
          </div>
        </header>
        <div className="component-table-container">
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Title:</strong>
              <input 
                type="text" 
                value={currentPage.title} 
                onChange={(e) => updatePage(currentPage.id, { title: e.target.value })}
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
              <strong>Slug:</strong>
              <input 
                type="text" 
                value={currentPage.slug} 
                onChange={(e) => updatePage(currentPage.id, { slug: e.target.value })}
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
          <ComponentEditor 
            rows={currentPage.rows || []}
            onChange={(newRows) => updatePage(currentPage.id, { rows: newRows })}
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
          <a href="#" onClick={(e) => { e.preventDefault(); handleAddPage(); }} className="highlighted">+ Add Page</a>
        </div>
      </header>
      <div className="component-table-container">
        <table className="page-list-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Last Published</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map(page => (
              <tr key={page.id} className={page.id === currentPageId ? 'active' : ''}>
                <td>{page.title}</td>
                <td>{page.slug}</td>
                <td>{page.lastPublished ? new Date(page.lastPublished).toLocaleString() : 'Never'}</td>
                <td>
                  <button onClick={() => handleEditPage(page.id)}>Edit</button>
                  <button onClick={() => deletePage(page.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

// Blog Section Component
const BlogSection = ({ cmsData }) => {
  const { blogArticles, currentBlogArticleId, saveCurrentBlogArticleId, addBlogArticle, deleteBlogArticle, updateBlogArticle, isBuilding } = cmsData;
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddArticle = () => {
    const newId = addBlogArticle();
    saveCurrentBlogArticleId(newId);
    setEditMode(true);
  };

  const handleEditArticle = (id) => {
    saveCurrentBlogArticleId(id);
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

  const currentArticle = blogArticles.find(a => a.id === currentBlogArticleId);

  if (editMode && currentArticle) {
    return (
      <section className="main-section active" id="blog-editor">
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
            <a href="#" onClick={(e) => { e.preventDefault(); handleBackToList(); }}>← Back to Blog</a>
          </div>
        </header>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Title:</strong>
              <input 
                type="text" 
                value={currentArticle.title} 
                onChange={(e) => handleUpdateArticle(currentArticle.id, { title: e.target.value })}
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
              <strong>Slug:</strong>
              <input 
                type="text" 
                value={currentArticle.slug} 
                onChange={(e) => handleUpdateArticle(currentArticle.id, { slug: e.target.value })}
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
              <strong>Author:</strong>
              <input 
                type="text" 
                value={currentArticle.author} 
                onChange={(e) => handleUpdateArticle(currentArticle.id, { author: e.target.value })}
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
              <strong>Content:</strong>
              <textarea 
                value={currentArticle.content} 
                onChange={(e) => handleUpdateArticle(currentArticle.id, { content: e.target.value })}
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

  const groupedArticles = {};
  blogArticles.forEach(article => {
    const year = article.year;
    const month = article.month;
    if (!groupedArticles[year]) groupedArticles[year] = {};
    if (!groupedArticles[year][month]) groupedArticles[year][month] = [];
    groupedArticles[year][month].push(article);
  });

  return (
    <section className="main-section active" id="blog">
      <header>
        <h1>Blog</h1>
        <div className="adjustment-buttons">
          <a href="#" onClick={(e) => { e.preventDefault(); handleAddArticle(); }} className="highlighted">+ Add Article</a>
        </div>
      </header>
      <div className="article-list">
        {Object.keys(groupedArticles).sort((a, b) => b - a).map(year => (
          <div key={year} className="blog-year-group">
            <h2>{year}</h2>
            {Object.keys(groupedArticles[year]).sort((a, b) => b - a).map(month => (
              <div key={month} className="blog-month-group">
                <h3>Month {month}</h3>
                <div className="blog-article-list">
                  {groupedArticles[year][month].map(article => (
                    <a 
                      key={article.id} 
                      href="#" 
                      className="blog-article-link"
                      onClick={(e) => { e.preventDefault(); handleEditArticle(article.id); }}
                    >
                      {article.title}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

// Cats Section Component
const CatsSection = ({ cmsData }) => {
  const { catRows, saveCatRows } = cmsData;

  const handleAddCat = () => {
    saveCatRows([...catRows, { name: '', breed: '', owner: '' }]);
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

  return (
    <section className="main-section active" id="cats">
      <header>
        <h1>Cats</h1>
      </header>
      <div className="component-table-container">
        <table className="component-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Breed</th>
              <th>Owner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {catRows.map((cat, index) => (
              <tr key={index}>
                <td>
                  <input 
                    type="text" 
                    value={cat.name} 
                    onChange={(e) => handleUpdateCat(index, 'name', e.target.value)}
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    value={cat.breed} 
                    onChange={(e) => handleUpdateCat(index, 'breed', e.target.value)}
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    value={cat.owner} 
                    onChange={(e) => handleUpdateCat(index, 'owner', e.target.value)}
                  />
                </td>
                <td>
                  <button className="remove-cat-btn" onClick={() => handleRemoveCat(index)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="add-cat-btn" onClick={handleAddCat}>+ Add Cat</button>
      </div>
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

  return (
    <section className="main-section active" id="settings">
      <header>
        <h1>Settings</h1>
      </header>
      <div style={{ padding: '20px' }}>
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
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            <strong>Default Language:</strong>
            <input 
              type="text" 
              value={settings.defaultLang} 
              onChange={(e) => handleChange('defaultLang', e.target.value)}
              placeholder="e.g., en, es, fr"
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

  return (
    <section className="main-section active" id="extensions">
      <header>
        <h1>Extensions</h1>
      </header>
      <div>
        <table className="page-list-table">
          <thead>
            <tr>
              <th>Extension</th>
              <th>Enabled</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(extensions).map(key => (
              <tr key={key}>
                <td>{key}</td>
                <td>
                  <input 
                    type="checkbox" 
                    checked={extensions[key]} 
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