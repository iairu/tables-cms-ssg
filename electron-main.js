const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
const AnsiToHtml = require('ansi-to-html');

const ansiToHtml = new AnsiToHtml();

let gatsbyProcess;
let mainWindow;
let launchWindow;

const log = (msg) => {
  console.log(msg);
  if (launchWindow && !launchWindow.isDestroyed()) {
    const html = ansiToHtml.toHtml(msg.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;'));
    launchWindow.webContents.send('console-output', html);
  }
};

const createLaunchWindow = () => {
  launchWindow = new BrowserWindow({
    width: 800,
    height: 400,
    frame: false,
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
  const platform = os.platform();
  const nodeExecutable = platform === 'win32' ? 'node.exe' : 'node';
  const binPath = path.join(__dirname, 'electron-bin', 'npm_source', 'bin');
  const nodePath = path.join(binPath, nodeExecutable);
  const npmCliPath = path.join(binPath, 'npm-cli.js');
  const cmsSiteDir = path.join(__dirname);

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

  return new Promise(async (resolve, reject) => {
    try {
      log('Running npm install in CMS site...');
      await runNpmCommand(['install']);
      log('npm install completed.');

      log('Running gatsby develop in CMS site...');
      gatsbyProcess = spawn(nodePath, [npmCliPath, 'run', 'develop'], { cwd: cmsSiteDir });

      gatsbyProcess.stdout.on('data', (data) => log(data.toString()));
      gatsbyProcess.stderr.on('data', (data) => log(data.toString()));

      gatsbyProcess.stdout.on('data', (data) => {
        if (data.toString().includes('You can now view')) {
          log('Gatsby development server is ready.');
          resolve();
        }
      });

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
  await createLaunchWindow();
  log('Console window created.');

  try {
    await startGatsby();
    createMainWindow();
    mainWindow.once('ready-to-show', () => {
      if (launchWindow && !launchWindow.isDestroyed()) {
        launchWindow.close();
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
