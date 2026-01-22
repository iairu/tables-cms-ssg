const { app, BrowserWindow } = require('electron');
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
    title: 'Launch and Console Output',
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      contextIsolation: true,
    },
  });

  launchWindow.loadFile('electron-launch.html');
  launchWindow.on('closed', () => {
    if (gatsbyProcess) {
      gatsbyProcess.kill();
    }
    app.quit();
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

const runCommand = (command, args) => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, { shell: true });
    let stdout = '';
    let stderr = '';

    childProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      log(data.toString());
    });

    childProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      log(data.toString());
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr));
      }
    });
  });
};

const ensureNodeAndNpm = async () => {
  log('Checking for Node.js and npm...');
  try {
    await runCommand('node', ['-v']);
    await runCommand('npm', ['-v']);
    log('Node.js and npm found.');
    return true;
  } catch (e) {
    log('Node.js or npm not found. Attempting to install...');
    const platform = os.platform();
    try {
      if (platform === 'darwin') {
        log('Installing Node.js and npm for macOS using Homebrew...');
        await runCommand('brew', ['install', 'node@22']);
      } else if (platform === 'linux') {
        log('Installing Node.js and npm for Linux...');
        await runCommand('bash', ['-c', 'curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs']);
      } else if (platform === 'win32') {
        log('Installing Node.js and npm for Windows using PowerShell...');
        await runCommand('powershell', ['-Command', 'Invoke-WebRequest -Uri https://nodejs.org/dist/v22.2.0/node-v22.2.0-x64.msi -OutFile node-setup.msi; Start-Process msiexec.exe -Wait -ArgumentList \'/i node-setup.msi /quiet\'; Remove-Item node-setup.msi']);
      } else {
        throw new Error('Unsupported OS for automatic Node.js installation.');
      }
      log('Node.js and npm installed successfully.');
      return true;
    } catch (err) {
      log(`Failed to install Node.js and npm: ${err}`);
      return false;
    }
  }
};

const ensureNpmInstall = async () => {
  log('Running npm install...');
  try {
    await runCommand('npm', ['install']);
    log('npm install completed successfully.');
    return true;
  } catch (err) {
    log(`Error during npm install: ${err}`);
    return false;
  }
};

const startGatsby = () => {
  log('Starting Gatsby development server...');
  gatsbyProcess = spawn('npm', ['run', 'develop'], { shell: true });

  gatsbyProcess.stdout.on('data', (data) => log(data.toString()));
  gatsbyProcess.stderr.on('data', (data) => log(data.toString()));

  return new Promise((resolve) => {
    gatsbyProcess.stdout.on('data', (data) => {
      if (data.toString().includes('You can now view')) {
        log('Gatsby development server is ready.');
        resolve();
      }
    });
  });
};

app.whenReady().then(async () => {
  await createLaunchWindow();
  log('Console window created.');

  if (await ensureNodeAndNpm() && await ensureNpmInstall()) {
    await startGatsby();
    if (launchWindow && !launchWindow.isDestroyed()) {
      launchWindow.close();
    }
    createMainWindow();
  } else {
    log('Failed to set up the environment. Please check the logs.');
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