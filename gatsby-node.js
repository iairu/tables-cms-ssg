/**
 * Gatsby Node API Configuration
 * This file creates pages dynamically from the CMS data
 */

exports.createPages = async ({ actions }) => {
  const { createPage } = actions;
  
  // Cache actions for hot reload in development
  cachedActions = actions;

  // Create CMS page at /cms/
  createPage({
    path: `/cms`,
    component: require.resolve(`./src/pages/cms.js`),
    context: {},
  })
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