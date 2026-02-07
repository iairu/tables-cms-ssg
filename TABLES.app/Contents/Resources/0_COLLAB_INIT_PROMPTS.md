we are dealing with a gatsby + electron app, the app is a static site generator with a cms interface (cms-site), the cms interface (cms-site) is a gatsby site that is served by electron, the cms interface is used to indirectly edit the static site (main-site)through api/build.js which exports json into main-site, the static site is also deployed to vercel through api/build.js

research how to create a collaborative websocket server by adding "This instance will be used as a server instead of a client" into Settings view, the server will be utilized to connect clients between each other within a company, add as many fields into settings as necessary in order to facilitate collaborative features. Collaboration will include seeing who is editing what field and live contents shown within each currently remotely edited field, the field will be disabled while being edited by another client from a remote machine, server will not have the ability to edit any fields

./electron-launch.html
./.cms-data.json
./electron-preload.js
./icon.icns
./main-site
./main-site/.vercel
./main-site/.vercel/project.json
./main-site/.vercel/README.txt
./main-site/gatsby-ssr.js
./main-site/.env.local
./main-site/README.md
./main-site/gatsby-browser.js
./main-site/.gitignore
./main-site/package-lock.json
./main-site/package.json
./main-site/gatsby-config.js
./main-site/static
./main-site/static/uploads
./main-site/static/uploads/redbull.png
./main-site/static/uploads/infobar-logo.png
./main-site/static/uploads/struk-lightning.png
./main-site/static/uploads/1769004709502-joj-ref.png
./main-site/static/uploads/brian-show-floater-2.png
./main-site/static/uploads/rank-bg.jpg
./main-site/static/uploads/1769004105171-partizan-ref.png
./main-site/static/uploads/dell.png
./main-site/static/uploads/1769070803399_bg-texture.png
./main-site/static/uploads/strukshow-new-title-bg.jpg
./main-site/static/uploads/1769073669110_soukujuce-bg.png
./main-site/static/uploads/panorama.png
./main-site/static/uploads/1769073836005_unforgettable-bg.png
./main-site/static/uploads/crowne.png
./main-site/static/uploads/grape.png
./main-site/static/uploads/strukshow-logo-black.svg
./main-site/static/uploads/brian-card-fly.png
./main-site/static/uploads/struk-show-top-bg.jpg
./main-site/static/uploads/1769007268303_slniecko.png
./main-site/static/uploads/rtvs.png
./main-site/static/uploads/brian-rope.png
./main-site/static/uploads/1769007311148_brian-card-fly-tp.png
./main-site/static/uploads/1769007115248_struk-podpis-sk-fly.gif
./main-site/static/uploads/strukshow-contact-bg.jpg
./main-site/static/uploads/strukshow-main-title-new.png
./main-site/static/uploads/brian-about-slide-right.jpg
./main-site/static/uploads/placeholder
./main-site/static/uploads/1769006801458_strukshow-logo-black.svg
./main-site/static/uploads/1769007279979_lovestream.png
./main-site/static/uploads/1769004756526-infobar-logo.png
./main-site/static/uploads/lovestream.png
./main-site/static/uploads/danfoss.png
./main-site/static/uploads/title-fly.png
./main-site/static/uploads/csmt.png
./main-site/static/sitemap.xml
./main-site/static/data
./main-site/static/data/settings.json
./main-site/static/data/cats.json
./main-site/static/data/placeholder
./main-site/static/data/blog.json
./main-site/static/data/pages.json
./main-site/static/assets
./main-site/static/assets/tables-icon-and-logo.af
./main-site/static/assets/tables-logo.svg
./main-site/static/assets/nextSection.js
./main-site/static/assets/tables-icon.svg
./main-site/gatsby-node.js
./main-site/.env.development
./main-site/src
./main-site/src/utils
./main-site/src/utils/accessibilityContext.js
./main-site/src/utils/gdprContext.js
./main-site/src/utils/localization.js
./main-site/src/styles
./main-site/src/styles/basis.css
./main-site/src/styles/default.css
./main-site/src/components
./main-site/src/components/page
./main-site/src/components/page/TitleSlide.js
./main-site/src/components/page/Boxes.js
./main-site/src/components/page/Slide.js
./main-site/src/components/page/Reviews.js
./main-site/src/components/page/References.js
./main-site/src/components/page/index.js
./main-site/src/components/page/Flies.js
./main-site/src/components/page/Video.js
./main-site/src/components/page/Infobar.js
./main-site/src/components/page/Ranking.js
./main-site/src/components/HeadComponent.js
./main-site/src/components/MarkdownRenderer.js
./main-site/src/components/Header.js
./main-site/src/components/blog
./main-site/src/components/blog/ArticleCard.js
./main-site/src/components/common
./main-site/src/components/common/Sitemap.js
./main-site/src/components/common/NotFound.js
./main-site/src/components/common/Loading.js
./main-site/src/components/common/AccessibilityControls.js
./main-site/src/components/common/GDPRConsent.js
./main-site/src/components/Breadcrumbs.js
./main-site/src/components/slideshow
./main-site/src/components/slideshow/Slide.js
./main-site/src/components/slideshow/slideshow.css
./main-site/src/components/slideshow/Slideshow.js
./main-site/src/components/Footer.js
./main-site/src/templates
./main-site/src/templates/blog-index.js
./main-site/src/templates/empty-home.js
./main-site/src/templates/page.js
./main-site/src/templates/language-redirect.js
./main-site/src/templates/blog-article.js
./main-site/src/templates/blog-redirect.js
./main-site/src/data
./main-site/src/data/placeholder
./main-site/src/pages
./main-site/src/pages/404.js
./package-lock.json
./package.json
./2_COLLAB_PROMPT_GALLERY.md
./static
./static/assets
./static/assets/tables-icon-and-logo.af
./static/assets/tables-logo.svg
./static/assets/tables-feature-highlight-banner.png
./static/assets/tables-icon.png
./static/assets/tables-icon.svg
./static/assets/tables-feature-highlight-banner.af
./support-setup
./support-setup/bundle-node-npm.js
./support-bin
./tsconfig.json
./electron-main.js
./electron-launch.js
./cms-site
./cms-site/gatsby-ssr.js
./cms-site/gatsby-express.json
./cms-site/server.js
./cms-site/gatsby-browser.js
./cms-site/package-lock.json
./cms-site/package.json
./cms-site/gatsby-config.js
./cms-site/static
./cms-site/static/uploads
./cms-site/static/uploads/placeholder
./cms-site/static/cms
./cms-site/static/cms/placeholder
./cms-site/static/.gitignore
./cms-site/static/assets
./cms-site/static/assets/tables-logo.svg
./cms-site/static/assets/tables-icon.png
./cms-site/gatsby-node.js
./cms-site/src
./cms-site/src/context
./cms-site/src/context/LoadingContext.js
./cms-site/src/utils
./cms-site/src/utils/navigation.js
./cms-site/src/utils/pathResolver.js
./cms-site/src/styles
./cms-site/src/styles/MassActions.css
./cms-site/src/styles/cms.css
./cms-site/src/components
./cms-site/src/components/Layout.js
./cms-site/src/components/LoadingBar.js
./cms-site/src/components/LoadingSkeleton.js
./cms-site/src/components/Header.js
./cms-site/src/components/cms
./cms-site/src/components/cms/AssetGrid.js
./cms-site/src/components/cms/sections
./cms-site/src/components/cms/sections/SettingsSection.js
./cms-site/src/components/cms/sections/CatsSection.js
./cms-site/src/components/cms/sections/index.js
./cms-site/src/components/cms/sections/RentalReservationsSection.js
./cms-site/src/components/cms/sections/PersonalSection.js
./cms-site/src/components/cms/sections/ExtensionsSection.js
./cms-site/src/components/cms/sections/BlogSection.js
./cms-site/src/components/cms/sections/ACLSection.js
./cms-site/src/components/cms/sections/RentalInventorySection.js
./cms-site/src/components/cms/sections/RentalCustomersSection.js
./cms-site/src/components/cms/sections/RentalCalendarSection.js
./cms-site/src/components/cms/sections/PagesSection.js
./cms-site/src/components/cms/sections/RentalAttendanceSection.js
./cms-site/src/components/cms/sections/PageGroupsSection.js
./cms-site/src/components/cms/sections/MoviesSection.js
./cms-site/src/components/cms/sections/RentalEmployeesSection.js
./cms-site/src/components/cms/AssetManagerModal.js
./cms-site/src/components/cms/FuzzySearchDropdown.js
./cms-site/src/components/cms/ButtonEditor.js
./cms-site/src/components/cms/DescendantsTree.js
./cms-site/src/components/cms/SlugPicker.js
./cms-site/src/components/cms/utils.js
./cms-site/src/components/cms/FamilyTree.js
./cms-site/src/components/cms/componentHelpers.js
./cms-site/src/components/cms/IconPickerModal.js
./cms-site/src/components/cms/UserAssetManager.js
./cms-site/src/components/cms/ComponentEditor.js
./cms-site/src/components/NotesSidebar.js
./cms-site/src/components/SideMenu.js
./cms-site/src/hooks
./cms-site/src/hooks/useCMSData.js
./cms-site/src/api
./cms-site/src/api/build.js
./cms-site/src/api/delete-upload.js
./cms-site/src/api/import-uploads.js
./cms-site/src/api/upload.js
./cms-site/src/api/uploads.js
./cms-site/src/api/purge-uploads.js
./cms-site/src/pages
./cms-site/src/pages/404.js
./cms-site/src/pages/index.js
./cms-site/src/pages/cms
./cms-site/src/pages/cms/attendance
./cms-site/src/pages/cms/attendance/index.js
./cms-site/src/pages/cms/customers
./cms-site/src/pages/cms/customers/index.js
./cms-site/src/pages/cms/personal
./cms-site/src/pages/cms/personal/index.js
./cms-site/src/pages/cms/settings
./cms-site/src/pages/cms/settings/index.js
./cms-site/src/pages/cms/calendar
./cms-site/src/pages/cms/calendar/index.js
./cms-site/src/pages/cms/page-groups
./cms-site/src/pages/cms/page-groups/index.js
./cms-site/src/pages/cms/reservations
./cms-site/src/pages/cms/reservations/index.js
./cms-site/src/pages/cms/uploads
./cms-site/src/pages/cms/uploads/index.js
./cms-site/src/pages/cms/blog
./cms-site/src/pages/cms/blog/edit.js
./cms-site/src/pages/cms/blog/index.js
./cms-site/src/pages/cms/extensions
./cms-site/src/pages/cms/extensions/index.js
./cms-site/src/pages/cms/inventory
./cms-site/src/pages/cms/inventory/index.js
./cms-site/src/pages/cms/pedigree
./cms-site/src/pages/cms/pedigree/index.js
./cms-site/src/pages/cms/pages
./cms-site/src/pages/cms/pages/edit.js
./cms-site/src/pages/cms/pages/index.js
./cms-site/src/pages/cms/movietracker
./cms-site/src/pages/cms/movietracker/index.js
./cms-site/src/pages/cms/employees
./cms-site/src/pages/cms/employees/index.js
./start.sh

current wip implementation of collaboration is

// electron-preload.js
  // Collaboration APIs
  getIP: () => ipcRenderer.invoke('collab-get-ip'),
  startServer: (port) => ipcRenderer.invoke('collab-start-server', port),
  stopServer: () => ipcRenderer.invoke('collab-stop-server'),

// electron-main.js
const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const net = require('net');
const AnsiToHtml = require('ansi-to-html');
const { Server } = require('socket.io'); // Socket.io server
const http = require('http'); // Required for Socket.io standalone

// Collaboration State
let io;
let collabServer;
let connectedClients = new Map(); // socketId -> clientInfo
let activeLocks = new Map(); // fieldId -> { socketId, timestamp, clientName }

const { Server } = require('socket.io'); // Socket.io server
const http = require('http'); // Required for Socket.io standalone

// Collaboration State
// Variables declared below



// NOTE: asar is disabled in package.json, allowing direct writes to the app folder
// This means we can modify files, create directories, and store data directly in:
// - app.getAppPath() when packaged (e.g., .../Resources/app/)
// - __dirname during development
// This enables: support-bin downloads, cms-site node_modules, cached data, etc.

// Set resource limits to prevent system hogging
app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendSwitch('max-old-space-size', '1024'); // Limit memory to 1GB
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=1024');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-dev-shm-usage');
app.commandLine.appendSwitch('no-sandbox'); // Faster startup

// Set process priority (lower priority to be nicer to system)
if (process.platform !== 'win32') {
  try {
    os.setPriority(os.constants.priority.PRIORITY_BELOW_NORMAL || 10);
  } catch (e) {
    console.log('Could not set process priority:', e.message);
  }
}

const ansiToHtml = new AnsiToHtml();
const logHistory = [];

const log = (msg) => {
  const msgStr = msg.toString();
  logHistory.push(msgStr);
  console.log(msgStr);
  if (launchWindow && !launchWindow.isDestroyed()) {
    const html = ansiToHtml.toHtml(msgStr.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
    launchWindow.webContents.send('console-output', html);
  }
};

const handleFatalError = (error, type) => {
  const errorMessage = `\n⚠️  ERROR (${type}): ${error.message || error}`;
  log(errorMessage);
  if (error.stack) {
    log(`Stack trace: ${error.stack}`);
  }

  const logPath = path.join(os.tmpdir(), `tables-cms-crash-${Date.now()}.log`);
  const fullLog = `${logHistory.join('\n')}\n\n${errorMessage}`;
  fs.writeFileSync(logPath, fullLog);

  log(`\n📋 Log file saved: ${logPath}`);
  log(`\n💡 Interactive console mode enabled. You can run commands below.`);
  log(`   Type commands and press Execute to run them in the cms-site directory.`);
  log(`   Close the window when done.\n`);

  // Keep the app running in console mode instead of quitting
  if (launchWindow && !launchWindow.isDestroyed()) {
    launchWindow.setTitle('TABLES CMS - Console Mode (Error Recovery)');
  }

  // Don't quit - let user interact with console
  return;
};

process.on('uncaughtException', (error) => {
  handleFatalError(error, 'Uncaught Exception');
  // Don't exit, keep console running
});
process.on('unhandledRejection', (reason) => {
  handleFatalError(reason, 'Unhandled Rejection');
  // Don't exit, keep console running
});

let gatsbyProcess;
let mainWindow;
let launchWindow;
let keepConsoleVisible = false;
let isBuildInProgress = false;

const IS_PACKAGED = app.isPackaged;

// Helper function to get the correct resource path
const getResourcePath = (...pathSegments) => {
  if (IS_PACKAGED) {
    // When packaged without asar, files are in app.getAppPath()
    return path.join(app.getAppPath(), ...pathSegments);
  }
  return path.join(__dirname, ...pathSegments);
};

// Helper function to ensure writable directories exist (cached)
const writableDirCache = new Set();
const ensureWritableDir = (dirPath) => {
  if (writableDirCache.has(dirPath)) return true;

  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
      log(`Created writable directory: ${dirPath}`);
    }
    writableDirCache.add(dirPath);
    return true;
  } catch (error) {
    log(`Warning: Directory ${dirPath} may not be writable: ${error.message}`);
    return false;
  }
};

const createLaunchWindow = () => {
  try {
    // Find icon path that exists
    const iconPaths = [
      getResourcePath('static/assets/tables-icon.png'),
      path.join(process.resourcesPath, 'static/assets/tables-icon.png'),
      path.join(__dirname, 'static/assets/tables-icon.png')
    ];

    log('Searching for launch window icon in paths:');
    let iconPath = undefined;
    for (const testPath of iconPaths) {
      log(`  Checking: ${testPath}`);
      if (fs.existsSync(testPath)) {
        iconPath = testPath;
        log(`  ✓ Found icon at: ${testPath}`);
        break;
      }
    }
    if (!iconPath) {
      log('  ⚠ Warning: Icon not found at any path, window will use default icon');
    }

    // Find preload script path that exists
    const preloadPaths = [
      getResourcePath('electron-preload.js'),
      path.join(__dirname, 'electron-preload.js'),
      path.join(process.resourcesPath, 'electron-preload.js')
    ];

    log('Searching for preload script in paths:');
    let preloadPath = preloadPaths[0]; // Default to first path
    for (const testPath of preloadPaths) {
      log(`  Checking: ${testPath}`);
      if (fs.existsSync(testPath)) {
        preloadPath = testPath;
        log(`  ✓ Found preload script at: ${testPath}`);
        break;
      }
    }

    launchWindow = new BrowserWindow({
      width: 800,
      height: 400,
      frame: false,
      icon: iconPath,
      titleBarStyle: 'hidden',
      title: 'Launch and Console Output',
      show: false, // Don't show immediately for faster perceived startup
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        webSecurity: false,
        nodeIntegration: false,
        enableRemoteModule: false,
        backgroundThrottling: false,
      },
    });

    // Find HTML file path that exists
    const htmlPaths = [
      getResourcePath('electron-launch.html'),
      path.join(__dirname, 'electron-launch.html'),
      path.join(process.resourcesPath, 'electron-launch.html')
    ];

    log('Searching for launch HTML file in paths:');
    let htmlPath = 'electron-launch.html'; // Fallback
    for (const testPath of htmlPaths) {
      log(`  Checking: ${testPath}`);
      if (fs.existsSync(testPath)) {
        htmlPath = testPath;
        log(`  ✓ Found HTML at: ${testPath}`);
        break;
      }
    }

    launchWindow.loadFile(htmlPath);
    launchWindow.on('closed', () => {
      if (!mainWindow) {
        app.quit();
      }
      launchWindow = null;
    });

    return new Promise((resolve) => {
      launchWindow.webContents.on('did-finish-load', () => {
        launchWindow.show(); // Show after load for smoother appearance
        resolve();
      });
    });
  } catch (error) {
    log(`Error creating launch window: ${error.message}`);
    log(`Stack trace: ${error.stack}`);
    handleFatalError(error, 'Launch Window Creation');
  }
};

const createMainWindow = () => {
  try {
    // Find icon path that exists
    const iconPaths = [
      getResourcePath('static/assets/tables-icon.png'),
      path.join(process.resourcesPath, 'static/assets/tables-icon.png'),
      path.join(__dirname, 'static/assets/tables-icon.png')
    ];

    log('Searching for main window icon in paths:');
    let iconPath = undefined;
    for (const testPath of iconPaths) {
      log(`  Checking: ${testPath}`);
      if (fs.existsSync(testPath)) {
        iconPath = testPath;
        log(`  ✓ Found icon at: ${testPath}`);
        break;
      }
    }
    if (!iconPath) {
      log('  ⚠ Warning: Icon not found at any path, window will use default icon');
    }

    // Find preload script path that exists
    const preloadPaths = [
      getResourcePath('electron-preload.js'),
      path.join(__dirname, 'electron-preload.js'),
      path.join(process.resourcesPath, 'electron-preload.js')
    ];

    log('Searching for main window preload script in paths:');
    let preloadPath = preloadPaths[0]; // Default to first path
    for (const testPath of preloadPaths) {
      log(`  Checking: ${testPath}`);
      if (fs.existsSync(testPath)) {
        preloadPath = testPath;
        log(`  ✓ Found preload script at: ${testPath}`);
        break;
      }
    }

    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false,
      frame: false,
      icon: iconPath,
      titleBarStyle: 'hidden',
      webPreferences: {
        preload: preloadPath,
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        backgroundThrottling: false,
        spellcheck: false, // Disable spellcheck for better performance
      },
    });
    mainWindow.loadURL('http://localhost:8000/cms/settings');
    mainWindow.on('closed', () => {
      if (gatsbyProcess) {
        gatsbyProcess.kill();
      }
      app.quit();
    });
  } catch (error) {
    log(`Error creating main window: ${error.message}`);
    log(`Stack trace: ${error.stack}`);
    handleFatalError(error, 'Main Window Creation');
  }
};

ipcMain.on('close-app', () => app.quit());
ipcMain.on('minimize-app', () => mainWindow?.minimize());
ipcMain.on('maximize-app', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('run-command', (event, command) => {
  const workDir = IS_PACKAGED
    ? path.join(getResourcePath(), 'cms-site')
    : path.join(__dirname, 'cms-site');

  log(`\n> ${command}`);
  log(`Working directory: ${workDir}`);

  exec(command, {
    cwd: workDir,
    maxBuffer: 10 * 1024 * 1024,
    env: { ...process.env } // Use updated PATH with our node/npm
  }, (error, stdout, stderr) => {
    if (error) {
      log(`❌ Error (exit code ${error.code || 'unknown'}): ${error.message}`);
      if (stderr) {
        log(`stderr: ${stderr}`);
      }
      return;
    }
    if (stderr) {
      log(`stderr: ${stderr}`);
    }
    if (stdout) {
      log(stdout);
    }
    log(`✓ Command completed successfully\n`);
  });
});

// Utility function to check if a port is open
const checkPort = (port, host = 'localhost') => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 1000;

    socket.setTimeout(timeout);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });

    socket.connect(port, host);
  });
};

// Utility function to wait for a port to become available
const waitForPort = async (port, host = 'localhost', maxAttempts = 30, delayMs = 1000) => {
  for (let i = 0; i < maxAttempts; i++) {
    const isOpen = await checkPort(port, host);
    if (isOpen) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return false;
};

const startGatsby = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const platform = os.platform();
      const nodeExecutable = platform === 'win32' ? 'node.exe' : 'node';
      log(`Node executable will be: ${nodeExecutable}`);
      const resourcesPath = getResourcePath();
      log(`Resources path: ${resourcesPath}`);

      // Ensure support-bin directory exists and is writable
      const supportBinDir = path.join(resourcesPath, 'support-bin');
      ensureWritableDir(supportBinDir);
      ensureWritableDir(path.join(supportBinDir, 'npm_source'));
      ensureWritableDir(path.join(supportBinDir, 'npm_source', 'bin'));

      const binPath = path.join(supportBinDir, 'npm_source', 'bin');
      const nodePath = path.join(binPath, nodeExecutable);
      log(`Node.js path: ${nodePath}`);
      const npmCliPath = path.join(binPath, 'npm-cli.js');
      log(`npm-cli.js path: ${npmCliPath}`);
      const cmsSiteDir = path.join(resourcesPath, 'cms-site');
      log(`cms-site directory: ${cmsSiteDir}`);

      // Set PATH to include our bundled node and npm
      const originalPath = process.env.PATH || '';
      const newPath = `${binPath}${path.delimiter}${originalPath}`;
      process.env.PATH = newPath;
      log(`Updated PATH to include: ${binPath}`);

      // Ensure cms-site is writable
      ensureWritableDir(cmsSiteDir);

      // Try multiple paths to find the bundle script
      log('Searching for bundle-node-npm.js in paths:');
      const bundleScriptPaths = [
        getResourcePath('support-setup', 'bundle-node-npm.js'),
        path.join(resourcesPath, 'support-setup', 'bundle-node-npm.js'),
        path.join(__dirname, 'support-setup', 'bundle-node-npm.js'),
        path.join(process.resourcesPath, 'support-setup', 'bundle-node-npm.js')
      ];

      let bundleScriptPath = null;
      for (const testPath of bundleScriptPaths) {
        log(`  Checking: ${testPath}`);
        if (fs.existsSync(testPath)) {
          bundleScriptPath = testPath;
          log(`  ✓ Found bundle script at: ${bundleScriptPath}`);
          break;
        }
      }

      if (!bundleScriptPath) {
        const errorMsg = 'Could not find bundle-node-npm.js script at any expected location:\n' +
          bundleScriptPaths.map(p => `  - ${p}`).join('\n');
        log(errorMsg);
        throw new Error(errorMsg);
      }

      const { setupBinaries, getPackageManager } = require(bundleScriptPath);

      // Validate or setup binaries
      const npmSourceDir = path.join(resourcesPath, 'support-bin', 'npm_source');
      const utilsPath = path.join(npmSourceDir, 'lib', 'utils');
      const commandsPath = path.join(npmSourceDir, 'lib', 'commands');
      const nodeModulesPath = path.join(npmSourceDir, 'node_modules');

      // Check if npm has all required directories including node_modules
      // Skip expensive checks if node binary doesn't exist
      let npmValid = false;
      if (fs.existsSync(nodePath)) {
        npmValid = fs.existsSync(utilsPath) &&
          fs.existsSync(commandsPath) &&
          fs.existsSync(nodeModulesPath) &&
          fs.existsSync(path.join(nodeModulesPath, 'semver'));
      }

      if (!npmValid) {
        if (!fs.existsSync(nodePath)) {
          log('Node.js/npm binaries not found. Attempting to download them...');
        } else {
          log('npm installation appears incomplete (missing critical directories or dependencies). Re-downloading...');
          const missing = [];
          if (!fs.existsSync(utilsPath)) missing.push('lib/utils');
          if (!fs.existsSync(commandsPath)) missing.push('lib/commands');
          if (!fs.existsSync(nodeModulesPath)) missing.push('node_modules');
          else if (!fs.existsSync(path.join(nodeModulesPath, 'semver'))) missing.push('node_modules/semver');
          log(`Missing: ${missing.join(', ')}`);
        }

        try {
          await setupBinaries(resourcesPath);
          log('Binaries setup completed successfully.');

        } catch (error) {
          log('\n⚠️  Failed to setup binaries. Please check your internet connection and try again.');
          log(error.message);
          log(error.stack || '');
          log('\n💡 Entering console mode. You can manually debug the issue.');
          return reject(new Error('Failed to setup binaries: ' + error.message));
        }
      } else {
        log('Binaries validated successfully.');
      }

      const packageManager = getPackageManager(resourcesPath);
      log(`Using ${packageManager.name} for package management.`);

      const cleanupOnError = async () => {
        log('Cleaning up node_modules and package-lock.json due to error...');
        const pathsToClean = [
          path.join(cmsSiteDir, 'node_modules'),
          path.join(cmsSiteDir, 'package-lock.json'),
          path.join(cmsSiteDir, '.cache'),
          path.join(resourcesPath, 'main-site', 'node_modules'),
          path.join(resourcesPath, 'main-site', 'package-lock.json'),
          path.join(resourcesPath, 'main-site', '.cache')
        ];

        for (const cleanPath of pathsToClean) {
          if (fs.existsSync(cleanPath)) {
            try {
              log(`  Removing: ${cleanPath}`);
              fs.rmSync(cleanPath, { recursive: true, force: true });
              log(`  ✓ Removed: ${cleanPath}`);
            } catch (err) {
              log(`  ⚠ Failed to remove ${cleanPath}: ${err.message}`);
            }
          }
        }
        log('✓ Cleanup complete. App folder is directly writable (asar disabled).');
      };

      const runPkgCommand = (args, options = {}) => {
        return new Promise((resolve, reject) => {
          const command = packageManager.name === 'npm' ? nodePath : packageManager.path;
          const finalArgs = packageManager.name === 'npm' ? [packageManager.path, ...args] : args;

          log(`Executing: ${command} ${finalArgs.join(' ')}`);
          log(`Working directory: ${cmsSiteDir}`);

          // Validate command and args exist
          if (!fs.existsSync(command)) {
            return reject(new Error(`Command executable not found: ${command}`));
          }
          if (packageManager.name === 'npm' && !fs.existsSync(packageManager.path)) {
            return reject(new Error(`npm-cli.js not found: ${packageManager.path}`));
          }

          const spawnOptions = {
            cwd: cmsSiteDir,
            env: {
              ...process.env,
              NODE_ENV: options.nodeEnv || process.env.NODE_ENV,
              NODE_PATH: path.join(npmSourceDir, 'node_modules'),
              PATH: process.env.PATH // Use updated PATH with our node/npm
            },
          };

          const childProcess = spawn(command, finalArgs, spawnOptions);

          childProcess.stdout.on('data', (data) => log(data.toString()));
          childProcess.stderr.on('data', (data) => log(data.toString()));

          childProcess.on('error', (error) => {
            log(`Process error: ${error.message}`);
            reject(new Error(`Failed to spawn ${packageManager.name}: ${error.message}`));
          });

          childProcess.on('close', async (code) => {
            if (code === 0) {
              resolve();
            } else {
              await cleanupOnError();
              reject(new Error(`Command "${packageManager.name} ${args.join(' ')}" failed with code ${code}`));
            }
          });
        });
      };

      log(`Running ${packageManager.name} install...`);
      try {
        // Check if node_modules already exists and is valid
        const cmsSiteNodeModules = path.join(cmsSiteDir, 'node_modules');
        const packageLockPath = path.join(cmsSiteDir, 'package-lock.json');

        if (fs.existsSync(cmsSiteNodeModules) && fs.existsSync(packageLockPath)) {
          log('node_modules and package-lock.json exist, checking validity...');
          // Try to verify it's complete by checking for key packages
          const hasGatsby = fs.existsSync(path.join(cmsSiteNodeModules, 'gatsby'));
          const hasReact = fs.existsSync(path.join(cmsSiteNodeModules, 'react'));

          if (hasGatsby && hasReact) {
            log('node_modules appears valid, skipping install for faster startup.');
          } else {
            log('node_modules incomplete, cleaning and reinstalling...');
            await cleanupOnError();
            await runPkgCommand(['install', '--legacy-peer-deps', '--prefer-offline', '--no-audit', '--no-fund']);
          }
        } else {
          log('node_modules missing, installing...');
          await runPkgCommand(['install', '--legacy-peer-deps', '--prefer-offline', '--no-audit', '--no-fund']);
        }
        log(`${packageManager.name} install completed.`);
      } catch (installError) {
        log(`Error during ${packageManager.name} install: ${installError.message}`);
        log('Attempting cleanup and retry...');
        await cleanupOnError();

        // Try one more time after cleanup with faster flags
        try {
          await runPkgCommand(['install', '--prefer-offline', '--no-audit', '--no-fund', '--legacy-peer-deps']);
          log('Retry succeeded after cleanup.');
        } catch (retryError) {
          log(`Retry also failed: ${retryError.message}`);
          log('\n💡 npm install failed. Entering console mode for manual debugging.');
          log(`   You can run: cd cms-site && npm install`);
          throw installError;
        }
      }

      log(`Running gatsby develop with ${packageManager.name}...`);
      const command = packageManager.name === 'npm' ? nodePath : packageManager.path;
      const finalArgs = packageManager.name === 'npm'
        ? [packageManager.path, 'run', 'develop']
        : ['run', 'develop'];

      log(`Gatsby command: ${command} ${finalArgs.join(' ')}`);

      // Use explicit environment to force color output and proper TTY behavior
      const gatsbyEnv = {
        ...process.env,
        FORCE_COLOR: '1',
        CI: 'false',
        // Ensure Gatsby doesn't wait for stdin
        GATSBY_TELEMETRY_DISABLED: '1',
        GATSBY_LOGGER_LOG_LEVEL: 'error',
        PATH: process.env.PATH // Ensure PATH includes our node/npm
      };

      gatsbyProcess = spawn(command, finalArgs, {
        cwd: cmsSiteDir,
        env: gatsbyEnv,
        stdio: ['ignore', 'pipe', 'pipe'] // Ignore stdin, pipe stdout/stderr
      });

      let serverReady = false;
      let readyTimeout;

      gatsbyProcess.on('error', (error) => {
        log(`Failed to start Gatsby process: ${error.message}`);
        if (!serverReady) {
          reject(new Error(`Failed to start Gatsby: ${error.message}`));
        }
      });

      const checkOutput = (data) => {
        const output = data.toString();
        log(output);

        // Fallback: if we see "write out requires" (one of the last steps before server start),
        // start checking the port
        if (!serverReady && output.includes('write out requires')) {
          log('Detected final build step, checking if server is starting...');
          clearTimeout(readyTimeout);

          // Start polling the port to see when Gatsby server actually starts
          const pollPort = async () => {
            log('Waiting for Gatsby server on port 8000...');
            const isReady = await waitForPort(8000, 'localhost', 90, 2000);

            if (isReady) {
              log('Gatsby development server is ready and accessible on port 8000.');
              serverReady = true;
              resolve();
            } else {
              log('Warning: Port 8000 did not become available within expected time.');
              log('The server might still be starting. Will continue waiting...');
              // Try one more time with extended timeout
              const isReadyExtended = await waitForPort(8000, 'localhost', 30, 2000);
              if (isReadyExtended) {
                log('Gatsby development server is now ready.');
                serverReady = true;
                resolve();
              } else {
                log('Error: Gatsby server failed to start on port 8000.');
                reject(new Error('Gatsby server did not start within expected time'));
              }
            }
          };

          pollPort().catch(err => {
            log(`Error while waiting for Gatsby server: ${err.message}`);
            if (!serverReady) {
              reject(err);
            }
          });
        }

        // Also check for direct indicators that server is ready
        if (!serverReady && (
          output.includes('You can now view') ||
          output.match(/Local:\s+http:\/\/localhost:\d+/)
        )) {
          log('Detected server ready message in output, verifying port...');
          checkPort(8000).then(isOpen => {
            if (isOpen && !serverReady) {
              serverReady = true;
              clearTimeout(readyTimeout);
              log('Gatsby development server is ready (confirmed via output and port check).');
              resolve();
            }
          });
        }
      };

      gatsbyProcess.stdout.on('data', checkOutput);
      gatsbyProcess.stderr.on('data', checkOutput);

      gatsbyProcess.on('close', (code) => {
        clearTimeout(readyTimeout);
        if (!serverReady && code !== 0) {
          log(`Gatsby process exited unexpectedly with code ${code}`);
          reject(new Error(`Gatsby process exited with code ${code}`));
        }
      });
    } catch (error) {
      log(`Error in startGatsby: ${error.message}`);
      log(`Stack trace: ${error.stack}`);
      reject(error);
    }
  });
};

app.whenReady().then(async () => {
  try {
    log('=== Application Starting ===');
    log(`App is packaged: ${IS_PACKAGED}`);
    log(`asar disabled: true (direct filesystem access enabled)`);
    log(`__dirname: ${__dirname}`);
    log(`process.resourcesPath: ${process.resourcesPath}`);
    log(`app.getAppPath(): ${app.getAppPath()}`);
    log(`App folder writable: ${ensureWritableDir(getResourcePath())}`);

    if (process.platform === 'darwin') {
      try {
        // Try multiple icon paths for both dev and packaged scenarios
        log('Searching for macOS dock icon in paths:');
        const iconPaths = [
          getResourcePath('static/assets/tables-icon.png'),
          path.join(process.resourcesPath, 'static', 'assets', 'tables-icon.png'),
          path.join(__dirname, 'static/assets/tables-icon.png')
        ];

        let iconSet = false;
        for (const iconPath of iconPaths) {
          log(`  Checking: ${iconPath}`);
          if (fs.existsSync(iconPath)) {
            app.dock.setIcon(iconPath);
            iconSet = true;
            log(`  ✓ Dock icon set from: ${iconPath}`);
            break;
          }
        }

        if (!iconSet) {
          log('  ⚠ Warning: Could not find dock icon at any expected path');
        }
      } catch (iconError) {
        log(`  ⚠ Warning: Failed to set dock icon: ${iconError.message}`);
      }
    }
    await createLaunchWindow();
    log('Console window created.');

    const isMac = process.platform === 'darwin';

    const menu = Menu.buildFromTemplate([
      // App Menu (macOS only)
      ...(isMac ? [{
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }] : []),
      // File Menu
      {
        label: 'File',
        submenu: [
          isMac ? { role: 'close' } : { role: 'quit' }
        ]
      },
      // Edit Menu
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          ...(isMac ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [
                { role: 'startSpeaking' },
                { role: 'stopSpeaking' }
              ]
            }
          ] : [
            { role: 'delete' },
            { type: 'separator' },
            { role: 'selectAll' }
          ])
        ]
      },
      // View Menu
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          {
            label: 'Toggle Developer Tools',
            accelerator: isMac ? 'Cmd+Alt+I' : 'Ctrl+Shift+I',
            click: () => {
              const focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow) {
                focusedWindow.webContents.toggleDevTools();
              } else {
                mainWindow?.webContents.toggleDevTools();
                launchWindow?.webContents.toggleDevTools();
              }
            },
          },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ],
      },
      // Window Menu
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'zoom' },
          ...(isMac ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' }
          ] : [
            { role: 'close' }
          ])
        ]
      }
    ]);
    Menu.setApplicationMenu(menu);

    await startGatsby();
    createMainWindow();
    mainWindow.once('ready-to-show', () => {
      if (launchWindow && !launchWindow.isDestroyed() && !keepConsoleVisible) {
        launchWindow.hide();
      }
      mainWindow.show();
    });
  } catch (error) {
    log(`\n${'='.repeat(60)}`);
    log(`⚠️  STARTUP ERROR`);
    log(`${'='.repeat(60)}`);
    log(`Error: ${error.message}`);
    if (error.stack) {
      log(`Stack: ${error.stack}`);
    }
    handleFatalError(error, 'Application Startup');
    // Don't propagate - keep console running
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('before-quit', () => {
  if (gatsbyProcess) {
    log('Terminating Gatsby process...');
    const killed = gatsbyProcess.kill();
    log(killed ? 'Gatsby process terminated.' : 'Failed to terminate Gatsby process.');
  }
});

// cms-site Settings section

import React, { useState, useEffect } from 'react';
import { toBase64 } from '../utils';
import AssetManagerModal from '../AssetManagerModal';

const SettingsSection = ({ cmsData }) => {
  const {
    settings,
    saveSettings,
    collabState,
    startCollaborationServer,
    connectToCollaborationServer,
    disconnectCollaboration,
    requestLock,
    releaseLock
  } = cmsData;
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [assetModalTarget, setAssetModalTarget] = useState(null);
  const [extensions, setExtensions] = useState({});
  const [connectIP, setConnectIP] = useState('');
  const [connectName, setConnectName] = useState('');

  // Helper to check if a field is locked by someone else
  const getLockInfo = (fieldId) => {
    if (!collabState?.activeLocks) return null;
    const lock = collabState.activeLocks.find(l => l.fieldId === fieldId);
    if (lock && lock.socketId !== socketRef?.current?.id) { // We haven't exposed socketRef ID, but we know if WE hold it
      // Actually, we don't know our own socket ID easily unless we store it.
      // But we know 'clientName'. Let's rely on that for now or just check if WE requested it?
      // The hook tells us if status is 'locked'.
      // Let's refine: The hook should probably tell us if WE hold the lock.
      // For now, let's assume if it's in activeLocks, it's locked.
      // We need to know if it's OUR lock to allow editing.
      // If we are the one who locked it, we can edit.
      // But looking at the hook implementation: activeLocks contains { fieldId, clientName, socketId }
      // We need to compare with our socketId? We don't have it in state.
      // Let's rely on the disabled state logic:
      // If we receive "lock-denied", we can't edit.
      // If we see a lock in activeLocks for this field, is it ours?
      // We need to store our socketID in collabState.
      return lock;
    }
    return null;
  };

  const isLockedForMe = (fieldId) => {
    if (!collabState?.activeLocks) return false;
    const lock = collabState.activeLocks.find(l => l.fieldId === fieldId);
    // We need to know if it's NOT us. 
    // Since we didn't expose socketID in collabState yet, let's handle this by
    // checking if we are able to focus it? 
    // Actually, better to update useCMSData to store my socketID.
    // For this step, I will implement the UI and then fix the hook if needed.
    // Let's assume for now if there is a lock, it's locked mainly for display.
    // Real disabling happens if someone else has it.
    // I will add a 'mySocketId' to collabState in a followup if needed.
    return !!lock;
  };

  useEffect(() => {
    const getExtensionsFromStorage = () => {
      try {
        return JSON.parse(localStorage.getItem('extensions') || '{}');
      } catch (e) {
        return {};
      }
    };
    setExtensions(getExtensionsFromStorage());

    const updateExtensions = () => {
      setExtensions(getExtensionsFromStorage());
    };

    window.addEventListener('storage', updateExtensions);
    window.addEventListener('extensions-updated', updateExtensions);

    return () => {
      window.removeEventListener('storage', updateExtensions);
      window.removeEventListener('extensions-updated', updateExtensions);
    };
  }, []);

  const handleChange = (field, value) => {
    saveSettings({ ...settings, [field]: value });
  };

  const handleVercelProjectNameChange = (value) => {
    const projectName = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    saveSettings({
      ...settings,
      vercelProjectName: projectName,
      domain: projectName ? `https://${projectName}.vercel.app/` : ''
    });
  };

  const handleFileChange = async (field, file) => {
    if (file) {
      const base64 = await toBase64(file);
      handleChange(field, base64);
    }
  };

  const handleSelectImage = (field) => {
    setAssetModalTarget(field);
    setAssetModalOpen(true);
  };

  const handleAssetSelected = (asset) => {
    if (assetModalTarget) {
      handleChange(assetModalTarget, asset.url);
    }
    setAssetModalOpen(false);
    setAssetModalTarget(null);
  };

  const handleAddLanguage = () => {
    const langCode = window.prompt('Enter language code (e.g., en, sk, de):');
    if (!langCode) return;

    const langName = window.prompt('Enter language name (e.g., English, Slovak, German):');
    if (!langName) return;

    const currentLanguages = settings.languages || [];
    const newLanguage = { code: langCode.toLowerCase(), name: langName };

    // Check if language already exists
    if (currentLanguages.some(lang => lang.code === newLanguage.code)) {
      alert('Language already exists!');
      return;
    }

    saveSettings({ ...settings, languages: [...currentLanguages, newLanguage] });
  };

  const handleRemoveLanguage = (langCode) => {
    if (!window.confirm(`Are you sure you want to remove this language? This will not delete existing content.`)) {
      return;
    }

    const currentLanguages = settings.languages || [];
    const updatedLanguages = currentLanguages.filter(lang => lang.code !== langCode);
    saveSettings({ ...settings, languages: updatedLanguages });
  };

  const handleAddSocialMedia = () => {
    const currentSocialMedia = settings.socialMedia || [];
    saveSettings({ ...settings, socialMedia: [...currentSocialMedia, { platform: '', url: '' }] });
  };

  const handleRemoveSocialMedia = (index) => {
    const currentSocialMedia = settings.socialMedia || [];
    const updatedSocialMedia = currentSocialMedia.filter((_, i) => i !== index);
    saveSettings({ ...settings, socialMedia: updatedSocialMedia });
  };

  const handleSocialMediaChange = (index, field, value) => {
    const currentSocialMedia = settings.socialMedia || [];
    const updatedSocialMedia = [...currentSocialMedia];
    updatedSocialMedia[index][field] = value;
    saveSettings({ ...settings, socialMedia: updatedSocialMedia });
  };

  const cardStyle = {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '20px',
  };

  const buttonStyle = {
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: 'white',
    color: '#2563eb',
    border: '1px solid #2563eb50',
  };

  const destructiveButtonStyle = {
    ...buttonStyle,
    background: '#ef4444',
    color: 'white',
    padding: '5px 10px',
  };

  const LockedInputWrapper = ({ fieldId, children }) => {
    const lock = collabState?.activeLocks?.find(l => l.fieldId === fieldId);
    // Check if it's my lock? We need a way to know. 
    // For now, show indicator if locked.

    const handleFocus = () => {
      requestLock(fieldId);
    };

    const handleBlur = () => {
      releaseLock(fieldId);
    };

    // Clone child to add handlers
    const child = React.Children.only(children);
    return (
      <div style={{ position: 'relative' }}>
        {React.cloneElement(child, {
          onFocus: (e) => {
            handleFocus();
            if (child.props.onFocus) child.props.onFocus(e);
          },
          onBlur: (e) => {
            handleBlur();
            if (child.props.onBlur) child.props.onBlur(e);
          },
          disabled: lock && lock.clientName !== collabState.clientName && lock.clientName !== connectName // heuristic
        })}
        {lock && (
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '0',
            background: '#e11d48',
            color: 'white',
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '4px',
            zIndex: 10
          }}>
            Locked by {lock.clientName}
          </div>
        )}
      </div>
    );
  };

  const renderImageUpload = (label, field, accept) => (
    <div style={{ marginBottom: '20px' }}>
      <strong style={{ display: 'block', marginBottom: '10px' }}>{label}:</strong>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <LockedInputWrapper fieldId={field}>
          <input
            type="file"
            accept={accept}
            onChange={(e) => handleFileChange(field, e.target.files[0])}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px',
              border: '1px solid #cbd5e1',
            }}
          />
        </LockedInputWrapper>
        <button onClick={() => handleSelectImage(field)} style={{ ...secondaryButtonStyle, padding: '8px 15px', whiteSpace: 'nowrap' }}>
          Select from Assets
        </button>
      </div>
      {settings[field] && (
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={settings[field]}
            alt={`${label} Preview`}
            style={{
              maxWidth: field === 'siteFavicon' ? '32px' : '200px',
              maxHeight: field === 'siteFavicon' ? '32px' : '100px',
              border: '1px solid #e2e8f0',
              background: field === 'siteLogoWhite' ? '#1e293b' : 'transparent',
              padding: field === 'siteLogoWhite' ? '10px' : '0'
            }}
          />
          <button onClick={() => handleChange(field, '')} style={{ ...destructiveButtonStyle }}>Remove</button>
        </div>
      )}
    </div>
  );

  return (
    <section className="main-section active" id="settings">
      <header>
        <h1>Settings</h1>
      </header>
      {(!settings.siteTitle || !settings.vercelApiKey || !settings.vercelProjectName) && (
        <div style={{ margin: '20px', padding: '15px 20px', background: '#fef3c7', border: '1px solid #f59e0b', color: '#92400e', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <strong>Action Required:</strong>
            {!settings.siteTitle && ' Please fill out the Site Title.'}
            {!settings.vercelApiKey && ' Please add your Vercel Deploy API Key.'}
            {!settings.vercelProjectName && ' Please add your Vercel Project Name.'}
          </div>
        </div>
      )}
      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '20px' }}>

        {/* Collaboration Settings */}
        <div style={{ ...cardStyle, gridColumn: '1 / -1', borderColor: '#3b82f6', background: '#eff6ff' }}>
          <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold', color: '#1e40af' }}>
            <i className="fa-solid fa-users" style={{ marginRight: '10px' }}></i>
            Collaboration
          </h2>

          {!collabState.isConnected ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Join Existing Server</h3>
                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                  <input
                    type="text"
                    placeholder="Server IP (e.g., 192.168.1.5:8081)"
                    value={connectIP}
                    onChange={(e) => setConnectIP(e.target.value)}
                    style={{ padding: '8px', border: '1px solid #cbd5e1' }}
                  />
                  <input
                    type="text"
                    placeholder="Your Name (e.g., Editor 2)"
                    value={connectName}
                    onChange={(e) => setConnectName(e.target.value)}
                    style={{ padding: '8px', border: '1px solid #cbd5e1' }}
                  />
                  <button
                    onClick={() => {
                      if (connectIP && connectName) {
                        // If no protocol, add http
                        const url = connectIP.startsWith('http') ? connectIP : `http://${connectIP}`;
                        connectToCollaborationServer(url, connectName);
                      } else {
                        alert('Please enter IP and Name');
                      }
                    }}
                    style={{ ...buttonStyle, background: '#3b82f6', color: 'white' }}
                  >
                    Connect
                  </button>
                </div>
              </div>
              <div style={{ borderLeft: '1px solid #bfdbfe', paddingLeft: '30px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Host Server</h3>
                <p style={{ fontSize: '14px', color: '#60a5fa', marginBottom: '15px' }}>
                  Use this instance as the central server. Other clients can connect to you.
                  <br /><strong>Note:</strong> Editing is disabled on the Host instance.
                </p>
                <button
                  onClick={startCollaborationServer}
                  style={{ ...buttonStyle, background: '#1e40af', color: 'white' }}
                >
                  Start Server
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', display: 'inline-block' }}></span>
                    <strong>Status:</strong>
                    {collabState.isServer ? ' Hosting Server' : ' Connected to Server'}
                  </div>
                  {collabState.isServer && (
                    <div style={{ marginTop: '5px', fontSize: '14px' }}>
                      <strong>Server IP:</strong> {collabState.serverIP}:8081
                    </div>
                  )}
                </div>
                <button onClick={disconnectCollaboration} style={destructiveButtonStyle}>Disconnect</button>
              </div>

              <div>
                <strong>Connected Clients:</strong>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  {collabState.connectedClients.map(client => (
                    <li key={client.id}>{client.name} {client.id === collabState.socketId ? '(You)' : ''}</li>
                  ))}
                  {collabState.connectedClients.length === 0 && <li style={{ color: '#94a3b8' }}>No other clients connected</li>}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* General Settings */}
        <div style={{ ...cardStyle }}>
          <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>General</h2>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Site Title:</strong>
              <LockedInputWrapper fieldId="siteTitle">
                <input type="text" value={settings.siteTitle || ''} onChange={(e) => handleChange('siteTitle', e.target.value)} placeholder="Enter your site title" style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1', }} />
              </LockedInputWrapper>
            </label>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>This will appear on the homepage.</p>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Default Meta Description:</strong>
              <LockedInputWrapper fieldId="defaultMetaDescription">
                <textarea value={settings.defaultMetaDescription || ''} onChange={(e) => handleChange('defaultMetaDescription', e.target.value)} placeholder="Enter a default meta description for your site" rows="3" style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }} />
              </LockedInputWrapper>
            </label>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>Default meta description for pages.</p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={settings.showBreadcrumbs || false} onChange={(e) => handleChange('showBreadcrumbs', e.target.checked)} style={{ cursor: 'pointer', width: '18px', height: '18px' }} />
            <strong>Show breadcrumbs on pages and articles</strong>
          </label>
        </div>

        {/* Branding */}
        <div style={{ ...cardStyle }}>
          <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Branding</h2>
          {renderImageUpload('Site Logo', 'siteLogo', 'image/*')}
          {renderImageUpload('Site Logo White', 'siteLogoWhite', 'image/*')}
          {renderImageUpload('Site Favicon', 'siteFavicon', 'image/png, image/x-icon, image/svg+xml')}
        </div>

        {/* Languages */}
        <div style={{ ...cardStyle }}>
          <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Languages</h2>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Default Language:</strong>
              <select value={settings.defaultLang || 'en'} onChange={(e) => handleChange('defaultLang', e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1', }}>
                {(settings.languages || [{ code: 'en', name: 'English' }]).map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name} ({lang.code})</option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ display: 'block', marginBottom: '10px' }}>Available Languages:</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(settings.languages || [{ code: 'en', name: 'English' }]).map(lang => (
                <div key={lang.code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 15px', background: 'white', border: '1px solid #e2e8f0', }}>
                  <div>
                    <strong>{lang.name}</strong> <span style={{ color: '#64748b' }}>({lang.code})</span>
                    {lang.code === settings.defaultLang && <span style={{ marginLeft: '10px', padding: '2px 8px', background: '#10b981', color: 'white', fontSize: '12px', fontWeight: '600' }}>DEFAULT</span>}
                  </div>
                  {lang.code !== 'en' && (
                    <button onClick={() => handleRemoveLanguage(lang.code)} style={destructiveButtonStyle}>Remove</button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleAddLanguage} style={secondaryButtonStyle}>+ Add Language</button>
        </div>

        {/* Social Media */}
        <div style={{ ...cardStyle }}>
          <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Social Media Links</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '15px' }}>
            {(settings.socialMedia || []).map((social, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LockedInputWrapper fieldId={`social-${index}-platform`}>
                  <select value={social.platform} onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)} style={{ width: '150px', padding: '10px', border: '1px solid #cbd5e1', }}>
                    <option value="">Select Platform</option>
                    <option value="X">X (Twitter)</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Reddit">Reddit</option>
                    <option value="Patreon">Patreon</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="GitHub">GitHub</option>
                    <option value="TikTok">TikTok</option>
                  </select>
                </LockedInputWrapper>
                <LockedInputWrapper fieldId={`social-${index}-url`}>
                  <input type="text" value={social.url} onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)} placeholder="Enter URL" style={{ flex: '1', padding: '10px', border: '1px solid #cbd5e1', }} />
                </LockedInputWrapper>
                <button onClick={() => handleRemoveSocialMedia(index)} style={{ ...destructiveButtonStyle, padding: '10px' }}>Remove</button>
              </div>
            ))}
          </div>
          <button onClick={handleAddSocialMedia} style={secondaryButtonStyle}>+ Add Social Media Link</button>
        </div>

        {extensions['movietracker-extension-enabled'] && (
          <div style={{ ...cardStyle }}>
            <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Movie Tracker</h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <strong>OMDb API Key:</strong>
                <LockedInputWrapper fieldId="omdbApiKey">
                  <input type="text" value={settings.omdbApiKey || ''} onChange={(e) => handleChange('omdbApiKey', e.target.value)} placeholder="Enter your OMDb API key" style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1', }} />
                </LockedInputWrapper>
              </label>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
                Get your API key from <a href="https://www.omdbapi.com/apikey.aspx" target="_blank" rel="noopener noreferrer">omdbapi.com</a>
              </p>
            </div>
          </div>
        )}

        {/* Deployment */}
        <div style={{ ...cardStyle, gridColumn: '1 / -1' }}>
          <h2 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Deployment</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <strong>Vercel Deploy API Key:</strong>
                <LockedInputWrapper fieldId="vercelApiKey">
                  <input type="password" value={settings.vercelApiKey || ''} onChange={(e) => handleChange('vercelApiKey', e.target.value)} placeholder="Enter your Vercel deploy token" style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1', }} />
                </LockedInputWrapper>
              </label>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
                Get your deploy token from <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer">vercel.com/account/tokens</a>
              </p>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <strong>Vercel Project Name:</strong>
                <LockedInputWrapper fieldId="vercelProjectName">
                  <input type="text" value={settings.vercelProjectName || ''} onChange={(e) => handleVercelProjectNameChange(e.target.value)} placeholder="my-project-name" pattern="[a-z-]+" style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1', }} />
                </LockedInputWrapper>
              </label>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>Lowercase letters and dashes only.</p>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <strong>Domain:</strong>
                <input type="text" value={settings.domain || ''} readOnly placeholder="Auto-generated from Vercel Project Name" style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #cbd5e1', background: '#f3f4f6', cursor: 'not-allowed' }} />
              </label>
            </div>
          </div>
        </div>

      </div>

      <AssetManagerModal
        isOpen={assetModalOpen}
        onClose={() => setAssetModalOpen(false)}
        assets={cmsData?.uploads || []}
        onSelectAsset={handleAssetSelected}
      />
    </section>
  );
};

export default SettingsSection;

// useCMSData.js

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
    connectedClients: []
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
      setCollabState(prev => ({ ...prev, isConnected: true, clientName: name }));
      socket.emit('register-client', { name });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from collaboration server');
      setCollabState(prev => ({ ...prev, isConnected: false }));
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
      connectedClients: []
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

