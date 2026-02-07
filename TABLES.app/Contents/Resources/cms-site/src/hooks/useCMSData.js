import { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from '../components/cms/utils';
import { io } from 'socket.io-client';

const useCMSData = () => {
  // Collaboration state
  const socketRef = useRef(null);
  const [collabState, setCollabState] = useState({
    isServer: false,
    isConnected: false,
    status: 'disconnected', // disconnected, connecting, connected, error
    error: null,
    serverIP: '',
    clientName: 'Anonymous',
    activeLocks: [], // Array of { fieldId, clientName }
    connectedClients: [],
    socketId: null,
    socketId: null,
    discoveredServers: [], // Array of { ip, port, name, id }
    availableInterfaces: [], // Array of { name, ip, family }
    recentConnections: [] // Array of { ip, port, name, lastConnected, isFavorite }
  });

  // Load recent connections from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentConnections');
      if (saved) {
        setCollabState(prev => ({ ...prev, recentConnections: JSON.parse(saved) }));
      }
    } catch (e) {
      console.error('Failed to load recent connections:', e);
    }
  }, []);

  const saveConnectionProfile = useCallback((ip, port, name) => {
    setCollabState(prev => {
      const current = prev.recentConnections || [];
      const existingIndex = current.findIndex(c => c.ip === ip && c.port === port);

      let updated;
      const now = new Date().toISOString();
      const profile = { ip, port, name, lastConnected: now, isFavorite: false };

      if (existingIndex >= 0) {
        // Update existing
        const existing = current[existingIndex];
        updated = [...current];
        updated[existingIndex] = { ...existing, name, lastConnected: now };
      } else {
        // Add new
        updated = [profile, ...current];
      }

      // Sort: Favorites first, then by lastConnected
      updated.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return new Date(b.lastConnected) - new Date(a.lastConnected);
      });

      // Limit to 10 non-favorites? No, let's keep all for now, maybe top 20
      if (updated.length > 20) updated = updated.slice(0, 20);

      localStorage.setItem('recentConnections', JSON.stringify(updated));
      return { ...prev, recentConnections: updated };
    });
  }, []);

  const toggleFavorite = useCallback((ip, port) => {
    setCollabState(prev => {
      const current = prev.recentConnections || [];
      const updated = current.map(c =>
        (c.ip === ip && c.port === port) ? { ...c, isFavorite: !c.isFavorite } : c
      );

      updated.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return new Date(b.lastConnected) - new Date(a.lastConnected);
      });

      localStorage.setItem('recentConnections', JSON.stringify(updated));
      return { ...prev, recentConnections: updated };
    });
  }, []);

  const removeConnectionProfile = useCallback((ip, port) => {
    setCollabState(prev => {
      const updated = (prev.recentConnections || []).filter(c => !(c.ip === ip && c.port === port));
      localStorage.setItem('recentConnections', JSON.stringify(updated));
      return { ...prev, recentConnections: updated };
    });
  }, []);

  // Load interfaces function
  const loadInterfaces = useCallback(async () => {
    if (window.electron && window.electron.getInterfaces) {
      try {
        const ifaces = await window.electron.getInterfaces();
        setCollabState(prev => ({ ...prev, availableInterfaces: ifaces }));
      } catch (e) {
        console.error('Failed to load interfaces:', e);
      }
    }
  }, []);

  // State Refs for Socket Listeners (to avoid stale closures)
  const dataRef = useRef({});
  const actionsRef = useRef({});

  useEffect(() => {
    dataRef.current = {
      collabState,
      pages,
      // ... (rest of useEffect content is same)
      extensions
      // Add other state as needed
    };
  });
  // Build trigger state
  const buildTimeoutRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const discoveredServersRef = useRef([]);
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
    // ...
  }, []);

  const startPolling = useCallback(() => {
    // ...
  }, [pollBuildStatus, setIsBuildingState]);

  // Trigger build function
  const triggerBuild = useCallback((localOnly = false) => {
    // ...
  }, [setIsBuildingState, startPolling]);

  // Manual trigger function (exposed to components)
  const manualTriggerBuild = useCallback((localOnly = false) => {
    // ...
  }, [triggerBuild]);

  // Schedule build 3 seconds after save (DISABLED FOR NOW)
  const scheduleBuild = useCallback(() => {
    // ...
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    // ...
  }, []);
  // Pages state
  // ...

  // Collaboration Functions
  const startCollaborationServer = useCallback(async (bindIP = null) => {
    if (!window.electron) return;

    // Check if other servers are already discovered - Single Server Policy
    // Use Ref for most up-to-date check if called manually shortly after launch
    if (discoveredServersRef.current.length > 0) {
      alert('Cannot start server: Another collaboration server was detected on this network. Please connect to the existing server instead.');
      return;
    }

    try {
      const result = await window.electron.startServer(8081, bindIP);
      if (result.status === 'started' || result.status === 'already-running') {
        console.log('Collaboration server started on', result.ip);

        // Connect to local server as HOST
        connectToCollaborationServer(`http://${result.ip === '0.0.0.0' ? 'localhost' : result.ip}:8081`, 'Host', true);

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

  const connectToCollaborationServer = useCallback((url, name, isHost = false) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(url, {
      reconnectionAttempts: 5,
      timeout: 10000,
      autoConnect: true
    });
    socketRef.current = socket;

    setCollabState(prev => ({ ...prev, status: 'connecting', error: null }));

    socket.on('connect', () => {
      console.log('Connected to collaboration server');

      // Save successful connection profile (if not host)
      if (!isHost) {
        try {
          const urlObj = new URL(url);
          saveConnectionProfile(urlObj.hostname, urlObj.port || '80', name);
        } catch (e) { console.error('Error saving connection profile', e); }
      }

      setCollabState(prev => ({
        ...prev,
        isConnected: true,
        status: 'connected',
        error: null,
        clientName: name,
        socketId: socket.id
      }));
      socket.emit('register-client', { name, isHost });
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from collaboration server:', reason);
      setCollabState(prev => ({
        ...prev,
        isConnected: false,
        status: 'disconnected', /* reason === 'io client disconnect' ? 'disconnected' : 'connecting' - socket.io auto-reconnects by default, so maybe 'connecting'? */
        // actually if socket.io is reconnecting, it might be better to say 'connecting' if strictly not a manual disconnect
        // But for UI clarity:
        socketId: null
      }));
    });

    socket.on('connect_error', (err) => {
      console.error('Collaboration connection error:', err);
      setCollabState(prev => ({
        ...prev,
        isConnected: false,
        status: 'error',
        error: `Connection failed: ${err.message}`
      }));
    });

    socket.on('reconnect_attempt', () => {
      setCollabState(prev => ({ ...prev, status: 'connecting', error: null }));
    });

    socket.on('reconnect_failed', () => {
      setCollabState(prev => ({ ...prev, status: 'error', error: 'Failed to reconnect after multiple attempts.' }));
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

      // Host Logic: Send full state to the new client
      const currentData = dataRef.current;
      if (currentData.collabState && currentData.collabState.isServer) {
        const payload = {
          pages: currentData.pages,
          pageGroups: currentData.pageGroups,
          blogArticles: currentData.blogArticles,
          catRows: currentData.catRows,
          userRows: currentData.userRows,
          inventoryRows: currentData.inventoryRows,
          attendanceRows: currentData.attendanceRows,
          reservationRows: currentData.reservationRows,
          componentRows: currentData.componentRows,
          movieList: currentData.movieList,
          settings: currentData.settings,
          acl: currentData.acl,
          extensions: currentData.extensions
        };
        socket.emit('sync-full-state', { targetSocketId: client.id, state: payload });
      }
    });

    socket.on('hydrate-state', (state) => {
      console.log('Received full state hydration from host');
      const actions = actionsRef.current;
      if (state.pages) actions.savePages(state.pages, true);
      if (state.pageGroups) actions.savePageGroups(state.pageGroups, true);
      if (state.blogArticles) actions.saveBlogArticles(state.blogArticles, true);
      if (state.catRows) actions.saveCatRows(state.catRows, true);
      if (state.userRows) actions.saveUserRows(state.userRows, true);
      if (state.inventoryRows) actions.saveInventoryRows(state.inventoryRows, true);
      if (state.attendanceRows) actions.saveAttendanceRows(state.attendanceRows, true);
      if (state.reservationRows) actions.saveReservationRows(state.reservationRows, true);
      if (state.componentRows) actions.saveComponentRows(state.componentRows, true);
      if (state.movieList) actions.saveMovieList(state.movieList, true);
      if (state.settings) actions.saveSettings(state.settings, true);
      if (state.acl) actions.saveAcl(state.acl, true);
      if (state.extensions) actions.saveExtensions(state.extensions, true);
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
      const actions = actionsRef.current;
      // Handle various types
      switch (update.type) {
        case 'pages': actions.savePages(update.data, true); break;
        case 'pageGroups': actions.savePageGroups(update.data, true); break;
        case 'blogArticles': actions.saveBlogArticles(update.data, true); break;
        case 'catRows': actions.saveCatRows(update.data, true); break;
        case 'userRows': actions.saveUserRows(update.data, true); break;
        case 'inventoryRows': actions.saveInventoryRows(update.data, true); break;
        case 'attendanceRows': actions.saveAttendanceRows(update.data, true); break;
        case 'reservationRows': actions.saveReservationRows(update.data, true); break;
        case 'componentRows': actions.saveComponentRows(update.data, true); break;
        case 'movieList': actions.saveMovieList(update.data, true); break;
        case 'settings': actions.saveSettings(update.data, true); break;
        case 'acl': actions.saveAcl(update.data, true); break;
        case 'extensions': actions.saveExtensions(update.data, true); break;
      }
    });

    socket.on('build-status', (status) => {
      console.log('[useCMSData] Received build status:', status);
      setIsBuildingState(status.isBuildInProgress);
      if (!status.isBuildInProgress && status.lastBuildTime) {
        setLastSaved(status.lastBuildTime);
        setCanBuild(true);
        setBuildCooldownSeconds(0);
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }
    });

    socket.on('build-error', (error) => {
      console.error('[useCMSData] Remote build error:', error);
      alert(`Remote build failed: ${error}`);
      setIsBuildingState(false);
      setCanBuild(true);
      setBuildCooldownSeconds(0);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    });

    socket.on('forwarded-update', (update) => {
      // Host Logic: Receive update from Peer, apply it (serializing it)
      console.log('Host received forwarded update from peer');
      const actions = actionsRef.current;
      // Apply update - this will trigger a save, which triggers a data-update broadcast from Host
      // We pass 'false' for skipBroadcast because we WANT to broadcast the result to everyone
      switch (update.type) {
        case 'pages': actions.savePages(update.data); break;
        case 'pageGroups': actions.savePageGroups(update.data); break;
        case 'blogArticles': actions.saveBlogArticles(update.data); break;
        case 'catRows': actions.saveCatRows(update.data); break;
        case 'userRows': actions.saveUserRows(update.data); break;
        case 'inventoryRows': actions.saveInventoryRows(update.data); break;
        case 'attendanceRows': actions.saveAttendanceRows(update.data); break;
        case 'reservationRows': actions.saveReservationRows(update.data); break;
        case 'componentRows': actions.saveComponentRows(update.data); break;
        case 'movieList': actions.saveMovieList(update.data); break;
        case 'settings': actions.saveSettings(update.data); break;
        case 'acl': actions.saveAcl(update.data); break;
        case 'extensions': actions.saveExtensions(update.data); break;
      }
    });

  }, []);

  // Listen for discovered servers & Auto-Negotiation
  useEffect(() => {
    if (window.electron && window.electron.onServerFound) {
      window.electron.onServerFound((serverInfo) => {
        console.log('Discovered server:', serverInfo);

        // Update Ref immediately for synchronous access in timeout
        const existsRef = discoveredServersRef.current.find(s => s.ip === serverInfo.ip && s.port === serverInfo.port);
        if (!existsRef) {
          discoveredServersRef.current = [...discoveredServersRef.current, serverInfo];
        }

        setCollabState(prev => {
          // Avoid duplicates based on IP and Port
          const exists = prev.discoveredServers.find(s => s.ip === serverInfo.ip && s.port === serverInfo.port);
          if (exists) return prev;
          return {
            ...prev,
            discoveredServers: [...prev.discoveredServers, serverInfo]
          };
        });
      });
    }

    // Auto-Negotiation: Wait for discovery, then decide role
    const negotiationTimeout = setTimeout(() => {
      if (discoveredServersRef.current.length > 0) {
        console.log('Auto-Negotiation: Server detected, defaulting to Client mode.');
      } else {
        console.log('Auto-Negotiation: No server detected, starting Host...');
        startCollaborationServer();
      }
    }, 2000); // 2 second discovery window

    return () => clearTimeout(negotiationTimeout);
  }, [startCollaborationServer]);

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
      status: 'disconnected',
      error: null,
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

  const forceReleaseLock = useCallback((fieldId) => {
    if (socketRef.current && collabState.isConnected) {
      socketRef.current.emit('admin-force-release', { fieldId });
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
  const savePages = (newPages, skipBroadcast = false) => {
    setPages(newPages);
    localStorage.setItem('pages', JSON.stringify(newPages));
    scheduleBuild();
    if (!skipBroadcast && socketRef.current && collabState.isConnected) {
      socketRef.current.emit('data-update', { type: 'pages', data: newPages });
    }
  };

  const saveCurrentPageId = (id) => {
    setCurrentPageId(id);
    localStorage.setItem('currentPageId', JSON.stringify(id));
  };

  const savePageGroups = (newGroups, skipBroadcast = false) => {
    setPageGroups(newGroups);
    localStorage.setItem('pageGroups', JSON.stringify(newGroups));
    scheduleBuild();
    if (!skipBroadcast && socketRef.current && collabState.isConnected) {
      socketRef.current.emit('data-update', { type: 'pageGroups', data: newGroups });
    }
  };

  const saveBlogArticles = (articles, skipBroadcast = false) => {
    setBlogArticles(articles);
    localStorage.setItem('blogArticles', JSON.stringify(articles));
    scheduleBuild();
    if (!skipBroadcast && socketRef.current && collabState.isConnected) {
      socketRef.current.emit('data-update', { type: 'blogArticles', data: articles });
    }
  };

  const saveCurrentBlogArticleId = (id) => {
    setCurrentBlogArticleId(id);
    localStorage.setItem('currentBlogArticleId', JSON.stringify(id));
  };

  const saveCatRows = (rows, skipBroadcast = false) => {
    setCatRows(rows);
    localStorage.setItem('catRows', JSON.stringify(rows));
    scheduleBuild();
    if (!skipBroadcast && socketRef.current && collabState.isConnected) {
      socketRef.current.emit('data-update', { type: 'catRows', data: rows });
    }
  };

  const saveUserRows = (rows, skipBroadcast = false) => {
    setUserRows(rows);
    localStorage.setItem('userRows', JSON.stringify(rows));
    scheduleBuild();
    if (!skipBroadcast && socketRef.current && collabState.isConnected) {
      socketRef.current.emit('data-update', { type: 'userRows', data: rows });
    }
  };

  const saveInventoryRows = (newRows, skipBroadcast = false) => {
    setInventoryRows(newRows);
    localStorage.setItem('inventoryRows', JSON.stringify(newRows));
    if (!skipBroadcast && socketRef.current && collabState.isConnected) {
      socketRef.current.emit('data-update', { type: 'inventoryRows', data: newRows });
    }
  };

  const saveCustomerRows = (newRows, skipBroadcast = false) => {
    setCustomerRows(newRows);
    localStorage.setItem('customerRows', JSON.stringify(newRows));
    if (!skipBroadcast && socketRef.current && collabState.isConnected) {
      socketRef.current.emit('data-update', { type: 'customerRows', data: newRows });
    }
  };

  const saveEmployeeRows = (newRows, skipBroadcast = false) => {
    setEmployeeRows(newRows);
    localStorage.setItem('employeeRows', JSON.stringify(newRows));
    if (!skipBroadcast && socketRef.current && collabState.isConnected) {
      socketRef.current.emit('data-update', { type: 'employeeRows', data: newRows });
    }
  };

  const saveAttendanceRows = (newRows, skipBroadcast = false) => {
    setAttendanceRows(newRows);
    localStorage.setItem('attendanceRows', JSON.stringify(newRows));
    if (!skipBroadcast && socketRef.current && collabState.isConnected) {
      socketRef.current.emit('data-update', { type: 'attendanceRows', data: newRows });
    }
  };

  const saveReservationRows = (newRows, skipBroadcast = false) => {
    setReservationRows(newRows);
    localStorage.setItem('reservationRows', JSON.stringify(newRows));
    if (!skipBroadcast && socketRef.current && collabState.isConnected) {
      socketRef.current.emit('data-update', { type: 'reservationRows', data: newRows });
    }
  };

  const saveMovieList = (newList, skipBroadcast = false) => {
    setMovieList(newList);
    localStorage.setItem('movieList', JSON.stringify(newList));
    if (!skipBroadcast && socketRef.current && collabState.isConnected) {
      socketRef.current.emit('data-update', { type: 'movieList', data: newList });
    }
  };

  const saveComponentRows = (rows, skipBroadcast = false) => {
    setComponentRows(rows);
    localStorage.setItem('componentRows', JSON.stringify(rows));
    scheduleBuild();
    if (!skipBroadcast && socketRef.current && collabState.isConnected) {
      socketRef.current.emit('data-update', { type: 'componentRows', data: rows });
    }
  };

  const saveSettings = (newSettings, skipBroadcast = false) => {
    setSettings(newSettings);
    localStorage.setItem('settings', JSON.stringify(newSettings));
    scheduleBuild();

    // Broadcast update if connected
    if (!skipBroadcast && socketRef.current && collabState.isConnected) {
      socketRef.current.emit('data-update', { type: 'settings', data: newSettings });
    }
  };

  const saveAcl = (newAcl, skipBroadcast = false) => {
    setAcl(newAcl);
    localStorage.setItem('acl', JSON.stringify(newAcl));
    scheduleBuild();
    if (!skipBroadcast && socketRef.current && collabState.isConnected) {
      socketRef.current.emit('data-update', { type: 'acl', data: newAcl });
    }
  };

  const saveExtensions = (newExtensions, skipBroadcast = false) => {
    setExtensions(newExtensions);
    localStorage.setItem('extensions', JSON.stringify(newExtensions));
    scheduleBuild();
    if (!skipBroadcast && socketRef.current && collabState.isConnected) {
      socketRef.current.emit('data-update', { type: 'extensions', data: newExtensions });
    }
  };

  // Sync actionsRef
  useEffect(() => {
    actionsRef.current = {
      savePages,
      savePageGroups,
      saveBlogArticles,
      saveCatRows,
      saveUserRows,
      saveInventoryRows,
      saveCustomerRows,
      saveEmployeeRows,
      saveAttendanceRows,
      saveReservationRows,
      saveComponentRows,
      saveMovieList,
      saveSettings,
      saveAcl,
      saveExtensions
    };
  }, [
    savePages, savePageGroups, saveBlogArticles, saveCatRows, saveUserRows,
    saveInventoryRows, saveCustomerRows, saveEmployeeRows, saveAttendanceRows,
    saveReservationRows, saveComponentRows, saveMovieList, saveSettings,
    saveAcl, saveExtensions
  ]);

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
    releaseLock,
    loadInterfaces,
    recentConnections: collabState.recentConnections,
    saveConnectionProfile,
    toggleFavorite,
    removeConnectionProfile,
    forceReleaseLock
  };
};

export default useCMSData;