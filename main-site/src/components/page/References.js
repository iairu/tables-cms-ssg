import React, { useEffect, useRef } from 'react';

const References = ({ row }) => {
  const isDark = row.fields.darkTheme || row.fields.darkMode;
  const contentRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Auto-scroll functionality similar to refsAutoScroll.js
    let refInterval;
    
    const setupAutoScroll = () => {
      if (contentRef.current && sectionRef.current) {
        const content = contentRef.current;
        const section = sectionRef.current;
        
        // Check if content is wider than section
        const shouldAnimate = content.scrollWidth > section.clientWidth;
        
        if (shouldAnimate) {
          section.classList.add('animate');
          
          // Auto-scroll logic
          let scrollPosition = 0;
          const scrollSpeed = 0.5; // pixels per frame
          
          refInterval = setInterval(() => {
            scrollPosition += scrollSpeed;
            
            // Reset when reaching halfway point (for seamless loop)
            if (scrollPosition >= content.scrollWidth / 2) {
              scrollPosition = 0;
            }
            
            if (section) {
              section.scrollLeft = scrollPosition;
            }
          }, 16); // ~60fps
        } else {
          section.classList.remove('animate');
        }
      }
    };

    setupAutoScroll();
    window.addEventListener('resize', setupAutoScroll);

    return () => {
      if (refInterval) {
        clearInterval(refInterval);
      }
      window.removeEventListener('resize', setupAutoScroll);
    };
  }, [row.fields.images]);

  const styles = {
    section: {
      display: 'flex',
      position: 'relative',
      flexFlow: 'row',
      width: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden',
      backgroundColor: isDark ? 'rgb(49, 49, 49)' : 'lightgray',
      padding: '2em 0',
      justifyContent: 'center',
    },
    content: {
      display: 'flex',
      flexFlow: 'row',
      flexWrap: 'nowrap',
      flexShrink: 0,
      alignItems: 'center',
    },
    img: {
      position: 'relative',
      height: '70px',
      width: '150px',
      objectFit: 'contain',
      margin: '1em',
    },
  };

  return (
    <section 
      ref={sectionRef}
      style={styles.section}
      className={`ref ${isDark ? 'dark' : ''}`}
    >
      {row.fields.images && row.fields.images.length > 0 && (
        <div ref={contentRef} style={styles.content} className="content">
          {row.fields.images.map((image, imgIdx) => (
            <img
              key={imgIdx}
              src={image.imageUrl}
              alt={image.altText || `Reference ${imgIdx + 1}`}
              style={{
                ...styles.img,
                width: image.width ? `${image.width}px` : '150px',
                height: image.height ? `${image.height}px` : '70px',
              }}
            />
          ))}
          {/* Duplicate images for seamless loop */}
          {row.fields.images.map((image, imgIdx) => (
            <img
              key={`duplicate-${imgIdx}`}
              src={image.imageUrl}
              alt={image.altText || `Reference ${imgIdx + 1}`}
              style={{
                ...styles.img,
                width: image.width ? `${image.width}px` : '150px',
                height: image.height ? `${image.height}px` : '70px',
              }}
            />
          ))}
        </div>
      )}
      
      <style>{`
        section.ref {
          display: flex;
          position: relative;
          flex-flow: row;
          width: 100%;
          box-sizing: border-box;
          overflow: hidden;
          background-color: lightgray;
          padding: 2em 0;
          justify-content: center;
        }
        
        section.ref.animate {
          justify-content: flex-start;
        }
        
        section.ref.dark {
          background-color: rgb(49, 49, 49);
        }
        
        section.ref img {
          position: relative;
          height: 70px;
          width: 150px;
          object-fit: contain;
          margin: 1em;
        }
        
        section.ref img:first-of-type {
          margin-left: 0;
        }
        
        section.ref .content {
          display: flex;
          flex-flow: row;
          flex-wrap: nowrap;
          flex-shrink: 0;
          align-items: center;
        }
      `}</style>
    </section>
  );
};

export default References;