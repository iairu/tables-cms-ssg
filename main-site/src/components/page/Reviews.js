import React, { useEffect, useRef, useState } from 'react';

const Reviews = ({ row }) => {
  const isDark = row.fields.darkTheme || row.fields.darkMode;
  const slidesRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef(null);

  const reviews = row.fields.reviews || [];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (reviews.length <= 1) return;

    const startSlideshow = () => {
      intervalRef.current = setInterval(() => {
        if (!isPaused) {
          setCurrentSlide((prev) => (prev + 1) % reviews.length);
        }
      }, 5000); // 5 seconds per slide
    };

    startSlideshow();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [reviews.length, isPaused]);

  const moveSlide = (direction) => {
    if (direction === 'prev') {
      setCurrentSlide((prev) => (prev - 1 + reviews.length) % reviews.length);
    } else {
      setCurrentSlide((prev) => (prev + 1) % reviews.length);
    }
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 2500);
  };

  const handleMouseOver = () => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseOut = () => {
    setIsPaused(false);
  };

  const generateFaStars = (count) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push(<i key={`filled-${i}`} className="fa fa-star"></i>);
    }
    for (let i = count; i < 5; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }
    return stars;
  };

  const styles = {
    section: {
      height: '250px',
      width: '100%',
      display: 'flex',
      position: 'relative',
      boxSizing: 'border-box',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: isDark ? 'black' : 'white',
      color: isDark ? 'white' : 'black',
    },
    slides: {
      position: 'relative',
      width: '100%',
      maxWidth: '900px',
      minWidth: '200px',
    },
    slide: {
      position: 'relative',
      border: isDark ? '1px solid rgb(66, 66, 66)' : '1px solid lightgray',
      padding: '25px 40px',
      minWidth: '200px',
      maxWidth: '900px',
      background: isDark ? 'black' : 'white',
      animation: 'slidein 1s',
    },
    slideHidden: {
      display: 'none',
    },
    text: {
      fontSize: '1.125rem',
      lineHeight: '1.75',
      marginBottom: '1rem',
      fontStyle: 'italic',
    },
    bottom: {
      display: 'flex',
      minHeight: '30px',
      justifyContent: 'flex-end',
    },
    author: {
      textAlign: 'right',
      fontWeight: 'bold',
      fontStyle: 'italic',
      fontSize: '0.875rem',
    },
    stars: {
      position: 'absolute',
      fontSize: '36px',
      left: '-40px',
      bottom: '10px',
      background: isDark ? 'black' : 'white',
      color: 'goldenrod',
    },
    button: {
      position: 'absolute',
      background: isDark ? '#262626' : 'white',
      border: isDark ? '1px solid rgb(66, 66, 66)' : '1px solid lightgray',
      color: '#0083FF',
      margin: '20px',
      width: '50px',
      height: '50px',
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      cursor: 'pointer',
      outline: 'none',
      fontSize: '20px',
    },
    buttonPrev: {
      left: 'calc(50vw - 600px)',
    },
    buttonNext: {
      right: 'calc(50vw - 600px)',
    },
    paused: {
      position: 'absolute',
      bottom: '8px',
      left: 0,
      right: 0,
      opacity: 0.5,
      display: 'flex',
      justifyContent: 'center',
    },
  };

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section 
      style={styles.section}
      className={`bubbles ${isDark ? 'dark' : ''}`}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <div style={styles.slides} ref={slidesRef} className="slides">
        {reviews.map((review, index) => (
          <div
            key={index}
            style={{
              ...styles.slide,
              ...(index !== currentSlide ? styles.slideHidden : {}),
            }}
            className={index === currentSlide ? 'slide' : 'slide hidden'}
          >
            {review.text && (
              <p style={styles.text} dangerouslySetInnerHTML={{ __html: review.text }} />
            )}
            {review.author && (
              <div style={styles.author}>~ {review.author}</div>
            )}
            {review.stars && (
              <div style={styles.stars}>
                {generateFaStars(review.stars)}
              </div>
            )}
          </div>
        ))}
      </div>

      {isPaused && (
        <div style={styles.paused} aria-label="Slideshow is currently paused">
          <i className="fa fa-pause"></i>
        </div>
      )}

      {reviews.length > 1 && (
        <>
          <button
            style={{ ...styles.button, ...styles.buttonPrev }}
            className="navigate prev"
            onClick={() => moveSlide('prev')}
            aria-label="Previous slide"
          >
            <i className="fa fa-angle-double-left"></i>
          </button>
          <button
            style={{ ...styles.button, ...styles.buttonNext }}
            className="navigate next"
            onClick={() => moveSlide('next')}
            aria-label="Next slide"
          >
            <i className="fa fa-angle-double-right"></i>
          </button>
        </>
      )}

      <style>{`
        @keyframes slidein {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0%);
            opacity: 1;
          }
        }

        @keyframes slideout {
          from {
            transform: translateX(0%);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        section.bubbles .hidden {
          display: none;
        }

        section.bubbles .animate-in {
          animation-name: slidein;
          animation-duration: 1s;
        }

        section.bubbles .animate-out {
          animation-name: slideout;
          animation-duration: 1s;
        }

        section.bubbles button.navigate:hover,
        section.bubbles button.navigate:focus {
          background: ${isDark ? '#333' : '#f4f4f4'};
        }

        section.bubbles button.navigate:focus {
          box-shadow: 0 0 0 2px inset rgba(0, 131, 255, 0.3);
        }

        @media (max-width: 1200px) {
          section.bubbles button.navigate.prev {
            left: 0px;
          }
          section.bubbles button.navigate.next {
            left: auto;
            right: 0px;
          }
        }

        @media (max-width: 600px) {
          section.bubbles button.navigate {
            width: 40px;
            height: 40px;
            margin: 5px;
          }
        }
      `}</style>
    </section>
  );
};

export default Reviews;