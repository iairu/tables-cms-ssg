/**
 * Gatsby Node API Configuration
 * This file creates pages dynamically from the CMS data
 */

exports.createPages = async ({ actions }) => {
  const { createPage } = actions;

  // Cache actions for hot reload in development
  cachedActions = actions;

  // Define CMS sections
  const sections = [
    'pages',
    'blog',
    'pedigree',
    'inventory',
    'attendance',
    'customers',
    'employees',
    'reservations',
    'calendar',
    'settings',
    'extensions'
  ];

  // Create CMS page at /cms/
  createPage({
    path: `/cms`,
    component: require.resolve(`./src/pages/cms.js`),
    context: { section: 'default' },
  });

  // Create pages for each section
  sections.forEach(section => {
    createPage({
      path: `/cms/${section}`,
      component: require.resolve(`./src/pages/cms.js`),
      context: { section },
    });
  });
}

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      fallback: {
        fs: false,
      },
    },
  })
}