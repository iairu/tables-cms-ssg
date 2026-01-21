import React from 'react';

const Flies = ({ row }) => {
  return (
    <div style={{
      position: 'relative',
      minHeight: '400px',
      overflow: row.fields.hideOverflow ? 'hidden' : 'visible'
    }}>
      {row.fields.flies && row.fields.flies.map((fly, flyIdx) => (
        <img
          key={flyIdx}
          src={fly.backgroundImage}
          alt={`Fly ${flyIdx + 1}`}
          style={{
            position: 'absolute',
            [fly.stickToRightSide ? 'right' : 'left']: `${fly.marginFromEdge || 0}%`,
            top: `${fly.marginFromTop || 0}%`,
            transform: `rotate(${fly.rotation || 0}deg) scale(${fly.scalingFactor || 1})`,
            opacity: (fly.transparency || 100) / 100,
            mixBlendMode: row.fields.blendMode || 'normal',
            display: fly.showOnMobile ? 'block' : 'none',
            maxWidth: '200px',
            pointerEvents: 'none'
          }}
        />
      ))}
    </div>
  );
};

export default Flies;
