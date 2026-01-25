import React, { useEffect, useRef, useState } from 'react';
import MarkdownRenderer from '../MarkdownRenderer';

const TitleSlide = ({ row }) => {
  const isDark = row.fields.darkTheme || row.fields.darkMode;
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

  const bgColor = row.fields.backgroundColor || (isDark ? 'black' : '#f2f2f2');
  const align = row.fields.alignment || 'left';
  const headingSize = row.fields.headingSize || 'normal';
  const minHeight = row.fields.minimalHeight || 0;

  const styles = {
    section: {
      display: 'flex',
      position: 'relative',
      flexFlow: 'column',
      justifyContent: 'flex-end',
      boxSizing: 'border-box',
      backgroundPosition: 'center',
      padding: '2em',
      width: '100%',
      backgroundColor: bgColor,
      color: isDark ? 'white' : 'black',
      overflow: 'hidden',
      minHeight: minHeight ? `${minHeight}vh` : 'auto',
      backgroundImage: row.fields.backgroundTexture ? `url(${row.fields.backgroundTexture})` : 'none',
    },
    pic: {
      display: 'flex',
      width: '100%',
      top: row.fields.scaleImageToWholeBackground ? '0' : '15px',
      left: 0,
      height: '100%',
      justifyContent: 'center',
      position: 'absolute',
      bottom: 0,
    },
    picImg: {
      height: '100%',
      maxWidth: '90%',
      objectFit: row.fields.scaleImageToWholeBackground ? 'cover' : 'contain',
    },
    picCover: {
      top: 0,
    },
    picCoverImg: {
      maxWidth: '100%',
      width: '100%',
      objectFit: 'cover',
    },
    content: {
      animation: isOffscreen ? 'fadeout 0.75s forwards' : 'slideinup 0.75s',
      display: 'flex',
      flexFlow: 'column',
      position: 'relative',
      width: '100%',
      marginTop: '2em',
      marginBottom: '2em',
      left: 0,
      zIndex: 99,
      padding: '0 15%',
      height: 'auto',
      boxSizing: 'border-box',
      justifyContent: 'space-around',
      alignItems: align === 'center' ? 'center' : (align === 'right' ? 'flex-end' : 'flex-start'),
    },
    heading: {
      fontSize: headingSize === 'big' ? '4rem' : '2.5rem',
      fontWeight: '700',
      margin: '0 0 1rem 0',
      textAlign: align,
    },
    text: {
      fontSize: '1.25rem',
      lineHeight: '1.75',
      margin: '0 0 2rem 0',
    },
    nav: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
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
      transition: 'all 0.2s',
    },
    link: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem',
      color: isDark ? '#ffffff' : 'var(--page-button-color)',
      textDecoration: 'none',
      fontWeight: '600',
    },
  };

  return (
    <section 
      ref={sectionRef}
      style={styles.section}
      className={`titulka ${isDark ? 'dark' : ''}`}
    >
      {(row.fields.backgroundImage || row.fields.mobileBackgroundImage || row.fields.backgroundVideo) && (
        <div 
          style={{
            ...styles.pic,
            ...(row.fields.scaleImageToWholeBackground || row.fields.backgroundVideo ? styles.picCover : {}),
          }}
          className={row.fields.scaleImageToWholeBackground || row.fields.backgroundVideo ? 'pic cover' : 'pic'}
        >
          {row.fields.backgroundImage && (
            <img
              className={row.fields.mobileBackgroundImage ? 'hide_m' : ''}
              src={row.fields.backgroundImage}
              alt="Title photo"
              style={{
                ...styles.picImg,
                ...(row.fields.scaleImageToWholeBackground ? styles.picCoverImg : {}),
              }}
            />
          )}
          {row.fields.mobileBackgroundImage && (
            <img
              className="hide_d"
              src={row.fields.mobileBackgroundImage}
              alt="Mobile title photo"
              style={{
                ...styles.picImg,
                ...(row.fields.scaleImageToWholeBackground ? styles.picCoverImg : {}),
              }}
            />
          )}
          {row.fields.backgroundVideo && (
            <video
              src={row.fields.backgroundVideo}
              autoPlay
              loop
              muted
              playsInline
              style={{
                ...styles.picImg,
                ...styles.picCoverImg,
                opacity: row.fields.videoOpacity ? row.fields.videoOpacity / 100 : 1,
              }}
            />
          )}
        </div>
      )}
      
      <div style={styles.content} className={`content ${align}`}>
        {row.fields.heading && (
          <h1 
            style={styles.heading}
            className={headingSize === 'big' ? 'big' : 'normal'}
            dangerouslySetInnerHTML={{ 
              __html: align === 'left' && typeof row.fields.heading === 'string' 
                ? row.fields.heading.replace(/\s/g, '<br>') 
                : row.fields.heading 
            }}
          />
        )}
        {row.fields.text && (
          <div style={styles.text}><MarkdownRenderer content={row.fields.text} /></div>
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

        section.titulka {
          display: flex;
          position: relative;
          flex-flow: column;
          justify-content: flex-end;
          box-sizing: border-box;
          background-position: center;
          padding: 2em;
          width: 100%;
          background: #f2f2f2;
          color: black;
          overflow: hidden;
        }

        .titulka.dark {
          color: white;
          background: black;
        }

        section.titulka .pic {
          display: flex;
          width: 100%;
          top: 15px;
          left: 0;
          height: 100%;
          justify-content: center;
          position: absolute;
          bottom: 0;
        }

        section.titulka .pic img {
          height: 100%;
          max-width: 90%;
          object-fit: contain;
        }

        section.titulka .pic.cover {
          top: 0;
        }

        section.titulka .pic.cover img,
        section.titulka .pic.cover video {
          max-width: 100%;
          width: 100%;
          object-fit: cover;
        }

        section.titulka .content {
          animation-name: slideinup;
          animation-duration: 0.75s;
          display: flex;
          flex-flow: column;
          position: relative;
          width: 100%;
          margin-top: 2em;
          margin-bottom: 2em;
          left: 0;
          z-index: 99;
          padding: 0 15%;
          height: auto;
          box-sizing: border-box;
          justify-content: space-around;
        }

        section.titulka.offscreen .content {
          animation-name: fadeout;
          animation-duration: 0.75s;
          animation-fill-mode: forwards;
        }

        section.titulka .content.left {
          align-items: flex-start;
        }

        section.titulka .content.center {
          align-items: center;
        }

        section.titulka .content.center h1 {
          text-align: center;
        }

        section.titulka .content.right {
          align-items: flex-end;
        }

        section.titulka .content.right h1 {
          text-align: right;
        }

        section.titulka .content span {
          margin-bottom: 0px;
        }

        @media (max-width: 1900px) {
          section.titulka .content {
            padding: 0 10%;
          }
        }

        @media (max-width: 1200px) {
          section.titulka .pic {
            top: 0;
          }

          section.titulka .pic img {
            object-fit: cover;
            max-width: 100%;
          }

          section.titulka .content {
            padding: 0;
          }
        }

        @media (max-width: 800px) {
          section.titulka .pic .hide_m {
            display: none;
          }
        }

        @media (min-width: 801px) {
          section.titulka .pic .hide_d {
            display: none;
          }
        }

        @media (max-width: 700px) {
          section.titulka .content p {
            text-align: center;
            align-self: center;
          }
        }
      `}</style>
    </section>
  );
};

export default TitleSlide;