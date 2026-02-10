/**
 * Gatsby Browser API Configuration
 * This file is used to add client-side functionality
 */

import './src/styles/cms.css';

import React from 'react';
import { LoadingProvider } from './src/context/LoadingContext';
import Layout from './src/components/Layout';
import { CMSProvider } from './src/context/CMSContext';

export const onClientEntry = () => {
  if (typeof window.IntersectionObserver === 'undefined') {
    import('intersection-observer');
  }
};

export const wrapRootElement = ({ element }) => {
  return (
    <LoadingProvider>
      <CMSProvider>
        {element}
      </CMSProvider>
    </LoadingProvider>
  );
};

export const wrapPageElement = ({ element, props }) => {
  return <Layout {...props}>{element}</Layout>;
};

export const onPreRouteUpdate = () => {
  window.dispatchEvent(new CustomEvent('show-loading'));
};

export const onRouteUpdate = () => {
  // Timeout to ensure the page has had a moment to render
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('hide-loading'));
  }, 500);
};

export const onServiceWorkerUpdateReady = () => {
  const answer = window.confirm(
    'This application has been updated. ' +
    'Reload to display the latest version?'
  );

  if (answer === true) {
    window.location.reload();
  }
};