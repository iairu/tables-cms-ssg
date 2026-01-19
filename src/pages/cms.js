import React, { useState, useEffect } from 'react';
import SideMenu from '../components/SideMenu';
import useCMSData from '../hooks/useCMSData';
import ComponentEditor from '../components/cms/ComponentEditor';
import { fuzzyMatch } from '../components/cms/utils';
import '../styles/cms.css';
import {
  PagesSection,
  BlogSection,
  CatsSection,
  ACLSection,
  SettingsSection,
  ExtensionsSection,
  RentalInventorySection,
  RentalAttendanceSection,
  RentalCustomersSection,
  RentalEmployeesSection,
  RentalReservationsSection,
  RentalCalendarSection
} from '../components/cms/sections';

const CMSPage = () => {
  const [currentSection, setCurrentSection] = useState('pages');
  const [disableFurtherNavigation, setDisableFurtherNavigation] = useState(false);
  const [hasRunInitialNavigation, setHasRunInitialNavigation] = useState(false);
  const cmsData = useCMSData();

  // Navigation logic on mount - only runs once when data is loaded
  useEffect(() => {
    if (typeof window === 'undefined' || hasRunInitialNavigation || !cmsData.isDataLoaded) {
      return;
    }

    // Mark that we've run the initial navigation check
    setHasRunInitialNavigation(true);

    // Check settings first - if siteTitle or vercelApiKey is empty, navigate to settings
    if (!cmsData.settings.siteTitle || cmsData.settings.siteTitle === '' ||
        !cmsData.settings.vercelApiKey || cmsData.settings.vercelApiKey === '') {
      setCurrentSection('settings');
      setDisableFurtherNavigation(true);
      return;
    }

    // Check if any extension is enabled
    const extensions = cmsData.extensions;
    const hasEnabledExtension =
      extensions['pages-extension-enabled'] ||
      extensions['blog-extension-enabled'] ||
      extensions['pedigree-extension-enabled'] ||
      extensions['rental-extension-enabled'];

    if (!hasEnabledExtension) {
      // No extensions enabled, navigate to extensions page
      setCurrentSection('extensions');
      setDisableFurtherNavigation(true);
      return;
    }

    // Navigate to first enabled extension
    if (extensions['pages-extension-enabled']) {
      setCurrentSection('pages');
    } else if (extensions['blog-extension-enabled']) {
      setCurrentSection('blog');
    } else if (extensions['pedigree-extension-enabled']) {
      setCurrentSection('cats');
    } else if (extensions['rental-extension-enabled']) {
      setCurrentSection('rental-inventory');
    }
  }, [cmsData.isDataLoaded, hasRunInitialNavigation, cmsData.settings.siteTitle, cmsData.settings.vercelApiKey, cmsData.extensions]);

  if (typeof window === 'undefined') {
    return null;
  }

  const handleSectionChange = (sectionId) => {
    setCurrentSection(sectionId);
  };

  const handleManualBuild = (localOnly = false) => {
    if (cmsData.manualTriggerBuild) {
      cmsData.manualTriggerBuild(localOnly);
    }
  };

  return (
    <div className="cms-container">
      <SideMenu
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        isBuilding={cmsData.isBuilding}
        lastSaved={cmsData.lastSaved}
        onBuildClick={handleManualBuild}
        canBuild={cmsData.canBuild}
        buildCooldownSeconds={cmsData.buildCooldownSeconds}
        domain={cmsData.settings.domain}
        vercelApiKey={cmsData.settings.vercelApiKey}
      />
      <main>

        {currentSection === 'pages' && <PagesSection cmsData={cmsData} />}
        {currentSection === 'blog' && <BlogSection cmsData={cmsData} />}
        {currentSection === 'cats' && <CatsSection cmsData={cmsData} />}
        {currentSection === 'settings' && <SettingsSection cmsData={cmsData} />}
        {currentSection === 'acl' && <ACLSection cmsData={cmsData} />}
        {currentSection === 'extensions' && <ExtensionsSection cmsData={cmsData} />}
        {currentSection === 'rental-inventory' && <RentalInventorySection cmsData={cmsData} />}
        {currentSection === 'rental-attendance' && <RentalAttendanceSection cmsData={cmsData} />}
        {currentSection === 'rental-customers' && <RentalCustomersSection cmsData={cmsData} />}
        {currentSection === 'rental-employees' && <RentalEmployeesSection cmsData={cmsData} />}
        {currentSection === 'rental-reservations' && <RentalReservationsSection cmsData={cmsData} />}
        {currentSection === 'rental-calendar' && <RentalCalendarSection cmsData={cmsData} />}
      </main>
    </div>
  );
};

export default CMSPage;

export const Head = () => (
  <>
    <title>CMS - TABLES</title>
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
