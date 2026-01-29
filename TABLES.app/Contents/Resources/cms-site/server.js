/**
 * Express server for TABLES CMS
 * Replaces gatsby develop for fast startup (~100ms vs 30-60s)
 * Serves pre-built static files and API endpoints
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 8000;

// ============================================================================
// Body Parser Configuration
// ============================================================================

// Large payload support for build API (base64 images)
app.use('/api/build', express.json({ limit: '50mb' }));
app.use('/api/build', express.urlencoded({ limit: '50mb', extended: true }));

// Large payload support for import-uploads API
app.use('/api/import-uploads', express.json({ limit: '50mb' }));

// Standard payload for other routes
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

// ============================================================================
// Path Utilities (from src/utils/pathResolver.js)
// ============================================================================

function getUploadDir() {
  return path.resolve(__dirname, 'static/uploads');
}

function getProjectRoot() {
  // In Express context, __dirname is cms-site/
  return path.resolve(__dirname, '..');
}

// Ensure upload directory exists
const uploadDir = getUploadDir();
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ============================================================================
// Build API State (global to survive between requests)
// ============================================================================

if (typeof global.isBuildInProgress === 'undefined') {
  global.isBuildInProgress = false;
}
if (typeof global.lastBuildTime === 'undefined') {
  global.lastBuildTime = null;
}

// ============================================================================
// Binary Finder (from build.js)
// ============================================================================

function findBinaries() {
  const isWin = process.platform === 'win32';
  const nodeName = isWin ? 'node.exe' : 'node';
  const projectRoot = getProjectRoot();

  const searchPaths = [
    projectRoot,
    ...(typeof process.resourcesPath === 'string' ? [process.resourcesPath] : [])
  ];

  for (const dir of searchPaths) {
    const binPath = path.join(dir, 'support-bin', 'npm_source', 'bin');
    const nodePath = path.join(binPath, nodeName);
    const npmPath = path.join(binPath, 'npm-cli.js');
    const npxPath = path.join(binPath, 'npx-cli.js');

    if (fs.existsSync(nodePath) && fs.existsSync(npmPath) && fs.existsSync(npxPath)) {
      return {
        node: nodePath,
        npm: npmPath,
        npx: npxPath,
        binDir: binPath,
        isBundled: true
      };
    }
  }

  return {
    node: 'node',
    npm: 'npm',
    npx: 'npx',
    binDir: null,
    isBundled: false
  };
}

// ============================================================================
// Utility: Copy Directory
// ============================================================================

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ============================================================================
// API: Build (POST /api/build, GET /api/build)
// ============================================================================

app.options('/api/build', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

app.get('/api/build', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    isBuildInProgress: global.isBuildInProgress,
    lastBuildTime: global.lastBuildTime,
    mode: process.env.NODE_ENV
  });
});

app.post('/api/build', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  console.log('BUILD_START');
  const { timestamp, trigger, data, localOnly, vercelApiToken, vercelProjectName } = req.body;

  console.log(`[Build API] Build request received at ${timestamp} (trigger: ${trigger}, localOnly: ${localOnly})`);

  if (global.isBuildInProgress) {
    console.log('[Build API] Build already in progress, rejecting request');
    return res.status(409).json({
      status: 'conflict',
      message: 'Build already in progress, please wait',
      isBuildInProgress: true
    });
  }

  global.isBuildInProgress = true;
  console.log('[Build API] isBuildInProgress set to true');

  res.status(200).json({
    status: 'building',
    message: localOnly ? 'Local build started - exporting data and building main site' : 'Build and deploy started - exporting data, building, and deploying to Vercel',
    timestamp: new Date().toISOString(),
    isBuildInProgress: true
  });

  exportDataAndBuild(data || {}, localOnly, vercelApiToken, vercelProjectName)
    .then(() => {
      console.log('[Build API] Build completed successfully');
      global.lastBuildTime = new Date().toISOString();
      global.isBuildInProgress = false;
      console.log('BUILD_END');
    })
    .catch(err => {
      console.error('[Build API] Build failed:', err);
      global.isBuildInProgress = false;
      global.lastBuildTime = new Date().toISOString();
      console.log('BUILD_END');
    });
});

async function exportDataAndBuild(data, localOnly = false, vercelApiToken = null, vercelProjectName = null) {
  let projectRoot = getProjectRoot();

  let mainSiteStaticDir = path.join(projectRoot, 'main-site', 'static', 'data');
  let uploadsSrcDir = path.join(projectRoot, 'cms-site', 'static', 'uploads');
  let uploadsDestDir = path.join(projectRoot, 'main-site', 'static', 'uploads');

  const isWritable = (p) => {
    try {
      const dirToCheck = fs.existsSync(p) ? p : path.dirname(p);
      fs.accessSync(dirToCheck, fs.constants.W_OK);
      return true;
    } catch (e) {
      return false;
    }
  };

  if (!isWritable(mainSiteStaticDir) || !isWritable(uploadsSrcDir) || !isWritable(uploadsDestDir)) {
    console.log('[Build API] Write permissions restricted. Using process.resourcesPath...');
    projectRoot = process.resourcesPath;
    mainSiteStaticDir = path.join(projectRoot, 'main-site', 'static', 'data');
    uploadsSrcDir = path.join(projectRoot, 'cms-site', 'static', 'uploads');
    uploadsDestDir = path.join(projectRoot, 'main-site', 'static', 'uploads');
  }

  console.log('[Build API] Exporting CMS data to main site...');
  console.log('[Build API] Target Data directory:', mainSiteStaticDir);

  if (!fs.existsSync(mainSiteStaticDir)) {
    fs.mkdirSync(mainSiteStaticDir, { recursive: true });
  }

  if (!fs.existsSync(path.join(projectRoot, 'main-site', 'static'))) {
    fs.mkdirSync(path.join(projectRoot, 'main-site', 'static'), { recursive: true });
  }

  let cmsData = data;

  if (Object.keys(cmsData).length === 0) {
    const storageFile = path.join(projectRoot, '.cms-data.json');
    if (fs.existsSync(storageFile)) {
      cmsData = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
      console.log('[Build API] Loaded data from storage file');
    }
  }

  const extensions = cmsData.extensions || {};
  const isBlogEnabled = extensions['blog-extension-enabled'] !== false;
  const areCatsEnabled = extensions['pedigree-extension-enabled'] !== false;

  // Export pages
  const pages = cmsData.pages || [];
  const filteredPages = isBlogEnabled ? pages : pages.filter(p => p.slug !== 'blog');
  fs.writeFileSync(
    path.join(mainSiteStaticDir, 'pages.json'),
    JSON.stringify(filteredPages, null, 2),
    'utf8'
  );
  console.log(`[Build API] Exported ${filteredPages.length} pages`);

  // Export blog
  if (isBlogEnabled) {
    const blogArticles = cmsData.blogArticles || [];
    fs.writeFileSync(
      path.join(mainSiteStaticDir, 'blog.json'),
      JSON.stringify(blogArticles, null, 2),
      'utf8'
    );
    console.log(`[Build API] Exported ${blogArticles.length} blog articles`);
  } else {
    fs.writeFileSync(
      path.join(mainSiteStaticDir, 'blog.json'),
      JSON.stringify([], null, 2),
      'utf8'
    );
  }

  // Export cats
  if (areCatsEnabled) {
    const catRows = cmsData.catRows || [];
    fs.writeFileSync(
      path.join(mainSiteStaticDir, 'cats.json'),
      JSON.stringify(catRows, null, 2),
      'utf8'
    );
    console.log(`[Build API] Exported ${catRows.length} cat rows`);
  } else {
    fs.writeFileSync(
      path.join(mainSiteStaticDir, 'cats.json'),
      JSON.stringify([], null, 2),
      'utf8'
    );
  }

  // Export settings
  const settings = cmsData.settings || { siteTitle: 'TABLES', defaultLang: 'en', theme: 'light', showBreadcrumbs: false };
  const settingsForExport = { ...settings };
  settingsForExport.hasBlogArticles = isBlogEnabled && (cmsData.blogArticles || []).length > 0;
  if (settingsForExport.vercelApiKey && settingsForExport.vercelApiKey.trim() !== '') {
    settingsForExport.vercelApiKey = '***HIDDEN***';
  }
  fs.writeFileSync(
    path.join(mainSiteStaticDir, 'settings.json'),
    JSON.stringify(settingsForExport, null, 2),
    'utf8'
  );
  console.log('[Build API] Exported settings');

  // Save persistent storage
  fs.writeFileSync(
    path.join(projectRoot, '.cms-data.json'),
    JSON.stringify(cmsData, null, 2),
    'utf8'
  );

  // Copy uploads
  if (fs.existsSync(uploadsSrcDir)) {
    if (fs.existsSync(uploadsDestDir)) {
      fs.rmSync(uploadsDestDir, { recursive: true, force: true });
    }
    copyDir(uploadsSrcDir, uploadsDestDir);
    console.log('[Build API] Copied uploads to main-site');
  }

  console.log('[Build API] Data export complete');

  if (localOnly) {
    console.log('[Build API] Local only mode - skipping build');
    return runMainSiteBuild(projectRoot, localOnly);
  } else {
    if (vercelApiToken && vercelApiToken.trim() !== '') {
      console.log('[Build API] Deploying to Vercel...');
      return runMainSiteDeployOnly(projectRoot, vercelApiToken, vercelProjectName);
    } else {
      console.log('[Build API] Running Gatsby build...');
      return runMainSiteBuild(projectRoot, false);
    }
  }
}

function runMainSiteBuild(projectRoot, localOnly = false) {
  return new Promise((resolve, reject) => {
    const mainSiteDir = path.join(projectRoot, 'main-site');
    const publicDir = path.join(mainSiteDir, 'public');

    if (localOnly) {
      console.log('[Build API] Local mode - skipping Gatsby build');
      resolve();
      return;
    }

    if (!fs.existsSync(mainSiteDir)) {
      reject(new Error('main-site directory not found'));
      return;
    }

    const { node, npm, binDir, isBundled } = findBinaries();

    const envWithPath = {
      ...process.env,
      NODE_ENV: 'production'
    };
    if (binDir) {
      envWithPath.PATH = `${binDir}${path.delimiter}${process.env.PATH}`;
    }

    const npmCmd = isBundled ? `"${node}" "${npm}"` : `"${npm}"`;

    const mainSiteNodeModules = path.join(mainSiteDir, 'node_modules');
    if (!fs.existsSync(mainSiteNodeModules)) {
      console.log('[Build API] Installing main-site dependencies...');
      exec(`${npmCmd} install`, {
        cwd: mainSiteDir,
        env: envWithPath
      }, (installError) => {
        if (installError) {
          reject(installError);
          return;
        }
        executeBuild(npmCmd, envWithPath);
      });
    } else {
      executeBuild(npmCmd, envWithPath);
    }

    function executeBuild(command, env) {
      const buildProcess = exec(
        `${command} run build`,
        {
          cwd: mainSiteDir,
          env: env,
          maxBuffer: 10 * 1024 * 1024
        },
        (error) => {
          if (error) {
            console.error('[Build API] Build error:', error);
            reject(error);
            return;
          }

          console.log('[Build API] Main site build completed');

          if (fs.existsSync(publicDir)) {
            const rootPublicDir = path.join(projectRoot, 'public');
            if (!fs.existsSync(rootPublicDir)) {
              fs.mkdirSync(rootPublicDir, { recursive: true });
            }
            try {
              copyDir(publicDir, rootPublicDir);
              console.log('[Build API] Built site copied to root');
              resolve();
            } catch (copyError) {
              reject(copyError);
            }
          } else {
            reject(new Error('Public directory not created'));
          }
        }
      );

      buildProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) console.log('[Main Site Build]', output);
      });

      buildProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        if (output) console.error('[Main Site Build Error]', output);
      });
    }
  });
}

function runMainSiteDeployOnly(projectRoot, vercelApiToken, vercelProjectName) {
  return new Promise((resolve, reject) => {
    const mainSiteDir = path.join(projectRoot, 'main-site');

    if (!fs.existsSync(mainSiteDir)) {
      reject(new Error('main-site directory not found'));
      return;
    }

    if (!vercelApiToken || vercelApiToken.trim() === '') {
      reject(new Error('Vercel API token is required'));
      return;
    }

    try {
      const cacheDir = path.join(mainSiteDir, '.cache');
      const publicDir = path.join(mainSiteDir, 'public');
      if (fs.existsSync(cacheDir)) fs.rmSync(cacheDir, { recursive: true, force: true });
      if (fs.existsSync(publicDir)) fs.rmSync(publicDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('[Build API] Cleanup error:', cleanupError);
    }

    deployToVercel(mainSiteDir, vercelApiToken, vercelProjectName)
      .then(resolve)
      .catch(reject);
  });
}

function deployToVercel(mainSiteDir, vercelApiToken, vercelProjectName) {
  return new Promise((resolve, reject) => {
    const { node, npx, binDir, isBundled } = findBinaries();

    const envWithPath = {
      ...process.env,
      NODE_ENV: 'production',
      VERCEL_TOKEN: vercelApiToken
    };
    if (binDir) {
      envWithPath.PATH = `${binDir}${path.delimiter}${process.env.PATH}`;
    }

    const npxCmd = isBundled ? `"${node}" "${npx}"` : `"${npx}"`;

    const vercelDir = path.join(mainSiteDir, '.vercel');
    if (fs.existsSync(vercelDir)) {
      fs.rmSync(vercelDir, { recursive: true, force: true });
    }

    const vercelProjectFlag = vercelProjectName?.trim() ? ` --name="${vercelProjectName}"` : '';

    const deployProcess = exec(
      `${npxCmd} vercel --prod --token="${vercelApiToken}" ${vercelProjectFlag} --yes`,
      {
        cwd: mainSiteDir,
        env: envWithPath,
        maxBuffer: 10 * 1024 * 1024
      },
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        console.log('[Build API] Vercel deployment completed');
        resolve();
      }
    );

    deployProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) console.log('[Vercel Deploy]', output);
    });

    deployProcess.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output) console.log('[Vercel Deploy Output]', output);
    });
  });
}

// ============================================================================
// API: Uploads (GET /api/uploads)
// ============================================================================

app.get('/api/uploads', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan directory.');
    }

    const fileUrls = files
      .filter(file => !file.startsWith('.') && file !== 'placeholder')
      .map(file => ({
        name: file,
        url: `/uploads/${file}`,
      }));
    res.json(fileUrls);
  });
});

// ============================================================================
// API: Upload (POST /api/upload)
// ============================================================================

app.post('/api/upload', (req, res) => {
  try {
    const { fileData, fileName } = req.body;

    if (!fileData || !fileName) {
      return res.status(400).send('Missing file data or file name.');
    }

    const timestamp = Date.now();
    const newFileName = `${timestamp}_${fileName}`;

    const base64Data = fileData.replace(/^data:image\/[\w\+\-\.]+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const filePath = path.join(uploadDir, newFileName);

    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        console.error('Error saving file:', err);
        return res.status(500).send('Error saving file.');
      }
      res.json({ url: `/uploads/${newFileName}` });
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).send('Error processing upload.');
  }
});

// ============================================================================
// API: Delete Upload (POST /api/delete-upload)
// ============================================================================

app.post('/api/delete-upload', (req, res) => {
  const { filename } = req.body;

  if (!filename) {
    return res.status(400).send('Filename not provided.');
  }

  const filePath = path.join(uploadDir, filename);

  // Security check to prevent path traversal
  if (path.dirname(filePath) !== uploadDir) {
    return res.status(400).send('Invalid path.');
  }

  fs.unlink(filePath, err => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).send('File not found.');
      }
      return res.status(500).send('Error deleting file.');
    }
    res.status(200).send('File deleted.');
  });
});

// ============================================================================
// API: Import Uploads (POST /api/import-uploads)
// ============================================================================

app.post('/api/import-uploads', (req, res) => {
  try {
    // Clear the uploads directory first
    fs.readdirSync(uploadDir).forEach(file => {
      if (file === 'placeholder') return;
      try {
        fs.unlinkSync(path.join(uploadDir, file));
      } catch (err) {
        console.error(`Failed to delete file: ${file}`, err);
      }
    });

    const { uploads } = req.body;

    if (!uploads || typeof uploads !== 'object') {
      return res.status(400).send('Invalid uploads data.');
    }

    const importErrors = [];

    Object.entries(uploads).forEach(([fileName, fileData]) => {
      try {
        if (!fileData || !fileName) {
          throw new Error(`Invalid file data or name for ${fileName}`);
        }

        const base64Data = fileData.replace(/^data:[^;]+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, buffer);
      } catch (error) {
        console.error(`Error saving file ${fileName}:`, error);
        importErrors.push(fileName);
      }
    });

    if (importErrors.length > 0) {
      return res.status(500).json({ message: 'Some files failed to import.', failedFiles: importErrors });
    }

    res.status(200).json({ message: 'Uploads imported successfully.' });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).send('Error processing import.');
  }
});

// ============================================================================
// API: Purge Uploads (POST /api/purge-uploads)
// ============================================================================

app.post('/api/purge-uploads', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);

    let deletedCount = 0;
    let errors = [];

    files.forEach(file => {
      if (!file.startsWith('.') && file !== 'placeholder') {
        try {
          const filePath = path.join(uploadDir, file);
          fs.unlinkSync(filePath);
          deletedCount++;
        } catch (err) {
          errors.push({ file, error: err.message });
        }
      }
    });

    if (errors.length > 0) {
      res.status(207).json({
        message: `Purged ${deletedCount} files with ${errors.length} errors`,
        deletedCount,
        errors
      });
    } else {
      res.status(200).json({
        message: `Successfully purged ${deletedCount} files`,
        deletedCount
      });
    }
  } catch (err) {
    console.error('Error purging uploads:', err);
    res.status(500).json({
      message: 'Failed to purge uploads',
      error: err.message
    });
  }
});

// ============================================================================
// Static Files: Uploads
// ============================================================================

app.use('/uploads', express.static(path.join(__dirname, 'static/uploads')));

// ============================================================================
// Static Files: Built Gatsby Site
// ============================================================================

const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// ============================================================================
// SPA Fallback: Serve index.html for client-side routing
// ============================================================================

app.get('*', (req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('CMS not built yet. Please wait for initial build to complete.');
  }
});

// ============================================================================
// Start Server
// ============================================================================

const server = app.listen(PORT, () => {
  console.log(`[CMS Server] Running on http://localhost:${PORT}`);
  console.log(`[CMS Server] Serving static files from: ${publicDir}`);
  console.log(`[CMS Server] Upload directory: ${uploadDir}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('[CMS Server] SIGTERM received, shutting down...');
  server.close(() => {
    console.log('[CMS Server] Server closed');
    process.exit(0);
  });
});

module.exports = { app, server };
