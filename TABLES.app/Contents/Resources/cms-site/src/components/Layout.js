import React, { useEffect, useState } from 'react';
import Header from './Header';
import SideMenu from './SideMenu';
import LoadingBar from './LoadingBar';
import LoadingSkeleton from './LoadingSkeleton';
import useCMSData from '../hooks/useCMSData';
import { useLoading } from '../context/LoadingContext';
import NotesSidebar from './NotesSidebar';
import '../styles/cms.css';

const getExtensionsFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('extensions') || '{}');
  } catch (e) {
    return {};
  }
};

const Layout = ({ children, location }) => {
  const cmsData = useCMSData();
  const { isLoading, showLoading, hideLoading } = useLoading();
  const [isNotesSidebarOpen, setNotesSidebarOpen] = useState(false);
  const [extensions, setExtensions] = useState(getExtensionsFromStorage());

  useEffect(() => {
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
    </div>
  );
};

export default Layout;
