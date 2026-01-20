import React, { useEffect } from 'react';
import { navigate } from 'gatsby';
import HeadComponent from '../components/HeadComponent';

const LanguageRedirect = ({ pageContext }) => {
  useEffect(() => {
    // Get browser language
    const browserLang = navigator.language.split('-')[0]; // e.g., 'en-US' -> 'en'
    
    // Supported languages
    const supportedLanguages = ['sk', 'en'];
    
    // Get user's saved preference from localStorage
    const savedLang = typeof window !== 'undefined' ? localStorage.getItem('currentlang') : null;
    
    // Get available languages from context
    const { languages, defaultLang } = pageContext;
    const availableCodes = languages.map(l => l.code);
    
    // Determine which language to use (preference order: saved > browser (if supported) > default)
    let targetLang = defaultLang;
    
    if (savedLang && availableCodes.includes(savedLang)) {
      // Use saved preference from localStorage
      targetLang = savedLang;
      console.log('[Language Redirect] Using saved preference:', savedLang);
    } else if (supportedLanguages.includes(browserLang) && availableCodes.includes(browserLang)) {
      // Use browser language only if it's in the supported list (sk, en)
      targetLang = browserLang;
      console.log('[Language Redirect] Using browser language:', browserLang);
    } else {
      console.log('[Language Redirect] Using default language:', defaultLang);
    }
    
    // Save the chosen language to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentlang', targetLang);
    }
    
    // Redirect to the appropriate language homepage
    navigate(`/${targetLang}`, { replace: true });
  }, [pageContext]);

  return (
    <div className="page-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: 'white'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTopColor: 'white',
          
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <p style={{ fontSize: '18px', margin: 0 }}>Redirecting...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default LanguageRedirect;

export const Head = () => <HeadComponent fullTitle="Redirecting..." />;