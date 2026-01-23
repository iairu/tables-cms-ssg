import React, { useEffect, useState } from 'react';

const GDPRConsent = ({ scripts = [], providers = '', currentLanguage = 'en' }) => {
  const [consent, setConsent] = useState(null);
  const [lastProviders, setLastProviders] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedConsent = localStorage.getItem('GDPRconsent');
      const savedProviders = localStorage.getItem('GDPRproviders');
      
      setConsent(savedConsent);
      setLastProviders(savedProviders || '');

      // Check if providers changed
      if (providers !== savedProviders && savedConsent) {
        resetConsent();
      }
    }
  }, [providers]);

  useEffect(() => {
    // Load scripts if consent is given
    if (typeof window !== 'undefined' && typeof document !== 'undefined' && consent === 'true' && scripts.length > 0) {
      scripts.forEach(script => {
        if (script && !document.querySelector(`script[src="${script}"]`)) {
          const scriptElement = document.createElement('script');
          scriptElement.src = script;
          scriptElement.async = true;
          document.head.appendChild(scriptElement);
        }
      });
    }
  }, [consent, scripts]);

  const hasAnswered = () => {
    return consent === 'true' || consent === 'false';
  };

  const hasAllowedConsent = () => {
    return consent === 'true';
  };

  const resetConsent = () => {
    setConsent(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('GDPRconsent');
      localStorage.removeItem('GDPRproviders');
    }
  };

  const userAllowConsent = () => {
    setConsent('true');
    if (typeof window !== 'undefined') {
      localStorage.setItem('GDPRconsent', 'true');
      localStorage.setItem('GDPRproviders', providers);
    }
  };

  const userDenyConsent = () => {
    setConsent('false');
    if (typeof window !== 'undefined') {
      localStorage.setItem('GDPRconsent', 'false');
      localStorage.setItem('GDPRproviders', providers);
    }
  };

  if ((scripts.length === 0 && !providers) || hasAnswered()) {
    return null;
  }

  const styles = {
    container: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      background: 'white',
      zIndex: 9999,
      display: 'flex',
      flexFlow: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTop: '1px solid rgba(0, 0, 0, 0.5)',
      padding: '0 10px',
      boxSizing: 'border-box',
    },
    paragraph: {
      color: 'black',
      margin: '15px',
    },
    list: {
      display: 'flex',
      flexFlow: 'row',
      border: 'none',
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    listItem: {
      border: 'none',
      padding: '0 5px',
    },
    buttonLink: {
      color: '#0070d9',
      textDecoration: 'none',
      background: 'transparent',
      outline: 'none',
      cursor: 'pointer',
      padding: '10px 25px',
      fontSize: '20px',
      border: 'none',
    },
    button: {
      outline: 'none',
      cursor: 'pointer',
      padding: '10px 25px',
      fontSize: '20px',
      background: '#0070d9',
      color: 'white',
      border: 'none',
      textDecoration: 'none',
    },
  };

  return (
    <div id="gdpr-consent" style={styles.container}>
      {currentLanguage === 'sk' ? (
        <>
          <p style={styles.paragraph}>
            <b>GDPR Oznam:</b> Ak súhlasíte, táto webstránka bude za cieľom
            zlepšenia poskytovaných služieb používať cookies a zbierať údaje
            o Vašej návštevnosti
            {providers ? ` od nasledovných poskytovateľov: ${providers}.` : '.'}
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <button style={styles.buttonLink} onClick={userDenyConsent}>
                Odmietnúť
              </button>
            </li>
            <li style={styles.listItem}>
              <button style={styles.button} onClick={userAllowConsent}>
                Povoliť
              </button>
            </li>
          </ul>
        </>
      ) : (
        <>
          <p style={styles.paragraph}>
            <b>GDPR Notice:</b> If you agree, this website will use cookies
            and your traffic data to ensure you get the best experience
            {providers ? ` from the following providers: ${providers}.` : '.'}
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <button style={styles.buttonLink} onClick={userDenyConsent}>
                Decline
              </button>
            </li>
            <li style={styles.listItem}>
              <button style={styles.button} onClick={userAllowConsent}>
                Accept
              </button>
            </li>
          </ul>
        </>
      )}
      
      <style>{`
        @media screen and (max-width: 600px) {
          #gdpr-consent {
            flex-flow: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default GDPRConsent;