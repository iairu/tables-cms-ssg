

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn, execSync } = require('child_process');
const os = require('os');


let gatsbyProcess;
let mainWindow;
let consoleWindow;
let consoleWindowReady = false;

function createConsoleWindow() {
  consoleWindow = new BrowserWindow({
    width: 800,
    height: 400,
    title: 'Gatsby Console Output',
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      contextIsolation: true
    }
  });
  consoleWindow.loadURL('data:text/html,' +
    encodeURIComponent(`
      <body style="margin:0;background:#111;color:#eee;">
        <pre id="output" style="background:#111;color:#eee;padding:1em;font-family:monospace;white-space:pre-wrap;">Launching Gatsby...</pre>
        <script>
          window.addEventListener('DOMContentLoaded', () => {
            window.electron && window.electron.onConsoleOutput && window.electron.onConsoleOutput((msg) => {
              const pre = document.getElementById('output');
              pre.textContent += '\n' + msg;
              pre.scrollTop = pre.scrollHeight;
            });
            window.electron && window.electron.consoleReady && window.electron.consoleReady();
          });
        </script>
      </body>
    `)
  );
}

function sendConsoleOutput(msg) {
  if (consoleWindow && !consoleWindow.isDestroyed() && consoleWindowReady) {
    consoleWindow.webContents.send('console-output', msg.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js')
    }
  });
  mainWindow.loadURL('http://localhost:8000/cms/settings');
}

function waitForGatsbyReady() {
  return new Promise((resolve) => {
    let buffer = '';
    gatsbyProcess.stdout.on('data', (data) => {
      buffer += data.toString();
      if (buffer.includes('You can now view')) {
        resolve();
      }
    });
  });
}


async function ensureNodeAndNpm() {
  try {
    execSync('node -v', { stdio: 'ignore' });
    execSync('npm -v', { stdio: 'ignore' });
    sendConsoleOutput('Node.js and npm found.');
    return true;
  } catch (e) {
    // Node or npm not found, try to install
    const platform = os.platform();
    if (platform === 'linux') {
      try {
        sendConsoleOutput('Installing Node.js and npm for Linux...');
        execSync('curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -', { stdio: 'inherit' });
        execSync('sudo apt-get install -y nodejs', { stdio: 'inherit' });
        sendConsoleOutput('Node.js and npm installed for Linux.');
      } catch (err) {
        sendConsoleOutput('Failed to install Node.js on Linux.');
        throw err;
      }
    } else if (platform === 'darwin') {
      try {
        sendConsoleOutput('Installing Node.js and npm for macOS...');
        execSync('brew install node@22', { stdio: 'inherit' });
        sendConsoleOutput('Node.js and npm installed for macOS.');
      } catch (err) {
        sendConsoleOutput('Failed to install Node.js on macOS.');
        throw err;
      }
    } else if (platform === 'win32') {
      try {
        sendConsoleOutput('Installing Node.js and npm for Windows...');
        execSync('powershell -Command "Invoke-WebRequest -Uri https://nodejs.org/dist/v22.2.0/node-v22.2.0-x64.msi -OutFile node-setup.msi; Start-Process msiexec.exe -Wait -ArgumentList \"/i node-setup.msi /quiet\"; Remove-Item node-setup.msi"', { stdio: 'inherit' });
        sendConsoleOutput('Node.js and npm installed for Windows.');
      } catch (err) {
        sendConsoleOutput('Failed to install Node.js on Windows.');
        throw err;
      }
    } else {
      sendConsoleOutput('Unsupported OS for automatic Node.js installation.');
      throw new Error('Unsupported OS');
    }
  }
}

async function ensureNpmInstall() {
  try {
    sendConsoleOutput('Running npm install...');
    execSync('npm install', { stdio: 'inherit' });
    sendConsoleOutput('npm install completed.');
  } catch (err) {
    sendConsoleOutput('npm install failed.');
    throw err;
  }
}

app.whenReady().then(async () => {
  createConsoleWindow();
  ipcMain.on('console-ready', () => {
    consoleWindowReady = true;
  });
  // Wait for the console window to be ready
  while (!consoleWindowReady) {
    await new Promise(r => setTimeout(r, 50));
  }
  try {
    sendConsoleOutput('Starting environment setup...');
    await ensureNodeAndNpm();
    await ensureNpmInstall();
    sendConsoleOutput('Environment setup complete. Starting Gatsby...');
  } catch (err) {
    sendConsoleOutput('Setup failed. Please check the logs.');
    return;
  }
  gatsbyProcess = spawn('npm', ['run', 'develop'], { shell: true });
  gatsbyProcess.stdout.on('data', (data) => sendConsoleOutput(data));
  gatsbyProcess.stderr.on('data', (data) => sendConsoleOutput(data));
  gatsbyProcess.on('close', (code) => {
    sendConsoleOutput(`\nGatsby process exited with code ${code}`);
  });
  await waitForGatsbyReady();
  if (consoleWindow && !consoleWindow.isDestroyed()) {
    consoleWindow.close();
  }
  createMainWindow();
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