import React, { useEffect } from 'react';
import { useLocation } from '@reach/router';
import SideMenu from '../../../components/SideMenu';
import useCMSData from '../../../hooks/useCMSData';
import { BlogSection } from '../../../components/cms/sections';
import '../../../styles/cms.css';
import Header from '../../../components/Header';
import { navigate } from 'gatsby';

const CMSBlogEditPage = () => {
  const cmsData = useCMSData();
  const location = useLocation();

  useEffect(() => {
    console.group('[CMSBlogEditPage] Edit Endpoint Debug');
    console.log('isDataLoaded:', cmsData.isDataLoaded);
    console.log('location.search:', location.search);
    console.log('cmsData.blogArticles:', cmsData.blogArticles);
    console.log('cmsData:', cmsData);
    if (cmsData.isDataLoaded) {
      const params = new URLSearchParams(location.search);
      const id = params.get('id');
      console.log('Extracted id:', id);
      if (id) {
        const article = cmsData.blogArticles.find(a => String(a.id) === String(id));
        console.log('Matched article:', article);
        if (article) {
          console.log('Saving current blog article ID:', article.id);
          cmsData.saveCurrentBlogArticleId(article.id);
        } else {
          console.warn('No article found for id:', id, 'Redirecting to /cms/blog');
          navigate('/cms/blog');
        }
      } else {
        console.warn('No id provided in query params. Redirecting to /cms/blog');
        navigate('/cms/blog');
      }
    }
    console.groupEnd();
  }, [cmsData.isDataLoaded, location.search, cmsData.blogArticles, cmsData.saveCurrentBlogArticleId, cmsData]);

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
          currentSection="blog"
          isBuilding={cmsData.isBuilding}
          lastSaved={cmsData.lastSaved}
          onBuildClick={handleManualBuild}
          canBuild={cmsData.canBuild}
          buildCooldownSeconds={cmsData.buildCooldownSeconds}
          domain={cmsData.settings.domain}
          vercelApiKey={cmsData.settings.vercelApiKey}
        />
        <BlogSection cmsData={cmsData} edit={true} />
      </main>
    </div>
  );
};

export default CMSBlogEditPage;

export const Head = () => (
    <>
      <title>CMS - Edit Article</title>
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
