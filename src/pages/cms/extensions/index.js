import React from 'react';
import SideMenu from '../../../components/SideMenu';
import useCMSData from '../../../hooks/useCMSData';
import { ExtensionsSection } from '../../../components/cms/sections';
import '../../../styles/cms.css';

const CMSExtensionsPage = () => {
  const cmsData = useCMSData();

  const handleManualBuild = (localOnly = false) => {
    if (cmsData.manualTriggerBuild) {
      cmsData.manualTriggerBuild(localOnly);
    }
  };

  return (
    <div className="cms-container">
      <SideMenu
        currentSection="extensions"
        isBuilding={cmsData.isBuilding}
        lastSaved={cmsData.lastSaved}
        onBuildClick={handleManualBuild}
        canBuild={cmsData.canBuild}
        buildCooldownSeconds={cmsData.buildCooldownSeconds}
        domain={cmsData.settings.domain}
        vercelApiKey={cmsData.settings.vercelApiKey}
      />
      <main>
        <ExtensionsSection cmsData={cmsData} />
      </main>
    </div>
  );
};

export default CMSExtensionsPage;

export const Head = () => (
    <>
      <title>CMS - Extensions</title>
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
