import React, { useEffect, useRef, useState } from 'react';
import MarkdownRenderer from '../MarkdownRenderer';

const Boxes = ({ row }) => {
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

  const handleBoxStyle = (box) => {
    if (box.horizontalAdjustment || box.verticalAdjustment) {
      return {
        transform: `translate(${box.horizontalAdjustment || 0}px, ${box.verticalAdjustment || 0}px)`,
      };
    }
    return {};
  };

  const styles = {
    section: {
      display: 'flex',
      flexFlow: 'row',
      justifyContent: 'center',
      boxSizing: 'border-box',
      width: '100%',
      zIndex: 9,
      backgroundColor: isDark ? 'black' : 'white',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundImage: row.fields.backgroundImage ? `url(${row.fields.backgroundImage})` : 'none',
    },
    wrapper: {
      display: 'flex',
      flexFlow: 'row wrap',
      justifyContent: 'space-evenly',
      margin: '50px',
      width: '100%',
      maxWidth: '1200px',
    },
    box: {
      animation: isOffscreen ? 'slideoutright 0.75s ease-in-out forwards' : 'slideinright 0.75s ease-in-out',
      display: 'flex',
      flexFlow: 'column',
      border: `1px solid ${isDark ? 'rgb(66, 66, 66)' : 'lightgray'}`,
      padding: '15px',
      margin: '5px',
      width: '100%',
      maxWidth: '300px',
      color: isDark ? 'white' : 'black',
      backgroundColor: isDark ? 'black' : 'white',
    },
    heading: {
      margin: 0,
      textTransform: 'uppercase',
      fontSize: '1.5rem',
      fontWeight: '600',
    },
    subheading: {
      margin: 0,
      color: 'gray',
      fontSize: '1rem',
    },
    icon: {
      width: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      margin: '10px 0 0',
      padding: '30px',
      boxSizing: 'border-box',
    },
    text: {
      flexGrow: 1,
      fontSize: '1rem',
      lineHeight: '1.6',
    },
    corner: {
      display: 'block',
      width: '100%',
      textAlign: 'right',
      fontSize: '0.875rem',
      color: '#94a3b8',
    },
  };

  return (
    <section ref={sectionRef} style={styles.section} className={`floaters ${isDark ? 'dark' : ''}`}>
      {row.fields.boxes && row.fields.boxes.length > 0 && (
        <div style={styles.wrapper}>
          {row.fields.boxes.map((box, boxIdx) => (
            <div 
              key={boxIdx} 
              className="box"
              style={{
                ...styles.box,
                ...handleBoxStyle(box),
              }}
            >
              {box.heading && <div style={styles.heading}><MarkdownRenderer content={box.heading} /></div>}
              {box.subheading && <div style={styles.subheading}><MarkdownRenderer content={box.subheading} /></div>}
              {box.icon && (
                <img 
                  src={box.icon} 
                  alt={box.heading || 'Icon'} 
                  style={styles.icon} 
                />
              )}
              {box.text && (
                <div style={styles.text}><MarkdownRenderer content={box.text} /></div>
              )}
              {box.lowerCornerText && (
                <div style={styles.corner}><MarkdownRenderer content={box.lowerCornerText} /></div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <style>{`
        @keyframes slideinright {
          from {
            transform: translateX(50px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideoutright {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(50px);
            opacity: 0;
          }
        }
        
        @media (max-width: 900px) {
          .box {
            transform: none !important !important;
          }
        }
        
        body.theme-goldshow .floaters.dark h2 {
          color: rgb(228, 185, 79);
        }
      `}</style>
    </section>
  );
};

export default Boxes;