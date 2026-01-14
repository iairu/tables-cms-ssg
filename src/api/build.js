const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Utility to find npm binary path
function findNpmBinary(callback) {
  // Try 'which npm' first
  exec('which npm', (err, stdout, stderr) => {
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
    const { timestamp, trigger, data } = req.body;

    console.log(`[Build API] Build request received at ${timestamp} (trigger: ${trigger})`);

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
      message: 'Build started - exporting data and building main site',
      timestamp: new Date().toISOString(),
      isBuildInProgress: true
    });

    // Export localStorage data and run the build asynchronously
    exportDataAndBuild(data || {})
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

const exportDataAndBuild = async (data) => {
  const projectRoot = path.resolve(__dirname, '..', '..');
  const mainSiteDataDir = path.join(projectRoot, 'main-site', 'src', 'data');

  console.log('[Build API] Exporting CMS data to main site...');
  console.log('[Build API] Data directory:', mainSiteDataDir);

  // Ensure main-site data directory exists
  if (!fs.existsSync(mainSiteDataDir)) {
    fs.mkdirSync(mainSiteDataDir, { recursive: true });
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
      path.join(mainSiteDataDir, 'pages.json'),
      JSON.stringify(pages, null, 2),
      'utf8'
    );
    console.log(`[Build API] Exported ${pages.length} pages`);

    // Export blog articles
    const blogArticles = cmsData.blogArticles || [];
    fs.writeFileSync(
      path.join(mainSiteDataDir, 'blog.json'),
      JSON.stringify(blogArticles, null, 2),
      'utf8'
    );
    console.log(`[Build API] Exported ${blogArticles.length} blog articles`);

    // Export cats data
    const catRows = cmsData.catRows || [];
    fs.writeFileSync(
      path.join(mainSiteDataDir, 'cats.json'),
      JSON.stringify(catRows, null, 2),
      'utf8'
    );
    console.log(`[Build API] Exported ${catRows.length} cat rows`);

    // Export settings
    const settings = cmsData.settings || { siteTitle: 'TABLES', defaultLang: 'en', theme: 'light' };
    fs.writeFileSync(
      path.join(mainSiteDataDir, 'settings.json'),
      JSON.stringify(settings, null, 2),
      'utf8'
    );
    console.log('[Build API] Exported settings');

    // Save data to persistent storage for future builds
    fs.writeFileSync(
      path.join(projectRoot, '.cms-data.json'),
      JSON.stringify(cmsData, null, 2),
      'utf8'
    );

    console.log('[Build API] Data export complete');

    // Now trigger the main site build
    return runMainSiteBuild(projectRoot);
  } catch (error) {
    console.error('[Build API] Error exporting data:', error);
    throw error;
  }
};

const runMainSiteBuild = (projectRoot) => {
  return new Promise((resolve, reject) => {
    const mainSiteDir = path.join(projectRoot, 'main-site');
    const publicDir = path.join(mainSiteDir, 'public');

    console.log('[Build API] Starting main site Gatsby build...');
    console.log('[Build API] Main site directory:', mainSiteDir);

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