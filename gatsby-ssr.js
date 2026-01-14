/**
 * Gatsby SSR API Configuration
 * This file is used to customize server-side rendering
 */

import React from 'react';

// Wrap page element to ensure consistent rendering between SSR and client
export const wrapPageElement = ({ element }) => {
  return element;
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

// Handle page wrapping for SSR
export const wrapRootElement = ({ element }) => {
  return element;
};