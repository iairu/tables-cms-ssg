const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configure body parser to handle large payloads (base64 images)
export const config = {
  bodyParser: {
    json: {
      limit: '50mb'
    },
    urlencoded: {
      limit: '50mb',
      extended: true
    }
  }
};

/**
 * Finds the bundled or system node, npm, and npx binaries.
 * Priority: 1. support-bin (Local), 2. node-bin (Resources), 3. System Default
 */
function findBinaries() {
  const isWin = process.platform === 'win32';
  const nodeName = isWin ? 'node.exe' : 'node';

  // Define search paths in order of priority
  const searchPaths = [

    path.join(__dirname, '../../../'), // 1. Development folder
    ...(typeof process.resourcesPath === 'string' 
      ? [process.resourcesPath] 
      : []) // 2. Production resources (only if string)
  ];
  
  console.log("[Build API] Searching for binaries in paths:", searchPaths);
  for (const dir of searchPaths) {
    const binPath = path.join(dir, 'support-bin', 'npm_source', 'bin');
    const nodePath = path.join(binPath, nodeName);
    const npmPath = path.join(binPath, 'npm-cli.js');
    const npxPath = path.join(binPath, 'npx-cli.js');
    
    // If we find the node binary and cli scripts, we assume this is our toolchain directory
    if (fs.existsSync(nodePath) && fs.existsSync(npmPath) && fs.existsSync(npxPath)) {
      return {
        node: nodePath,
        npm: npmPath,
        npx: npxPath,
        binDir: binPath, // The binDir should be what we add to PATH
        isBundled: true
      };
    }
  }

  // 3. Fallback to system defaults
  return {
    node: 'node',
    npm: 'npm',
    npx: 'npx',
    binDir: null,
    isBundled: false
  };
}

// Use global state to survive hot reloads in development
if (typeof global.isBuildInProgress === 'undefined') {
  global.isBuildInProgress = false;
}
if (typeof global.lastBuildTime === 'undefined') {
  global.lastBuildTime = null;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle GET request - return build status
  if (req.method === 'GET') {
    return res.status(200).json({
      isBuildInProgress: global.isBuildInProgress,
      lastBuildTime: global.lastBuildTime,
      mode: process.env.NODE_ENV
    });
  }

  // Handle POST request - trigger build
  if (req.method === 'POST') {
    console.log('BUILD_START');
    const { timestamp, trigger, data, localOnly, vercelApiToken, vercelProjectName } = req.body;

    console.log(`[Build API] Build request received at ${timestamp} (trigger: ${trigger}, localOnly: ${localOnly})`);

    // If a build is already in progress, reject this request (don't queue)
    if (global.isBuildInProgress) {
      console.log('[Build API] Build already in progress, rejecting request');
      return res.status(409).json({
        status: 'conflict',
        message: 'Build already in progress, please wait',
        isBuildInProgress: true
      });
    }

    // Mark build as in progress BEFORE doing anything else
    global.isBuildInProgress = true;
    console.log('[Build API] isBuildInProgress set to true');
    console.log('[Build API] Build status set to IN PROGRESS');

    // Send immediate response with build in progress status
    res.status(200).json({
      status: 'building',
      message: localOnly ? 'Local build started - exporting data and building main site' : 'Build and deploy started - exporting data, building, and deploying to Vercel',
      timestamp: new Date().toISOString(),
      isBuildInProgress: true
    });

    // Export localStorage data and run the build asynchronously
    exportDataAndBuild(data || {}, localOnly, vercelApiToken, vercelProjectName)
      .then(() => {
        console.log('[Build API] Build promise resolved');
        console.log('[Build API] Build completed successfully');
        const completionTime = new Date().toISOString();
        global.lastBuildTime = completionTime;
        global.isBuildInProgress = false;
        console.log('[Build API] isBuildInProgress set to false');
        console.log('[Build API] Status updated - isBuildInProgress: false, lastBuildTime:', completionTime);
        console.log('BUILD_END');
      })
      .catch(err => {
        console.log('[Build API] Build promise rejected');
        console.error('[Build API] Build failed:', err);
        global.isBuildInProgress = false;
        console.log('[Build API] isBuildInProgress set to false');
        global.lastBuildTime = new Date().toISOString(); // Set timestamp even on failure so polling can detect completion
        console.log('BUILD_END');
      });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Utility function to recursively copy directory
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

const exportDataAndBuild = async (data, localOnly = false, vercelApiToken = null, vercelProjectName = null) => {
  let projectRoot = path.resolve(__dirname, '..', '..', '..');
  
  // Define candidate paths
  let mainSiteStaticDir = path.join(projectRoot, 'main-site', 'static', 'data');
  let uploadsSrcDir = path.join(projectRoot, 'static', 'uploads');
  let uploadsDestDir = path.join(projectRoot, 'main-site', 'static', 'uploads');

  // Helper to check if a directory (or its parent if it doesn't exist) is writable
  const isWritable = (p) => {
    try {
      const dirToCheck = fs.existsSync(p) ? p : path.dirname(p);
      fs.accessSync(dirToCheck, fs.constants.W_OK);
      return true;
    } catch (e) {
      return false;
    }
  };

  // If any path is not writable, switch the root to process.resourcesPath
  if (!isWritable(mainSiteStaticDir) || !isWritable(uploadsSrcDir) || !isWritable(uploadsDestDir)) {
    console.log('[Build API] Write permissions restricted in project root. Utilizing process.resourcesPath...');
    projectRoot = process.resourcesPath;
    mainSiteStaticDir = path.join(projectRoot, 'main-site', 'static', 'data');
    uploadsSrcDir = path.join(projectRoot, 'static', 'uploads');
    uploadsDestDir = path.join(projectRoot, 'main-site', 'static', 'uploads');
  }

  console.log('[Build API] Exporting CMS data to main site...');
  console.log('[Build API] Target Data directory:', mainSiteStaticDir);
  console.log('[Build API] Local only mode:', localOnly);

  // Ensure main-site static data directory exists
  if (!fs.existsSync(mainSiteStaticDir)) {
    fs.mkdirSync(mainSiteStaticDir, { recursive: true });
  }

  // Ensure main-site static uploads directory exists (for copy)
  if (!fs.existsSync(path.join(projectRoot, 'main-site', 'static'))) {
    fs.mkdirSync(path.join(projectRoot, 'main-site', 'static'), { recursive: true });
  }

  try {
    // Read data from localStorage (passed from client)
    let cmsData = data;

    if (Object.keys(cmsData).length === 0) {
      const storageFile = path.join(projectRoot, '.cms-data.json');
      if (fs.existsSync(storageFile)) {
        cmsData = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
        console.log('[Build API] Loaded data from storage file');
      }
    }

    // Get extensions status
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
    console.log(`[Build API] Exported ${filteredPages.length} pages (Blog enabled: ${isBlogEnabled})`);

    // Export blog articles
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
      console.log('[Build API] Blog is disabled, exported empty blog.json');
    }

    // Export cats data
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
      console.log('[Build API] Cats are disabled, exported empty cats.json');
    }

    // Export settings (with vercelApiKey hidden)
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
    console.log('[Build API] Exported settings (vercelApiKey hidden)');

    // Save data to persistent storage for future builds
    fs.writeFileSync(
      path.join(projectRoot, '.cms-data.json'),
      JSON.stringify(cmsData, null, 2),
      'utf8'
    );

    // Copy static/uploads to main-site/static/uploads
    if (fs.existsSync(uploadsSrcDir)) {
      if (fs.existsSync(uploadsDestDir)) {
        fs.rmSync(uploadsDestDir, { recursive: true, force: true });
      }
      copyDir(uploadsSrcDir, uploadsDestDir);
      console.log('[Build API] Copied static/uploads to main-site/static/uploads');
    } else {
      console.log('[Build API] No static/uploads directory found to copy');
    }

    console.log('[Build API] Data export complete');

    // Now trigger the main site build (and optionally deploy)
    if (localOnly) {
      console.log('[Build API] Local only mode - skipping Gatsby build (gatsby develop will pick up changes)', "Project root is", projectRoot);
      return runMainSiteBuild(projectRoot, localOnly);
    } else {
      if (vercelApiToken && vercelApiToken.trim() !== '') {
        console.log('[Build API] Production mode - deploying to Vercel (no local build)');
        return runMainSiteDeployOnly(projectRoot, vercelApiToken, vercelProjectName);
      } else {
        console.log('[Build API] Production mode - running Gatsby build only (no Vercel deployment)');
        return runMainSiteBuild(projectRoot, false);
      }
    }
  } catch (error) {
    console.error('[Build API] Error exporting data:', error);
    throw error;
  }
};

const runMainSiteBuild = (projectRoot, localOnly = false) => {
  return new Promise((resolve, reject) => {
    // Try Resources path first, then local projectRoot
    let mainSiteDir = path.join(projectRoot, 'main-site');
    if (!fs.existsSync(mainSiteDir)) {
      mainSiteDir = path.join(projectRoot, 'main-site');
    }
    
    const publicDir = path.join(mainSiteDir, 'public');

    console.log('[Build API] Starting main site Gatsby build...');
    
    if (localOnly) {
      console.log('[Build API] Local mode detected - skipping Gatsby build');
      resolve();
      return;
    }

    if (!fs.existsSync(mainSiteDir)) {
      reject(new Error('main-site directory not found'));
      return;
    }

    const { node, npm, binDir, isBundled } = findBinaries();
    
    // Prepare environment
    const envWithPath = {
      ...process.env,
      NODE_ENV: 'production'
    };
    if (binDir) {
      envWithPath.PATH = `${binDir}${path.delimiter}${process.env.PATH}`;
    }

    // Determine the npm command
    const npmCmd = isBundled ? `"${node}" "${npm}"` : `"${npm}"`;

    const mainSiteNodeModules = path.join(mainSiteDir, 'node_modules');
    if (!fs.existsSync(mainSiteNodeModules)) {
      console.log('[Build API] Installing main-site dependencies first...');
      exec(`${npmCmd} install`, {
        cwd: mainSiteDir,
        env: envWithPath
      }, (installError) => {
        if (installError) {
          console.error('[Build API] npm install failed:', installError);
          reject(installError);
          return;
        }
        console.log('[Build API] Dependencies installed, starting build...');
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
          maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        },
        (error) => {
          if (error) {
            console.error('[Build API] Main site build error:', error);
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
              console.log('[Build API] Built site copied to root public directory');
              resolve();
            } catch (copyError) {
              console.error('[Build API] Error copying built site:', copyError);
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
};

const runMainSiteDeployOnly = (projectRoot, vercelApiToken, vercelProjectName) => {
  return new Promise((resolve, reject) => {
    // Try Resources path first, then local projectRoot
    let mainSiteDir = path.join(projectRoot, 'main-site');
    if (!fs.existsSync(mainSiteDir)) {
      mainSiteDir = path.join(projectRoot, 'main-site');
    }

    console.log('[Build API] Starting Vercel deployment (no local build) ...');

    if (!fs.existsSync(mainSiteDir)) {
      reject(new Error('main-site directory not found'));
      return;
    }

    if (!vercelApiToken || vercelApiToken.trim() === '') {
      reject(new Error('Vercel API token is required for deployment.'));
      return;
    }

    try {
      const cacheDir = path.join(mainSiteDir, '.cache');
      const publicDir = path.join(mainSiteDir, 'public');
      if (fs.existsSync(cacheDir)) fs.rmSync(cacheDir, { recursive: true, force: true });
      if (fs.existsSync(publicDir)) fs.rmSync(publicDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('[Build API] Error removing .cache or public directories:', cleanupError);
    }

    console.log('[Build API] About to deploy to Vercel...');
    deployToVercel(mainSiteDir, vercelApiToken, vercelProjectName)
      .then(() => {
        console.log('[Build API] Deployment completed successfully');
        resolve();
      })
      .catch((error) => {
        console.error('[Build API] Deployment failed:', error);
        reject(error);
      });
  });
};

const deployToVercel = (mainSiteDir, vercelApiToken, vercelProjectName) => {
  return new Promise((resolve, reject) => {
    const { node, npm, npx, binDir, isBundled } = findBinaries();

    const envWithPath = {
      ...process.env,
      NODE_ENV: 'production',
      VERCEL_TOKEN: vercelApiToken
    };
    if (binDir) {
      envWithPath.PATH = `${binDir}${path.delimiter}${process.env.PATH}`;
    }

    const npmCmd = isBundled ? `"${node}" "${npm}"` : `"${npm}"`;
    const npxCmd = isBundled ? `"${node}" "${npx}"` : `"${npx}"`;

    const mainSiteNodeModules = path.join(mainSiteDir, 'node_modules');
    if (!fs.existsSync(mainSiteNodeModules)) {
      // console.log('[Build API] Installing main-site dependencies first...');
      // exec(`${npmCmd} install`, {
      //   cwd: mainSiteDir,
      //   env: envWithPath
      // }, (installError) => {
      //   if (installError) {
      //     reject(installError);
      //     return;
      //   }
        executeVercelDeploy(npxCmd, envWithPath);
      
    } else {
      executeVercelDeploy(npxCmd, envWithPath);
    }

    function executeVercelDeploy(npxCommand, env) {
      const vercelDir = path.join(mainSiteDir, '.vercel');
      if (fs.existsSync(vercelDir)) {
        fs.rmSync(vercelDir, { recursive: true, force: true });
        console.log('[Build API] Removed existing .vercel directory');
      }

      // Handle project name update in project.json
      const vercelProjectJsonPath = path.join(mainSiteDir, '.vercel', 'project.json');
      if (fs.existsSync(vercelProjectJsonPath) && vercelProjectName?.trim()) {
        try {
          const projectConfig = JSON.parse(fs.readFileSync(vercelProjectJsonPath, 'utf8'));
          if (projectConfig.projectName !== vercelProjectName) {
            projectConfig.projectName = vercelProjectName;
            fs.writeFileSync(vercelProjectJsonPath, JSON.stringify(projectConfig, null, 2), 'utf8');
          }
        } catch (error) {
          console.error(`[Build API] Error updating ${vercelProjectJsonPath}:`, error);
        }
      }

      const vercelProjectFlag = vercelProjectName?.trim() ? ` --name="${vercelProjectName}"` : '';
      
      // Deploy using npx vercel
      const deployProcess = exec(
        `${npxCommand} vercel --prod --token="${vercelApiToken}" ${vercelProjectFlag} --yes`,
        {
          cwd: mainSiteDir,
          env: env,
          maxBuffer: 10 * 1024 * 1024
        },
        (error, stdout) => {
          if (error) {
            reject(error);
            return;
          }
          console.log('[Build API] Vercel deployment completed successfully');
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
    }
  });
}