import { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from '../components/cms/utils';
import { io } from 'socket.io-client';

const useCMSData = () => {
  // Collaboration state
  const socketRef = useRef(null);
  const [collabState, setCollabState] = useState({
    isServer: false,
    isConnected: false,
    serverIP: '',
    clientName: 'Anonymous',
    activeLocks: [], // Array of { fieldId, clientName }
    connectedClients: [],
    socketId: null
  });
  // Build trigger state
  const buildTimeoutRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
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
    return fetch(`/api/build?t=${Date.now()}`)
      .then(res => res.json())
      .catch(err => {
        console.error('[useCMSData] Build status poll failed:', err);
        // Return a default object on error to avoid breaking the chain
        return { isBuildInProgress: isBuildingRef.current, lastBuildTime: null };
      });
  }, []);

  const startPolling = useCallback(() => {
    // Clear any existing poll timer
    if (pollIntervalRef.current) {
      clearTimeout(pollIntervalRef.current);
    }

    const poll = () => {
      pollBuildStatus().then(data => {
        console.log('[useCMSData] Build status response:', data);

        if (isBuildingRef.current) {
          if (!data.isBuildInProgress && data.lastBuildTime) {
            // Build complete
            console.log('[useCMSData] Build complete! Stopping polling.');
            setIsBuildingState(false);
            setLastSaved(data.lastBuildTime);

            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            setCanBuild(true);
            setBuildCooldownSeconds(0);

            if (pollIntervalRef.current) {
              clearTimeout(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          } else {
            // Build still in progress, poll again
            pollIntervalRef.current = setTimeout(poll, 3000);
          }
        } else {
          // Not supposed to be building, so stop polling
          if (pollIntervalRef.current) {
            clearTimeout(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      });
    };

    // Start the first poll immediately
    poll();
  }, [pollBuildStatus, setIsBuildingState]);

  // Trigger build function
  const triggerBuild = useCallback((localOnly = false) => {
    if (isBuildingRef.current) {
      console.log('[useCMSData] Build already in progress, skipping trigger');
      return;
    }

    setIsBuildingState(true);
    console.log('[useCMSData] Starting new build...', localOnly ? '(local only)' : '(build and deploy)');

    // ... (rest of the function is the same)
    const cmsData = {
      pages: JSON.parse(localStorage.getItem('pages') || '[]'),
      pageGroups: JSON.parse(localStorage.getItem('pageGroups') || '[]'),
      blogArticles: JSON.parse(localStorage.getItem('blogArticles') || '[]'),
      catRows: JSON.parse(localStorage.getItem('catRows') || '[]'),
      userRows: JSON.parse(localStorage.getItem('userRows') || '[]'),
      inventoryRows: JSON.parse(localStorage.getItem('inventoryRows') || '[]'),
      attendanceRows: JSON.parse(localStorage.getItem('attendanceRows') || '[]'),
      reservationRows: JSON.parse(localStorage.getItem('reservationRows') || '[]'),
      componentRows: JSON.parse(localStorage.getItem('componentRows') || '[]'),
      movieList: JSON.parse(localStorage.getItem('movieList') || '[]'),
      settings: JSON.parse(localStorage.getItem('settings') || '{"siteTitle":"TABLES","defaultLang":"en","theme":"light","vercelApiKey":"","languages":[{"code":"en","name":"English"}],"showBreadcrumbs":false}'),
      acl: JSON.parse(localStorage.getItem('acl') || '{}'),
      extensions: JSON.parse(localStorage.getItem('extensions') || '{}')
    };

    const vercelApiToken = cmsData.settings.vercelApiKey || '';
    const vercelProjectName = cmsData.settings.vercelProjectName || '';

    fetch('/api/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        trigger: 'cms-save',
        data: cmsData,
        localOnly: localOnly,
        vercelApiToken: vercelApiToken,
        vercelProjectName: vercelProjectName
      })
    })
      .then(res => {
        if (res.status === 409) {
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

        // Start polling for build status
        startPolling();
      })
      .catch(err => {
        console.error('[useCMSData] Build trigger failed:', err);
        setIsBuildingState(false);
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setCanBuild(true);
        setBuildCooldownSeconds(0);
      });
  }, [setIsBuildingState, startPolling]);

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
    countdownIntervalRef.current = setInterval(() => {
      setBuildCooldownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
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
        clearTimeout(pollIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);
  // Pages state
  const [pages, setPages] = useState([]);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [pageGroups, setPageGroups] = useState([]);

  // Blog state
  const [blogArticles, setBlogArticles] = useState([]);
  const [currentBlogArticleId, setCurrentBlogArticleId] = useState(null);

  // Cats state
  const [catRows, setCatRows] = useState([]);

  // Biometric state
  const [userRows, setUserRows] = useState([]);

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

  // Movie list state
  const [movieList, setMovieList] = useState([]);

  // Uploads state
  const [uploads, setUploads] = useState([]);

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
    'biometric-extension-enabled': false,
    'rental-extension-enabled': false,
    'medical-extension-enabled': false,
    'financial-extension-enabled': false,
    'legal-extension-enabled': false,
    'personal-extension-enabled': false
  });

  // Upload functions
  const fetchUploads = useCallback(async () => {
    try {
      const response = await fetch('/api/uploads');
      const data = await response.json();
      setUploads(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  }, []);

  const uploadFile = useCallback(async ({ fileData, fileName }) => {
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData, fileName }),
      });

      if (response.ok) {
        const newAsset = await response.json();
        fetchUploads(); // Refresh the list in the background
        return newAsset.url; // Return the new URL
      } else {
        console.error('Upload failed');
        return null;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }, [fetchUploads]);

  const deleteFile = useCallback(async (filename) => {
    try {
      const response = await fetch('/api/delete-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      if (response.ok) {
        fetchUploads(); // Refresh the list
      } else {
        console.error('Delete failed');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }, [fetchUploads]);

  const replaceFile = useCallback(async (oldFilename, { fileData, fileName }) => {
    try {
      // Now, upload the new file
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData, fileName: oldFilename }),
      });

      if (uploadResponse.ok) {
        fetchUploads(); // Refresh the list
      } else {
        console.error('Upload failed during replacement');
      }
    } catch (error) {
      console.error('Error replacing file:', error);
    }
  }, [fetchUploads]);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedPages = JSON.parse(localStorage.getItem('pages') || '[]');
    let loadedPageGroups = JSON.parse(localStorage.getItem('pageGroups') || 'null');

    if (!loadedPageGroups) {
      const homePage = loadedPages.find(p => p.slug === 'home');
      const otherPages = loadedPages.filter(p => p.slug !== 'home');

      loadedPageGroups = [
        {
          id: 'direct-pages',
          name: 'Direct Pages',
          pageIds: [homePage?.id, ...otherPages.map(p => p.id)].filter(Boolean)
        }
      ];
      localStorage.setItem('pageGroups', JSON.stringify(loadedPageGroups));
    }

    setPages(loadedPages);
    setPageGroups(loadedPageGroups);

    const loadedCurrentPageId = localStorage.getItem('currentPageId');
    const loadedBlogArticles = localStorage.getItem('blogArticles');
    const loadedCurrentBlogArticleId = localStorage.getItem('currentBlogArticleId');
    const loadedCatRows = localStorage.getItem('catRows');
    const loadedUserRows = localStorage.getItem('userRows');
    const loadedInventoryRows = localStorage.getItem('inventoryRows');
    const loadedCustomerRows = localStorage.getItem('customerRows');
    const loadedEmployeeRows = localStorage.getItem('employeeRows');
    const loadedAttendanceRows = localStorage.getItem('attendanceRows');
    const loadedReservationRows = localStorage.getItem('reservationRows');
    const loadedComponentRows = localStorage.getItem('componentRows');
    const loadedMovieList = localStorage.getItem('movieList');
    const loadedSettings = localStorage.getItem('settings');

    // Initialize default languages if not present
    if (loadedSettings) {
      try {
        const parsedSettings = JSON.parse(loadedSettings);
        if (!parsedSettings.languages) {
          parsedSettings.languages = [{ code: 'en', name: 'English' }];
          localStorage.setItem('settings', JSON.stringify(parsedSettings));
          setSettings(parsedSettings);
        } else {
          setSettings(parsedSettings);
        }
      } catch (e) {
        console.error('Error parsing settings:', e);
      }
    }
    const loadedAcl = localStorage.getItem('acl');
    const loadedExtensions = localStorage.getItem('extensions');

    if (loadedCurrentPageId) setCurrentPageId(JSON.parse(loadedCurrentPageId));
    if (loadedBlogArticles) setBlogArticles(JSON.parse(loadedBlogArticles));
    if (loadedCurrentBlogArticleId) setCurrentBlogArticleId(JSON.parse(loadedCurrentBlogArticleId));
    if (loadedCatRows) setCatRows(JSON.parse(loadedCatRows));
    if (loadedUserRows) setUserRows(JSON.parse(loadedUserRows));
    if (loadedInventoryRows) setInventoryRows(JSON.parse(loadedInventoryRows));
    if (loadedCustomerRows) setCustomerRows(JSON.parse(loadedCustomerRows));
    if (loadedEmployeeRows) setEmployeeRows(JSON.parse(loadedEmployeeRows));
    if (loadedAttendanceRows) setAttendanceRows(JSON.parse(loadedAttendanceRows));
    if (loadedReservationRows) setReservationRows(JSON.parse(loadedReservationRows));
    if (loadedComponentRows) setComponentRows(JSON.parse(loadedComponentRows));
    if (loadedMovieList) setMovieList(JSON.parse(loadedMovieList));
    if (loadedAcl) setAcl(JSON.parse(loadedAcl));
    if (loadedExtensions) setExtensions(JSON.parse(loadedExtensions));

    // Load build state
    const loadedBuildState = localStorage.getItem('buildState');
    if (loadedBuildState) {
      const { isBuilding, lastBuildTime, canBuild, buildCooldownSeconds } = JSON.parse(loadedBuildState);
      setIsBuildingState(isBuilding);
      lastBuildTimeRef.current = lastBuildTime;
      setCanBuild(canBuild);
      setBuildCooldownSeconds(buildCooldownSeconds);
      if (isBuilding) {
        startPolling();
      }
    }

    fetchUploads();
    // Mark data as loaded
    setIsDataLoaded(true);
  }, [fetchUploads, setIsBuildingState, startPolling]);

  // Collaboration Functions
  const startCollaborationServer = useCallback(async () => {
    if (!window.electron) return;
    try {
      const result = await window.electron.startServer(8081);
      if (result.status === 'started' || result.status === 'already-running') {
        console.log('Collaboration server started on', result.ip);

        // Connect to local server
        connectToCollaborationServer('http://localhost:8081', 'Host');

        setCollabState(prev => ({
          ...prev,
          isServer: true,
          serverIP: result.ip
        }));
      }
    } catch (err) {
      console.error('Failed to start collaboration server:', err);
    }
  }, []);

  const connectToCollaborationServer = useCallback((url, name) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(url);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to collaboration server');
      setCollabState(prev => ({ ...prev, isConnected: true, clientName: name, socketId: socket.id }));
      socket.emit('register-client', { name });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from collaboration server');
      setCollabState(prev => ({ ...prev, isConnected: false, socketId: null }));
    });

    socket.on('initial-state', ({ locks, clients }) => {
      setCollabState(prev => ({
        ...prev,
        activeLocks: locks.map(([fieldId, lock]) => ({ fieldId, ...lock })),
        connectedClients: clients
      }));
    });

    socket.on('client-joined', (client) => {
      setCollabState(prev => ({
        ...prev,
        connectedClients: [...prev.connectedClients, client]
      }));
    });

    socket.on('client-left', (socketId) => {
      setCollabState(prev => ({
        ...prev,
        connectedClients: prev.connectedClients.filter(c => c.id !== socketId)
      }));
    });

    socket.on('lock-update', ({ fieldId, status, clientName, socketId }) => {
      setCollabState(prev => {
        let newLocks = [...prev.activeLocks];
        if (status === 'locked') {
          // Remove existing lock for this field if any (shouldn't happen but safe)
          newLocks = newLocks.filter(l => l.fieldId !== fieldId);
          newLocks.push({ fieldId, clientName, socketId });
        } else {
          newLocks = newLocks.filter(l => l.fieldId !== fieldId);
        }
        return { ...prev, activeLocks: newLocks };
      });
    });

    socket.on('lock-granted', ({ fieldId }) => {
      console.log('Lock granted for:', fieldId);
    });

    socket.on('lock-denied', ({ fieldId, holder }) => {
      console.log('Lock denied for:', fieldId, 'held by', holder);
      alert(`Could not edit field. It is currently locked by ${holder}.`);
      // Optionally trigger a blur or other UI reaction here if possible
    });

    socket.on('data-update', (update) => {
      // Handle remote data updates
      // For now, we only support Settings updates as per request
      if (update.type === 'settings') {
        console.log('Received settings update:', update.data);
        // Verify this doesn't cause a loop - usually we guard updates
        // But for now, we just update the local state without saving to disk immediately if it's the server?
        // Actually, 'saveSettings' writes to localStorage and triggers build.
        // We need a way to 'quietly' update state without triggering another broadcast if we were the sender.
        // But here we are the receiver.
        setSettings(update.data);
        localStorage.setItem('settings', JSON.stringify(update.data));
      }
    });

  }, []);

  const disconnectCollaboration = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (collabState.isServer && window.electron) {
      window.electron.stopServer();
    }
    setCollabState(prev => ({
      ...prev,
      isConnected: false,
      isServer: false,
      activeLocks: [],
      connectedClients: [],
      socketId: null
    }));
  }, [collabState.isServer]);

  const requestLock = useCallback((fieldId) => {
    if (socketRef.current && collabState.isConnected) {
      socketRef.current.emit('request-lock', { fieldId, clientName: collabState.clientName });
    }
  }, [collabState.isConnected, collabState.clientName]);

  const releaseLock = useCallback((fieldId) => {
    if (socketRef.current && collabState.isConnected) {
      socketRef.current.emit('release-lock', { fieldId });
    }
  }, [collabState.isConnected]);

  const broadcastSettingsUpdate = useCallback((newSettings) => {
    if (socketRef.current && collabState.isConnected) {
      socketRef.current.emit('data-update', { type: 'settings', data: newSettings });
    }
  }, [collabState.isConnected]);

  // Save build state to localStorage
  useEffect(() => {
    const buildState = {
      isBuilding,
      lastBuildTime: lastBuildTimeRef.current,
      canBuild,
      buildCooldownSeconds,
    };
    localStorage.setItem('buildState', JSON.stringify(buildState));
  }, [isBuilding, canBuild, buildCooldownSeconds]);

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

  const savePageGroups = (newGroups) => {
    setPageGroups(newGroups);
    localStorage.setItem('pageGroups', JSON.stringify(newGroups));
    scheduleBuild();
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

  const saveUserRows = (rows) => {
    setUserRows(rows);
    localStorage.setItem('userRows', JSON.stringify(rows));
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

  const saveMovieList = (newList) => {
    setMovieList(newList);
    localStorage.setItem('movieList', JSON.stringify(newList));
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

    // Broadcast update if connected
    if (socketRef.current && collabState.isConnected) {
      // Debounce this? Or just send it. Settings updates are usually atomic.
      socketRef.current.emit('data-update', { type: 'settings', data: newSettings });
    }
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
      // { component: 'Slide', fields: { 'Slide heading': '', 'Slide content': '' } },
      // { component: 'Reviews', fields: { reviews: [{ 'Review logo': '', 'Review content': '', 'Review author': '' }] } }
    ];
  };

  const addPage = (settings, initialData = {}) => {
    const newId = initialData.id || Date.now().toString();

    const isHomepage = initialData.slug === 'home';
    const enTitle = isHomepage ? 'Homepage' : 'New Page';
    const skTitle = isHomepage ? 'Domovská stránka' : 'Nová stránka';

    const translations = {};
    if (settings && settings.languages) {
      settings.languages.forEach(lang => {
        let title;
        switch (lang.code) {
          case 'sk':
            title = skTitle;
            break;
          case 'en':
          default:
            title = enTitle;
            break;
        }
        translations[lang.code] = {
          title: title,
          slug: initialData.slug || `new-page-${newId}`,
          rows: defaultPageRows(),
        };
      });
    }

    const defaultLang = settings?.defaultLang || 'en';
    const defaultTitle = translations[defaultLang]?.title || enTitle;

    const newPage = {
      id: newId,
      title: defaultTitle,
      slug: initialData.slug || `new-page-${newId}`,
      rows: defaultPageRows(),
      history: [],
      lastEdited: Date.now(),
      includeInMenu: false,
      navigationDropdown: 'none', // none, header, footer
      themeVersion: 'auto', // auto, light, dark
      enforcedTheme: '', // empty string means use global theme
      metaDescription: '',
      buttonLinkColor: '',
      sitemapPriority: 0.5,
      ...initialData,
      translations: translations,
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
    const debouncedUpdateLastEdited = debounce((pageId) => {
      const currentPages = JSON.parse(localStorage.getItem('pages') || '[]');
      const updatedPages = currentPages.map(p =>
        p.id === pageId ? { ...p, lastEdited: Date.now() } : p
      );
      savePages(updatedPages);
    }, 2000);

    const updatedPages = pages.map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    savePages(updatedPages);

    if (!updates.hasOwnProperty('lastEdited')) {
      debouncedUpdateLastEdited(id);
    }
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
      highlighted: false,
      lastEdited: Date.now()
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
    const debouncedUpdateBlogLastEdited = debounce((articleId) => {
      const currentArticles = JSON.parse(localStorage.getItem('blogArticles') || '[]');
      const updatedArticles = currentArticles.map(a =>
        a.id === articleId ? { ...a, lastEdited: Date.now() } : a
      );
      saveBlogArticles(updatedArticles);
    }, 2000);

    const updatedArticles = blogArticles.map(a =>
      a.id === id ? { ...a, ...updates } : a
    );
    saveBlogArticles(updatedArticles);

    if (!updates.hasOwnProperty('lastEdited')) {
      debouncedUpdateBlogLastEdited(id);
    }
  };

  return {
    // Pages
    pages,
    currentPageId,
    pageGroups,
    savePages,
    saveCurrentPageId,
    savePageGroups,
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

    // Biometric
    userRows,
    saveUserRows,

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
    saveReservationRows,

    // Movie List
    movieList,
    saveMovieList,

    // Uploads
    uploads,
    fetchUploads,
    uploadFile,
    deleteFile,
    replaceFile,

    // Collaboration
    collabState,
    startCollaborationServer,
    connectToCollaborationServer,
    disconnectCollaboration,
    requestLock,
    releaseLock
  };
};

export default useCMSData;