import React, { useEffect, useState } from 'react';
import { Link, navigate } from 'gatsby';
import Header from './Header';
import SideMenu from './SideMenu';
import LoadingBar from './LoadingBar';
import LoadingSkeleton from './LoadingSkeleton';
import useCMSData from '../hooks/useCMSData';
import { useLoading } from '../context/LoadingContext';
import NotesSidebar from './NotesSidebar';
import '../styles/cms.css';



const Layout = ({ children, location }) => {
  const cmsData = useCMSData();
  const { isLoading, showLoading, hideLoading } = useLoading();
  const [isNotesSidebarOpen, setNotesSidebarOpen] = useState(false);
  const { extensions } = cmsData;
  const { collabState } = cmsData;

  // Show reconnection banner when client was connected but lost server
  const showReconnectBanner = collabState.wasConnectedAsClient && !collabState.isConnected;

  useEffect(() => {
    const handleShowLoading = () => showLoading();
    const handleHideLoading = () => hideLoading();

    window.addEventListener('show-loading', handleShowLoading);
    window.addEventListener('hide-loading', handleHideLoading);

    return () => {
      window.removeEventListener('show-loading', handleShowLoading);
      window.removeEventListener('hide-loading', handleHideLoading);
    };
  }, [showLoading, hideLoading]);

  const handleManualBuild = (localOnly = false) => {
    if (cmsData.manualTriggerBuild) {
      cmsData.manualTriggerBuild(localOnly);
    }
  };

  const getCurrentSection = () => {
    const path = location.pathname;
    if (path.startsWith('/cms/pages')) return 'pages';
    if (path.startsWith('/cms/page-groups')) return 'page-groups';
    if (path.startsWith('/cms/blog')) return 'blog';
    if (path.startsWith('/cms/pedigree')) return 'cats';
    if (path.startsWith('/cms/personal')) return 'personal';
    if (path.startsWith('/cms/inventory')) return 'rental-inventory';
    if (path.startsWith('/cms/attendance')) return 'rental-attendance';
    if (path.startsWith('/cms/customers')) return 'rental-customers';
    if (path.startsWith('/cms/employees')) return 'rental-employees';
    if (path.startsWith('/cms/reservations')) return 'rental-reservations';
    if (path.startsWith('/cms/calendar')) return 'rental-calendar';
    if (path.startsWith('/cms/settings')) return 'settings';
    if (path.startsWith('/cms/extensions')) return 'extensions';
    if (path.startsWith('/cms/uploads')) return 'uploads';
    if (path.startsWith('/cms/movietracker')) return 'movietracker';
    return '';
  };

  const toggleNotesSidebar = () => {
    setNotesSidebarOpen(!isNotesSidebarOpen);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="cms-container" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <LoadingBar />
        {showReconnectBanner && (
          <div style={{
            background: 'linear-gradient(90deg, #dc2626, #b91c1c)',
            color: 'white',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#fca5a5',
                animation: 'reconnect-pulse 1.5s ease-in-out infinite'
              }} />
              <span>
                {collabState.status === 'connecting'
                  ? 'Attempting to reconnect to server…'
                  : collabState.status === 'error'
                    ? `Connection lost: ${collabState.error || 'Server unreachable'}`
                    : 'Disconnected from server — attempting to reconnect…'}
              </span>
            </div>
            <button
              onClick={() => navigate('/cms/settings')}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.4)',
                color: 'white',
                padding: '5px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.35)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              Go to Settings
            </button>
          </div>
        )}
        <Header
          onVisitDomain={() => window.open(cmsData.settings.domain, '_blank')}
          onBuildAndDeploy={() => handleManualBuild(false)}
          onBuildLocally={() => handleManualBuild(true)}
          onToggleNotesSidebar={toggleNotesSidebar}
          isBuilding={cmsData.isBuilding}
          canBuild={cmsData.canBuild}
          domain={cmsData.settings.domain}
          vercelApiKey={cmsData.settings.vercelApiKey}
          buildCooldownSeconds={cmsData.buildCooldownSeconds}
          disableImport={cmsData.collabState.isConnected && !cmsData.collabState.isServer}
        />
        <main style={{ flexGrow: 1, position: 'relative', transition: 'margin-right 0.3s' }}>
          <SideMenu
            currentSection={getCurrentSection()}
            isBuilding={cmsData.isBuilding}
            lastSaved={cmsData.lastSaved}
            onBuildClick={handleManualBuild}
            canBuild={cmsData.canBuild}
            buildCooldownSeconds={cmsData.buildCooldownSeconds}
            domain={cmsData.settings.domain}
            vercelApiKey={cmsData.settings.vercelApiKey}
          />
          {isLoading ? <LoadingSkeleton /> : children}
        </main>
      </div>
      {extensions['notes-extension-enabled'] && toggleNotesSidebar && (
        <NotesSidebar isOpen={isNotesSidebarOpen} onClose={toggleNotesSidebar} />
      )}
      <style>{`
        @keyframes reconnect-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
