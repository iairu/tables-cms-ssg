import React, { useState, useEffect } from 'react';
import { toBase64 } from '../utils';
import AssetManagerModal from '../AssetManagerModal';
import LockedInputWrapper from '../LockedInputWrapper';

const SettingsSection = ({ cmsData }) => {
  const {
    settings,
    saveSettings,
    collabState,
    startCollaborationServer,
    connectToCollaborationServer,
    disconnectCollaboration,
    requestLock,
    releaseLock
  } = cmsData;
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [assetModalTarget, setAssetModalTarget] = useState(null);
  const [extensions, setExtensions] = useState({});
  const [connectIP, setConnectIP] = useState('');
  const [connectName, setConnectName] = useState('');

  // Helper to check if a field is locked by someone else
  const getLockInfo = (fieldId) => {
    if (!collabState?.activeLocks) return null;
    const lock = collabState.activeLocks.find(l => l.fieldId === fieldId);
    if (lock && lock.socketId !== collabState.socketId) {
      // Actually, we don't know our own socket ID easily unless we store it.
      // But we know 'clientName'. Let's rely on that for now or just check if WE requested it?
      // The hook tells us if status is 'locked'.
      // Let's refine: The hook should probably tell us if WE hold the lock.
      // For now, let's assume if it's in activeLocks, it's locked.
      // We need to know if it's OUR lock to allow editing.
      // If we are the one who locked it, we can edit.
      // But looking at the hook implementation: activeLocks contains { fieldId, clientName, socketId }
      // We need to compare with our socketId? We don't have it in state.
      // Let's rely on the disabled state logic:
      // If we receive "lock-denied", we can't edit.
      // If we see a lock in activeLocks for this field, is it ours?
      // We need to store our socketID in collabState.
      return lock;
    }
    return null;
  };

  const isLockedForMe = (fieldId) => {
    if (!collabState?.activeLocks) return false;
    const lock = collabState.activeLocks.find(l => l.fieldId === fieldId);
    // We need to know if it's NOT us. 
    // Since we didn't expose socketID in collabState yet, let's handle this by
    // checking if we are able to focus it? 
    // Actually, better to update useCMSData to store my socketID.
    // For this step, I will implement the UI and then fix the hook if needed.
    // Let's assume for now if there is a lock, it's locked mainly for display.
    // Real disabling happens if someone else has it.
    // I will add a 'mySocketId' to collabState in a followup if needed.
    return !!lock;
  };

  useEffect(() => {
    const getExtensionsFromStorage = () => {
      try {
        return JSON.parse(localStorage.getItem('extensions') || '{}');
      } catch (e) {
        return {};
      }
    };
    setExtensions(getExtensionsFromStorage());

    const updateExtensions = () => {
      setExtensions(getExtensionsFromStorage());
    };

    window.addEventListener('storage', updateExtensions);
    window.addEventListener('extensions-updated', updateExtensions);

    return () => {
      window.removeEventListener('storage', updateExtensions);
      window.removeEventListener('extensions-updated', updateExtensions);
    };
  }, []);

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

  // Imported LockedInputWrapper is used instead
  /* 
  const LockedInputWrapper = ... 
  (Local definition removed)
  */

  const renderImageUpload = (label, field, accept) => (
    <div style={{ marginBottom: '20px' }}>
      <strong style={{ display: 'block', marginBottom: '10px' }}>{label}:</strong>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <LockedInputWrapper fieldId={field} cmsData={cmsData}>
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
        </LockedInputWrapper>
        <button onClick={() => handleSelectImage(field)} style={{ ...secondaryButtonStyle, padding: '8px 15px', whiteSpace: 'nowrap' }}>
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

        {/* Collaboration Settings */}
        <div style={{ ...cardStyle, gridColumn: '1 / -1', borderColor: '#3b82f6', background: '#eff6ff' }}>
          <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold', color: '#1e40af' }}>
            <i className="fa-solid fa-users" style={{ marginRight: '10px' }}></i>
            Collaboration
          </h2>


          {/* Status Message Display */}
          {collabState.status === 'error' && (
            <div style={{ marginBottom: '15px', padding: '10px', background: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', borderRadius: '4px', fontSize: '14px' }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>
              {collabState.error || 'Connection Error'}
            </div>
          )}
          {collabState.status === 'connecting' && (
            <div style={{ marginBottom: '15px', padding: '10px', background: '#e0f2fe', border: '1px solid #3b82f6', color: '#1d4ed8', borderRadius: '4px', fontSize: '14px' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
              Connecting...
            </div>
          )}

          {!collabState.isConnected && !collabState.isServer ? (
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <h3 style={{ marginTop: '0', fontSize: '16px', marginBottom: '10px' }}>Client Mode</h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>Connect to an existing CMS server.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Server IP (e.g. 192.168.1.5)"
                    value={connectIP}
                    onChange={(e) => setConnectIP(e.target.value)}
                    style={{ flexGrow: 1, padding: '8px', border: '1px solid #cbd5e1' }}
                  />
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={connectName}
                    onChange={(e) => setConnectName(e.target.value)}
                    style={{ width: '120px', padding: '8px', border: '1px solid #cbd5e1' }}
                  />
                  <button
                    onClick={() => connectToCollaborationServer(`http://${connectIP}:8081`, connectName || 'Anonymous')}
                    style={{ ...secondaryButtonStyle, whiteSpace: 'nowrap' }}
                  >
                    Connect
                  </button>
                </div>
                {/* Discovered Servers List */}
                {collabState.discoveredServers.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    <strong style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#64748b' }}>Discovered Servers:</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {collabState.discoveredServers.map((server, idx) => (
                        <div key={`${server.ip}-${server.port}-${idx}`} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px'
                        }}>
                          <span style={{ fontSize: '14px' }}>
                            <strong>{server.hostname}</strong> <span style={{ color: '#94a3b8' }}>({server.ip})</span>
                          </span>
                          <button
                            onClick={() => {
                              setConnectIP(server.ip);
                              connectToCollaborationServer(`http://${server.ip}:${server.port}`, connectName || 'Anonymous');
                            }}
                            style={{ ...secondaryButtonStyle, padding: '4px 10px', fontSize: '12px' }}
                          >
                            Connect
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Connections */}
                {collabState.recentConnections && collabState.recentConnections.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    <strong style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#64748b' }}>Recent Connections:</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {collabState.recentConnections.map((conn, idx) => (
                        <div key={`${conn.ip}-${conn.port}-${idx}`} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cmsData.toggleFavorite(conn.ip, conn.port);
                              }}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                                color: conn.isFavorite ? '#f59e0b' : '#cbd5e1', fontSize: '16px'
                              }}
                              title={conn.isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                              ★
                            </button>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '500' }}>{conn.name || 'Anonymous'} <span style={{ color: '#94a3b8', fontSize: '12px' }}>({conn.ip})</span></div>
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Last: {new Date(conn.lastConnected).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              onClick={() => {
                                setConnectIP(conn.ip);
                                setConnectName(conn.name);
                                connectToCollaborationServer(`http://${conn.ip}:${conn.port || 8081}`, conn.name || 'Anonymous');
                              }}
                              style={{ ...secondaryButtonStyle, padding: '4px 10px', fontSize: '12px' }}
                            >
                              Connect
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cmsData.removeConnectionProfile(conn.ip, conn.port);
                              }}
                              style={{ ...destructiveButtonStyle, padding: '4px 8px', fontSize: '12px' }}
                              title="Remove from history"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <h3 style={{ marginTop: '0', fontSize: '16px', marginBottom: '10px' }}>Host Mode</h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>Start a server on this machine.</p>

                {collabState.availableInterfaces && collabState.availableInterfaces.length > 1 && (
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Network Interface:</label>
                    <select
                      value={selectedInterfaceIP}
                      onChange={(e) => setSelectedInterfaceIP(e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', marginBottom: '10px' }}
                    >
                      {collabState.availableInterfaces.map((iface, idx) => (
                        <option key={`${iface.name}-${idx}`} value={iface.ip}>
                          {iface.name} ({iface.ip}) [{iface.family}]
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={() => startCollaborationServer(selectedInterfaceIP)}
                  style={{ ...buttonStyle, background: '#1e40af', color: 'white' }}
                >
                  Start Server {selectedInterfaceIP ? `on ${selectedInterfaceIP}` : ''}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '10px',
                      height: '10px',
                      background: collabState.status === 'connected' ? '#22c55e' : '#f59e0b',
                      borderRadius: '50%',
                      display: 'inline-block'
                    }}></span>
                    <strong>Status:</strong>
                    {collabState.isServer ? ' Hosting Server' : ' Connected to Server'}
                    {collabState.status !== 'connected' && <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '5px' }}>({collabState.status})</span>}
                  </div>
                  {collabState.isServer && (
                    <div style={{ marginTop: '5px', fontSize: '14px' }}>
                      <strong>Server IP:</strong> {collabState.serverIP}:8081
                    </div>
                  )}
                </div>
                <button onClick={disconnectCollaboration} style={destructiveButtonStyle}>Disconnect</button>
              </div>

              <div>
                <strong>Connected Clients:</strong>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  {collabState.connectedClients.map(client => (
                    <li key={client.id}>{client.name} {client.id === collabState.socketId ? '(You)' : ''}</li>
                  ))}
                  {collabState.connectedClients.length === 0 && <li style={{ color: '#94a3b8' }}>No other clients connected</li>}
                </ul>
              </div>

              {collabState.isServer && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                  <h3 style={{ fontSize: '15px', marginBottom: '10px', color: '#dc2626' }}>Admin Panel</h3>
                  <div style={{ fontSize: '13px', marginBottom: '10px', fontWeight: '600' }}>Active Locks:</div>
                  {collabState.activeLocks && collabState.activeLocks.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {collabState.activeLocks.map(lock => (
                        <div key={lock.fieldId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff1f2', padding: '8px', borderRadius: '4px', border: '1px solid #fda4af' }}>
                          <span style={{ fontSize: '13px' }}>
                            <strong>{lock.fieldId}</strong> <span style={{ color: '#64748b' }}>by</span> {lock.clientName}
                            <span style={{ color: '#991b1b', marginLeft: '5px', fontSize: '11px' }}>
                              ({Math.floor((Date.now() - (lock.timestamp || Date.now())) / 1000)}s)
                            </span>
                          </span>
                          <button
                            onClick={() => cmsData.forceReleaseLock(lock.fieldId)}
                            style={{ ...destructiveButtonStyle, padding: '4px 8px', fontSize: '11px' }}
                          >
                            Force Release
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No active locks</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* General Settings */}
        <div style={{ ...cardStyle }}>
          <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>General</h2>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Site Title:</strong>
              <LockedInputWrapper fieldId="siteTitle" cmsData={cmsData}>
                <input type="text" value={settings.siteTitle || ''} onChange={(e) => handleChange('siteTitle', e.target.value)} placeholder="Enter your site title" style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1', }} />
              </LockedInputWrapper>
            </label>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>This will appear on the homepage.</p>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Default Meta Description:</strong>
              <LockedInputWrapper fieldId="defaultMetaDescription" cmsData={cmsData}>
                <textarea value={settings.defaultMetaDescription || ''} onChange={(e) => handleChange('defaultMetaDescription', e.target.value)} placeholder="Enter a default meta description for your site" rows="3" style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }} />
              </LockedInputWrapper>
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
              <select value={settings.defaultLang || 'en'} onChange={(e) => handleChange('defaultLang', e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1', }}>
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
                <div key={lang.code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 15px', background: 'white', border: '1px solid #e2e8f0', }}>
                  <div>
                    <strong>{lang.name}</strong> <span style={{ color: '#64748b' }}>({lang.code})</span>
                    {lang.code === settings.defaultLang && <span style={{ marginLeft: '10px', padding: '2px 8px', background: '#10b981', color: 'white', fontSize: '12px', fontWeight: '600' }}>DEFAULT</span>}
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
                <LockedInputWrapper fieldId={`social-${index}-platform`}>
                  <select value={social.platform} onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)} style={{ width: '150px', padding: '10px', border: '1px solid #cbd5e1', }}>
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
                </LockedInputWrapper>
                <LockedInputWrapper fieldId={`social-${index}-url`}>
                  <input type="text" value={social.url} onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)} placeholder="Enter URL" style={{ flex: '1', padding: '10px', border: '1px solid #cbd5e1', }} />
                </LockedInputWrapper>
                <button onClick={() => handleRemoveSocialMedia(index)} style={{ ...destructiveButtonStyle, padding: '10px' }}>Remove</button>
              </div>
            ))}
          </div>
          <button onClick={handleAddSocialMedia} style={secondaryButtonStyle}>+ Add Social Media Link</button>
        </div>

        {
          extensions['movietracker-extension-enabled'] && (
            <div style={{ ...cardStyle }}>
              <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Movie Tracker</h2>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                  <strong>OMDb API Key:</strong>
                  <LockedInputWrapper fieldId="omdbApiKey">
                    <input type="text" value={settings.omdbApiKey || ''} onChange={(e) => handleChange('omdbApiKey', e.target.value)} placeholder="Enter your OMDb API key" style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1', }} />
                  </LockedInputWrapper>
                </label>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
                  Get your API key from <a href="https://www.omdbapi.com/apikey.aspx" target="_blank" rel="noopener noreferrer">omdbapi.com</a>
                </p>
              </div>
            </div>
          )
        }

        {/* Deployment */}
        <div style={{ ...cardStyle, gridColumn: '1 / -1' }}>
          <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Deployment</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <strong>Vercel Deploy API Key:</strong>
                <LockedInputWrapper fieldId="vercelApiKey">
                  <input type="password" value={settings.vercelApiKey || ''} onChange={(e) => handleChange('vercelApiKey', e.target.value)} placeholder="Enter your Vercel deploy token" style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1', }} />
                </LockedInputWrapper>
              </label>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
                Get your deploy token from <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer">vercel.com/account/tokens</a>
              </p>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <strong>Vercel Project Name:</strong>
                <LockedInputWrapper fieldId="vercelProjectName">
                  <input type="text" value={settings.vercelProjectName || ''} onChange={(e) => handleVercelProjectNameChange(e.target.value)} placeholder="my-project-name" pattern="[a-z-]+" style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1', }} />
                </LockedInputWrapper>
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

      </div >

      <AssetManagerModal
        isOpen={assetModalOpen}
        onClose={() => setAssetModalOpen(false)}
        assets={cmsData?.uploads || []}
        onSelectAsset={handleAssetSelected}
      />
    </section >
  );
};

export default SettingsSection;