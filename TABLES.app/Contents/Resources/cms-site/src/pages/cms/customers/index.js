import React from 'react';
import { useCMSData } from '../../../context/CMSContext';
import { RentalCustomersSection } from '../../../components/cms/sections';
import '../../../styles/cms.css';

const CMSCustomersPage = () => {
  const cmsData = useCMSData();

  return <RentalCustomersSection cmsData={cmsData} />;
};

export default CMSCustomersPage;

export const Head = () => (
  <>
    <title>CMS - Customers</title>
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
