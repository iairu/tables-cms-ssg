
exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  // During SSR (static HTML build), replace browser-only modules with empty stubs
  // react-quill and react-mde use `document` at import time, which crashes SSR
  if (stage === 'build-html' || stage === 'develop-html') {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /react-quill/,
            use: loaders.null(),
          },
          {
            test: /react-mde/,
            use: loaders.null(),
          },
          {
            test: /quill/,
            use: loaders.null(),
          },
          {
            test: /intersection-observer/,
            use: loaders.null(),
          },
        ],
      },
      resolve: {
        fallback: {
          fs: false,
        },
      },
    })
  } else {
    actions.setWebpackConfig({
      resolve: {
        fallback: {
          fs: false,
        },
      },
    })
  }
}