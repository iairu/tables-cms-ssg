import React, { useEffect, useRef, useState } from 'react';

const Ranking = ({ row }) => {
  const isDark = row.fields.darkTheme || row.fields.darkMode;
  const sectionRef = useRef(null);
  const [isOffscreen, setIsOffscreen] = useState(false);

  useEffect(() => {
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

  const styles = {
    section: {
      display: 'flex',
      flexFlow: 'row',
      width: '100%',
      padding: '2em',
      boxSizing: 'border-box',
      color: isDark ? 'white' : 'black',
      backgroundColor: isDark ? 'black' : 'lightgray',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundImage: row.fields.backgroundImage ? `url(${row.fields.backgroundImage})` : 'none',
    },
    content: {
      display: 'flex',
      flexFlow: 'row wrap',
      width: '100%',
      justifyContent: 'space-around',
      border: 'none',
      animation: isOffscreen ? 'fadeout 0.75s forwards' : 'scalein 0.75s',
    },
    li: {
      border: 'none',
      padding: '1em',
      display: 'flex',
      flexFlow: 'column',
      textTransform: 'uppercase',
      alignItems: 'center',
      listStyle: 'none',
    },
    count: {
      fontSize: '3em',
      fontWeight: '900',
      margin: 0,
      WebkitTextStroke: `2px ${isDark ? 'white' : 'black'}`,
      WebkitTextFillColor: 'transparent',
    },
    name: {
      fontSize: '1rem',
      fontWeight: '600',
    },
  };

  return (
    <section ref={sectionRef} style={styles.section} className={`ranking ${isDark ? 'dark' : ''}`}>
      {row.fields.ranks && row.fields.ranks.length > 0 && (
        <ul style={styles.content} className="content">
          {row.fields.ranks.map((rank, rankIdx) => (
            <li key={rankIdx} style={styles.li}>
              <h1 
                className="count"
                style={styles.count}
                dangerouslySetInnerHTML={{ __html: rank.heading || '' }}
              />
              <span className="name" style={styles.name}>{rank.subheading || ''}</span>
            </li>
          ))}
        </ul>
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
        
        @media (max-width: 500px) {
          .ranking .content .count {
            font-size: 2.5em;
          }
        }
        
        body.theme-goldshow .ranking .content .count {
          font-size: 4em;
        }
        
        body.theme-goldshow .ranking .content .count b {
          -webkit-text-fill-color: white;
        }
        
        body.theme-goldshow .ranking.dark h1 {
          -webkit-text-stroke-color: white;
        }
        
        body.theme-goldshow .ranking.dark h1 b {
          -webkit-text-fill-color: white;
        }
        
        @media (max-width: 500px) {
          body.theme-goldshow .ranking .content .count {
            font-size: 3.5em;
          }
        }
      `}</style>
    </section>
  );
};

export default Ranking;