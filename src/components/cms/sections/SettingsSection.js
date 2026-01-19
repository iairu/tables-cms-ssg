import React from 'react';
import { toBase64 } from '../utils';

const SettingsSection = ({ cmsData }) => {
  const { settings, saveSettings } = cmsData;

  const handleChange = (field, value) => {
    saveSettings({ ...settings, [field]: value });
  };

  const handleFileChange = async (field, file) => {
    if (file) {
      const base64 = await toBase64(file);
      handleChange(field, base64);
    }
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

  const handleAddSocialMedia = () => {
    const currentSocialMedia = settings.socialMedia || [];
    saveSettings({ ...settings, socialMedia: [...currentSocialMedia, { platform: '', url: '' }] });
  };

  const handleRemoveSocialMedia = (index) => {
    const currentSocialMedia = settings.socialMedia || [];
    const updatedSocialMedia = currentSocialMedia.filter((_, i) => i !== index);
    saveSettings({ ...settings, socialMedia: updatedSocialMedia });
  };

  const handleSocialMediaChange = (index, field, value) => {
    const currentSocialMedia = settings.socialMedia || [];
    const updatedSocialMedia = [...currentSocialMedia];
    updatedSocialMedia[index][field] = value;
    saveSettings({ ...settings, socialMedia: updatedSocialMedia });
  };

  const handleExportData = () => {
    try {
      // Collect all localStorage data
      const exportData = {
        pages: JSON.parse(localStorage.getItem('pages') || '[]'),
        blogArticles: JSON.parse(localStorage.getItem('blogArticles') || '[]'),
        catRows: JSON.parse(localStorage.getItem('catRows') || '[]'),
        componentRows: JSON.parse(localStorage.getItem('componentRows') || '[]'),
        settings: JSON.parse(localStorage.getItem('settings') || '{"siteTitle":"TABLES","defaultLang":"en","theme":"light","vercelApiKey":"","showBreadcrumbs":false}'),
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
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            <strong>Site Logo:</strong>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange('siteLogo', e.target.files[0])}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1'
              }}
            />
          </label>
          {settings.siteLogo && (
            <div style={{ marginTop: '10px' }}>
              <img src={settings.siteLogo} alt="Site Logo Preview" style={{ maxWidth: '200px', maxHeight: '100px', border: '1px solid #e2e8f0', borderRadius: '4px' }} />
              <button
                onClick={() => handleChange('siteLogo', '')}
                style={{
                  marginLeft: '10px',
                  padding: '5px 10px',
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
          )}
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            <strong>Site Favicon:</strong>
            <input
              type="file"
              accept="image/png, image/x-icon, image/svg+xml"
              onChange={(e) => handleFileChange('siteFavicon', e.target.files[0])}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1'
              }}
            />
          </label>
          {settings.siteFavicon && (
            <div style={{ marginTop: '10px' }}>
              <img src={settings.siteFavicon} alt="Favicon Preview" style={{ width: '32px', height: '32px', border: '1px solid #e2e8f0', borderRadius: '4px' }} />
              <button
                onClick={() => handleChange('siteFavicon', '')}
                style={{
                  marginLeft: '10px',
                  padding: '5px 10px',
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
          )}
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            <strong>Default Meta Description:</strong>
            <textarea
              value={settings.defaultMetaDescription || ''}
              onChange={(e) => handleChange('defaultMetaDescription', e.target.value)}
              placeholder="Enter a default meta description for your site"
              rows="3"
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontFamily: 'inherit'
              }}
            />
          </label>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
            This will be used as the default meta description for pages that don't have a specific one.
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
        <div style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Social Media Links</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>
            Add links to your social media profiles. These will be displayed in the site footer or other designated areas.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {(settings.socialMedia || []).map((social, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select
                  value={social.platform}
                  onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
                  style={{
                    width: '150px',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1'
                  }}
                >
                  <option value="">Select Platform</option>
                  <option value="X">X (Twitter)</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Reddit">Reddit</option>
                  <option value="Patreon">Patreon</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="GitHub">GitHub</option>
                  <option value="TikTok">TikTok</option>
                </select>
                <input
                  type="text"
                  value={social.url}
                  onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                  placeholder="Enter URL"
                  style={{
                    flex: '1',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1'
                  }}
                />
                <button
                  onClick={() => handleRemoveSocialMedia(index)}
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
              </div>
            ))}
          </div>
          <button
            onClick={handleAddSocialMedia}
            style={{
              marginTop: '15px',
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
            + Add Social Media Link
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
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.showBreadcrumbs || false}
              onChange={(e) => handleChange('showBreadcrumbs', e.target.checked)}
              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
            />
            <strong>Show breadcrumbs on pages and articles</strong>
          </label>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
            Display navigation breadcrumbs at the top of pages and blog articles
          </p>
        </div>
      </div>
    </section>
  );
};

export default SettingsSection;