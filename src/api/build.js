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

// Utility to find npm binary path
function findNpmBinary(callback) {
  // Try 'which npm' first
  exec('which npm', (err, stdout) => {
    let npmPath = stdout && stdout.trim();
    if (!err && npmPath && fs.existsSync(npmPath)) {
      callback(npmPath);
    } else {
      // Fallback: try common nvm path
      const nvmNpmPath = '/Users/iairu/.nvm/versions/node/v22.18.0/bin/npm';
      if (fs.existsSync(nvmNpmPath)) {
        callback(nvmNpmPath);
      } else {
        // Fallback to just 'npm' (hope it's in PATH)
        callback('npm');
      }
    }
  });
}

let isBuildInProgress = false;
let lastBuildTime = null;

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
      isBuildInProgress,
      lastBuildTime,
      mode: process.env.NODE_ENV
    });
  }

  // Handle POST request - trigger build
  if (req.method === 'POST') {
    const { timestamp, trigger, data, localOnly, vercelApiToken } = req.body;

    console.log(`[Build API] Build request received at ${timestamp} (trigger: ${trigger}, localOnly: ${localOnly})`);

    // If a build is already in progress, reject this request (don't queue)
    if (isBuildInProgress) {
      console.log('[Build API] Build already in progress, rejecting request');
      return res.status(409).json({
        status: 'conflict',
        message: 'Build already in progress, please wait',
        isBuildInProgress: true
      });
    }

    // Mark build as in progress BEFORE doing anything else
    isBuildInProgress = true;
    console.log('[Build API] Build status set to IN PROGRESS');

    // Send immediate response with build in progress status
    res.status(200).json({
      status: 'building',
      message: localOnly ? 'Local build started - exporting data and building main site' : 'Build and deploy started - exporting data, building, and deploying to Vercel',
      timestamp: new Date().toISOString(),
      isBuildInProgress: true
    });

    // Export localStorage data and run the build asynchronously
    exportDataAndBuild(data || {}, localOnly, vercelApiToken)
      .then(() => {
        console.log('[Build API] Build completed successfully');
        const completionTime = new Date().toISOString();
        lastBuildTime = completionTime;
        isBuildInProgress = false;
        console.log('[Build API] Status updated - isBuildInProgress: false, lastBuildTime:', completionTime);
      })
      .catch(err => {
        console.error('[Build API] Build failed:', err);
        isBuildInProgress = false;
        lastBuildTime = new Date().toISOString(); // Set timestamp even on failure so polling can detect completion
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

const exportDataAndBuild = async (data, localOnly = false, vercelApiToken = null) => {
  const projectRoot = path.resolve(__dirname, '..', '..');
  const mainSiteStaticDir = path.join(projectRoot, 'main-site', 'static', 'data');
  const uploadsSrcDir = path.join(projectRoot, 'static', 'uploads');
  const uploadsDestDir = path.join(projectRoot, 'main-site', 'static', 'uploads');

  console.log('[Build API] Exporting CMS data to main site...');
  console.log('[Build API] Data directory:', mainSiteStaticDir);
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
    // If no data passed, try to read from a persistent storage file
    let cmsData = data;

    if (Object.keys(cmsData).length === 0) {
      const storageFile = path.join(projectRoot, '.cms-data.json');
      if (fs.existsSync(storageFile)) {
        cmsData = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
        console.log('[Build API] Loaded data from storage file');
      }
    }

    // Export pages
    const pages = cmsData.pages || [];
    fs.writeFileSync(
      path.join(mainSiteStaticDir, 'pages.json'),
      JSON.stringify(pages, null, 2),
      'utf8'
    );
    console.log(`[Build API] Exported ${pages.length} pages`);

    // Export blog articles
    const blogArticles = cmsData.blogArticles || [];
    fs.writeFileSync(
      path.join(mainSiteStaticDir, 'blog.json'),
      JSON.stringify(blogArticles, null, 2),
      'utf8'
    );
    console.log(`[Build API] Exported ${blogArticles.length} blog articles`);

    // Export cats data
    const catRows = cmsData.catRows || [];
    fs.writeFileSync(
      path.join(mainSiteStaticDir, 'cats.json'),
      JSON.stringify(catRows, null, 2),
      'utf8'
    );
    console.log(`[Build API] Exported ${catRows.length} cat rows`);

    // Export settings (with vercelApiKey hidden)
    const settings = cmsData.settings || { siteTitle: 'TABLES', defaultLang: 'en', theme: 'light', showBreadcrumbs: false };
    const settingsForExport = { ...settings };
    settingsForExport.hasBlogArticles = blogArticles.length > 0;
    if (settingsForExport.vercelApiKey && settingsForExport.vercelApiKey.trim() !== '') {
      settingsForExport.vercelApiKey = '***HIDDEN***';
    }
    fs.writeFileSync(
      path.join(mainSiteStaticDir, 'settings.json'),
      JSON.stringify(settingsForExport, null, 2),
      'utf8'
    );
    console.log('[Build API] Exported settings (vercelApiKey hidden)');

    // Save data to persistent storage for future builds (with real vercelApiKey)
    fs.writeFileSync(
      path.join(projectRoot, '.cms-data.json'),
      JSON.stringify(cmsData, null, 2),
      'utf8'
    );

    // Copy static/uploads to main-site/static/uploads
    if (fs.existsSync(uploadsSrcDir)) {
      // Remove existing uploadsDestDir first to ensure clean copy
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
      console.log('[Build API] Local only mode - skipping Gatsby build (gatsby develop will pick up changes)');
      return runMainSiteBuild(projectRoot, localOnly);
    } else {
      if (vercelApiToken && vercelApiToken.trim() !== '') {
        console.log('[Build API] Production mode - deploying to Vercel (no local build)');
        return runMainSiteDeployOnly(projectRoot, vercelApiToken);
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
    const mainSiteDir = path.join(projectRoot, 'main-site');
    const publicDir = path.join(mainSiteDir, 'public');

    console.log('[Build API] Starting main site Gatsby build...');
    console.log('[Build API] Main site directory:', mainSiteDir);
    console.log('[Build API] NODE_ENV:', process.env.NODE_ENV);

    // Skip build in local mode - gatsby develop will pick up the changes automatically
    // Only when localOnly=true (development), we skip the build
    // When localOnly=false (production), we run the full Gatsby build
    if (localOnly) {
      console.log('[Build API] Local mode detected - skipping Gatsby build');
      console.log('[Build API] The gatsby develop server will automatically pick up data changes');
      resolve();
      return;
    }

    // Check if main-site exists
    if (!fs.existsSync(mainSiteDir)) {
      console.error('[Build API] main-site directory not found');
      reject(new Error('main-site directory not found'));
      return;
    }

    // Check if node_modules exists in main-site
    const mainSiteNodeModules = path.join(mainSiteDir, 'node_modules');
    if (!fs.existsSync(mainSiteNodeModules)) {
      console.log('[Build API] Installing main-site dependencies first...');

      // Find npm binary and install dependencies first
      findNpmBinary((npmPath) => {
        // Add node bin directory to PATH
        const nodeBinDir = path.dirname(npmPath);
        const envWithPath = {
          ...process.env,
          PATH: `${nodeBinDir}:${process.env.PATH}`
        };

        exec(`"${npmPath}" install`, {
          cwd: mainSiteDir,
          env: envWithPath
        }, (installError) => {
          if (installError) {
            console.error('[Build API] npm install failed:', installError);
            reject(installError);
            return;
          }

          console.log('[Build API] Dependencies installed, starting build...');
          executeBuild(npmPath);
        });
      });
    } else {
      // Find npm binary for build step
      findNpmBinary((npmPath) => {
        executeBuild(npmPath);
      });
    }

    function executeBuild(npmPath) {
      // Add node bin directory to PATH
      const nodeBinDir = path.dirname(npmPath);
      const envWithPath = {
        ...process.env,
        PATH: `${nodeBinDir}:${process.env.PATH}`,
        NODE_ENV: 'production'
      };

      // Execute gatsby build in main-site directory
      const buildProcess = exec(
        `"${npmPath}" run build`,
        {
          cwd: mainSiteDir,
          env: envWithPath,
          maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        },
        (error) => {
          if (error) {
            console.error('[Build API] Main site build error:', error);
            reject(error);
            return;
          }

          console.log('[Build API] Main site build completed');

          // Check if public directory was created
          if (fs.existsSync(publicDir)) {
            console.log('[Build API] Main site public directory exists');

            // Copy built site to root public directory for serving
            const rootPublicDir = path.join(projectRoot, 'public');
            if (!fs.existsSync(rootPublicDir)) {
              fs.mkdirSync(rootPublicDir, { recursive: true });
            }

            // Copy contents
            try {
              copyDir(publicDir, rootPublicDir);
              console.log('[Build API] Built site copied to root public directory');
              resolve();
            } catch (copyError) {
              console.error('[Build API] Error copying built site:', copyError);
              reject(copyError);
            }
          } else {
            console.error('[Build API] Main site public directory not found');
            reject(new Error('Public directory not created'));
          }
        }
      );

      // Log build output in real-time
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

// // Utility function to recursively copy directory
// function copyDir(src, dest) {
//   if (!fs.existsSync(dest)) {
//     fs.mkdirSync(dest, { recursive: true });
//   }

//   const entries = fs.readdirSync(src, { withFileTypes: true });

//   for (const entry of entries) {
//     const srcPath = path.join(src, entry.name);
//     const destPath = path.join(dest, entry.name);

//     if (entry.isDirectory()) {
//       copyDir(srcPath, destPath);
//     } else {
//       fs.copyFileSync(srcPath, destPath);
//     }
//   }
// }
const runMainSiteDeployOnly = (projectRoot, vercelApiToken) => {
  return new Promise((resolve, reject) => {
    const mainSiteDir = path.join(projectRoot, 'main-site');

    console.log('[Build API] Starting Vercel deployment (no local build) ...');
    console.log('[Build API] Main site directory:', mainSiteDir);
    console.log('[Build API] NODE_ENV:', process.env.NODE_ENV);

    // Check if main-site exists
    if (!fs.existsSync(mainSiteDir)) {
      console.error('[Build API] main-site directory not found');
      reject(new Error('main-site directory not found'));
      return;
    }

    // Check if vercelApiToken is provided
    if (!vercelApiToken || vercelApiToken.trim() === '') {
      console.error('[Build API] Vercel API token not provided');
      reject(new Error('Vercel API token is required for deployment. Please set it in Settings.'));
      return;
    }

    // Remove .cache and public directories before deploying
    const cacheDir = path.join(mainSiteDir, '.cache');
    const publicDir = path.join(mainSiteDir, 'public');
    try {
      if (fs.existsSync(cacheDir)) {
        fs.rmSync(cacheDir, { recursive: true, force: true });
        console.log('[Build API] Removed main-site/.cache directory');
      }
      if (fs.existsSync(publicDir)) {
        fs.rmSync(publicDir, { recursive: true, force: true });
        console.log('[Build API] Removed main-site/public directory');
      }
    } catch (cleanupError) {
      console.error('[Build API] Error removing .cache or public directories:', cleanupError);
      // Not rejecting here, just logging, as cleanup failure shouldn't block deploy
    }

    // Only deploy to Vercel, do not run local build
    console.log('[Build API] Deploying to Vercel...');
    deployToVercel(mainSiteDir, vercelApiToken)
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

const deployToVercel = (mainSiteDir, vercelApiToken) => {
  return new Promise((resolve, reject) => {
    // Check if node_modules exists in main-site
    const mainSiteNodeModules = path.join(mainSiteDir, 'node_modules');
    if (!fs.existsSync(mainSiteNodeModules)) {
      console.log('[Build API] Installing main-site dependencies first...');

      // Find npm binary and install dependencies first
      findNpmBinary((npmPath) => {
        // Add node bin directory to PATH
        const nodeBinDir = path.dirname(npmPath);
        const envWithPath = {
          ...process.env,
          PATH: `${nodeBinDir}:${process.env.PATH}`
        };

        exec(`"${npmPath}" install`, {
          cwd: mainSiteDir,
          env: envWithPath
        }, (installError) => {
          if (installError) {
            console.error('[Build API] npm install failed:', installError);
            reject(installError);
            return;
          }

          console.log('[Build API] Dependencies installed, starting deployment...');
          executeVercelDeploy(npmPath);
        });
      });
    } else {
      // Find npm binary for deployment step
      findNpmBinary((npmPath) => {
        executeVercelDeploy(npmPath);
      });
    }

    function executeVercelDeploy(npmPath) {
      // Add node bin directory to PATH
      const nodeBinDir = path.dirname(npmPath);
      const envWithPath = {
        ...process.env,
        PATH: `${nodeBinDir}:${process.env.PATH}`,
        NODE_ENV: 'production',
        VERCEL_TOKEN: vercelApiToken
      };

      // Check if Vercel CLI is installed
      exec('which vercel', { env: envWithPath }, (whichError, whichStdout) => {
        let vercelCommand = 'vercel';

        if (whichError) {
          console.log('[Build API] Vercel CLI not found globally, trying npx...');
          vercelCommand = 'npx vercel';
        } else {
          vercelCommand = whichStdout.trim();
          console.log('[Build API] Found Vercel CLI at:', vercelCommand);
        }

        // Deploy to Vercel with production flag
        console.log('[Build API] Deploying to Vercel...');
        const deployProcess = exec(
          `${vercelCommand} --prod --token="${vercelApiToken}" --yes`,
          {
            cwd: mainSiteDir,
            env: envWithPath,
            maxBuffer: 10 * 1024 * 1024 // 10MB buffer
          },
          (error, stdout, stderr) => {
            if (error) {
              console.error('[Build API] Vercel deployment error:', error);
              console.error('[Build API] Deployment stderr:', stderr);
              reject(error);
              return;
            }

            console.log('[Build API] Vercel deployment completed successfully');
            console.log('[Build API] Deployment output:', stdout);
            resolve();
          }
        );

        // Log deployment output in real-time
        deployProcess.stdout.on('data', (data) => {
          const output = data.toString().trim();
          if (output) console.log('[Vercel Deploy]', output);
        });

        deployProcess.stderr.on('data', (data) => {
          const output = data.toString().trim();
          if (output) console.log('[Vercel Deploy]', output); // bug where stdout is sent to stderr, so we handle errors by ignoring them as if they're non-errors
        });
      });
    }
  });
}
