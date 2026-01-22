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

const ensureNVM = async () => {
  log('Checking for NVM...');
  const nvmDir = path.join(os.homedir(), '.nvm');
  const nvmScript = path.join(nvmDir, 'nvm.sh');

  try {
    await runCommand('test', ['-s', nvmScript]);
    log('NVM is already installed.');
    return true;
  } catch (e) {
    log('NVM not found. Attempting to install...');
    try {
      const installCommand = 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash';
      await runCommand(installCommand, []);
      log('NVM installed successfully.');
      return true;
    } catch (err) {
      log(`Failed to install NVM: ${err}`);
      return false;
    }
  }
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
      if (platform === 'darwin' || platform === 'linux') {
        if (!(await ensureNVM())) {
          throw new Error('NVM is required and could not be installed.');
        }

        log('Installing Node.js v22.18.0 using NVM...');
        const nvmScript = path.join(os.homedir(), '.nvm', 'nvm.sh');
        const nodeVersion = 'v22.18.0';
        const installNodeCommand = `source ${nvmScript} && nvm install ${nodeVersion} && nvm alias default ${nodeVersion}`;
        await runCommand('bash', ['-c', installNodeCommand]);

        const nodeBinPath = path.join(os.homedir(), '.nvm', 'versions', 'node', nodeVersion, 'bin');
        process.env.PATH = `${nodeBinPath}${path.delimiter}${process.env.PATH}`;

        // Ensure the nodeBinPath is added to shell configuration files for future terminal sessions.
        const fs = require('fs').promises; // Import fs.promises here

        const shellConfigFiles = [
            path.join(os.homedir(), '.bashrc'),
            path.join(os.homedir(), '.zshrc'),
        ];

        // The PATH export line for shell configuration files (uses ':' delimiter for Unix-like shells)
        const shellPathExportLine = `export PATH="${nodeBinPath}:$PATH"`;

        log(`Attempting to add Node.js bin path to shell configuration files for persistent access.`);

        for (const filePath of shellConfigFiles) {
            try {
                let fileContent = '';
                try {
                    fileContent = await fs.readFile(filePath, { encoding: 'utf8' });
                } catch (readError) {
                    if (readError.code === 'ENOENT') {
                        log(`Shell configuration file not found: ${filePath}. It will be created.`);
                        // Continue, fileContent remains empty, so the file will effectively be created by appendFile
                    } else {
                        log(`Error reading ${filePath}: ${readError.message}`);
                        continue; // Skip to the next file
                    }
                }

                // Check if the nodeBinPath or the exact export line already exists in the file
                const pathAlreadyExists = fileContent.includes(nodeBinPath);
                const lineAlreadyExists = fileContent.includes(shellPathExportLine);

                if (!pathAlreadyExists && !lineAlreadyExists) {
                    // Prepend a newline if the file content is not empty and doesn't end with one
                    const lineToWrite = (fileContent.length > 0 && !fileContent.endsWith('\n') ? '\n' : '') + shellPathExportLine + '\n';
                    await fs.appendFile(filePath, lineToWrite, { encoding: 'utf8' });
                    log(`Successfully added "${nodeBinPath}" to ${filePath}`);
                } else {
                    log(`${filePath} already contains the Node.js bin path or similar PATH export. Skipping.`);
                }
            } catch (writeError) {
                log(`Failed to update ${filePath}: ${writeError.message}`);
            }
        }
        log(`Added ${nodeBinPath} to PATH.`);
      } else if (platform === 'win32') {
        log('Installing Node.js and npm for Windows using PowerShell...');
        await runCommand('powershell', [
          '-Command',
          'Invoke-WebRequest -Uri https://nodejs.org/dist/v22.2.0/node-v22.2.0-x64.msi -OutFile node-setup.msi; Start-Process msiexec.exe -Wait -ArgumentList "/i node-setup.msi /quiet"; Remove-Item node-setup.msi',
        ]);
      } else {
        throw new Error('Unsupported OS for automatic Node.js installation.');
      }
      log('Node.js and npm installed successfully.');
      await runCommand('node', ['-v']);
      await runCommand('npm', ['-v']);
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
    createMainWindow();
    mainWindow.once('ready-to-show', () => {
      if (launchWindow && !launchWindow.isDestroyed()) {
        launchWindow.close();
      }
      mainWindow.show();
    });
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
