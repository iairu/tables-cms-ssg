import React, { useState } from 'react';

export const renderEmojiPicker = (rowIndex, fieldName, value, handleChange, itemIndex = null, itemFieldName = null) => {
  const commonEmojis = ['😀', '😃', '😄', '😁', '😊', '🎉', '🎊', '🎈', '🎁', '🏆', '⭐', '✨', '🔥', '💡', '📌', '📍', '🏠', '🏢', '🏪', '🏬', '📧', '📞', '💬', '✅', '❌', '⚠️', '🔔', '🔍', '📝', '📄'];

  return (
    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
      {commonEmojis.map(emoji => (
        <button
          key={emoji}
          type="button"
          onClick={() => handleChange(emoji)}
          style={{
            padding: '5px 10px',
            border: '1px solid #cbd5e1',

            background: value === emoji ? '#0002ff' : 'white',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export const renderRichTextEditor = (editorId, value, onChange) => {
  const execCommand = (command, val = null) => {
    const editor = document.getElementById(editorId);
    if (editor) {
      editor.focus();
      document.execCommand(command, false, val);
    }
  };

  return (
    <div style={{ border: '1px solid #cbd5e1',  overflow: 'hidden' }}>
      <div style={{ background: '#f8fafc', padding: '8px', borderBottom: '1px solid #cbd5e1', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => execCommand('bold')} style={{ padding: '5px 10px', border: '1px solid #cbd5e1',  background: 'white', cursor: 'pointer', fontWeight: 'bold' }}>B</button>
        <button type="button" onClick={() => execCommand('italic')} style={{ padding: '5px 10px', border: '1px solid #cbd5e1',  background: 'white', cursor: 'pointer', fontStyle: 'italic' }}>I</button>
        <button type="button" onClick={() => execCommand('strikeThrough')} style={{ padding: '5px 10px', border: '1px solid #cbd5e1',  background: 'white', cursor: 'pointer', textDecoration: 'line-through' }}>S</button>
        <button type="button" onClick={() => { const url = window.prompt('Enter URL:'); if (url) execCommand('createLink', url); }} style={{ padding: '5px 10px', border: '1px solid #cbd5e1',  background: 'white', cursor: 'pointer' }}>🔗</button>
        <button type="button" onClick={() => execCommand('formatBlock', 'blockquote')} style={{ padding: '5px 10px', border: '1px solid #cbd5e1',  background: 'white', cursor: 'pointer' }}>❝❞</button>
        <button type="button" onClick={() => execCommand('insertUnorderedList')} style={{ padding: '5px 10px', border: '1px solid #cbd5e1',  background: 'white', cursor: 'pointer' }}>• List</button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} style={{ padding: '5px 10px', border: '1px solid #cbd5e1',  background: 'white', cursor: 'pointer' }}>1. List</button>
      </div>
      <div
        id={editorId}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: unescape(value) || '' }}
        style={{
          padding: '10px',
          minHeight: '100px',
          outline: 'none',
          background: 'white'
        }}
      />
    </div>
  );
};

// Modified renderImageUpload to wait for upload to complete before showing the image
export function RenderImageUpload({ label, value, onUpload, onRemove, onSelect }) {
  const [uploading, setUploading] = useState(false);

  // Wrap onUpload to set uploading state
  const handleUpload = async () => {
    setUploading(true);
    try {
      // onUpload should be async and set value when done
      await onUpload();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: '10px' }}>
      <label style={{ display: 'block', marginBottom: '5px' }}><strong>{label}:</strong></label>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '5px' }}>
        <button
          type="button"
          onClick={handleUpload}
          style={{ padding: '8px 16px', background: '#0002ff', color: 'white', border: 'none', cursor: 'pointer' }}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
        <button
          type="button"
          onClick={onSelect}
          style={{ padding: '8px 16px', background: '#4b5563', color: 'white', border: 'none', cursor: 'pointer' }}
          disabled={uploading}
        >
          Select Asset
        </button>
      </div>
      {value && !uploading && (
        <div style={{ marginTop: '5px' }}>
          <img src={value} alt="Upload Done (Verify in Assets)" style={{ maxWidth: '200px', maxHeight: '150px', display: 'block' }} />
          <button
            type="button"
            onClick={onRemove}
            style={{ marginTop: '5px', padding: '5px 10px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

// For backward compatibility, keep the old export as a wrapper
export const renderImageUpload = (label, value, onUpload, onRemove, onSelect) => (
  <RenderImageUpload
    label={label}
    value={value}
    onUpload={onUpload}
    onRemove={onRemove}
    onSelect={onSelect}
  />
);

export const renderButtonList = (buttons, onAdd, onRemove, onChange, renderEmojiPickerFn) => {
  return (
    <div style={{ marginTop: '10px' }}>
      {buttons && buttons.map((button, btnIndex) => (
        <div key={btnIndex} style={{ background: 'white', padding: '15px',  marginBottom: '10px', border: '1px solid #e2e8f0' }}>
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
            <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Icon (Emoji):</label>
            <input
              type="text"
              value={button.icon || ''}
              onChange={(e) => onChange(btnIndex, 'icon', e.target.value)}
              style={{ width: '100%', padding: '6px',  border: '1px solid #cbd5e1', marginBottom: '5px' }}
              placeholder="e.g., 🚀"
            />
            {renderEmojiPickerFn(button.icon, (emoji) => onChange(btnIndex, 'icon', emoji))}
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
            <input
              type="text"
              value={button.link || ''}
              onChange={(e) => onChange(btnIndex, 'link', e.target.value)}
              style={{ width: '100%', padding: '6px',  border: '1px solid #cbd5e1' }}
            />
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
      ))}
      <button
        type="button"
        onClick={onAdd}
        style={{ padding: '8px 16px', background: '#0002ff', color: 'white', border: 'none',  cursor: 'pointer' }}
      >
        + Add Button
      </button>
    </div>
  );
};

export const CSS_BLEND_MODES = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'];

export const getDefaultFieldsForComponent = (type) => {
  switch (type) {
    case 'TitleSlide':
      return {
        heading: '',
        alignment: 'center',
        headingSize: 'normal',
        text: '',
        buttons: [],
        darkTheme: false,
        backgroundColor: '#ffffff',
        minimalHeight: 70,
        backgroundImage: '',
        mobileBackgroundImage: '',
        scaleImageToWholeBackground: false,
        backgroundTexture: '',
        videoTransparency: 100,
        videoLink: ''
      };
    case 'Boxes':
      return {
        boxes: [],
        darkTheme: false,
        backgroundImage: ''
      };
    case 'Infobar':
      return {
        logo: '',
        alternativeIcon: '',
        text: '',
        buttons: [],
        darkTheme: false
      };
    case 'Flies':
      return {
        flies: [],
        blendMode: 'normal',
        hideOverflow: false
      };
    case 'Slide':
      return {
        leftHeading: '',
        rightHeading: '',
        leftText: '',
        rightText: '',
        leftButtons: [],
        rightButtons: [],
        leftBackgroundColor: '#ffffff',
        rightBackgroundColor: '#ffffff',
        leftDarkTheme: false,
        rightDarkTheme: false,
        leftBackgroundImage: '',
        rightBackgroundImage: '',
        fitLeftBackground: false,
        fitRightBackground: false,
        minimalLeftHeight: 70,
        minimalRightHeight: 70,
        hideLeftOnMobile: false,
        hideRightOnMobile: false,
        largerSlide: false,
        switchOrderOnMobile: false
      };
    case 'Video':
      return {
        youtubeUrl: '',
        specialTheme: 'default'
      };
    case 'Ranking':
      return {
        ranks: [],
        darkMode: false,
        backgroundImage: ''
      };
    case 'References':
      return {
        images: [],
        darkTheme: false
      };
    case 'Reviews':
      return {
        reviews: [],
        darkTheme: false
      };
    case 'Slideshow':
      return {
        slides: [],
        darkTheme: false,
        minHeight: 30,
        maxHeight: 70,
      };
    default:
      return {};
  }
};