import React, { useState } from 'react';

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '15px',
  },
  card: {
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    padding: '10px',
    transition: 'all 0.2s',
    background: '#fff',
  },
  cardHover: {
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)',
  },
  cardSelectable: {
    cursor: 'pointer',
  },
  image: {
    width: '100%',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '8px',
  },
  filename: {
    margin: '0',
    wordBreak: 'break-all',
    fontSize: '11px',
    color: '#4a5568',
    lineHeight: '1.4',
    height: '30px', // Approx 2 lines
    overflow: 'hidden',
  },
  buttonGroup: {
    display: 'flex',
    gap: '5px',
    marginTop: '8px',
  },
  button: {
    padding: '5px 8px',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '10px',
    flex: 1,
    textTransform: 'uppercase',
    fontWeight: 600,
  },
  replaceButton: {
    background: '#3b82f6',
  },
  deleteButton: {
    background: '#ef4444',
  },
};

const AssetGrid = ({ assets, mode = 'manage', onDelete, onAssetClick }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const getCardStyle = (asset) => {
    let style = { ...styles.card };
    if (hoveredCard === asset.name) {
      style = { ...style, ...styles.cardHover };
    }
    if (mode === 'select') {
      style = { ...style, ...styles.cardSelectable };
    }
    return style;
  };

  // Copy asset path to clipboard
  const copyPath = async (assetPath) => {
    try {
      await navigator.clipboard.writeText(assetPath);
    } catch (err) {
      // fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = assetPath;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch (e) {}
      document.body.removeChild(textarea);
    }
  };

  return (
    <div style={styles.grid}>
      {assets.map(asset => (
        <div 
          key={asset.name}
          style={getCardStyle(asset)}
          onMouseEnter={() => setHoveredCard(asset.name)}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => mode === 'select' && onAssetClick && onAssetClick(asset)}
          role={mode === 'select' ? 'button' : 'listitem'}
          tabIndex={mode === 'select' ? 0 : -1}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && mode === 'select' && onAssetClick) {
              onAssetClick(asset);
            }
          }}
        >
          <img src={asset.url} alt={asset.name} style={styles.image} />
          <p style={styles.filename}>{asset.name}</p>
          {mode === 'manage' && (
            <div style={styles.buttonGroup}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyPath(asset.url);
                }}
                style={{ ...styles.button, ...styles.replaceButton }}
              >
                Copy Path
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(asset.name); }} style={{...styles.button, ...styles.deleteButton}}>
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AssetGrid;
