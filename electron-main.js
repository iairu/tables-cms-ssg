const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const AnsiToHtml = require('ansi-to-html');

const ansiToHtml = new AnsiToHtml();

let gatsbyProcess;
let mainWindow;
let launchWindow;
let keepConsoleVisible = false;
let isBuildInProgress = false;

const IS_PACKAGED = app.isPackaged;

const log = (msg) => {
  const msgStr = msg.toString();

  // Check for build lifecycle messages
  if (msgStr.includes('BUILD_START')) {
    isBuildInProgress = true;
    if (launchWindow && !launchWindow.isDestroyed() && !launchWindow.isVisible()) {
      launchWindow.show();
    }
    // We don't want to show the lifecycle message in the console UI
    console.log(msgStr); // log to terminal
    return;
  }
  if (msgStr.includes('BUILD_END')) {
    isBuildInProgress = false;
    if (launchWindow && !launchWindow.isDestroyed() && !keepConsoleVisible) {
      launchWindow.hide();
    }
    // We don't want to show the lifecycle message in the console UI
    console.log(msgStr); // log to terminal
    return;
  }

  console.log(msgStr); // log to terminal
  if (launchWindow && !launchWindow.isDestroyed()) {
    const html = ansiToHtml.toHtml(msgStr.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
    launchWindow.webContents.send('console-output', html);
  }
};

const createLaunchWindow = () => {
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
    // If launchWindow is closed and mainWindow has not yet been initialized (meaning it was not
    // closed programmatically because mainWindow is opening), then it implies the user
    // manually closed the launch window, and we should quit the app.
    if (!mainWindow) {
      app.quit();
    }
    launchWindow = null;
  });

  return new Promise((resolve) => {
    launchWindow.webContents.on('did-finish-load', () => {
      resolve();
    });
  });
};

const createMainWindow = () => {
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
};

ipcMain.on('close-app', () => {
  app.quit();
});

ipcMain.on('minimize-app', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('maximize-app', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

const startGatsby = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const platform = os.platform();
      const nodeExecutable = platform === 'win32' ? 'node.exe' : 'node';
      const resourcesPath = IS_PACKAGED ? process.resourcesPath : __dirname;
      const binPath = path.join(resourcesPath, 'support-bin', 'npm_source', 'bin');
      const nodePath = path.join(binPath, nodeExecutable);
      const npmCliPath = path.join(binPath, 'npm-cli.js');
      const cmsSiteDir = path.join(resourcesPath, 'cms-site');

      // Check for binaries and download if missing
      if (!fs.existsSync(nodePath) || !fs.existsSync(npmCliPath)) {
        log('Node.js/npm binaries not found. Attempting to download them...');
        try {
          const { setupBinaries } = require('./support-setup/bundle-node-npm.js');
          await setupBinaries(resourcesPath);
          log('Binaries downloaded successfully.');
        } catch (error) {
          log('Failed to download binaries. Please check your internet connection and try again.');
          log(error.message);
          app.quit();
          return reject(new Error('Failed to download binaries.'));
        }
      }

      log('Starting Gatsby development server using bundled node and npm...');

      const runNpmCommand = (args) => {
        return new Promise((resolve, reject) => {
          const childProcess = spawn(nodePath, [npmCliPath, ...args], { cwd: cmsSiteDir });
          childProcess.stdout.on('data', (data) => log(data.toString()));
          childProcess.stderr.on('data', (data) => log(data.toString()));
          childProcess.on('close', (code) => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`Command "npm ${args.join(' ')}" failed with code ${code}`));
            }
          });
        });
      };

      log('Running npm install in CMS site...');
      await runNpmCommand(['install']);
      log('npm install completed.');

      log('Running gatsby develop in CMS site...');
      gatsbyProcess = spawn(nodePath, [npmCliPath, 'run', 'develop'], { cwd: cmsSiteDir });

      gatsbyProcess.stdout.on('data', (data) => {
          log(data.toString());
          if (data.toString().includes('You can now view')) {
              log('Gatsby development server is ready.');
              resolve();
          }
      });

      gatsbyProcess.stderr.on('data', (data) => log(data.toString()));

      gatsbyProcess.on('close', (code) => {
          if (code !== 0) {
              const errorMsg = `Gatsby process exited with code ${code}`;
              log(errorMsg);
              reject(new Error(errorMsg));
          }
      });
    } catch (error) {
        log(error.message);
        reject(error);
    }
  });
};

app.whenReady().then(async () => {
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, 'static/assets/tables-icon.png'));
  }
  await createLaunchWindow();
  log('Console window created.');

  const menu = Menu.buildFromTemplate([
    {
      label: 'View',
      submenu: [
        {
          label: 'Keep Console Visible',
          type: 'checkbox',
          checked: keepConsoleVisible,
          click: (item) => {
            keepConsoleVisible = item.checked;
            if (launchWindow && !launchWindow.isDestroyed()) {
              if (keepConsoleVisible) {
                launchWindow.show();
              } else if (!isBuildInProgress) {
                launchWindow.hide();
              }
            }
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CmdOrCtrl+Alt+I',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.toggleDevTools();
            }
            if (launchWindow && !launchWindow.isDestroyed()) {
              launchWindow.webContents.toggleDevTools();
            }
          }
        }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);

  try {
    await startGatsby();
    createMainWindow();
    mainWindow.once('ready-to-show', () => {
      if (launchWindow && !launchWindow.isDestroyed() && !keepConsoleVisible) {
        launchWindow.hide();
      }
      mainWindow.show();
    });
  } catch (error) {
    log('Failed to set up the environment. Please check the logs.');
    // Optionally, you could show an error message to the user in the launch window
    // and/or prevent the app from quitting immediately to let them read the log.
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
    if (killed) {
      log('Gatsby process terminated.');
    } else {
      log('Failed to terminate Gatsby process.');
    }
  }
});
