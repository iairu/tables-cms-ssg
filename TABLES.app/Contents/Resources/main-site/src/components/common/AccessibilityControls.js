import React from 'react';
import { useAccessibility } from '../../utils/accessibilityContext';

const AccessibilityControls = ({ style = {} }) => {
  const { fontSize, increaseFontSize, decreaseFontSize, resetFontSize } = useAccessibility();

  const buttonStyle = {
    background: 'none',
    border: '1px solid #64748b',
    padding: '4px 8px',
    margin: '0 2px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#64748b',
    transition: 'all 0.2s ease',
    ...style
  };

  const hoverStyle = {
    backgroundColor: '#64748b',
    color: 'white'
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: '12px', color: '#64748b', marginRight: '4px' }}>
        Accessibility:
      </span>
      <button
        onClick={decreaseFontSize}
        disabled={fontSize <= 80}
        style={{
          ...buttonStyle,
          opacity: fontSize <= 80 ? 0.5 : 1,
          cursor: fontSize <= 80 ? 'not-allowed' : 'pointer'
        }}
        onMouseEnter={(e) => {
          if (fontSize > 80) {
            Object.assign(e.target.style, hoverStyle);
          }
        }}
        onMouseLeave={(e) => {
          Object.assign(e.target.style, buttonStyle);
        }}
        title="Decrease font size"
      >
        A-
      </button>
      <button
        onClick={resetFontSize}
        style={buttonStyle}
        onMouseEnter={(e) => {
          Object.assign(e.target.style, hoverStyle);
        }}
        onMouseLeave={(e) => {
          Object.assign(e.target.style, buttonStyle);
        }}
        title="Reset font size"
      >
        A
      </button>
      <button
        onClick={increaseFontSize}
        disabled={fontSize >= 150}
        style={{
          ...buttonStyle,
          opacity: fontSize >= 150 ? 0.5 : 1,
          cursor: fontSize >= 150 ? 'not-allowed' : 'pointer'
        }}
        onMouseEnter={(e) => {
          if (fontSize < 150) {
            Object.assign(e.target.style, hoverStyle);
          }
        }}
        onMouseLeave={(e) => {
          Object.assign(e.target.style, buttonStyle);
        }}
        title="Increase font size"
      >
        A+
      </button>
    </div>
  );
};

export default AccessibilityControls;