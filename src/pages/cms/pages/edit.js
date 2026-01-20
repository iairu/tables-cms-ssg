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
    if (!cmsData.isDataLoaded) {
      // Wait for data to load before running matching logic
      return;
    }
    // Complex logging for debugging
    console.group("[CMSPagesEditPage] Edit endpoint debug");
    console.log("Location search:", location.search);
    console.log("cmsData.isDataLoaded:", cmsData.isDataLoaded);
    console.log("cmsData.pages:", cmsData.pages);

    // Log each page object and its keys for debugging
    if (Array.isArray(cmsData.pages)) {
      cmsData.pages.forEach((p, idx) => {
        console.log(`[Page ${idx}]`, p);
        console.log(`[Page ${idx} keys]`, Object.keys(p));
      });
    }

    try {
      const params = new URLSearchParams(location.search);
      const slug = params.get('slug');
      console.log("Extracted slug:", slug);

      let page = undefined;
      if (slug && Array.isArray(cmsData.pages)) {
        const normalizedSlug = decodeURIComponent((slug || '').trim().toLowerCase());

        // Try matching by direct slug
        page = cmsData.pages.find(p =>
          decodeURIComponent((p.slug || '').trim().toLowerCase()) === normalizedSlug
        );

        // If not found, try alternate keys or nested structures
        if (!page) {
          page = cmsData.pages.find(p =>
            p.page?.slug && decodeURIComponent((p.page.slug || '').trim().toLowerCase()) === normalizedSlug
          );
        }
        if (!page) {
          page = cmsData.pages.find(p =>
            p.fields?.slug && decodeURIComponent((p.fields.slug || '').trim().toLowerCase()) === normalizedSlug
          );
        }
        if (!page) {
          page = cmsData.pages.find(p =>
            p.id && decodeURIComponent((p.id || '').trim().toLowerCase()) === normalizedSlug
          );
        }
      }

      console.log("Matched page:", page);

      if (slug) {
        if (page) {
          console.log("Saving current page ID:", page.id);
          cmsData.saveCurrentPageId(page.id);
        } else {
          console.warn("No page found for slug:", slug, "Redirecting to /cms/pages");
          navigate('/cms/pages');
        }
      } else {
        console.warn("No slug found in query params. Redirecting to /cms/pages");
        navigate('/cms/pages');
      }
    } catch (err) {
      console.error("Error in edit endpoint useEffect:", err);
    }
    console.groupEnd();
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
