/**
 * Gatsby SSR API Configuration
 * This file is used to customize server-side rendering
 */

import React from 'react';
import { LoadingProvider } from './src/context/LoadingContext';
import Layout from './src/components/Layout';

export const wrapRootElement = ({ element }) => {
  return (
    <LoadingProvider>
      {element}
    </LoadingProvider>
  );
};

export const wrapPageElement = ({ element, props }) => {
  return <Layout {...props}>{element}</Layout>;
};

// Add custom HTML attributes
export const onRenderBody = ({ setHtmlAttributes, setHeadComponents }) => {
  setHtmlAttributes({ lang: 'en' });
  
  setHeadComponents([
    <link
      key="preconnect-google-fonts"
      rel="preconnect"
      href="https://fonts.googleapis.com"
    />,
    <link
      key="preconnect-gstatic"
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossOrigin="anonymous"
    />,
    <link
      key="google-fonts"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />,
  ]);
};
