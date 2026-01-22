import React, { useEffect, useRef, useState } from 'react';

const Video = ({ row }) => {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [isOffscreen, setIsOffscreen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOffscreenVid = () => {
      if (videoRef.current && sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const offset = 3;
        const offscreen = rect.bottom < offset || rect.top > window.innerHeight - offset;
        
        setIsOffscreen(offscreen);
        
        if (videoRef.current.tagName === 'VIDEO') {
          if (offscreen) {
            videoRef.current.pause();
          } else {
            if (videoRef.current.paused) {
              videoRef.current.play();
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleOffscreenVid);
    window.addEventListener('resize', handleOffscreenVid);
    handleOffscreenVid();

    return () => {
      window.removeEventListener('scroll', handleOffscreenVid);
      window.removeEventListener('resize', handleOffscreenVid);
    };
  }, []);

  const recalculateVideoHeight = () => {
    if (typeof window === 'undefined') return '675px'; // Default height (1200/16*9)
    const assumedVideoWidth = (window.innerWidth < 1200) ? window.innerWidth : 1200;
    return (assumedVideoWidth / 16 * 9) + 'px';
  };

  const [videoHeight, setVideoHeight] = useState(() => {
    if (typeof window === 'undefined') return '675px';
    return recalculateVideoHeight();
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setVideoHeight(recalculateVideoHeight());
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const YTurlToEmbed = (url) => {
    if (!url) return '';
    
    // Handle youtu.be format
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle youtube.com/watch?v= format
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle youtube.com/embed/ format (already embedded)
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    return url;
  };

  const handleVideoClasses = (theme) => {
    const classes = [];
    if (theme) {
      if (theme.includes('fullwidth') || theme.includes('autoplay-fullwidth')) {
        classes.push('span');
      }
      if (theme.includes('embedded')) {
        classes.push('embedded');
      }
      if (theme.includes('iphone') || theme.includes('iPhone immersive')) {
        classes.push('immersive_screen');
      }
      if (theme.includes('autoplay')) {
        classes.push('autoplay');
      }
    }
    return classes.join(' ');
  };

  const ytlink = row.fields.youtubeUrl || '';
  const ytembedlink = YTurlToEmbed(ytlink);
  const local = row.fields.localVideo || '';
  const theme = row.fields.specialTheme || '';
  const loopopacity = row.fields.videoOpacity || '';
  const classes = handleVideoClasses(theme);

  const styles = {
    section: {
      display: 'flex',
      position: 'relative',
      justifyContent: 'center',
      width: '100%',
      overflow: 'hidden',
    },
    video: {
      position: 'relative',
      width: '100%',
      height: '55vh',
      maxWidth: '1200px',
      background: 'transparent',
      animation: isOffscreen ? 'semifadeout 0.75s forwards' : 'semifadein 0.75s',
    },
    iframe: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      border: 'none',
    },
    iframeWrapper: {
      maxWidth: theme.includes('fullwidth') || theme.includes('autoplay-fullwidth') ? '100%' : '1200px',
      width: '100%',
      position: 'relative',
      paddingBottom: theme.includes('iphone') ? '0' : '56.25%',
      height: theme.includes('iphone') ? '600px' : '0',
    },
  };

  return (
    <section 
      ref={sectionRef}
      style={styles.section}
      className={`video ${classes}`.trim()}
    >
      {ytembedlink !== '' ? (
        <div style={styles.iframeWrapper}>
          <iframe
            className="ytvideo"
            title={row.fields.videoTitle || "YouTube Video"}
            src={ytembedlink + (theme.includes('autoplay') ? '?autoplay=1&mute=1&loop=1' : '')}
            style={styles.iframe}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : local ? (
        classes.includes('autoplay') ? (
          <video
            ref={videoRef}
            src={local}
            style={{
              ...styles.video,
              maxHeight: videoHeight,
              opacity: loopopacity ? (parseInt(loopopacity) / 100) : 1,
            }}
            muted
            loop
            autoPlay
            playsInline
          />
        ) : (
          <video
            src={local}
            style={{
              ...styles.video,
              maxHeight: videoHeight,
            }}
            controls
          />
        )
      ) : null}

      <style>{`
        @keyframes semifadein {
          from {
            opacity: 0.5;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes semifadeout {
          from {
            opacity: 1;
          }
          to {
            opacity: 0.5;
          }
        }

        section.video {
          display: flex;
          position: relative;
          justify-content: center;
          width: 100%;
          overflow: hidden;
        }

        section.video video,
        section.video .ytvideo {
          position: relative;
          width: 100%;
          height: 55vh;
          background: transparent;
        }

        section.video video {
          animation-name: semifadein;
          animation-duration: 0.75s;
        }

        section.video video.offscreen {
          animation-name: semifadeout;
          animation-duration: 0.75s;
          animation-fill-mode: forwards;
        }

        section.video.span video,
        section.video.span .ytvideo {
          left: 0;
          right: 0;
          object-fit: cover;
          max-width: none;
        }

        section.video.embedded {
          height: 100%;
        }

        section.video.embedded video {
          animation: none;
          height: 100%;
          max-height: 100% !important;
        }

        section.video.embedded video.offscreen {
          animation: none;
        }

        section.video.immersive_screen {
        }

        section.video.immersive_screen video,
        section.video.immersive_screen .ytvideo {
          overflow: hidden;
          padding: 8% 6%;
          box-sizing: border-box;
          background: black;
        }

        section.video.immersive_screen:before {
          content: "";
          display: flex;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          z-index: 99;
          pointer-events: none;
          background: url("/img/video/immersive_screen.svg") repeat center !important;
        }

        body.theme-goldshow .video.immersive_screen:before {
          background: url("/img/video/immersive_screen_dark.svg") repeat center !important;
        }
      `}</style>
    </section>
  );
};

export default Video;