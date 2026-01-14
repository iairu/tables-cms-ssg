const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Create Express app for serving the built site
const app = express();
const PORT = process.env.PORT || 80;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Build tracking
let isBuildInProgress = false;
let lastBuildTime = null;
let buildQueue = [];

// Build API endpoint
app.post('/api/build', async (req, res) => {
  const { timestamp, trigger } = req.body;

  console.log(`[Build API] Build request received at ${timestamp} (trigger: ${trigger})`);

  // If a build is already in progress, queue this request
  if (isBuildInProgress) {
    console.log('[Build API] Build already in progress, queuing request');
    buildQueue.push({ timestamp, trigger });
    return res.status(202).json({ 
      status: 'queued', 
      message: 'Build already in progress, request queued',
      queueLength: buildQueue.length
    });
  }

  // Mark build as in progress
  isBuildInProgress = true;

  // Send immediate response
  res.status(200).json({ 
    status: 'building', 
    message: 'Build started',
    timestamp: new Date().toISOString()
  });

  // Run the build asynchronously
  runBuild()
    .then(() => {
      console.log('[Build API] Build completed successfully');
      lastBuildTime = new Date().toISOString();
      isBuildInProgress = false;

      // Process next item in queue if any
      if (buildQueue.length > 0) {
        console.log(`[Build API] Processing ${buildQueue.length} queued builds`);
        buildQueue = []; // Clear queue (we only need one build for all queued requests)
        setTimeout(() => {
          isBuildInProgress = true;
          runBuild()
            .then(() => {
              isBuildInProgress = false;
              lastBuildTime = new Date().toISOString();
            })
            .catch(err => {
              console.error('[Build API] Queued build failed:', err);
              isBuildInProgress = false;
            });
        }, 1000);
      }
    })
    .catch(err => {
      console.error('[Build API] Build failed:', err);
      isBuildInProgress = false;
    });
});

// Build status endpoint
app.get('/api/build/status', (req, res) => {
  res.json({
    isBuildInProgress,
    lastBuildTime,
    queueLength: buildQueue.length
  });
});

// Function to run Gatsby build
const runBuild = () => {
  return new Promise((resolve, reject) => {
    const projectRoot = __dirname;
    const publicDir = path.join(projectRoot, 'public');
    
    console.log('[Build API] Starting Gatsby build...');
    console.log('[Build API] Project root:', projectRoot);

    // Execute gatsby build
    const buildProcess = exec(
      'npm run build',
      {
        cwd: projectRoot,
        env: { ...process.env, NODE_ENV: 'production' },
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error('[Build API] Build error:', error);
          console.error('[Build API] stderr:', stderr);
          reject(error);
          return;
        }

        console.log('[Build API] Build completed');
        
        // Check if public directory was created
        if (fs.existsSync(publicDir)) {
          console.log('[Build API] Public directory exists');
          resolve();
        } else {
          console.error('[Build API] Public directory not found');
          reject(new Error('Public directory not created'));
        }
      }
    );

    // Log build output in real-time
    buildProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) console.log('[Build]', output);
    });

    buildProcess.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output) console.error('[Build Error]', output);
    });
  });
};

// Serve static files from the public directory (built Gatsby site)
const publicPath = path.join(__dirname, 'public');

// Check if public directory exists
if (fs.existsSync(publicPath)) {
  console.log('[Server] Serving static files from:', publicPath);
  app.use(express.static(publicPath));
  
  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Site not built yet. Please run `npm run build` first.');
    }
  });
} else {
  console.warn('[Server] Public directory not found. Run `npm run build` to generate it.');
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.status(503).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Site Not Built</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #f8fafc;
            }
            .container {
              background: white;
              padding: 3rem;
              border-radius: 1rem;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              text-align: center;
              max-width: 500px;
            }
            h1 { color: #0f172a; margin-bottom: 1rem; }
            p { color: #64748b; line-height: 1.6; }
            code {
              background: #f1f5f9;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 0.9em;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Site Not Built</h1>
            <p>The site hasn't been built yet. Please run:</p>
            <p><code>npm run build</code></p>
            <p>Or access the CMS at port 8080 to trigger an automatic build by saving content.</p>
          </div>
        </body>
      </html>
    `);
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 TABLES Production Server');
  console.log('='.repeat(60));
  console.log(`📦 Serving built site on: http://localhost:${PORT}`);
  console.log(`🛠️  CMS running on: http://localhost:8080 (gatsby develop)`);
  console.log(`📁 Serving from: ${publicPath}`);
  console.log(`⚡ Build API: POST http://localhost:${PORT}/api/build`);
  console.log('='.repeat(60));
  
  if (!fs.existsSync(publicPath)) {
    console.warn('⚠️  Warning: Public directory not found!');
    console.warn('   Run `npm run build` or save content in CMS to trigger build');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received, shutting down gracefully');
  process.exit(0);
});