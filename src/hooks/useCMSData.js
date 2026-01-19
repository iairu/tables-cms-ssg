import { useState, useEffect, useRef, useCallback } from 'react';

const useCMSData = () => {
  // Build trigger state
  const buildTimeoutRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const isBuildingRef = useRef(false);
  const lastBuildTimeRef = useRef(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [canBuild, setCanBuild] = useState(true);
  const [buildCooldownSeconds, setBuildCooldownSeconds] = useState(0);

  // Helper to update building state
  const setIsBuildingState = useCallback((value) => {
    isBuildingRef.current = value;
    setIsBuilding(value);
  }, []);

  // Poll build status
  const pollBuildStatus = useCallback(() => {
    console.log('[useCMSData] Polling build status...');
    fetch('/api/build')
      .then(res => res.json())
      .then(data => {
        console.log('[useCMSData] Build status response:', data);
        
        // Check if we're currently building (based on our local state)
        if (isBuildingRef.current) {
          // We think we're building, check server status
          if (!data.isBuildInProgress && data.lastBuildTime) {
            // Build is complete
            console.log('[useCMSData] Build complete! Stopping polling. Last build time:', data.lastBuildTime);
            setIsBuildingState(false);
            setLastSaved(data.lastBuildTime);
            
            // Clear polling interval
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          } else if (data.isBuildInProgress) {
            // Build still in progress
            console.log('[useCMSData] Build still in progress, will poll again...');
          } else {
            // Unclear state - stop polling to be safe
            console.log('[useCMSData] Unclear build state, stopping polling');
            setIsBuildingState(false);
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }
        } else {
          // We're not building according to our state, stop polling
          console.log('[useCMSData] Not building locally, stopping polling');
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      })
      .catch(err => {
        console.error('[useCMSData] Build status poll failed:', err);
        // On error, DON'T stop polling immediately - the build might still be running
        // Just log the error and let the next poll attempt continue
      });
  }, [setIsBuildingState]);

  // Trigger build function
  const triggerBuild = useCallback((localOnly = false) => {
    // Don't trigger if already building (check ref for current state)
    if (isBuildingRef.current) {
      console.log('[useCMSData] Build already in progress, skipping trigger');
      return;
    }
    
    setIsBuildingState(true);
    console.log('[useCMSData] Starting new build...', localOnly ? '(local only)' : '(build and deploy)');
    
    // Collect all localStorage data
    const cmsData = {
      pages: JSON.parse(localStorage.getItem('pages') || '[]'),
      blogArticles: JSON.parse(localStorage.getItem('blogArticles') || '[]'),
      catRows: JSON.parse(localStorage.getItem('catRows') || '[]'),
      inventoryRows: JSON.parse(localStorage.getItem('inventoryRows') || '[]'),
      attendanceRows: JSON.parse(localStorage.getItem('attendanceRows') || '[]'),
      reservationRows: JSON.parse(localStorage.getItem('reservationRows') || '[]'),
      componentRows: JSON.parse(localStorage.getItem('componentRows') || '[]'),
      settings: JSON.parse(localStorage.getItem('settings') || '{"siteTitle":"TABLES","defaultLang":"en","theme":"light","vercelApiKey":"","languages":[{"code":"en","name":"English"}],"showBreadcrumbs":false}'),
      acl: JSON.parse(localStorage.getItem('acl') || '{}'),
      extensions: JSON.parse(localStorage.getItem('extensions') || '{}')
    };
    
    // Get Vercel API token from settings
    const vercelApiToken = cmsData.settings.vercelApiKey || '';
    
    // Trigger Gatsby build with data
    fetch('/api/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        trigger: 'cms-save',
        data: cmsData,
        localOnly: localOnly,
        vercelApiToken: vercelApiToken
      })
    })
    .then(res => {
      if (res.status === 409) {
        // Build already in progress
        console.log('[useCMSData] Build already in progress on server');
        return res.json();
      }
      if (!res.ok) {
        throw new Error(`Build trigger failed with status ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('[useCMSData] Build trigger response:', data);
      
      if (data.status === 'conflict') {
        // Build already in progress, just start polling
        console.log('[useCMSData] Conflict detected, starting polling for existing build...');
      }
      
      // Start polling for build status every 3 seconds (less aggressive)
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      console.log('[useCMSData] Starting build status polling every 3 seconds...');
      pollIntervalRef.current = setInterval(pollBuildStatus, 3000);
      
      // Poll once after 1 second to check initial status
      setTimeout(pollBuildStatus, 1000);
    })
    .catch(err => {
      console.error('[useCMSData] Build trigger failed:', err);
      setIsBuildingState(false);
    });
  }, [pollBuildStatus, setIsBuildingState]);

  // Manual trigger function (exposed to components)
  const manualTriggerBuild = useCallback((localOnly = false) => {
    // Check if we're in cooldown period (5 seconds for local, 2 minutes for deploy)
    const cooldownSeconds = localOnly ? 5 : 120;
    const cooldownMs = cooldownSeconds * 1000;
    
    if (lastBuildTimeRef.current) {
      const timeSinceLastBuild = Date.now() - lastBuildTimeRef.current;
      
      // if (timeSinceLastBuild < cooldownMs) {
      //   console.log('[useCMSData] Build on cooldown, please wait');
      //   return;
      // }
    }
    
    console.log('[useCMSData] Manual build triggered', localOnly ? '(local only)' : '(build and deploy)');
    lastBuildTimeRef.current = Date.now();
    setCanBuild(false);
    setBuildCooldownSeconds(cooldownSeconds);
    
    // Start countdown timer
    const countdownInterval = setInterval(() => {
      setBuildCooldownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setCanBuild(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    triggerBuild(localOnly);
  }, [triggerBuild]);

  // Schedule build 3 seconds after save (DISABLED FOR NOW)
  const scheduleBuild = useCallback(() => {
    // Automatic builds disabled - do nothing
    console.log('[useCMSData] Automatic builds disabled, skipping schedule');
    return;
    
    /* DISABLED CODE:
    // Don't schedule if already building (check ref for current state)
    if (isBuildingRef.current) {
      console.log('[useCMSData] Build already in progress, not scheduling new build');
      return;
    }
    
    if (buildTimeoutRef.current) {
      clearTimeout(buildTimeoutRef.current);
    }
    
    console.log('[useCMSData] Build scheduled for 3 seconds from now');
    buildTimeoutRef.current = setTimeout(() => {
      triggerBuild();
    }, 3000);
    */
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (buildTimeoutRef.current) {
        clearTimeout(buildTimeoutRef.current);
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);
  // Pages state
  const [pages, setPages] = useState([]);
  const [currentPageId, setCurrentPageId] = useState(null);

  // Blog state
  const [blogArticles, setBlogArticles] = useState([]);
  const [currentBlogArticleId, setCurrentBlogArticleId] = useState(null);

  // Cats state
  const [catRows, setCatRows] = useState([]);

  // Components state
  const [componentRows, setComponentRows] = useState([]);

  // Inventory state
  const [inventoryRows, setInventoryRows] = useState([]);

  // Contacts state
  const [customerRows, setCustomerRows] = useState([]);

  // Employees state
  const [employeeRows, setEmployeeRows] = useState([]);

  // Attendance state
  const [attendanceRows, setAttendanceRows] = useState([]);

  // Reservation state
  const [reservationRows, setReservationRows] = useState([]);

  // Settings state
  const [settings, setSettings] = useState({
    siteTitle: '',
    defaultLang: '',
    theme: 'light',
    vercelApiKey: '',
    showBreadcrumbs: false
  });

  // Data loaded state
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // ACL state
  const [acl, setAcl] = useState({
    'acl-page-allowed': false,
    'acl-admin': false,
    'acl-blog-allowed': false,
    'acl-cat-allowed': false,
    'acl-admin-allowed': false
  });

  // Extensions state
  const [extensions, setExtensions] = useState({
    'pages-extension-enabled': false,
    'blog-extension-enabled': false,
    'pedigree-extension-enabled': false,
    'rental-extension-enabled': false
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedPages = localStorage.getItem('pages');
    const loadedCurrentPageId = localStorage.getItem('currentPageId');
    const loadedBlogArticles = localStorage.getItem('blogArticles');
    const loadedCurrentBlogArticleId = localStorage.getItem('currentBlogArticleId');
    const loadedCatRows = localStorage.getItem('catRows');
    const loadedInventoryRows = localStorage.getItem('inventoryRows');
    const loadedCustomerRows = localStorage.getItem('customerRows');
    const loadedEmployeeRows = localStorage.getItem('employeeRows');
    const loadedAttendanceRows = localStorage.getItem('attendanceRows');
    const loadedReservationRows = localStorage.getItem('reservationRows');
    const loadedComponentRows = localStorage.getItem('componentRows');
    const loadedSettings = localStorage.getItem('settings');
    
    // Initialize default languages if not present
    if (loadedSettings) {
      try {
        const parsedSettings = JSON.parse(loadedSettings);
        if (!parsedSettings.languages) {
          parsedSettings.languages = [{ code: 'en', name: 'English' }];
          localStorage.setItem('settings', JSON.stringify(parsedSettings));
          setSettings(parsedSettings);
        }
      } catch (e) {
        console.error('Error parsing settings:', e);
      }
    }
    const loadedAcl = localStorage.getItem('acl');
    const loadedExtensions = localStorage.getItem('extensions');

    if (loadedPages) setPages(JSON.parse(loadedPages));
    if (loadedCurrentPageId) setCurrentPageId(JSON.parse(loadedCurrentPageId));
    if (loadedBlogArticles) setBlogArticles(JSON.parse(loadedBlogArticles));
    if (loadedCurrentBlogArticleId) setCurrentBlogArticleId(JSON.parse(loadedCurrentBlogArticleId));
    if (loadedCatRows) setCatRows(JSON.parse(loadedCatRows));
    if (loadedInventoryRows) setInventoryRows(JSON.parse(loadedInventoryRows));
    if (loadedCustomerRows) setCustomerRows(JSON.parse(loadedCustomerRows));
    if (loadedEmployeeRows) setEmployeeRows(JSON.parse(loadedEmployeeRows));
    if (loadedAttendanceRows) setAttendanceRows(JSON.parse(loadedAttendanceRows));
    if (loadedReservationRows) setReservationRows(JSON.parse(loadedReservationRows));
    if (loadedComponentRows) setComponentRows(JSON.parse(loadedComponentRows));
    if (loadedSettings) setSettings(JSON.parse(loadedSettings));
    if (loadedAcl) setAcl(JSON.parse(loadedAcl));
    if (loadedExtensions) setExtensions(JSON.parse(loadedExtensions));
    
    // Mark data as loaded
    setIsDataLoaded(true);
  }, []);

  // Save functions
  const savePages = (newPages) => {
    setPages(newPages);
    localStorage.setItem('pages', JSON.stringify(newPages));
    scheduleBuild();
  };

  const saveCurrentPageId = (id) => {
    setCurrentPageId(id);
    localStorage.setItem('currentPageId', JSON.stringify(id));
  };

  const saveBlogArticles = (articles) => {
    setBlogArticles(articles);
    localStorage.setItem('blogArticles', JSON.stringify(articles));
    scheduleBuild();
  };

  const saveCurrentBlogArticleId = (id) => {
    setCurrentBlogArticleId(id);
    localStorage.setItem('currentBlogArticleId', JSON.stringify(id));
  };

  const saveCatRows = (rows) => {
    setCatRows(rows);
    localStorage.setItem('catRows', JSON.stringify(rows));
    scheduleBuild();
  };

  const saveInventoryRows = (newRows) => {
    setInventoryRows(newRows);
    localStorage.setItem('inventoryRows', JSON.stringify(newRows));
  };

  const saveCustomerRows = (newRows) => {
    setCustomerRows(newRows);
    localStorage.setItem('customerRows', JSON.stringify(newRows));
  };

  const saveEmployeeRows = (newRows) => {
    setEmployeeRows(newRows);
    localStorage.setItem('employeeRows', JSON.stringify(newRows));
  };

  const saveAttendanceRows = (newRows) => {
    setAttendanceRows(newRows);
    localStorage.setItem('attendanceRows', JSON.stringify(newRows));
  };

  const saveReservationRows = (newRows) => {
    setReservationRows(newRows);
    localStorage.setItem('reservationRows', JSON.stringify(newRows));
  };

  const saveComponentRows = (rows) => {
    setComponentRows(rows);
    localStorage.setItem('componentRows', JSON.stringify(rows));
    scheduleBuild();
  };

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('settings', JSON.stringify(newSettings));
    scheduleBuild();
  };

  const saveAcl = (newAcl) => {
    setAcl(newAcl);
    localStorage.setItem('acl', JSON.stringify(newAcl));
    scheduleBuild();
  };

  const saveExtensions = (newExtensions) => {
    setExtensions(newExtensions);
    localStorage.setItem('extensions', JSON.stringify(newExtensions));
    scheduleBuild();
  };

  // Helper functions
  const defaultPageRows = () => {
    return [
      { component: 'Slide', fields: { 'Slide heading': '', 'Slide content': '' } },
      { component: 'Reviews', fields: { reviews: [{ 'Review logo': '', 'Review content': '', 'Review author': '' }] } }
    ];
  };

  const addPage = (initialData = {}) => {
    const newId = initialData.id || Date.now().toString();
    const newPage = {
      id: newId,
      title: 'New Page',
      slug: 'new-page-' + newId,
      rows: defaultPageRows(),
      history: [],
      lastPublished: null,
      includeInMenu: false,
      navigationDropdown: 'none', // none, header, footer
      themeVersion: 'auto', // auto, light, dark
      enforcedTheme: '', // empty string means use global theme
      metaDescription: '',
      buttonLinkColor: '',
      sitemapPriority: 0.5,
      ...initialData
    };
    const updatedPages = [...pages, newPage];
    savePages(updatedPages);
    return newId;
  };

  const deletePage = (id) => {
    const updatedPages = pages.filter(p => p.id !== id);
    savePages(updatedPages);
    if (currentPageId === id) {
      saveCurrentPageId(null);
    }
  };

  const updatePage = (id, updates) => {
    const updatedPages = pages.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    savePages(updatedPages);
  };

  const addBlogArticle = () => {
    const newId = Date.now().toString();
    const now = new Date();
    const newArticle = {
      id: newId,
      title: 'New Article',
      content: '',
      author: '',
      date: now.toISOString(),
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      slug: 'new-article-' + newId,
      history: [],
      category: '',
      tags: '',
      highlighted: false
    };
    const updatedArticles = [...blogArticles, newArticle];
    saveBlogArticles(updatedArticles);
    return newId;
  };

  const deleteBlogArticle = (id) => {
    const updatedArticles = blogArticles.filter(a => a.id !== id);
    saveBlogArticles(updatedArticles);
    if (currentBlogArticleId === id) {
      saveCurrentBlogArticleId(null);
    }
  };

  const updateBlogArticle = (id, updates) => {
    const updatedArticles = blogArticles.map(a => 
      a.id === id ? { ...a, ...updates } : a
    );
    saveBlogArticles(updatedArticles);
  };

  return {
    // Pages
    pages,
    currentPageId,
    savePages,
    saveCurrentPageId,
    addPage,
    deletePage,
    updatePage,
    defaultPageRows,
    
    // Blog
    blogArticles,
    currentBlogArticleId,
    saveBlogArticles,
    saveCurrentBlogArticleId,
    addBlogArticle,
    deleteBlogArticle,
    updateBlogArticle,
    
    // Cats
    catRows,
    saveCatRows,
    
    // Components
    componentRows,
    saveComponentRows,
    
    // Settings
    settings,
    saveSettings,
    
    // ACL
    acl,
    saveAcl,
    
    // Extensions
    extensions,
    saveExtensions,
    
    // Build status
    isBuilding,
    lastSaved,
    manualTriggerBuild,
    canBuild,
    buildCooldownSeconds,
    
    // Data loaded flag
    isDataLoaded,
    
    // Rental
    inventoryRows,
    saveInventoryRows,
    customerRows,
    saveCustomerRows,
    employeeRows,
    saveEmployeeRows,
    attendanceRows,
    saveAttendanceRows,
    reservationRows,
    saveReservationRows
  };
};

export default useCMSData;