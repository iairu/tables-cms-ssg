import React from 'react';
import UserAssetManager from '../../../components/cms/UserAssetManager';
import useCMSData from '../../../hooks/useCMSData';
import '../../../styles/cms.css';

const UploadsPage = () => {
  const cmsData = useCMSData();

  return (
    <UserAssetManager
      assets={cmsData.uploads}
      onPageLoad={cmsData.fetchUploads}
      onUpload={cmsData.uploadFile}
      onDelete={cmsData.deleteFile}
      onReplace={cmsData.replaceFile}
    />
  );
};

export default UploadsPage;

export const Head = () => (
  <>
    <title>CMS - Uploads</title>
    <meta name="description" content="TABLES Content Management System - Uploads" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    {/* FontAwesome CDN */}
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  </>
);
