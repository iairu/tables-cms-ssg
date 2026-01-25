import React, { useEffect } from 'react';
import Header from './Header';
import SideMenu from './SideMenu';
import LoadingBar from './LoadingBar';
import LoadingSkeleton from './LoadingSkeleton';
import useCMSData from '../hooks/useCMSData';
import { useLoading } from '../context/LoadingContext';
import '../styles/cms.css';

const Layout = ({ children, location }) => {
  const cmsData = useCMSData();
  const { isLoading, showLoading, hideLoading } = useLoading();

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
    if (path.startsWith('/cms/inventory')) return 'rental-inventory';
    if (path.startsWith('/cms/attendance')) return 'rental-attendance';
    if (path.startsWith('/cms/customers')) return 'rental-customers';
    if (path.startsWith('/cms/employees')) return 'rental-employees';
    if (path.startsWith('/cms/reservations')) return 'rental-reservations';
    if (path.startsWith('/cms/calendar')) return 'rental-calendar';
    if (path.startsWith('/cms/settings')) return 'settings';
    if (path.startsWith('/cms/extensions')) return 'extensions';
    if (path.startsWith('/cms/uploads')) return 'uploads';
    return '';
  };

  return (
    <div className="cms-container">
      <LoadingBar />
      <Header
        onVisitDomain={() => window.open(cmsData.settings.domain, '_blank')}
        onBuildAndDeploy={() => handleManualBuild(false)}
        onBuildLocally={() => handleManualBuild(true)}
        isBuilding={cmsData.isBuilding}
        canBuild={cmsData.canBuild}
        domain={cmsData.settings.domain}
        vercelApiKey={cmsData.settings.vercelApiKey}
        buildCooldownSeconds={cmsData.buildCooldownSeconds}
      />
      <main>
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
  );
};

export default Layout;
