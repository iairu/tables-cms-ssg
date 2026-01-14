/**
 * Gatsby Browser API Configuration
 * This file is used to add client-side functionality
 */

import './src/styles/cms.css';

// Prevent flash of unstyled content
export const onClientEntry = () => {
  // IntersectionObserver polyfill for older browsers
  if (typeof window.IntersectionObserver === 'undefined') {
    import('intersection-observer');
  }
};

// Wrap page element to handle client-side only components
export const wrapPageElement = ({ element }) => {
  return element;
};

// Handle service worker updates
export const onServiceWorkerUpdateReady = () => {
  const answer = window.confirm(
    'This application has been updated. ' +
      'Reload to display the latest version?'
  );

  if (answer === true) {
    window.location.reload();
  }
};