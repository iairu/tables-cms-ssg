import React, { useState } from 'react';
import { toBase64 } from '../utils';
import AssetManagerModal from '../AssetManagerModal';

const SettingsSection = ({ cmsData }) => {
  const { settings, saveSettings } = cmsData;
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [assetModalTarget, setAssetModalTarget] = useState(null);

  const handleChange = (field, value) => {
    saveSettings({ ...settings, [field]: value });
  };

  const handleVercelProjectNameChange = (value) => {
    const projectName = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    saveSettings({
      ...settings,
      vercelProjectName: projectName,
      domain: projectName ? `https://${projectName}.vercel.app/` : ''
    });
  };

  const handleFileChange = async (field, file) => {
    if (file) {
      const base64 = await toBase64(file);
      handleChange(field, base64);
    }
  };

  const handleSelectImage = (field) => {
    setAssetModalTarget(field);
    setAssetModalOpen(true);
  };

  const handleAssetSelected = (asset) => {
    if (assetModalTarget) {
      handleChange(assetModalTarget, asset.url);
    }
    setAssetModalOpen(false);
    setAssetModalTarget(null);
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

  const cardStyle = {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '20px',
  };

  const buttonStyle = {
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: 'white',
    color: '#2563eb',
    border: '1px solid #2563eb50',
  };

  const destructiveButtonStyle = {
    ...buttonStyle,
    background: '#ef4444',
    color: 'white',
    padding: '5px 10px',
  };

  const renderImageUpload = (label, field, accept) => (
    <div style={{ marginBottom: '20px' }}>
      <strong style={{ display: 'block', marginBottom: '10px' }}>{label}:</strong>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(field, e.target.files[0])}
          style={{ 
            display: 'block',
            width: '100%',
            padding: '8px',
            border: '1px solid #cbd5e1',
          }}
        />
        <button onClick={() => handleSelectImage(field)} style={{...secondaryButtonStyle, padding: '8px 15px', whiteSpace: 'nowrap'}}>
          Select from Assets
        </button>
      </div>
      {settings[field] && (
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src={settings[field]} 
            alt={`${label} Preview`} 
            style={{ 
              maxWidth: field === 'siteFavicon' ? '32px' : '200px', 
              maxHeight: field === 'siteFavicon' ? '32px' : '100px', 
              border: '1px solid #e2e8f0', 
              background: field === 'siteLogoWhite' ? '#1e293b' : 'transparent',
              padding: field === 'siteLogoWhite' ? '10px' : '0'
            }} 
          />
          <button onClick={() => handleChange(field, '')} style={{ ...destructiveButtonStyle }}>Remove</button>
        </div>
      )}
    </div>
  );

  return (
    <section className="main-section active" id="settings">
      <header>
        <h1>Settings</h1>
      </header>
      {(!settings.siteTitle || !settings.vercelApiKey || !settings.vercelProjectName) && (
        <div style={{ margin: '20px', padding: '15px 20px', background: '#fef3c7', border: '1px solid #f59e0b', color: '#92400e', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <strong>Action Required:</strong>
            {!settings.siteTitle && ' Please fill out the Site Title.'}
            {!settings.vercelApiKey && ' Please add your Vercel Deploy API Key.'}
            {!settings.vercelProjectName && ' Please add your Vercel Project Name.'}
          </div>
        </div>
      )}
      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '20px' }}>
        
        {/* General Settings */}
        <div style={{ ...cardStyle }}>
          <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>General</h2>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Site Title:</strong>
              <input type="text" value={settings.siteTitle || ''} onChange={(e) => handleChange('siteTitle', e.target.value)} placeholder="Enter your site title" style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1',  }} />
            </label>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>This will appear on the homepage.</p>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Default Meta Description:</strong>
              <textarea value={settings.defaultMetaDescription || ''} onChange={(e) => handleChange('defaultMetaDescription', e.target.value)} placeholder="Enter a default meta description for your site" rows="3" style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }} />
            </label>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>Default meta description for pages.</p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={settings.showBreadcrumbs || false} onChange={(e) => handleChange('showBreadcrumbs', e.target.checked)} style={{ cursor: 'pointer', width: '18px', height: '18px' }} />
            <strong>Show breadcrumbs on pages and articles</strong>
          </label>
        </div>

        {/* Branding */}
        <div style={{ ...cardStyle }}>
          <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Branding</h2>
          {renderImageUpload('Site Logo', 'siteLogo', 'image/*')}
          {renderImageUpload('Site Logo White', 'siteLogoWhite', 'image/*')}
          {renderImageUpload('Site Favicon', 'siteFavicon', 'image/png, image/x-icon, image/svg+xml')}
        </div>

        {/* Languages */}
        <div style={{ ...cardStyle }}>
          <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Languages</h2>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Default Language:</strong>
              <select value={settings.defaultLang || 'en'} onChange={(e) => handleChange('defaultLang', e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1',  }}>
                {(settings.languages || [{ code: 'en', name: 'English' }]).map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name} ({lang.code})</option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ display: 'block', marginBottom: '10px' }}>Available Languages:</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(settings.languages || [{ code: 'en', name: 'English' }]).map(lang => (
                <div key={lang.code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 15px', background: 'white', border: '1px solid #e2e8f0',  }}>
                  <div>
                    <strong>{lang.name}</strong> <span style={{ color: '#64748b' }}>({lang.code})</span>
                    {lang.code === settings.defaultLang && <span style={{ marginLeft: '10px', padding: '2px 8px', background: '#10b981', color: 'white', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>DEFAULT</span>}
                  </div>
                  {lang.code !== 'en' && (
                    <button onClick={() => handleRemoveLanguage(lang.code)} style={destructiveButtonStyle}>Remove</button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleAddLanguage} style={secondaryButtonStyle}>+ Add Language</button>
        </div>

        {/* Social Media */}
        <div style={{ ...cardStyle }}>
          <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Social Media Links</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '15px' }}>
            {(settings.socialMedia || []).map((social, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select value={social.platform} onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)} style={{ width: '150px', padding: '10px', border: '1px solid #cbd5e1',  }}>
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
                <input type="text" value={social.url} onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)} placeholder="Enter URL" style={{ flex: '1', padding: '10px', border: '1px solid #cbd5e1',  }} />
                <button onClick={() => handleRemoveSocialMedia(index)} style={{...destructiveButtonStyle, padding: '10px'}}>Remove</button>
              </div>
            ))}
          </div>
          <button onClick={handleAddSocialMedia} style={secondaryButtonStyle}>+ Add Social Media Link</button>
        </div>
        
        {/* Deployment */}
        <div style={{ ...cardStyle, gridColumn: '1 / -1' }}>
          <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Deployment</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <strong>Vercel Deploy API Key:</strong>
                <input type="password" value={settings.vercelApiKey || ''} onChange={(e) => handleChange('vercelApiKey', e.target.value)} placeholder="Enter your Vercel deploy token" style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1',  }} />
              </label>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
                Get your deploy token from <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer">vercel.com/account/tokens</a>
              </p>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <strong>Vercel Project Name:</strong>
                <input type="text" value={settings.vercelProjectName || ''} onChange={(e) => handleVercelProjectNameChange(e.target.value)} placeholder="my-project-name" pattern="[a-z-]+" style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1',  }} />
              </label>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>Lowercase letters and dashes only.</p>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <strong>Domain:</strong>
                <input type="text" value={settings.domain || ''} readOnly placeholder="Auto-generated from Vercel Project Name" style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1', background: '#f3f4f6', cursor: 'not-allowed' }} />
              </label>
            </div>
          </div>
        </div>

      </div>

      <AssetManagerModal
        isOpen={assetModalOpen}
        onClose={() => setAssetModalOpen(false)}
        assets={cmsData?.uploads || []}
        onSelectAsset={handleAssetSelected}
      />
    </section>
  );
};

export default SettingsSection;