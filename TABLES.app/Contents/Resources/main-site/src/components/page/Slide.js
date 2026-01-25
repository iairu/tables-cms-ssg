import React, { useEffect, useRef, useState } from 'react';
import MarkdownRenderer from '../MarkdownRenderer';

const Slide = ({ row }) => {
  const sectionRef = useRef(null);
  const [isOffscreen, setIsOffscreen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const offscreen = rect.bottom < 0 || rect.top > window.innerHeight;
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

  const leftDark = row.fields.leftDarkTheme;
  const rightDark = row.fields.rightDarkTheme;
  const big = row.fields.largerSlide;
  const reorderM = row.fields.switchOrderOnMobile;

  const styles = {
    section: {
      display: 'flex',
      flexFlow: 'row',
      position: 'relative',
      boxSizing: 'border-box',
      justifyContent: 'space-around',
      overflow: 'hidden',
      width: '100%',
    },
    left: {
      boxSizing: 'border-box',
      display: 'flex',
      position: 'relative',
      flexFlow: 'column',
      justifyContent: 'center',
      minHeight: row.fields.minimalLeftHeight ? `${row.fields.minimalLeftHeight}vh` : (big ? '70vh' : '30vh'),
      width: '50%',
      paddingLeft: '2em',
      paddingRight: '4em',
      paddingTop: '2em',
      paddingBottom: '2em',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: row.fields.fitLeftBackground ? 'contain' : 'cover',
      backgroundColor: row.fields.leftBackgroundColor || '#f4f4f4',
      backgroundImage: row.fields.leftBackgroundImage ? `url(${row.fields.leftBackgroundImage})` : 'none',
      color: leftDark ? 'white' : 'black',
      zIndex: 10,
      overflow: 'hidden',
      clipPath: 'polygon(0 0, 100% 0, calc(100% - 50px) 100%, 0 100%)',
    },
    right: {
      boxSizing: 'border-box',
      display: 'flex',
      position: 'relative',
      flexFlow: 'column',
      justifyContent: 'center',
      minHeight: row.fields.minimalRightHeight ? `${row.fields.minimalRightHeight}vh` : (big ? '70vh' : '30vh'),
      width: '50%',
      paddingLeft: '2em',
      paddingRight: '4em',
      paddingTop: '2em',
      paddingBottom: '2em',
      backgroundColor: 'transparent',
      overflow: 'visible',
      zIndex: 9,
      color: rightDark ? 'white' : 'black',
    },
    under: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: row.fields.rightBackgroundColor || 'white',
      backgroundImage: row.fields.rightBackgroundImage ? `url(${row.fields.rightBackgroundImage})` : 'none',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: row.fields.fitRightBackground ? 'contain' : 'cover',
      left: '-50px',
      width: 'calc(100% + 50px)',
      zIndex: -1,
      boxSizing: 'border-box',
    },
    heading: {
      fontSize: '3em',
      margin: '0 0 0.5em 0',
      animation: isOffscreen ? 'fadeout 0.75s forwards' : 'slideinup 0.75s',
    },
    text: {
      fontSize: '1.125rem',
      lineHeight: '1.75',
      margin: '0 0 1.5em 0',
      animation: isOffscreen ? 'fadeout 0.75s forwards' : 'slideinup 0.75s',
    },
    nav: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      animation: isOffscreen ? 'fadeout 0.75s forwards' : 'slideinup 0.75s',
    },
    button: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      backgroundColor: 'var(--page-button-color)',
      color: 'white',
      textDecoration: 'none',
      fontWeight: '600',
      border: '1px solid',
      cursor: 'pointer',
    },
    link: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem',
      color: 'var(--page-button-color)',
      textDecoration: 'none',
      fontWeight: '600',
    },
  };

  return (
    <section 
      ref={sectionRef}
      style={styles.section}
      className={`slide${reorderM ? ' reorder_m' : ''}`}
    >
      <div style={styles.left} className={`left${leftDark ? ' dark' : ''}${row.fields.hideLeftOnMobile ? ' hide-left-on-mobile' : ''}`}>
        {row.fields.leftHeading && (
          <div style={styles.heading}><MarkdownRenderer content={row.fields.leftHeading} /></div>
        )}
        {row.fields.leftText && (
          <div style={styles.text}><MarkdownRenderer content={row.fields.leftText} /></div>
        )}
        {row.fields.leftButtons && row.fields.leftButtons.length > 0 && (
          <nav style={styles.nav}>
            {row.fields.leftButtons.map((button, btnIdx) => (
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
      </div>

      <div style={styles.right} className={`right${rightDark ? ' dark' : ''}${row.fields.hideRightOnMobile ? ' hide-right-on-mobile' : ''}`}>
        {row.fields.rightHeading && (
          <div style={styles.heading}><MarkdownRenderer content={row.fields.rightHeading} /></div>
        )}
        {row.fields.rightText && (
          <div style={styles.text}><MarkdownRenderer content={row.fields.rightText} /></div>
        )}
        {row.fields.rightButtons && row.fields.rightButtons.length > 0 && (
          <nav style={styles.nav}>
            {row.fields.rightButtons.map((button, btnIdx) => (
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

        <div style={styles.under} className={`under${rightDark ? ' dark' : ''}`}></div>
      </div>

      <style>{`
        @keyframes slideinup {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
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

        section.slide .left.dark {
          background-color: black;
          color: white;
        }

        section.slide .under.dark {
          background-color: black;
          color: white;
        }

        @media (max-width: 1500px) {
          section.slide .left,
          section.slide .right {
            width: 100%;
            padding: 2em;
          }
        }

        @media (max-width: 1200px) {
          section.slide {
            flex-flow: column;
          }

          section.slide.reorder_m .right {
            order: -1;
          }

          section.slide .hide_m {
            display: none;
          }

          section.slide .left,
          section.slide .right {
            clip-path: none;
          }

          section.slide .left {
            padding: 2em;
          }

          section.slide .right .under {
            padding: 2em;
            width: 100%;
            left: 0;
          }

          section.slide h1 {
            font-size: 2em;
          }

          section.slide .hide-left-on-mobile {
            display: none;
          }
        }

        @media (min-width: 901px) {
          section.slide .hide-left-on-mobile {
            display: flex;
          }
        }

        @media (max-width: 900px) {
          section.slide .hide-right-on-mobile {
            display: none;
          }
        }

        @media (max-width: 700px) {
          section.slide {
            flex-flow: column;
          }

          section.slide .left {
            width: 100%;
            padding: 2em;
            margin-bottom: 1em;
          }

          section.slide .right {
            width: 100%;
            padding: 2em;
          }

          section.slide .right .under {
            width: 100%;
            left: 0;
          }
        }
      `}</style>
    </section>
  );
};

export default Slide;