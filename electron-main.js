

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn, execSync } = require('child_process');
const os = require('os');


let gatsbyProcess;
let mainWindow;
let consoleWindow;

function createConsoleWindow() {
  consoleWindow = new BrowserWindow({
    width: 800,
    height: 400,
    title: 'Gatsby Console Output',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  consoleWindow.loadURL('data:text/html,<pre id="output" style="background:#111;color:#eee;padding:1em;font-family:monospace;white-space:pre-wrap;">Launching Gatsby...</pre>');
}

function appendConsoleOutput(data) {
  if (consoleWindow && !consoleWindow.isDestroyed()) {
    const text = data.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
    consoleWindow.webContents.executeJavaScript(
      `const pre = document.getElementById('output'); pre.textContent += '\n' + ${JSON.stringify(text)}; pre.scrollTop = pre.scrollHeight;`
    );
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
    return true;
  } catch (e) {
    // Node or npm not found, try to install
    const platform = os.platform();
    if (platform === 'linux') {
      // Install Node.js 22.x for Linux
      try {
        appendConsoleOutput('Installing Node.js and npm for Linux...');
        execSync('curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -', { stdio: 'inherit' });
        execSync('sudo apt-get install -y nodejs', { stdio: 'inherit' });
      } catch (err) {
        appendConsoleOutput('Failed to install Node.js on Linux.');
        throw err;
      }
    } else if (platform === 'darwin') {
      // Install Node.js 22.x for macOS
      try {
        appendConsoleOutput('Installing Node.js and npm for macOS...');
        execSync('brew install node@22', { stdio: 'inherit' });
      } catch (err) {
        appendConsoleOutput('Failed to install Node.js on macOS.');
        throw err;
      }
    } else if (platform === 'win32') {
      // Install Node.js 22.x for Windows
      try {
        appendConsoleOutput('Installing Node.js and npm for Windows...');
        execSync('powershell -Command "Invoke-WebRequest -Uri https://nodejs.org/dist/v22.2.0/node-v22.2.0-x64.msi -OutFile node-setup.msi; Start-Process msiexec.exe -Wait -ArgumentList "/i node-setup.msi /quiet"; Remove-Item node-setup.msi"', { stdio: 'inherit' });
      } catch (err) {
        appendConsoleOutput('Failed to install Node.js on Windows.');
        throw err;
      }
    } else {
      appendConsoleOutput('Unsupported OS for automatic Node.js installation.');
      throw new Error('Unsupported OS');
    }
  }
}

async function ensureNpmInstall() {
  try {
    appendConsoleOutput('Running npm install...');
    execSync('npm install', { stdio: 'inherit' });
    appendConsoleOutput('npm install completed.');
  } catch (err) {
    appendConsoleOutput('npm install failed.');
    throw err;
  }
}

app.whenReady().then(async () => {
  createConsoleWindow();
  try {
    await ensureNodeAndNpm();
    await ensureNpmInstall();
  } catch (err) {
    appendConsoleOutput('Setup failed. Please check the logs.');
    return;
  }
  gatsbyProcess = spawn('npm', ['run', 'develop'], { shell: true });
  gatsbyProcess.stdout.on('data', (data) => appendConsoleOutput(data));
  gatsbyProcess.stderr.on('data', (data) => appendConsoleOutput(data));
  gatsbyProcess.on('close', (code) => {
    appendConsoleOutput(`\nGatsby process exited with code ${code}`);
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