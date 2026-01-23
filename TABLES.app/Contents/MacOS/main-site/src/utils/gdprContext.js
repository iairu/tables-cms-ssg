import React, { createContext, useContext, useState, useEffect } from 'react';

const GDPRContext = createContext();

export const useGDPR = () => {
  const context = useContext(GDPRContext);
  if (!context) {
    throw new Error('useGDPR must be used within a GDPRProvider');
  }
  return context;
};

export const GDPRProvider = ({ children }) => {
  const [consent, setConsent] = useState(null);
  const [providers, setProviders] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedConsent = localStorage.getItem('GDPRconsent');
      const savedProviders = localStorage.getItem('GDPRproviders');
      
      if (savedConsent) {
        setConsent(savedConsent === 'true');
      }
      if (savedProviders) {
        setProviders(savedProviders);
      }
    }
  }, []);

  const userAllowConsent = (providerList = '') => {
    setConsent(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('GDPRconsent', 'true');
      localStorage.setItem('GDPRproviders', providerList);
    }
    setProviders(providerList);
  };

  const userDenyConsent = (providerList = '') => {
    setConsent(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('GDPRconsent', 'false');
      localStorage.setItem('GDPRproviders', providerList);
    }
    setProviders(providerList);
  };

  const resetConsent = () => {
    setConsent(null);
    setProviders('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('GDPRconsent');
      localStorage.removeItem('GDPRproviders');
    }
  };

  const hasAnswered = () => {
    return consent !== null;
  };

  const hasAllowedConsent = () => {
    return consent === true;
  };

  return (
    <GDPRContext.Provider
      value={{
        consent,
        providers,
        userAllowConsent,
        userDenyConsent,
        resetConsent,
        hasAnswered,
        hasAllowedConsent,
      }}
    >
      {children}
    </GDPRContext.Provider>
  );
};