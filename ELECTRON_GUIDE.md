# Guide: Wrapping the TABLES CMS in Electron

This guide outlines the process of wrapping the entire TABLES CMS site in an Electron application. The primary goal is to create a desktop application that can manage the main-site's content and uploads locally before triggering a build and deployment to Vercel using the existing `api/build.js` script.

The core concept is to use the `main-site` directory as a boilerplate. The Electron app will copy this boilerplate to a temporary location, inject the user's data and uploads into it, and then run the build process on this temporary directory.

## Prerequisites

-   Node.js and npm/yarn installed.
-   The existing TABLES CMS project structure.

## Step 1: Setting up the Electron Project

First, we'll create a new directory for our Electron application and set up the basic structure.

1.  **Create a directory for the Electron app:**
    
    In the root of your `TABLES` project, create a new directory:
    
    ```bash
    mkdir electron-app
    cd electron-app
    npm init -y
    npm install --save-dev electron
    npm install fs-extra
    ```
    
5.  **Create the main Electron process file:**
    
    Create a file named `main.js` in the `electron-app` directory. This will be the entry point for your Electron application.
    
    ```javascript
    // electron-app/main.js
    const { app, BrowserWindow, ipcMain } = require('electron');
    const path = require('path');
    
    function createWindow () {
      const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js')
        }
      });
    
      // In development, load from the Gatsby dev server.
      // In production, load the built Gatsby site.
      if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:8000/cms'); // Assuming CMS runs on port 8000
      } else {
        win.loadFile(path.join(__dirname, '../public/cms/index.html'));
      }
    }
    
    app.whenReady().then(createWindow);
    
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
    
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
    ```
    
6.  **Create a preload script:**
    
    Create a file named `preload.js` in the `electron-app` directory. This script is used to safely expose Node.js APIs to your React frontend.
    
    ```javascript
    // electron-app/preload.js
    const { contextBridge, ipcRenderer } = require('electron');
    
    contextBridge.exposeInMainWorld('electron', {
      triggerBuild: () => ipcRenderer.invoke('trigger-build')
    });
    ```
    
7.  **Update `package.json`:**
    
    Open `electron-app/package.json` and modify the `main` entry and add a `start` script:
    
    ```json
    {
      "name": "tables-electron-app",
      "version": "1.0.0",
      "description": "",
      "main": "main.js",
      "scripts": {
        "start": "electron ."
      },
      ...
    }
    ```
    

## Step 2: Integrating the Gatsby Site

The Electron app needs to load your Gatsby site. We have two modes for this:

-   **Development:** Load the site from the Gatsby development server. This allows for hot-reloading.
-   **Production:** Load the pre-built static files of the Gatsby site.

1.  **Run the main Gatsby site in development mode:**
    
    From the root of the `TABLES` project, run:
    
    ```bash
    npm run develop
    ```
    
2.  **Start the Electron app:**
    
    In a new terminal, from the `electron-app` directory, run:
    
    ```bash
    npm start
    ```
    
    A new window should open, loading your TABLES CMS from `http://localhost:8000/cms`.
    

## Step 3: Triggering the Build from the UI

To trigger the build process from the CMS UI, you'll need to add a button that communicates with the Electron main process.

1.  **Add a "Build" button in your CMS:**
    
    In one of your React components (e.g., `src/components/cms/sections/SettingsSection.js`), add a button.
    
    ```jsx
    // Example in SettingsSection.js
    
    const handleTriggerBuild = async () => {
      if (window.electron) {
        try {
          const result = await window.electron.triggerBuild();
          alert('Build process completed: ' + result);
        } catch (error) {
          console.error('Build failed:', error);
          alert('Build failed: ' + error.message);
        }
      } else {
        alert('This feature is only available in the Electron app.');
      }
    };
    
    return (
      // ... existing JSX ...
      <div style={{ padding: '20px' }}>
        <h2>Desktop App Actions</h2>
        <button onClick={handleTriggerBuild}>Build and Deploy Site</button>
      </div>
      // ... existing JSX ...
    );
    ```
    
2.  **Handle the trigger in Electron's `main.js`:**
    
    Now, let's implement the logic for `trigger-build` in `electron-app/main.js`. This is where we'll perform the copy, data injection, and build steps.
    

## Step 4: The Build and Deploy Process

This is the core logic that handles preparing the boilerplate and running the Vercel build.

1.  **Update `electron-app/main.js` with the build logic:**
    
    We'll use Node.js's `fs-extra` for copying and `child_process` to execute scripts.
    
    ```javascript
    // electron-app/main.js
    const { app, BrowserWindow, ipcMain, dialog } = require('electron');
    const path = require('path');
    const fs = require('fs-extra');
    const { exec } = require('child_process');
    
    // ... (createWindow and other app event listeners) ...
    
    ipcMain.handle('trigger-build', async () => {
      const projectRoot = path.join(__dirname, '..');
      const mainSitePath = path.join(projectRoot, 'main-site');
      const tempBuildPath = path.join(app.getPath('userData'), 'tmp', 'main-site-build');
      const uploadsPath = path.join(projectRoot, 'static', 'uploads');
      const tempUploadsPath = path.join(tempBuildPath, 'static', 'uploads');
    
      try {
        // 1. Clean and copy the boilerplate
        await fs.emptyDir(tempBuildPath);
        await fs.copy(mainSitePath, tempBuildPath);
    
        // 2. Copy the uploads
        await fs.ensureDir(tempUploadsPath);
        await fs.copy(uploadsPath, tempUploadsPath);
    
        // 3. (Optional) Inject data if not using localStorage
        // If your data is stored in files, you would copy them here.
        // For example, if you have a data.json in the Electron app's user data path:
        // const dataPath = path.join(app.getPath('userData'), 'data.json');
        // await fs.copy(dataPath, path.join(tempBuildPath, 'src', 'data', 'data.json'));
    
        dialog.showMessageBox({
          type: 'info',
          title: 'Build Process',
          message: 'Copied boilerplate and uploads. Starting build process...'
        });
    
        // 4. Run the build script
        // We execute api/build.js using Node.
        // This assumes api/build.js can be run as a standalone script.
        const buildScriptPath = path.join(projectRoot, 'src', 'api', 'build.js');
        
        return new Promise((resolve, reject) => {
          // You might need to pass the path to the temp directory to your build script
          const command = `node ${buildScriptPath} --buildPath=${tempBuildPath}`;
          
          const buildProcess = exec(command, (error, stdout, stderr) => {
            if (error) {
              console.error(`Build script error: ${error}`);
              reject(new Error(`Build failed: ${stderr}`));
              return;
            }
            resolve(stdout);
          });
    
          buildProcess.stdout.on('data', (data) => {
            console.log(`Build stdout: ${data}`);
          });
    
          buildProcess.stderr.on('data', (data) => {
            console.error(`Build stderr: ${data}`);
          });
        });
    
      } catch (error) {
        console.error('An error occurred during the build process:', error);
        throw error;
      }
    });
    ```
    
2.  **Adapt `src/api/build.js` (if necessary):**
    
    Your `api/build.js` script might need to be aware of the temporary build directory. You can pass the path as a command-line argument as shown above.
    
    You would need to modify `api/build.js` to parse this argument.
    
    ```javascript
    // Example at the top of src/api/build.js
    
    // Get the build path from arguments, or default to the project structure
    const args = process.argv.slice(2);
    const buildPathArg = args.find(arg => arg.startsWith('--buildPath='));
    const buildPath = buildPathArg ? buildPathArg.split('=')[1] : path.join(process.cwd(), 'main-site');
    
    // Now, use `buildPath` throughout your script instead of a hardcoded path.
    ```
    

## Summary of the Workflow

1.  The user clicks the "Build and Deploy Site" button in the Electron app's UI.
2.  The click event calls `window.electron.triggerBuild()`, which is handled by `ipcMain` in `electron-app/main.js`.
3.  The `ipcMain` handler:
    a.  Copies the `main-site` folder to a temporary location (`electron-app/tmp/main-site-build`).
    b.  Copies the `static/uploads` folder into the temporary `main-site`'s `static` directory.
    c.  Executes the `src/api/build.js` script using Node's `child_process`.
    d.  Passes the path of the temporary directory to the build script.
4.  The `build.js` script runs its logic on the temporary, populated directory, building the site and deploying it to Vercel.
5.  The result of the build process (success or failure) is sent back to the UI.

This setup provides a robust way to manage your site's content locally in a desktop application and deploy it to the web with a single click.
