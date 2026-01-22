import React from 'react';
import { useLoading } from '../context/LoadingContext';

const LoadingBar = () => {
  const { isLoading } = useLoading();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '3px',
        zIndex: 9999,
        transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
        transform: isLoading ? 'scaleX(1)' : 'scaleX(0)',
        transformOrigin: 'left',
        opacity: isLoading ? 1 : 0,
        backgroundColor: 'var(--page-button-color)', // blue-500
      }}
    />
  );
};

export default LoadingBar;
