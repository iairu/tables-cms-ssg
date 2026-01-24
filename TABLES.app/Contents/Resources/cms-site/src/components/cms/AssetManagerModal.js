import React from 'react';
import AssetGrid from './AssetGrid';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3000,
  },
  modal: {
    background: '#f9f9f9',
    width: '90%',
    maxWidth: '1200px',
    top: '10%',
    height: '70vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
  },
  header: {
    padding: '15px 20px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#888',
    zIndex: 3001,
  },
  content: {
    padding: '20px',
    overflowY: 'auto',
    flex: 1,
  },
  emptyState: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#718096',
  }
};

const AssetManagerModal = ({ isOpen, onClose, onSelectAsset, assets }) => {
  if (!isOpen) {
    return null;
  }

  const handleAssetSelect = (asset) => {
    if (onSelectAsset) {
      onSelectAsset(asset);
    }
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>Select an Asset</h3>
          <button style={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        <div style={styles.content}>
          {assets && assets.length > 0 ? (
            <AssetGrid
              assets={assets}
              mode="select"
              onAssetClick={handleAssetSelect}
            />
          ) : (
            <div style={styles.emptyState}>No assets available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetManagerModal;
