import React from 'react';

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
    maxWidth: '800px',
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
  iconGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
    gap: '10px',
  },
  iconButton: {
    padding: '10px',
    border: '1px solid #cbd5e1',
    background: 'white',
    cursor: 'pointer',
    fontSize: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};

const IconPickerModal = ({ isOpen, onClose, onSelectIcon }) => {
  if (!isOpen) {
    return null;
  }

  const commonEmojis = ['😀', '😃', '😄', '😁', '😊', '🎉', '🎊', '🎈', '🎁', '🏆', '⭐', '✨', '🔥', '💡', '📌', '📍', '🏠', '🏢', '🏪', '🏬', '📧', '📞', '💬', '✅', '❌', '⚠️', '🔔', '🔍', '📝', '📄'];
  const commonFaIcons = ['fa-star', 'fa-heart', 'fa-check', 'fa-times', 'fa-arrow-left', 'fa-arrow-right', 'fa-plus', 'fa-minus', 'fa-home', 'fa-user', 'fa-cog', 'fa-envelope', 'fa-search', 'fa-bell', 'fa-bookmark', 'fa-camera', 'fa-video', 'fa-image', 'fa-music', 'fa-play', 'fa-pause', 'fa-stop', 'fa-forward', 'fa-backward', 'fa-step-forward', 'fa-step-backward', 'fa-eject', 'fa-bullhorn', 'fa-volume-up', 'fa-volume-down', 'fa-volume-off'];

  const handleIconSelect = (icon) => {
    if (onSelectIcon) {
      onSelectIcon(icon);
    }
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>Select an Icon</h3>
          <button style={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        <div style={styles.content}>
          <h4>Emojis</h4>
          <div style={styles.iconGrid}>
            {commonEmojis.map(emoji => (
              <button key={emoji} style={styles.iconButton} onClick={() => handleIconSelect(emoji)}>
                {emoji}
              </button>
            ))}
          </div>
          <h4 style={{marginTop: '20px'}}>Font Awesome Icons</h4>
          <div style={styles.iconGrid}>
            {commonFaIcons.map(icon => (
              <button key={icon} style={styles.iconButton} onClick={() => handleIconSelect(icon)}>
                <i className={`fa ${icon}`}></i>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconPickerModal;
