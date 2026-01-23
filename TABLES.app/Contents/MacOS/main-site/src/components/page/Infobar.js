import React, { useEffect, useRef, useState } from 'react';

const Infobar = ({ row }) => {
  const isDark = row.fields.darkTheme || row.fields.darkMode;
  const sectionRef = useRef(null);
  const [isOffscreen, setIsOffscreen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const offset = 32;
        const offscreen = rect.bottom < offset || rect.top > window.innerHeight - offset;
        setIsOffscreen(offscreen);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const styles = {
    section: {
      display: 'flex',
      flexFlow: 'row wrap',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      minHeight: '60px',
      padding: '10px 15px',
      backgroundColor: isDark ? 'black' : '#f4f4f4',
      border: `1px solid ${isDark ? 'rgb(66, 66, 66)' : 'lightgray'}`,
      borderLeft: 'none',
      borderRight: 'none',
      boxSizing: 'border-box',
      color: isDark ? 'white' : 'black',
    },
    logo: {
      maxHeight: '40px',
      marginRight: '3em',
    },
    icon: {
      fontSize: '48px',
      marginRight: '1em',
    },
    text: {
      marginRight: '3em',
      animation: isOffscreen ? 'fadeout 0.75s forwards' : 'scalein 0.75s',
    },
    nav: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
    },
    button: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      backgroundColor: 'var(--page-button-color)',
      color: 'white',
      textDecoration: 'none',
      fontWeight: '500',
      fontSize: '0.875rem',
      border: '1px solid',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    link: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.25rem',
      color: 'var(--page-button-color)',
      textDecoration: 'none',
      fontWeight: '500',
      fontSize: '0.875rem',
    },
  };

  return (
    <section ref={sectionRef} style={styles.section} className={`bar ${isDark ? 'dark' : 'light'}`}>
      {row.fields.logo ? (
        <img src={row.fields.logo} alt="Logo" style={styles.logo} />
      ) : row.fields.alternativeIcon ? (
        <big className="icon" style={styles.icon}>
          <i className={row.fields.alternativeIcon}></i>
        </big>
      ) : null}
      
      {row.fields.text && (
        <span style={styles.text} dangerouslySetInnerHTML={{ __html: unescape(row.fields.text) }} />
      )}
      
      {row.fields.buttons && row.fields.buttons.length > 0 && (
        <nav style={styles.nav}>
          {row.fields.buttons.map((button, btnIdx) => (
            <a
              key={btnIdx}
              href={button.link}
              target={button.openAsPopup ? '_blank' : '_self'}
              rel={button.openAsPopup ? 'noopener noreferrer' : ''}
              style={button.showAsButton ? styles.button : styles.link}
            >
              {button.icon && <span>{button.icon}</span>}
              {button.title}
            </a>
          ))}
        </nav>
      )}
      
      <style>{`
        @keyframes scalein {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes fadeout {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        
        @media (max-width: 1200px) {
          section.bar {
            flex-flow: column;
            justify-content: center;
            align-items: center;
            padding: 1em;
          }
          section.bar > *:not(:last-child) {
            margin-right: 0;
            margin-bottom: 1em;
          }
          section.bar big.icon {
            margin-right: 0 !important;
            margin-bottom: 0.3em !important;
          }
        }
        
        body.theme-goldshow .bar.light {
          background-color: #262626;
          border-color: rgb(66, 66, 66);
          color: white;
        }
      `}</style>
    </section>
  );
};

export default Infobar;