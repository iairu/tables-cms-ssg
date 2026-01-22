const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const AnsiToHtml = require('ansi-to-html');

const ansiToHtml = new AnsiToHtml();

// ============================================================================
// Path Resolution Functions
// ============================================================================

/**
 * Get the path to the bundled Node.js binary
 */
function getBundledNodePath() {
  const isDev = !app.isPackaged;
  
  if (isDev) {
    return process.execPath;
  }

  // Consistent with your package.json extraResources: "to": "node-bin"
  const nodeBinName = process.platform === 'win32' ? 'node.exe' : 'node';
  const nodePath = path.join(
    process.resourcesPath,
    'node-bin', 
    nodeBinName
  );

  if (!fs.existsSync(nodePath)) {
    console.error('Bundled Node.js not found! Falling back to system Node.');
    return process.execPath;
  }

  if (process.platform !== 'win32') {
    try {
      fs.chmodSync(nodePath, 0o755);
    } catch (err) {
      console.error('Failed to set Node binary permissions:', err);
    }
  }

  return nodePath;
}

/**
 * Get the path to npm
 */
function getBundledNpmPath() {
  const isDev = !app.isPackaged;
  
  if (isDev) {
    return process.platform === 'win32' ? 'npm.cmd' : 'npm';
  }

  const nodePath = getBundledNodePath();
  const nodeDir = path.dirname(nodePath);
  
  // Try the wrapper first
  let npmName = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  let npmPath = path.join(nodeDir, npmName);

  // Fallback to the npm-cli.js inside the source directory we created
  if (!fs.existsSync(npmPath)) {
    const isWin = process.platform === 'win32';
    const npmCliPath = path.join(
      nodeDir,
      'npm_source',
      'bin',
      'npm_cli.js'
    );
    
    if (fs.existsSync(npmCliPath)) {
      npmPath = npmCliPath;
    } else {
      console.warn('Bundled npm-cli.js not found, falling back to system npm');
      return npmName;
    }
  }

  if (process.platform !== 'win32' && fs.existsSync(npmPath)) {
    try { fs.chmodSync(npmPath, 0o755); } catch (err) {}
  }

  return npmPath;
}

/**
 * Get environment variables with proper PATH setup
 */
function getNodeEnvironment() {
  const nodePath = getBundledNodePath();
  const nodeDir = path.dirname(nodePath);
  
  return {
    ...process.env,
    PATH: `${nodeDir}${path.delimiter}${process.env.PATH}`,
    // Required for npm to find its internal modules when running via node npm-cli.js
    NODE_PATH: path.join(nodeDir, 'npm_source', 'node_modules'),
    // Pass the resources path so Gatsby can find static assets in production
    ELECTRON_RESOURCES_PATH: process.resourcesPath
  };
}

// ============================================================================
// Execution Functions
// ============================================================================

/**
 * Execute npm commands
 */
function executeNpmCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const npmPath = getBundledNpmPath();
    const nodePath = getBundledNodePath();
    
    // Logic: If we are in production, prioritize main-site inside resourcesPath.
    // Otherwise, use the provided cwd or default to app directory.
    let workingDir = options.cwd || __dirname;

    if (app.isPackaged) {
      const resourcesMainSite = path.join(process.resourcesPath, 'main-site');
      if (fs.existsSync(resourcesMainSite)) {
        workingDir = resourcesMainSite;
      }
    }
    
    log('=================================');
    log(`Executing npm: ${command}`);
    log(`Working directory: ${workingDir}`);
    log('=================================');

    // Build arguments
    const isJsFile = npmPath.endsWith('.js');
    const spawnCmd = isJsFile ? nodePath : npmPath;
    const spawnArgs = isJsFile ? [npmPath, command, ...args] : [command, ...args];

    const childProcess = spawn(spawnCmd, spawnArgs, {
      cwd: workingDir,
      env: getNodeEnvironment(),
      shell: process.platform === 'win32'
    });

    let stdout = '';
    let stderr = '';

    childProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      log(`[npm stdout]: ${data.toString()}`);
    });

    childProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      log(`[npm stderr]: ${data.toString()}`);
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code, childProcess });
      } else {
        reject(new Error(`npm command failed with code ${code}`));
      }
    });

    childProcess.on('error', (err) => {
      log(`Failed to execute npm: ${err}`);
      reject(err);
    });
  });
}

/**
 * Execute a Node.js script directly
 */
function executeNodeScript(scriptPath, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const nodePath = getBundledNodePath();
    
    const childProcess = spawn(nodePath, [scriptPath, ...args], {
      cwd: options.cwd || process.cwd(),
      env: getNodeEnvironment(),
      shell: process.platform === 'win32'
    });

    let stdout = '';
    let stderr = '';

    childProcess.stdout.on('data', (data) => { stdout += data.toString(); });
    childProcess.stderr.on('data', (data) => { stderr += data.toString(); });

    childProcess.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr, code });
      else reject(new Error(`Script failed with code ${code}`));
    });

    childProcess.on('error', reject);
  });
}

// ============================================================================
// Window Management
// ============================================================================

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
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      contextIsolation: true,
      webSecurity: false,
    },
  });

  launchWindow.loadFile('electron-launch.html');
  return new Promise((resolve) => {
    launchWindow.webContents.on('did-finish-load', () => resolve());
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
    if (gatsbyProcess) gatsbyProcess.kill();
    app.quit();
  });
};

// ============================================================================
// Lifecycle and IPC
// ============================================================================

ipcMain.on('close-app', () => { app.quit(); });

const ensureNpmInstall = async () => {
  log('Checking environment...');
  try {
    // This will now use resourcesPath/main-site if packaged
    await executeNpmCommand('install');
    log('Environment ready.');
    return true;
  } catch (err) {
    log(`Setup note: ${err.message}`);
    // We return true because in some packaged environments install is skipped
    return true; 
  }
};

const startGatsby = () => {
  log('Starting Gatsby development server...');
  return new Promise((resolve, reject) => {
    executeNpmCommand('run', ['develop'])
      .then(result => {
        gatsbyProcess = result.childProcess;
        gatsbyProcess.stdout.on('data', (data) => {
          if (data.toString().includes('You can now view')) {
            log('Gatsby server ready.');
            resolve();
          }
        });
      })
      .catch(reject);
  });
};

app.whenReady().then(async () => {
  await createLaunchWindow();
  if (await ensureNpmInstall()) {
    await startGatsby();
    createMainWindow();
    mainWindow.once('ready-to-show', () => {
      if (launchWindow && !launchWindow.isDestroyed()) {
        launchWindow.close();
      }
      mainWindow.show();
    });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (gatsbyProcess) gatsbyProcess.kill();
});