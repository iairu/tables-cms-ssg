import React, { useState, useEffect, useRef } from 'react';

const styles = {
  container: {
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  header: {
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '10px',
    marginBottom: '20px',
    fontSize: '24px',
    fontWeight: 600,
    color: '#1a202c',
  },
  uploadButton: {
    display: 'inline-block',
    padding: '10px 20px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
  },
  card: {
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    padding: '10px',
    transition: 'box-shadow 0.2s',
  },
  cardHover: {
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  image: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  filename: {
    margin: '10px 0',
    wordBreak: 'break-all',
    fontSize: '12px',
    color: '#4a5568',
  },
  buttonGroup: {
    display: 'flex',
    gap: '5px',
  },
  button: {
    padding: '5px 10px',
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
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#718096',
  },
  emptyState: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#718096',
    border: '2px dashed #e2e8f0',
    borderRadius: '4px',
  }
};

const UserAssetManager = ({ assets, onPageLoad, onUpload, onDelete, onReplace }) => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const loadAssets = async () => {
      setLoading(true);
      if (onPageLoad) {
        await onPageLoad();
      }
      setLoading(false);
    };
    loadAssets();
  }, [onPageLoad]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !onUpload) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        const fileData = event.target.result;
        await onUpload({ fileData, fileName: file.name });
    };
    reader.readAsDataURL(file);
    
    // Reset the file input so the same file can be selected again
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (filename) => {
    if (window.confirm(`Are you sure you want to delete ${filename}?`)) {
      if (onDelete) {
        onDelete(filename);
      }
    }
  };

  const handleReplace = (filename) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file || !onReplace) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
          const fileData = event.target.result;
          await onReplace(filename, { fileData, fileName: file.name });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };
  
  const triggerUpload = () => {
    fileInputRef.current.click();
  }

  if (loading) {
    return <div style={styles.loading}>Loading assets...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>User Asset Manager</h2>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleUpload} 
        style={{ display: 'none' }} 
        accept="image/*"
      />
      <button onClick={triggerUpload} style={styles.uploadButton}>
        Upload New Asset
      </button>
      
      {assets.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No assets found. Upload your first asset to get started!</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {assets.map(asset => (
            <div 
              key={asset.name} 
              style={hoveredCard === asset.name ? {...styles.card, ...styles.cardHover} : styles.card}
              onMouseEnter={() => setHoveredCard(asset.name)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <img src={asset.url} alt={asset.name} style={styles.image} />
              <p style={styles.filename}>{asset.name}</p>
              <div style={styles.buttonGroup}>
                <button onClick={() => handleReplace(asset.name)} style={{...styles.button, ...styles.replaceButton}}>
                  Replace
                </button>
                <button onClick={() => handleDelete(asset.name)} style={{...styles.button, ...styles.deleteButton}}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserAssetManager;
