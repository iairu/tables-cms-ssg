import './src/styles/default.css';
import './src/styles/theme-strukshow.css';
import React from 'react';
import { AccessibilityProvider } from './src/utils/accessibilityContext';

export const wrapRootElement = ({ element }) => {
  return <AccessibilityProvider>{element}</AccessibilityProvider>;
};