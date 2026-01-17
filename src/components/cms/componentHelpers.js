import React from 'react';

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
            borderRadius: '4px',
            background: value === emoji ? '#3b82f6' : 'white',
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
    <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ background: '#f8fafc', padding: '8px', borderBottom: '1px solid #cbd5e1', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => execCommand('bold')} style={{ padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '3px', background: 'white', cursor: 'pointer', fontWeight: 'bold' }}>B</button>
        <button type="button" onClick={() => execCommand('italic')} style={{ padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '3px', background: 'white', cursor: 'pointer', fontStyle: 'italic' }}>I</button>
        <button type="button" onClick={() => execCommand('strikeThrough')} style={{ padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '3px', background: 'white', cursor: 'pointer', textDecoration: 'line-through' }}>S</button>
        <button type="button" onClick={() => { const url = window.prompt('Enter URL:'); if (url) execCommand('createLink', url); }} style={{ padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '3px', background: 'white', cursor: 'pointer' }}>🔗</button>
        <button type="button" onClick={() => execCommand('formatBlock', 'blockquote')} style={{ padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '3px', background: 'white', cursor: 'pointer' }}>❝❞</button>
        <button type="button" onClick={() => execCommand('insertUnorderedList')} style={{ padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '3px', background: 'white', cursor: 'pointer' }}>• List</button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} style={{ padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '3px', background: 'white', cursor: 'pointer' }}>1. List</button>
      </div>
      <div
        id={editorId}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value || '' }}
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

export const renderImageUpload = (label, value, onUpload, onRemove) => {
  return (
    <div style={{ marginBottom: '10px' }}>
      <label style={{ display: 'block', marginBottom: '5px' }}><strong>{label}:</strong></label>
      <button
        type="button"
        onClick={onUpload}
        style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '5px' }}
      >
        Upload Image
      </button>
      {value && (
        <div style={{ marginTop: '5px' }}>
          <img src={value} alt="Preview" style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px', display: 'block' }} />
          <button
            type="button"
            onClick={onRemove}
            style={{ marginTop: '5px', padding: '5px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export const renderButtonList = (buttons, onAdd, onRemove, onChange, renderEmojiPickerFn) => {
  return (
    <div style={{ marginTop: '10px' }}>
      {buttons && buttons.map((button, btnIndex) => (
        <div key={btnIndex} style={{ background: 'white', padding: '15px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <strong>Button {btnIndex + 1}</strong>
            <button
              type="button"
              onClick={() => onRemove(btnIndex)}
              style={{ padding: '3px 10px', background: '#f87171', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
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
              style={{ width: '100%', padding: '6px', borderRadius: '3px', border: '1px solid #cbd5e1', marginBottom: '5px' }}
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
              style={{ width: '100%', padding: '6px', borderRadius: '3px', border: '1px solid #cbd5e1' }}
            />
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Link:</label>
            <input
              type="text"
              value={button.link || ''}
              onChange={(e) => onChange(btnIndex, 'link', e.target.value)}
              style={{ width: '100%', padding: '6px', borderRadius: '3px', border: '1px solid #cbd5e1' }}
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
        style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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
        minimalHeight: 400,
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
        minimalLeftHeight: 300,
        minimalRightHeight: 300,
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
    default:
      return {};
  }
};