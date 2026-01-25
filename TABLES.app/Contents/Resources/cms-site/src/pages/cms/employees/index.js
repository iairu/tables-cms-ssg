import React from 'react';
import useCMSData from '../../../hooks/useCMSData';
import { RentalEmployeesSection } from '../../../components/cms/sections';
import '../../../styles/cms.css';

const CMSEmployeesPage = () => {
  const cmsData = useCMSData();

  return <RentalEmployeesSection cmsData={cmsData} />;
};

export default CMSEmployeesPage;

export const Head = () => (
    <>
      <title>CMS - Employees</title>
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
