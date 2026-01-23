import React, { useEffect, useRef, useState } from 'react';

const Flies = ({ row }) => {
  const sectionRef = useRef(null);
  const overlayRef = useRef(null);
  const [overlayHeight, setOverlayHeight] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const findDiffElmBelow = (elm) => {
      if (elm && elm.parentElement) {
        const siblings = Array.prototype.slice.call(elm.parentElement.children);
        const elmIdx = siblings.findIndex(sibling => sibling === elm);
        let elmIdxBelow = elmIdx;
        while (elmIdxBelow < siblings.length && siblings[elmIdxBelow].className === elm.className) {
          elmIdxBelow++;
        }
        return (elmIdxBelow !== elmIdx) ? siblings[elmIdxBelow] : undefined;
      }
      return undefined;
    };

    const recalcOverlayHeight = () => {
      if (sectionRef.current) {
        const below = findDiffElmBelow(sectionRef.current);
        if (below) {
          setOverlayHeight(below.clientHeight);
        }
      }
    };

    recalcOverlayHeight();
    window.addEventListener('resize', recalcOverlayHeight);

    return () => {
      window.removeEventListener('resize', recalcOverlayHeight);
    };
  }, []);

  const handleFlyStyle = (fly) => {
    let style = {};
    
    if (fly.marginFromTop) {
      style.top = `${fly.marginFromTop}%`;
    }
    
    if (fly.marginFromEdge !== undefined || fly.stickToRightSide) {
      if (fly.stickToRightSide) {
        style.right = `${fly.marginFromEdge || 0}%`;
      } else {
        style.left = `${fly.marginFromEdge || 0}%`;
      }
    }
    
    if (fly.rotation || fly.scalingFactor) {
      const transforms = [];
      if (fly.rotation) transforms.push(`rotate(${fly.rotation}deg)`);
      if (fly.scalingFactor && fly.scalingFactor > 0) transforms.push(`scale(${fly.scalingFactor})`);
      style.transform = transforms.join(' ');
    }
    
    if (fly.transparency) {
      style.opacity = fly.transparency / 100;
    }
    
    return style;
  };

  if (!row.fields.flies || row.fields.flies.length === 0) {
    return null;
  }

  const styles = {
    section: {
      display: 'flex',
      width: '100%',
      position: 'relative',
      height: '0px',
      maxHeight: '0px',
      overflow: 'visible',
      pointerEvents: 'none',
    },
    overlay: {
      position: 'absolute',
      width: '100%',
      zIndex: 150,
      boxSizing: 'border-box',
      overflow: row.fields.hideOverflow ? 'hidden' : 'visible',
      pointerEvents: 'none',
      height: overlayHeight ? `${overlayHeight}px` : 'auto',
      mixBlendMode: row.fields.blendMode && row.fields.blendMode !== 'normal' ? row.fields.blendMode : 'normal',
    },
    img: {
      width: '100%',
      maxWidth: '10vw',
      position: 'absolute',
      pointerEvents: 'none',
    },
  };

  return (
    <section ref={sectionRef} style={styles.section} className="flies">
      <div ref={overlayRef} style={styles.overlay}>
        {row.fields.flies.map((fly, flyIdx) => {
          if (!fly.backgroundImage) return null;
          
          const flyStyle = {
            ...styles.img,
            ...handleFlyStyle(fly),
          };

          return (
            <img
              key={flyIdx}
              className={fly.showOnMobile ? '' : 'hide_m'}
              src={fly.backgroundImage}
              alt={fly.altText || `Fly ${flyIdx + 1}`}
              style={flyStyle}
            />
          );
        })}
      </div>
      
      <style>{`
        @media (max-width: 1200px) {
          section.flies img.hide_m {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};

export default Flies;