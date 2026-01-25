import React from 'react';
import SlugPicker from './SlugPicker';
import ButtonEditor from './ButtonEditor';

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

export const renderIconPicker = (value, handleChange) => {
  const commonEmojis = ['😀', '😃', '😄', '😁', '😊', '🎉', '🎊', '🎈', '🎁', '🏆', '⭐', '✨', '🔥', '💡', '📌', '📍', '🏠', '🏢', '🏪', '🏬', '📧', '📞', '💬', '✅', '❌', '⚠️', '🔔', '🔍', '📝', '📄'];
  const commonFaIcons = ['fa-star', 'fa-heart', 'fa-check', 'fa-times', 'fa-arrow-left', 'fa-arrow-right', 'fa-plus', 'fa-minus', 'fa-home', 'fa-user', 'fa-cog', 'fa-envelope'];

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
      {commonFaIcons.map(icon => (
        <button
          key={icon}
          type="button"
          onClick={() => handleChange(icon)}
          style={{
            padding: '5px 10px',
            border: '1px solid #cbd5e1',
            background: value === icon ? '#0002ff' : 'white',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          <i className={`fa ${icon}`}></i>
        </button>
      ))}
    </div>
  );
};

// Modified renderImageUpload to wait for upload to complete before showing the image
export function RenderImageUpload({ label, value, onUpload, onRemove, onSelect }) {
  const [uploading, setUploading] = React.useState(false);

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
      <label style={{ display: 'block', marginBottom: '5px' }}><strong>{label}</strong></label>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '5px' }}>
        <button
          type="button"
          onClick={handleUpload}
          style={{ padding: '8px 16px', background: 'white', color: '#2563eb', border: '1px solid #2563eb50', cursor: 'pointer' }}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : <><i className="fa fa-upload"></i> Upload Image</>}
        </button>
        <button
          type="button"
          onClick={onSelect}
          style={{ padding: '8px 16px', background: 'white', color: '#4b5563', border: '1px solid #4b556350', cursor: 'pointer' }}
          disabled={uploading}
        >
          <i className="fa fa-folder-open"></i> Select Asset
        </button>
      </div>
      {value && !uploading && (
        <div style={{ marginTop: '5px' }}>
          <img src={value} alt="Upload Done (Verify in Assets)" style={{ maxWidth: '200px', maxHeight: '150px', display: 'block' }} />
          <button
            type="button"
            onClick={onRemove}
            style={{ marginTop: '5px', padding: '5px 10px', background: 'white', color: '#ef4444', border: '1px solid #ef444450', cursor: 'pointer', fontSize: '12px' }}
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

export const renderButtonList = (buttons, onAdd, onRemove, onChange, openIconPickerModal, cmsData) => {
  return (
    <div style={{ marginTop: '10px' }}>
      {buttons && buttons.map((button, btnIndex) => (
        <ButtonEditor 
          key={btnIndex}
          button={button}
          btnIndex={btnIndex}
          onChange={onChange}
          onRemove={() => onRemove(btnIndex)}
          openIconPickerModal={openIconPickerModal}
          cmsData={cmsData}
        />
      ))}
      <button
        type="button"
        onClick={onAdd}
        style={{ padding: '8px 16px', background: 'white', color: '#2563eb', border: '1px solid #2563eb50',  cursor: 'pointer' }}
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