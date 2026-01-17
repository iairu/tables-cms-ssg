/**
 * Gatsby Node API for Main Site
 * Generates pages dynamically from CMS data stored in static JSON files
 * Data will be fetched at runtime from /data/*.json
 */

const path = require('path');
const fs = require('fs');

// Cache for development file watching
let cachedCreatePages = null;

exports.createPages = async ({ actions }) => {
  const { createPage } = actions;

  // Cache the createPage function for hot reload
  if (process.env.NODE_ENV === 'development') {
    cachedCreatePages = { createPage };
  }

  // Read CMS data from the static directory
  const staticDataDir = path.join(__dirname, 'static', 'data');
  
  // Ensure static data directory exists
  if (!fs.existsSync(staticDataDir)) {
    fs.mkdirSync(staticDataDir, { recursive: true });
    console.log('[Gatsby Node] Created static/data directory');
  }

  // Load pages data from static folder
  const pagesFile = path.join(staticDataDir, 'pages.json');
  let pages = [];
  if (fs.existsSync(pagesFile)) {
    try {
      pages = JSON.parse(fs.readFileSync(pagesFile, 'utf8'));
      console.log(`[Gatsby Node] Loaded ${pages.length} pages from static data`);
    } catch (error) {
      console.error('[Gatsby Node] Error reading pages.json:', error);
    }
  }

  // Create pages
  const pageTemplate = path.resolve(__dirname, 'src/templates/page.js');
  
  // Check if home page exists
  const hasHomePage = pages.some(page => page.slug === 'home' || page.slug === '/');
  
  // Load settings for SSG optimization (production only)
  const isProduction = process.env.NODE_ENV === 'production';
  let settings = {};
  
  if (isProduction) {
    const settingsFile = path.join(staticDataDir, 'settings.json');
    if (fs.existsSync(settingsFile)) {
      try {
        settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
        console.log('[Gatsby Node] Production build: Embedding data in pageContext for SSG optimization');
      } catch (error) {
        console.error('[Gatsby Node] Error reading settings.json:', error);
      }
    }
  } else {
    console.log('[Gatsby Node] Development mode: Templates will fetch JSON at runtime for hot reload');
  }
  
  // Get menu pages (pages with includeInMenu or slug === 'home')
  const menuPages = pages.filter(p => p.includeInMenu || p.slug === 'home');
  
  pages.forEach(page => {
    const context = {
      slug: page.slug,
    };
    
    // Only pass data in production for SSG optimization
    if (isProduction) {
      context.pageData = page;
      context.settings = settings;
      context.menuPages = menuPages;
    }
    
    createPage({
      path: page.slug === 'home' ? '/' : `/${page.slug}`,
      component: pageTemplate,
      context: context,
    });
  });
  
  // Create fallback home page if none exists
  if (!hasHomePage) {
    console.log('[Gatsby Node] No home page found, creating fallback home page');
    const context = {};
    
    // Only pass data in production
    if (isProduction) {
      context.settings = settings;
      context.menuPages = menuPages;
    }
    
    createPage({
      path: '/',
      component: path.resolve(__dirname, 'src/templates/empty-home.js'),
      context: context,
    });
  }

  // Load blog articles data from static folder
  const blogFile = path.join(staticDataDir, 'blog.json');
  let blogArticles = [];
  if (fs.existsSync(blogFile)) {
    try {
      blogArticles = JSON.parse(fs.readFileSync(blogFile, 'utf8'));
      console.log(`[Gatsby Node] Loaded ${blogArticles.length} blog articles from static data`);
    } catch (error) {
      console.error('[Gatsby Node] Error reading blog.json:', error);
    }
  }

  // Create blog article pages
  const blogTemplate = path.resolve(__dirname, 'src/templates/blog-article.js');
  blogArticles.forEach(article => {
    const pagePath = `/blog/${article.year}/${article.month}/${article.slug}`;
    console.log(`[Gatsby Node] Creating blog page: ${pagePath}`);
    
    const context = {
      slug: article.slug,
    };
    
    // Only pass data in production for SSG optimization
    if (isProduction) {
      context.articleData = article;
      context.settings = settings;
      context.menuPages = menuPages;
    }
    
    createPage({
      path: pagePath,
      component: blogTemplate,
      context: context,
    });
  });

  // Create a catch-all client-side route for blog articles in development
  // This enables hot reload without needing to restart the dev server
  if (process.env.NODE_ENV === 'development') {
    console.log('[Gatsby Node] Creating catch-all blog route for hot reload support');
    createPage({
      path: '/blog/catch-all',
      matchPath: '/blog/:year/:month/:slug',
      component: blogTemplate,
      context: {
        slug: null, // Will be extracted from URL on client-side
      },
    });
  }

  // Create a catch-all client-side route for pages in development
  // This enables hot reload without needing to restart the dev server
  // We create this AFTER blog routes to ensure proper route priority
  if (process.env.NODE_ENV === 'development') {
    console.log('[Gatsby Node] Creating catch-all page route for hot reload support');
    createPage({
      path: '/page-catch-all',
      matchPath: '/:slug',
      component: pageTemplate,
      context: {
        slug: null, // Will be extracted from URL on client-side
      },
    });
  }

  // Create blog index page
  const blogIndexTemplate = path.resolve(__dirname, 'src/templates/blog-index.js');
  const context = {};
  
  // Only pass data in production for SSG optimization
  if (isProduction) {
    context.articlesData = blogArticles;
    context.settings = settings;
    context.menuPages = menuPages;
  }
  
  createPage({
    path: '/blog',
    component: blogIndexTemplate,
    context: context,
  });
};

/**
 * Setup file watching for static data files in development
 * Triggers Gatsby to rebuild routes when JSON files change
 */
exports.onCreateDevServer = ({ app }) => {
  const staticDataDir = path.join(__dirname, 'static', 'data');
  
  // Only watch in development
  if (process.env.NODE_ENV === 'development') {
    try {
      const chokidar = require('chokidar');
      const http = require('http');
      
      console.log('[Gatsby Node] 🔥 Setting up hot reload for static/data/*.json');
      console.log('[Gatsby Node] Routes will rebuild automatically when data changes!');
      
      const watcher = chokidar.watch(path.join(staticDataDir, '*.json'), {
        ignoreInitial: true,
        persistent: true,
      });
      
      let isRebuilding = false;
      
      const triggerRebuild = (fileName) => {
        if (isRebuilding) {
          console.log('[Gatsby Node] ⏳ Rebuild already in progress, skipping...');
          return;
        }
        
        isRebuilding = true;
        console.log(`\n[Gatsby Node] 🔄 Detected change in ${fileName}`);
        console.log('[Gatsby Node] 🚀 Triggering automatic route rebuild...\n');
        
        // Trigger Gatsby's webhook to rebuild
        const options = {
          hostname: 'localhost',
          port: 3000,
          path: '/__refresh',
          method: 'POST',
        };
        
        const req = http.request(options, (res) => {
          if (res.statusCode === 200) {
            console.log('[Gatsby Node] ✅ Routes rebuilt successfully!');
            console.log('[Gatsby Node] 🎉 Your changes are now live!\n');
          } else {
            console.log(`[Gatsby Node] ⚠️ Rebuild returned status ${res.statusCode}`);
          }
          setTimeout(() => { isRebuilding = false; }, 2000);
        });
        
        req.on('error', (error) => {
          console.error('[Gatsby Node] ❌ Error triggering rebuild:', error.message);
          console.log('[Gatsby Node] 📝 Manual restart may be needed: npm run develop\n');
          isRebuilding = false;
        });
        
        req.end();
      };
      
      watcher.on('change', (filePath) => {
        const fileName = path.basename(filePath);
        triggerRebuild(fileName);
      });
      
      watcher.on('add', (filePath) => {
        const fileName = path.basename(filePath);
        triggerRebuild(fileName);
      });
      
    } catch (error) {
      console.log('[Gatsby Node] ⚠️ File watcher not available (chokidar not installed)');
      console.log('[Gatsby Node] To enable hot reload, run:');
      console.log('   npm install --save-dev chokidar\n');
    }
  }
};

