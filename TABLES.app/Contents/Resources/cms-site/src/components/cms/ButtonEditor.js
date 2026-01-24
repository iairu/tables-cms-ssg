import React, { useState } from 'react';
import SlugPicker from './SlugPicker';

const ButtonEditor = ({ button, btnIndex, onChange, onRemove, openIconPickerModal, cmsData }) => {
  const [showSlugPicker, setShowSlugPicker] = useState(false);

  const handleSlugSelect = (slug) => {
    onChange(btnIndex, 'link', slug);
    setShowSlugPicker(false);
  }

  return (
    <div style={{ background: 'white', padding: '15px',  marginBottom: '10px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <strong>Button {btnIndex + 1}</strong>
        <button
          type="button"
          onClick={() => onRemove(btnIndex)}
          style={{ padding: '3px 10px', background: '#f87171', color: 'white', border: 'none',  cursor: 'pointer', fontSize: '12px' }}
        >
          Remove
        </button>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Icon (Emoji or Font Awesome):</label>
        <div style={{display: 'flex'}}>
          <input
            type="text"
            value={button.icon || ''}
            onChange={(e) => onChange(btnIndex, 'icon', e.target.value)}
            style={{ width: '100%', padding: '6px',  border: '1px solid #cbd5e1', marginBottom: '5px' }}
            placeholder="e.g., 🚀 or fa-star"
          />
          <button type="button" onClick={() => openIconPickerModal(btnIndex)} style={{padding: '0 10px', marginLeft: '5px'}}><i className="fa fa-icons"></i></button>
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Title:</label>
        <input
          type="text"
          value={button.title || ''}
          onChange={(e) => onChange(btnIndex, 'title', e.target.value)}
          style={{ width: '100%', padding: '6px',  border: '1px solid #cbd5e1' }}
        />
      </div>

      <div style={{ marginBottom: '8px' }}>
        <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Link:</label>
        <div style={{display: 'flex'}}>
          <input
            type="text"
            value={button.link || ''}
            onChange={(e) => onChange(btnIndex, 'link', e.target.value)}
            style={{ width: '100%', padding: '6px',  border: '1px solid #cbd5e1' }}
          />
          <button type="button" onClick={() => setShowSlugPicker(!showSlugPicker)} style={{padding: '0 10px', marginLeft: '5px'}}><i className="fa fa-link"></i></button>
        </div>
        {showSlugPicker && <SlugPicker cmsData={cmsData} onSelectSlug={handleSlugSelect} />}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={button.openAsPopup || false}
            onChange={(e) => onChange(btnIndex, 'openAsPopup', e.target.checked)}
          />
          <span style={{ fontSize: '14px' }}>Open as popup</span>
        </label>
      </div>

      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={button.showAsButton || false}
            onChange={(e) => onChange(btnIndex, 'showAsButton', e.target.checked)}
          />
          <span style={{ fontSize: '14px' }}>Show as button (not link)</span>
        </label>
      </div>
    </div>
  )
}

export default ButtonEditor;
