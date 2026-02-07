const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const net = require('net');
const AnsiToHtml = require('ansi-to-html');
const { Server } = require('socket.io'); // Socket.io server
const http = require('http'); // Required for Socket.io standalone
const dgram = require('node:dgram'); // UDP for auto-discovery

// Collaboration State
let io;
let collabServer;
let connectedClients = new Map(); // socketId -> clientInfo
let activeLocks = new Map(); // fieldId -> { socketId, timestamp, clientName }

// Discovery State
const DISCOVERY_PORT = 41234;
const DISCOVERY_MSG_KEY = 'tables-cms-discovery';
let discoverySocket;
let broadcastInterval;

const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
};

const startDiscoveryService = () => {
  try {
    discoverySocket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

    discoverySocket.on('error', (err) => {
      log(`Discovery socket error: ${err.message}`);
      discoverySocket.close();
    });

    discoverySocket.on('message', (msg, rinfo) => {
      try {
        const message = JSON.parse(msg.toString());
        if (message.key === DISCOVERY_MSG_KEY && message.type === 'announce') {
          // Verify it's not our own broadcast (optional, but good for UI to filter if needed)
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('collab-server-found', {
              ip: message.ip,
              hostname: message.hostname,
              port: message.port
            });
          }
        }
      } catch (e) {
        // Ignore malformed messages
      }
    });

    discoverySocket.bind(DISCOVERY_PORT, () => {
      discoverySocket.setBroadcast(true);
      log(`Discovery service listening on UDP port ${DISCOVERY_PORT}`);
    });
  } catch (e) {
    log(`Failed to start discovery service: ${e.message}`);
  }
};

const startBroadcasting = () => {
  if (broadcastInterval) clearInterval(broadcastInterval);

  const ip = getLocalIP();
  const hostname = os.hostname();
  const message = JSON.stringify({
    key: DISCOVERY_MSG_KEY,
    type: 'announce',
    ip: ip,
    hostname: hostname,
    port: 3001 // Default socket.io port
  });

  log(`Starting UDP broadcast for ${ip} on port ${DISCOVERY_PORT}`);

  broadcastInterval = setInterval(() => {
    if (discoverySocket) {
      discoverySocket.send(message, DISCOVERY_PORT, '255.255.255.255', (err) => {
        if (err) log(`Broadcast error: ${err.message}`);
      });
    }
  }, 3000);
};

const stopBroadcasting = () => {
  if (broadcastInterval) {
    clearInterval(broadcastInterval);
    broadcastInterval = null;
    log('Stopped UDP broadcast');
  }
};





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
  startDiscoveryService(); // Start UDP discovery listener
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
  stopBroadcasting();
  if (discoverySocket) {
    discoverySocket.close();
    discoverySocket = null;
  }
});

// ============================================================================
// Collaboration Server Logic
// ============================================================================

ipcMain.handle('collab-get-ip', () => getLocalIP());

ipcMain.handle('collab-start-server', async () => {
  try {
    startServer();
    return { status: 'started', ip: getLocalIP() };
  } catch (e) {
    return { status: 'error', error: e.message };
  }
});

ipcMain.handle('collab-stop-server', async () => {
  stopServer();
  return { status: 'stopped' };
});

const startServer = () => {
  if (collabServer) return;

  collabServer = http.createServer();
  io = new Server(collabServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    const clientIp = socket.handshake.address;
    log(`Client connected: ${socket.id} from ${clientIp}`);

    // Send current active locks to new client
    socket.emit('lock-update', Array.from(activeLocks.entries()));

    socket.on('register-client', (clientInfo) => {
      connectedClients.set(socket.id, { ...clientInfo, ip: clientIp, id: socket.id });
      if (clientInfo.isHost) {
        hostSocketId = socket.id;
        log(`Host registered: ${socket.id}`);
      }
      io.emit('client-list-update', Array.from(connectedClients.values()));
    });

    // Handle Build Requests
    socket.on('request-save-and-build', async (payload) => {
      log(`Received build request from ${socket.id}`);

      if (isBuildInProgress) {
        socket.emit('build-status', 'Build already in progress');
        return;
      }

      isBuildInProgress = true;
      io.emit('build-status', { isBuildInProgress: true, status: 'Starting build...' });

      try {
        const postData = JSON.stringify(payload);
        const req = http.request({
          hostname: 'localhost',
          port: 8000,
          path: '/api/build',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        }, (res) => {
          log(`Triggered build via API, status: ${res.statusCode}`);
          if (res.statusCode === 200 || res.statusCode === 409) {
            // isBuildInProgress remains true
            io.emit('build-status', { isBuildInProgress: true, status: 'Build confirmed on host...' });
            startGlobalBuildPolling();
          } else {
            isBuildInProgress = false;
            io.emit('build-status', { isBuildInProgress: false, status: `Failed to trigger build: ${res.statusCode}` });
            io.emit('build-error', `Failed to trigger build on host: ${res.statusCode}`);
          }
        });
        req.on('error', (e) => {
          isBuildInProgress = false;
          log(`Failed to trigger build API: ${e.message}`);
          io.emit('build-status', { isBuildInProgress: false, status: 'Failed to start build on host' });
        });
        req.write(postData);
        req.end();
      } catch (e) {
        isBuildInProgress = false;
        log(`Error triggering build: ${e.message}`);
        io.emit('build-status', { isBuildInProgress: false, status: 'Error triggering build' });
      }
    });

    socket.on('request-lock', ({ fieldId, user }) => {
      if (activeLocks.has(fieldId)) {
        const lock = activeLocks.get(fieldId);
        if (lock.socketId === socket.id) {
          socket.emit('lock-granted', { fieldId });
          return;
        }
        socket.emit('lock-denied', { fieldId, lockedBy: lock.clientName });
      } else {
        activeLocks.set(fieldId, { socketId: socket.id, timestamp: Date.now(), clientName: user.name });
        io.emit('lock-update', Array.from(activeLocks.entries()));
        socket.emit('lock-granted', { fieldId });
        log(`Lock granted: ${fieldId} to ${user.name}`);
      }
    });

    socket.on('release-lock', ({ fieldId }) => {
      if (activeLocks.has(fieldId)) {
        const lock = activeLocks.get(fieldId);
        if (lock.socketId === socket.id) {
          activeLocks.delete(fieldId);
          io.emit('lock-update', Array.from(activeLocks.entries()));
          log(`Lock released: ${fieldId}`);
        }
      }
    });

    socket.on('disconnect', () => {
      log(`Client disconnected: ${socket.id}`);
      connectedClients.delete(socket.id);
      if (hostSocketId === socket.id) {
        hostSocketId = null;
        log('Host disconnected.');
      }
      io.emit('client-list-update', Array.from(connectedClients.values()));

      let locksRemoved = false;
      for (const [fieldId, lock] of activeLocks.entries()) {
        if (lock.socketId === socket.id) {
          activeLocks.delete(fieldId);
          locksRemoved = true;
        }
      }
      if (locksRemoved) {
        io.emit('lock-update', Array.from(activeLocks.entries()));
        log(`Cleaned up locks for disconnected user ${socket.id}`);
      }
    });

    // Data Synchronization
    socket.on('data-update', (payload) => {
      if (socket.id === hostSocketId) {
        // Authoritative update from Host: Broadcast to ALL clients (including sender? No, sender knows. Broadcast sends to everyone else)
        // Actually, for consistency, maybe we should just broadcast to others. Host already applied it.
        socket.broadcast.emit('data-update', payload);
        // log('Broadcasted update from Host');
      } else {
        // Update from Peer: Forward to Host for approval/serialization
        if (hostSocketId) {
          io.to(hostSocketId).emit('forwarded-update', { ...payload, originSocketId: socket.id });
          log(`Forwarded update from ${socket.id} to Host`);
        } else {
          log('Received update from Peer but no Host connected. Ignoring.');
        }
      }
    });

    socket.on('sync-full-state', ({ targetSocketId, state }) => {
      // Relay full state to the specific new client
      io.to(targetSocketId).emit('hydrate-state', state);
      log(`Relayed full state to ${targetSocketId}`);
    });
  });

  collabServer.listen(3001, '0.0.0.0', () => {
    const ip = getLocalIP();
    log(`Collaboration Server running at http://${ip}:3001`);
    startBroadcasting(); // Start broadcasting via UDP
  });
};

const stopServer = () => {
  stopBroadcasting(); // Stop broadcasting
  if (io) {
    io.close();
    io = null;
  }
  if (collabServer) {
    collabServer.close();
    collabServer = null;
  }
  connectedClients.clear();
  activeLocks.clear();
  log('Collaboration Server stopped');
};

let buildPollInterval;
const startGlobalBuildPolling = () => {
  if (buildPollInterval) clearInterval(buildPollInterval);

  const poll = () => {
    http.get('http://localhost:8000/api/build', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const status = JSON.parse(data);
          io.emit('build-status', status);
          if (!status.isBuildInProgress) {
            clearInterval(buildPollInterval);
            buildPollInterval = null;
            log('Remote build finished.');
          }
        } catch (e) { }
      });
    }).on('error', (e) => { });
  };

  buildPollInterval = setInterval(poll, 2000);
  poll();
};
