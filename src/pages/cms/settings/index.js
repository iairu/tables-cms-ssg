import React from 'react';
import SideMenu from '../../../components/SideMenu';
import useCMSData from '../../../hooks/useCMSData';
import { SettingsSection } from '../../../components/cms/sections';
import '../../../styles/cms.css';

const CMSSettingsPage = () => {
  const cmsData = useCMSData();

  const handleManualBuild = (localOnly = false) => {
    if (cmsData.manualTriggerBuild) {
      cmsData.manualTriggerBuild(localOnly);
    }
  };

  return (
    <div className="cms-container">
      <SideMenu
        currentSection="settings"
        isBuilding={cmsData.isBuilding}
        lastSaved={cmsData.lastSaved}
        onBuildClick={handleManualBuild}
        canBuild={cmsData.canBuild}
        buildCooldownSeconds={cmsData.buildCooldownSeconds}
        domain={cmsData.settings.domain}
        vercelApiKey={cmsData.settings.vercelApiKey}
      />
      <main>
        <SettingsSection cmsData={cmsData} />
      </main>
    </div>
  );
};

export default CMSSettingsPage;

export const Head = () => (
    <>
      <title>CMS - Settings</title>
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
