const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const net = require('net');
const AnsiToHtml = require('ansi-to-html');

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
  const errorMessage = `A fatal error of type ${type} occurred: ${error.stack || error}`;
  log(errorMessage);

  const logPath = path.join(os.tmpdir(), `tables-cms-crash-${Date.now()}.log`);
  const fullLog = `${logHistory.join('\n')}\n\n${errorMessage}`;
  fs.writeFileSync(logPath, fullLog);

  dialog.showMessageBoxSync({
    type: 'error',
    title: 'Application Error',
    message: `A critical error occurred. The application must close.\n\nA log file has been saved at:\n${logPath}`,
    buttons: ['OK']
  });
  app.quit();
};

process.on('uncaughtException', (error) => handleFatalError(error, 'Uncaught Exception'));
process.on('unhandledRejection', (reason) => handleFatalError(reason, 'Unhandled Rejection'));

let gatsbyProcess;
let mainWindow;
let launchWindow;
let keepConsoleVisible = false;
let isBuildInProgress = false;

const IS_PACKAGED = app.isPackaged;

const createLaunchWindow = () => {
  try {
    launchWindow = new BrowserWindow({
      width: 800,
      height: 400,
      frame: false,
      icon: path.join(__dirname, 'static/assets/tables-icon.png'),
      titleBarStyle: 'hidden',
      title: 'Launch and Console Output',
      webPreferences: {
        preload: path.join(__dirname, 'electron-preload.js'),
        contextIsolation: true,
        webSecurity: false,
      },
    });

    launchWindow.loadFile('electron-launch.html');
    launchWindow.on('closed', () => {
      if (!mainWindow) {
        app.quit();
      }
      launchWindow = null;
    });

    return new Promise((resolve) => {
      launchWindow.webContents.on('did-finish-load', resolve);
    });
  } catch (error) {
    handleFatalError(error, 'Launch Window Creation');
  }
};

const createMainWindow = () => {
  try {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false,
      frame: false,
      icon: path.join(__dirname, 'static/assets/tables-icon.png'),
      titleBarStyle: 'hidden',
      webPreferences: {
        preload: path.join(__dirname, 'electron-preload.js'),
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
  log(`> ${command}`);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      log(`exec error: ${error.message}`);
      return;
    }
    if (stderr) {
      log(`stderr: ${stderr}`);
    }
    log(`stdout: ${stdout}`);
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
      const resourcesPath = IS_PACKAGED ? process.resourcesPath : __dirname;
      log(`Resources path: ${resourcesPath}`);
      const binPath = path.join(resourcesPath, 'support-bin', 'npm_source', 'bin');
      const nodePath = path.join(binPath, nodeExecutable);
      log(`Node.js path: ${nodePath}`);
      const npmCliPath = path.join(binPath, 'npm-cli.js');
      log(`npm-cli.js path: ${npmCliPath}`);
      const cmsSiteDir = path.join(resourcesPath, 'cms-site');
      log(`cms-site directory: ${cmsSiteDir}`);
      
      const bundleScriptPath = IS_PACKAGED
        ? path.join(process.resourcesPath, 'app', 'support-setup', 'bundle-node-npm.js')
        : path.join(__dirname, 'support-setup', 'bundle-node-npm.js');

      if (!fs.existsSync(bundleScriptPath)) {
        const tempPath = path.join(__dirname, 'support-setup', 'bundle-node-npm.js');
        if (fs.existsSync(tempPath)) {
          bundleScriptPath = tempPath;
        }
      }

      const { setupBinaries, getPackageManager } = require(bundleScriptPath);

      // Validate or setup binaries
      const npmSourceDir = path.join(resourcesPath, 'support-bin', 'npm_source');
      const utilsPath = path.join(npmSourceDir, 'lib', 'utils');
      const commandsPath = path.join(npmSourceDir, 'lib', 'commands');
      
      if (!fs.existsSync(nodePath) || !fs.existsSync(utilsPath) || !fs.existsSync(commandsPath)) {
        if (!fs.existsSync(nodePath)) {
          log('Node.js/npm binaries not found. Attempting to download them...');
        } else {
          log('npm installation appears incomplete (missing critical directories). Re-downloading...');
          log(`Missing: ${!fs.existsSync(utilsPath) ? 'lib/utils ' : ''}${!fs.existsSync(commandsPath) ? 'lib/commands' : ''}`);
        }
        
        try {
          await setupBinaries(resourcesPath);
          log('Binaries setup completed successfully.');
          
          // Verify installation after setup
          if (!fs.existsSync(utilsPath) || !fs.existsSync(commandsPath)) {
            throw new Error('Binary setup completed but npm installation is still incomplete. Please check the console output above for errors.');
          }
        } catch (error) {
          log('Failed to setup binaries. Please check your internet connection and try again.');
          log(error.message);
          log(error.stack || '');
          return reject(new Error('Failed to setup binaries: ' + error.message));
        }
      } else {
        log('Binaries validated successfully.');
      }
      
      const packageManager = getPackageManager(resourcesPath);
      log(`Using ${packageManager.name} for package management.`);

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
            env: { ...process.env, NODE_ENV: options.nodeEnv || process.env.NODE_ENV },
          };
          
          const childProcess = spawn(command, finalArgs, spawnOptions);
          
          childProcess.stdout.on('data', (data) => log(data.toString()));
          childProcess.stderr.on('data', (data) => log(data.toString()));
          
          childProcess.on('error', (error) => {
            log(`Process error: ${error.message}`);
            reject(new Error(`Failed to spawn ${packageManager.name}: ${error.message}`));
          });
          
          childProcess.on('close', (code) => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`Command "${packageManager.name} ${args.join(' ')}" failed with code ${code}`));
            }
          });
        });
      };

      log(`Running ${packageManager.name} install...`);
      try {
        await runPkgCommand(['install']);
        log(`${packageManager.name} install completed.`);
      } catch (installError) {
        log(`Error during ${packageManager.name} install: ${installError.message}`);
        throw installError;
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
        GATSBY_LOGGER_LOG_LEVEL: 'error'
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
            const isReady = await waitForPort(8000, 'localhost', 30, 1000);
            
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
          reject(new Error(`Gatsby process exited with code ${code}`));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

app.whenReady().then(async () => {
  try {
    if (process.platform === 'darwin') {
      app.dock.setIcon(path.join(__dirname, 'static/assets/tables-icon.png'));
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
          {
            label: 'Keep Console Visible',
            type: 'checkbox',
            checked: keepConsoleVisible,
            click: (item) => {
              keepConsoleVisible = item.checked;
            },
          },
          { type: 'separator' },
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
    handleFatalError(error, 'Application Startup');
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
