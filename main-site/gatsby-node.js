/**
 * Gatsby Node API for Main Site - Multi-Language Support
 * Generates pages dynamically from CMS data with language routing
 * Pages: /{lang}/{slug}
 * Blog: /{lang}/blog/{year}/{month}/{slug}
 */

const path = require('path');
const fs = require('fs');

exports.createPages = async ({ actions }) => {
  const { createPage } = actions;

  // Read CMS data from the static directory
  const staticDataDir = path.join(__dirname, 'static', 'data');
  
  // Ensure static data directory exists
  if (!fs.existsSync(staticDataDir)) {
    fs.mkdirSync(staticDataDir, { recursive: true });
    console.log('[Gatsby Node] Created static/data directory');
  }

  // Load settings to get available languages
  const settingsFile = path.join(staticDataDir, 'settings.json');
  let settings = { languages: [{ code: 'en', name: 'English' }], defaultLang: 'en' };
  if (fs.existsSync(settingsFile)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      if (!settings.languages) {
        settings.languages = [{ code: 'en', name: 'English' }];
      }
      if (!settings.defaultLang) {
        settings.defaultLang = 'en';
      }
      console.log(`[Gatsby Node] Loaded settings with ${settings.languages.length} languages`);
    } catch (error) {
      console.error('[Gatsby Node] Error reading settings.json:', error);
    }
  }

  const languages = settings.languages;
  const defaultLang = settings.defaultLang;
  const isProduction = process.env.NODE_ENV === 'production';

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

  // Get menu pages
  const menuPages = pages.filter(p => p.includeInMenu || p.slug === 'home');

  // Create pages for each language
  const pageTemplate = path.resolve(__dirname, 'src/templates/page.js');
  const redirectTemplate = path.resolve(__dirname, 'src/templates/language-redirect.js');
  
  // Create root redirect page
  console.log('[Gatsby Node] Creating language detection redirect at /');
  createPage({
    path: '/',
    component: redirectTemplate,
    context: {
      languages: languages.map(l => l.code),
      defaultLang: defaultLang,
      isProduction: isProduction,
      settings: isProduction ? settings : null,
      menuPages: isProduction ? menuPages : null,
    },
  });

  languages.forEach(lang => {
    pages.forEach(page => {
      // Get localized content for this language
      const localizedContent = page.translations && page.translations[lang.code] 
        ? page.translations[lang.code] 
        : { title: page.title, slug: page.slug, rows: page.rows };

      const isHome = page.slug === 'home' || localizedContent.slug === 'home';
      const pagePath = isHome 
        ? `/${lang.code}`
        : `/${lang.code}/${localizedContent.slug}`;
      
      console.log(`[Gatsby Node] Creating page: ${pagePath}`);
      
      const context = {
        slug: localizedContent.slug,
        language: lang.code,
        pageId: page.id,
      };
      
      // Only pass data in production for SSG optimization
      if (isProduction) {
        context.pageData = {
          ...page,
          title: localizedContent.title,
          slug: localizedContent.slug,
          rows: localizedContent.rows,
        };
        context.settings = settings;
        context.menuPages = menuPages;
        context.languages = languages;
      }
      
      createPage({
        path: pagePath,
        component: pageTemplate,
        context: context,
      });
    });
  });

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

  // Create blog article pages for each language
  const blogTemplate = path.resolve(__dirname, 'src/templates/blog-article.js');
  
  languages.forEach(lang => {
    blogArticles.forEach(article => {
      // Get localized content for this language
      const hasTranslation = article.translations && article.translations[lang.code];
      const localizedContent = hasTranslation
        ? article.translations[lang.code]
        : { title: article.title, slug: article.slug, content: article.content, author: article.author };

      const pagePath = `/${lang.code}/blog/${article.year}/${article.month}/${localizedContent.slug}`;
      console.log(`[Gatsby Node] Creating blog page: ${pagePath}${hasTranslation ? ' (translated)' : ' (fallback)'}`);
      
      const context = {
        slug: localizedContent.slug,
        language: lang.code,
        articleId: article.id,
      };
      
      // Only pass data in production for SSG optimization
      if (isProduction) {
        context.articleData = {
          ...article,
          title: localizedContent.title,
          slug: localizedContent.slug,
          content: localizedContent.content,
          author: localizedContent.author,
        };
        context.settings = settings;
        context.menuPages = menuPages;
        context.languages = languages;
      }
      
      createPage({
        path: pagePath,
        component: blogTemplate,
        context: context,
      });
    });
  });

  // Create blog index pages for each language
  const blogIndexTemplate = path.resolve(__dirname, 'src/templates/blog-index.js');
  const blogRedirectTemplate = path.resolve(__dirname, 'src/templates/blog-redirect.js');
  
  // Create /blog redirect
  console.log('[Gatsby Node] Creating blog language redirect at /blog');
  createPage({
    path: '/blog',
    component: blogRedirectTemplate,
    context: {
      languages: languages.map(l => l.code),
      defaultLang: defaultLang,
    },
  });

  languages.forEach(lang => {
    const pagePath = `/${lang.code}/blog`;
    console.log(`[Gatsby Node] Creating blog index: ${pagePath}`);
    
    const context = {
      language: lang.code,
    };
    
    // Only pass data in production for SSG optimization
    if (isProduction) {
      context.articlesData = blogArticles;
      context.settings = settings;
      context.menuPages = menuPages;
      context.languages = languages;
    }
    
    createPage({
      path: pagePath,
      component: blogIndexTemplate,
      context: context,
    });
  });

  // Create catch-all routes for development hot reload
  if (process.env.NODE_ENV === 'development') {
    console.log('[Gatsby Node] Creating catch-all routes for hot reload support');
    
    // Catch-all for blog articles
    createPage({
      path: '/lang-blog-catch-all',
      matchPath: '/:lang/blog/:year/:month/:slug',
      component: blogTemplate,
      context: {
        slug: null,
        language: null,
      },
    });
    
    // Catch-all for pages
    createPage({
      path: '/lang-page-catch-all',
      matchPath: '/:lang/:slug',
      component: pageTemplate,
      context: {
        slug: null,
        language: null,
      },
    });

    // Catch-all for language home pages
    createPage({
      path: '/lang-home-catch-all',
      matchPath: '/:lang',
      component: pageTemplate,
      context: {
        slug: 'home',
        language: null,
      },
    });
  }
  // Generate sitemap.xml with priority support
  if (isProduction) {
    console.log('[Gatsby Node] Generating sitemap.xml');
    
    const sitemapEntries = [];
    const baseUrl = process.env.GATSBY_SITE_URL || 'https://example.com';
    
    // Add pages to sitemap
    languages.forEach(lang => {
      pages.forEach(page => {
        const localizedSlug = page.translations && page.translations[lang.code]
          ? page.translations[lang.code].slug
          : page.slug;
        
        const isHome = page.slug === 'home' || localizedSlug === 'home';
        const url = isHome 
          ? `${baseUrl}/${lang.code}`
          : `${baseUrl}/${lang.code}/${localizedSlug}`;
        
        const priority = page.sitemapPriority !== undefined ? page.sitemapPriority : 0.5;
        const lastMod = page.lastPublished ? new Date(page.lastPublished).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        
        sitemapEntries.push({
          url,
          priority,
          lastmod: lastMod,
          changefreq: 'weekly'
        });
      });
      
      // Add blog pages
      blogArticles.forEach(article => {
        const localizedSlug = article.translations && article.translations[lang.code]
          ? article.translations[lang.code].slug
          : article.slug;
        
        const url = `${baseUrl}/${lang.code}/blog/${article.year}/${article.month}/${localizedSlug}`;
        const lastMod = article.date ? new Date(article.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        
        sitemapEntries.push({
          url,
          priority: 0.6,
          lastmod: lastMod,
          changefreq: 'monthly'
        });
      });
    });
    
    // Generate XML
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    // Write sitemap to static folder
    const sitemapPath = path.join(__dirname, 'static', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemapXml);
    console.log(`[Gatsby Node] Sitemap generated with ${sitemapEntries.length} entries`);
  }
};

/**
 * Setup file watching for static data files in development
 */
exports.onCreateDevServer = ({ app }) => {
  const staticDataDir = path.join(__dirname, 'static', 'data');
  
  if (process.env.NODE_ENV === 'development') {
    try {
      const chokidar = require('chokidar');
      const http = require('http');
      
      console.log('[Gatsby Node] 🔥 Setting up hot reload for static/data/*.json');
      
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
        
        const options = {
          hostname: 'localhost',
          port: 3000,
          path: '/__refresh',
          method: 'POST',
        };
        
        const req = http.request(options, (res) => {
          if (res.statusCode === 200) {
            console.log('[Gatsby Node] ✅ Routes rebuilt successfully!\n');
          }
          setTimeout(() => { isRebuilding = false; }, 2000);
        });
        
        req.on('error', (error) => {
          console.error('[Gatsby Node] ❌ Error triggering rebuild:', error.message);
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
      console.log('[Gatsby Node] ⚠️ File watcher not available (install chokidar for hot reload)');
    }
  }
};