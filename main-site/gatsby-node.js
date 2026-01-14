/**
 * Gatsby Node API for Main Site
 * Generates pages dynamically from CMS data stored in data files
 */

const path = require('path');
const fs = require('fs');

exports.sourceNodes = ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions;

  // Read CMS data from the data directory
  const dataDir = path.join(__dirname, 'src', 'data');
  
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Load pages data
  const pagesFile = path.join(dataDir, 'pages.json');
  if (fs.existsSync(pagesFile)) {
    const pagesData = JSON.parse(fs.readFileSync(pagesFile, 'utf8'));
    pagesData.forEach((page, index) => {
      createNode({
        ...page,
        rows: JSON.stringify(page.rows || []), // Store rows as JSON string
        id: createNodeId(`Page-${page.id || index}`),
        parent: null,
        children: [],
        internal: {
          type: 'Page',
          contentDigest: createContentDigest(page),
        },
      });
    });
  }

  // Load blog articles data
  const blogFile = path.join(dataDir, 'blog.json');
  if (fs.existsSync(blogFile)) {
    const blogData = JSON.parse(fs.readFileSync(blogFile, 'utf8'));
    blogData.forEach((article, index) => {
      createNode({
        ...article,
        id: createNodeId(`BlogArticle-${article.id || index}`),
        parent: null,
        children: [],
        internal: {
          type: 'BlogArticle',
          contentDigest: createContentDigest(article),
        },
      });
    });
  }

  // Load cats data
  const catsFile = path.join(dataDir, 'cats.json');
  if (fs.existsSync(catsFile)) {
    const catsData = JSON.parse(fs.readFileSync(catsFile, 'utf8'));
    createNode({
      cats: catsData,
      id: createNodeId('Cats'),
      parent: null,
      children: [],
      internal: {
        type: 'CatsData',
        contentDigest: createContentDigest(catsData),
      },
    });
  }

  // Load settings data
  const settingsFile = path.join(dataDir, 'settings.json');
  if (fs.existsSync(settingsFile)) {
    const settingsData = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    createNode({
      ...settingsData,
      id: createNodeId('Settings'),
      parent: null,
      children: [],
      internal: {
        type: 'Settings',
        contentDigest: createContentDigest(settingsData),
      },
    });
  }
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  // Query all pages
  const pagesResult = await graphql(`
    query {
      allPage {
        nodes {
          id
          slug
          title
        }
      }
    }
  `);

  if (pagesResult.errors) {
    console.error('Error querying pages:', pagesResult.errors);
    return;
  }

  // Create pages
  const pageTemplate = path.resolve(__dirname, 'src/templates/page.js');
  const pages = pagesResult.data.allPage.nodes;
  
  // Check if home page exists
  const hasHomePage = pages.some(page => page.slug === 'home' || page.slug === '/');
  
  pages.forEach(page => {
    createPage({
      path: page.slug === 'home' ? '/' : `/${page.slug}`,
      component: pageTemplate,
      context: {
        id: page.id,
        slug: page.slug,
      },
    });
  });
  
  // Create fallback home page if none exists
  if (!hasHomePage) {
    console.log('[Gatsby Node] No home page found, creating fallback home page');
    createPage({
      path: '/',
      component: path.resolve(__dirname, 'src/templates/empty-home.js'),
      context: {},
    });
  }

  // Query all blog articles
  const blogResult = await graphql(`
    query {
      allBlogArticle(sort: { date: DESC }) {
        nodes {
          id
          slug
          title
          year
          month
        }
      }
    }
  `);

  if (blogResult.errors) {
    console.error('Error querying blog articles:', blogResult.errors);
    return;
  }

  // Create blog article pages
  const blogTemplate = path.resolve(__dirname, 'src/templates/blog-article.js');
  blogResult.data.allBlogArticle.nodes.forEach(article => {
    createPage({
      path: `/blog/${article.year}/${article.month}/${article.slug}`,
      component: blogTemplate,
      context: {
        id: article.id,
        slug: article.slug,
      },
    });
  });

  // Create blog index page
  const blogIndexTemplate = path.resolve(__dirname, 'src/templates/blog-index.js');
  createPage({
    path: '/blog',
    component: blogIndexTemplate,
  });
};