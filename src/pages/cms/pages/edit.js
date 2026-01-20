import React, { useEffect } from 'react';
import { useLocation } from '@reach/router';
import Header from '../../../components/Header';
import SideMenu from '../../../components/SideMenu';
import useCMSData from '../../../hooks/useCMSData';
import { PagesSection } from '../../../components/cms/sections';
import '../../../styles/cms.css';
import { navigate } from 'gatsby';

const CMSPagesEditPage = () => {
  const cmsData = useCMSData();
  const location = useLocation();

  useEffect(() => {
    if (cmsData.isDataLoaded) {
      const params = new URLSearchParams(location.search);
      const slug = params.get('slug');
      if (slug) {
        const page = cmsData.pages.find(p => p.slug === slug);
        if (page) {
          cmsData.saveCurrentPageId(page.id);
        } else {
            navigate('/cms/pages');
        }
      } else {
        navigate('/cms/pages');
      }
    }
  }, [cmsData.isDataLoaded, location.search, cmsData.pages, cmsData.saveCurrentPageId, cmsData]);

  const handleManualBuild = (localOnly = false) => {
    if (cmsData.manualTriggerBuild) {
      cmsData.manualTriggerBuild(localOnly);
    }
  };

  return (
    <div className="cms-container">
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
          currentSection="pages"
          isBuilding={cmsData.isBuilding}
          lastSaved={cmsData.lastSaved}
          onBuildClick={handleManualBuild}
          canBuild={cmsData.canBuild}
          buildCooldownSeconds={cmsData.buildCooldownSeconds}
          domain={cmsData.settings.domain}
          vercelApiKey={cmsData.settings.vercelApiKey}
        />
        <PagesSection cmsData={cmsData} edit={true} />
      </main>
    </div>
  );
};

export default CMSPagesEditPage;

export const Head = () => (
    <>
      <title>CMS - Edit Page</title>
      <meta name="description" content="TABLES Content Management System" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      {/* FontAwesome CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    </>
  );
