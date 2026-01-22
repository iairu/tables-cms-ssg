import React from 'react';
import UserAssetManager from '../../../components/cms/UserAssetManager';
import SideMenu from '../../../components/SideMenu';
import Header from '../../../components/Header';
import useCMSData from '../../../hooks/useCMSData';
import '../../../styles/cms.css';

const UploadsPage = () => {
  const cmsData = useCMSData();

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
          currentSection="uploads"
          isBuilding={cmsData.isBuilding}
          lastSaved={cmsData.lastSaved}
          onBuildClick={handleManualBuild}
          canBuild={cmsData.canBuild}
          buildCooldownSeconds={cmsData.buildCooldownSeconds}
          domain={cmsData.settings.domain}
          vercelApiKey={cmsData.settings.vercelApiKey}
        />
        <UserAssetManager
          assets={cmsData.uploads}
          onPageLoad={cmsData.fetchUploads}
          onUpload={cmsData.uploadFile}
          onDelete={cmsData.deleteFile}
          onReplace={cmsData.replaceFile}
        />
      </main>
    </div>
  );
};

export default UploadsPage;
