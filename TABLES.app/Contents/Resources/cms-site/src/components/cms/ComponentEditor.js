import React, { useState } from 'react';
import { 
  renderEmojiPicker, 
  renderRichTextEditor, 
  renderImageUpload, 
  renderButtonList, 
  CSS_BLEND_MODES,
  getDefaultFieldsForComponent 
} from './componentHelpers';
import AssetManagerModal from './AssetManagerModal';

const ComponentEditor = ({ rows, onChange, currentLanguage = 'en', cmsData }) => {
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [assetModalTarget, setAssetModalTarget] = useState(null);

  const handleAddComponent = () => {
    const newRows = [...rows, { component: 'TitleSlide', fields: getDefaultFieldsForComponent('TitleSlide') }];
    onChange(newRows);
  };

  const handleRemoveComponent = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    onChange(newRows);
  };

  const handleMoveComponentUp = (index) => {
    if (index === 0) return;
    const newRows = [...rows];
    const [moved] = newRows.splice(index, 1);
    newRows.splice(index - 1, 0, moved);
    onChange(newRows);
  };

  const handleMoveComponentDown = (index) => {
    if (index === rows.length - 1) return;
    const newRows = [...rows];
    const [moved] = newRows.splice(index, 1);
    newRows.splice(index + 1, 0, moved);
    onChange(newRows);
  };

  const handleChangeComponentType = (index, newType) => {
    const newRows = [...rows];
    newRows[index] = { component: newType, fields: getDefaultFieldsForComponent(newType) };
    onChange(newRows);
  };

  const handleFieldChange = (rowIndex, fieldName, value) => {
    const newRows = [...rows];
    newRows[rowIndex].fields[fieldName] = value;
    onChange(newRows);
  };

  const handleArrayItemAdd = (rowIndex, fieldName, defaultItem) => {
    const newRows = [...rows];
    if (!newRows[rowIndex].fields[fieldName]) {
      newRows[rowIndex].fields[fieldName] = [];
    }
    newRows[rowIndex].fields[fieldName].push(defaultItem);
    onChange(newRows);
  };

  const handleArrayItemRemove = (rowIndex, fieldName, itemIndex) => {
    const newRows = [...rows];
    newRows[rowIndex].fields[fieldName].splice(itemIndex, 1);
    onChange(newRows);
  };

  const handleArrayItemChange = (rowIndex, fieldName, itemIndex, itemFieldName, value) => {
    const newRows = [...rows];
    newRows[rowIndex].fields[fieldName][itemIndex][itemFieldName] = value;
    onChange(newRows);
  };

  const handleImageUpload = (rowIndex, fieldName, itemIndex = null, itemFieldName = null) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file || !cmsData?.uploadFile) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
          const fileData = event.target.result;
          const newUrl = await cmsData.uploadFile({ fileData, fileName: file.name });
          
          if (newUrl) {
            if (itemIndex !== null && itemFieldName !== null) {
              handleArrayItemChange(rowIndex, fieldName, itemIndex, itemFieldName, newUrl);
            } else {
              handleFieldChange(rowIndex, fieldName, newUrl);
            }
          }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSelectImage = (rowIndex, fieldName, itemIndex = null, itemFieldName = null) => {
    setAssetModalTarget({ rowIndex, fieldName, itemIndex, itemFieldName });
    setAssetModalOpen(true);
  };

  const handleAssetSelected = (asset) => {
    if (assetModalTarget) {
      const { rowIndex, fieldName, itemIndex, itemFieldName } = assetModalTarget;
      if (itemIndex !== null && itemFieldName !== null) {
        handleArrayItemChange(rowIndex, fieldName, itemIndex, itemFieldName, asset.url);
      } else {
        handleFieldChange(rowIndex, fieldName, asset.url);
      }
    }
    setAssetModalOpen(false);
    setAssetModalTarget(null);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>Page Components</h3>
        <span style={{ 
          padding: '6px 12px', 
          background: '#0002ff', 
          color: 'white', 
          fontSize: '14px',
          fontWeight: '600'
        }}>
          Editing in: {currentLanguage.toUpperCase()}
        </span>
      </div>
      <p style={{ 
        fontSize: '14px', 
        color: '#64748b', 
        marginBottom: '15px',
        padding: '10px',
        background: '#f1f5f9',
        border: '1px solid #e2e8f0'
      }}>
        ℹ️ All component content below is specific to the <strong>{currentLanguage.toUpperCase()}</strong> language. 
        Switch languages using the dropdown above to edit content for other languages.
      </p>
      {rows.map((row, rowIndex) => (
        <div className="single-component-editor" key={rowIndex} style={{
          border: '1px solid #e2e8f0',
          padding: '20px',
          marginBottom: '15px',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <label style={{ fontWeight: '600' }}>
              Component Type:
              <select
                value={row.component}
                onChange={(e) => handleChangeComponentType(rowIndex, e.target.value)}
                style={{ marginLeft: '10px', padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              >
                <option value="TitleSlide">TitleSlide</option>
                <option value="Boxes">Boxes</option>
                <option value="Infobar">Infobar</option>
                <option value="Flies">Flies</option>
                <option value="Slide">Slide</option>
                <option value="Video">Video</option>
                <option value="Ranking">Ranking</option>
                <option value="References">References</option>
                <option value="Reviews">Reviews</option>
              </select>
            </label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button
                onClick={() => handleMoveComponentUp(rowIndex)}
                disabled={rowIndex === 0}
                style={{
                  padding: '5px 15px',
                  background: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: rowIndex === 0 ? 0.5 : 1,
                  borderRadius: '6px'
                }}
              >
                Up
              </button>
              <button
                onClick={() => handleMoveComponentDown(rowIndex)}
                disabled={rowIndex === rows.length - 1}
                style={{
                  padding: '5px 15px',
                  background: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: rowIndex === rows.length - 1 ? 0.5 : 1,
                  borderRadius: '6px'
                }}
              >
                Down
              </button>
              <button
                onClick={() => handleRemoveComponent(rowIndex)}
                style={{
                  padding: '5px 15px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '6px'
                }}
              >
                Remove
              </button>
            </div>
          </div>

          {/* TitleSlide Component */}
          {row.component === 'TitleSlide' && (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Heading ({currentLanguage}):</strong></label>
                <input
                  type="text"
                  value={row.fields.heading || ''}
                  onChange={(e) => handleFieldChange(rowIndex, 'heading', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Alignment ({currentLanguage}):</strong></label>
                <select
                  value={row.fields.alignment || 'center'}
                  onChange={(e) => handleFieldChange(rowIndex, 'alignment', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Heading Size ({currentLanguage}):</strong></label>
                <select
                  value={row.fields.headingSize || 'normal'}
                  onChange={(e) => handleFieldChange(rowIndex, 'headingSize', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="normal">Normal</option>
                  <option value="big">Big</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Text ({currentLanguage}):</strong></label>
                {renderRichTextEditor(`editor-${rowIndex}-text`, row.fields.text, (value) => handleFieldChange(rowIndex, 'text', value))}
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Buttons ({currentLanguage}):</strong></label>
                {renderButtonList(
                  row.fields.buttons,
                  () => handleArrayItemAdd(rowIndex, 'buttons', { icon: '', title: '', link: '', openAsPopup: false, showAsButton: true }),
                  (btnIndex) => handleArrayItemRemove(rowIndex, 'buttons', btnIndex),
                  (btnIndex, field, value) => handleArrayItemChange(rowIndex, 'buttons', btnIndex, field, value),
                  (value, onChange) => renderEmojiPicker(rowIndex, 'buttons', value, onChange)
                )}
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={row.fields.darkTheme || false}
                    onChange={(e) => handleFieldChange(rowIndex, 'darkTheme', e.target.checked)}
                  />
                  <span>Dark theme ({currentLanguage})</span>
                </label>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Background Color ({currentLanguage}):</strong></label>
                <input
                  type="color"
                  value={row.fields.backgroundColor || '#ffffff'}
                  onChange={(e) => handleFieldChange(rowIndex, 'backgroundColor', e.target.value)}
                  style={{ width: '100px', height: '40px', padding: '2px', border: '1px solid #cbd5e1' }}
                />
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Minimal Height (vh) ({currentLanguage}):</strong></label>
                <input
                  type="number"
                  value={row.fields.minimalHeight || 400}
                  onChange={(e) => handleFieldChange(rowIndex, 'minimalHeight', parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              
              {renderImageUpload(
                'Background Image',
                row.fields.backgroundImage,
                () => handleImageUpload(rowIndex, 'backgroundImage'),
                () => handleFieldChange(rowIndex, 'backgroundImage', ''),
                () => handleSelectImage(rowIndex, 'backgroundImage')
              )}
              
              {renderImageUpload(
                'Mobile Background Image',
                row.fields.mobileBackgroundImage,
                () => handleImageUpload(rowIndex, 'mobileBackgroundImage'),
                () => handleFieldChange(rowIndex, 'mobileBackgroundImage', ''),
                () => handleSelectImage(rowIndex, 'mobileBackgroundImage')
              )}
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={row.fields.scaleImageToWholeBackground || false}
                    onChange={(e) => handleFieldChange(rowIndex, 'scaleImageToWholeBackground', e.target.checked)}
                  />
                  <span>Scale image to whole background ({currentLanguage})</span>
                </label>
              </div>
              
              {renderImageUpload(
                'Background Texture',
                row.fields.backgroundTexture,
                () => handleImageUpload(rowIndex, 'backgroundTexture'),
                () => handleFieldChange(rowIndex, 'backgroundTexture', ''),
                () => handleSelectImage(rowIndex, 'backgroundTexture')
              )}
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Video Transparency (0-100) ({currentLanguage}):</strong></label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={row.fields.videoTransparency || 100}
                  onChange={(e) => handleFieldChange(rowIndex, 'videoTransparency', parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Video Link ({currentLanguage}):</strong></label>
                <input
                  type="text"
                  value={row.fields.videoLink || ''}
                  onChange={(e) => handleFieldChange(rowIndex, 'videoLink', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1' }}
                  placeholder="YouTube or video URL"
                />
              </div>
            </div>
          )}

          {/* Boxes Component */}
          {row.component === 'Boxes' && (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Boxes ({currentLanguage}):</strong></label>
                {row.fields.boxes && row.fields.boxes.map((box, boxIndex) => (
                  <div key={boxIndex} style={{ background: 'white', padding: '15px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <strong>Box {boxIndex + 1}</strong>
                      <button
                        type="button"
                        onClick={() => handleArrayItemRemove(rowIndex, 'boxes', boxIndex)}
                        style={{ padding: '3px 10px', background: '#f87171', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Heading ({currentLanguage}):</label>
                      <input
                        type="text"
                        value={box.heading || ''}
                        onChange={(e) => handleArrayItemChange(rowIndex, 'boxes', boxIndex, 'heading', e.target.value)}
                        style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Subheading ({currentLanguage}):</label>
                      <input
                        type="text"
                        value={box.subheading || ''}
                        onChange={(e) => handleArrayItemChange(rowIndex, 'boxes', boxIndex, 'subheading', e.target.value)}
                        style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Text ({currentLanguage}):</label>
                      {renderRichTextEditor(
                        `editor-${rowIndex}-boxes-${boxIndex}-text`, 
                        box.text || '', 
                        (value) => handleArrayItemChange(rowIndex, 'boxes', boxIndex, 'text', value)
                      )}
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Text in lower corner ({currentLanguage}):</label>
                      <input
                        type="text"
                        value={box.lowerCornerText || ''}
                        onChange={(e) => handleArrayItemChange(rowIndex, 'boxes', boxIndex, 'lowerCornerText', e.target.value)}
                        style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Icon ({currentLanguage}):</label>
                      {renderImageUpload(
                        '',
                        box.icon,
                        () => handleImageUpload(rowIndex, 'boxes', boxIndex, 'icon'),
                        () => handleArrayItemChange(rowIndex, 'boxes', boxIndex, 'icon', ''),
                        () => handleSelectImage(rowIndex, 'boxes', boxIndex, 'icon')
                      )}
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Horizontal Adjustment ({currentLanguage}):</label>
                      <input
                        type="number"
                        value={box.horizontalAdjustment || 0}
                        onChange={(e) => handleArrayItemChange(rowIndex, 'boxes', boxIndex, 'horizontalAdjustment', parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px',  border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Vertical Adjustment ({currentLanguage}):</label>
                      <input
                        type="number"
                        value={box.verticalAdjustment || 0}
                        onChange={(e) => handleArrayItemChange(rowIndex, 'boxes', boxIndex, 'verticalAdjustment', parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px',  border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleArrayItemAdd(rowIndex, 'boxes', { heading: '', subheading: '', text: '', lowerCornerText: '', icon: '', horizontalAdjustment: 0, verticalAdjustment: 0 })}
                  style={{ padding: '8px 16px', background: '#0002ff', color: 'white', border: 'none',  cursor: 'pointer' }}
                >
                  + Add Box
                </button>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={row.fields.darkTheme || false}
                    onChange={(e) => handleFieldChange(rowIndex, 'darkTheme', e.target.checked)}
                  />
                  <span>Dark theme ({currentLanguage})</span>
                </label>
              </div>
              
              {renderImageUpload(
                'Background Image',
                row.fields.backgroundImage,
                () => handleImageUpload(rowIndex, 'backgroundImage'),
                () => handleFieldChange(rowIndex, 'backgroundImage', ''),
                () => handleSelectImage(rowIndex, 'backgroundImage')
              )}
            </div>
          )}

          {/* Infobar Component */}
          {row.component === 'Infobar' && (
            <div>
              {renderImageUpload(
                'Logo',
                row.fields.logo,
                () => handleImageUpload(rowIndex, 'logo'),
                () => handleFieldChange(rowIndex, 'logo', ''),
                () => handleSelectImage(rowIndex, 'logo')
              )}
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Alternative Icon (if no logo) ({currentLanguage}):</strong></label>
                <input
                  type="text"
                  value={row.fields.alternativeIcon || ''}
                  onChange={(e) => handleFieldChange(rowIndex, 'alternativeIcon', e.target.value)}
                  style={{ width: '100%', padding: '8px',  border: '1px solid #cbd5e1', marginBottom: '5px' }}
                  placeholder="e.g., 🏠"
                />
                {renderEmojiPicker(rowIndex, 'alternativeIcon', row.fields.alternativeIcon, (value) => handleFieldChange(rowIndex, 'alternativeIcon', value))}
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Text ({currentLanguage}):</strong></label>
                <input
                  type="text"
                  value={row.fields.text || ''}
                  onChange={(e) => handleFieldChange(rowIndex, 'text', e.target.value)}
                  style={{ width: '100%', padding: '8px',  border: '1px solid #cbd5e1' }}
                />
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Buttons ({currentLanguage}):</strong></label>
                {renderButtonList(
                  row.fields.buttons,
                  () => handleArrayItemAdd(rowIndex, 'buttons', { icon: '', title: '', link: '', openAsPopup: false, showAsButton: true }),
                  (btnIndex) => handleArrayItemRemove(rowIndex, 'buttons', btnIndex),
                  (btnIndex, field, value) => handleArrayItemChange(rowIndex, 'buttons', btnIndex, field, value),
                  (value, onChange) => renderEmojiPicker(rowIndex, 'buttons', value, onChange)
                )}
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={row.fields.darkTheme || false}
                    onChange={(e) => handleFieldChange(rowIndex, 'darkTheme', e.target.checked)}
                  />
                  <span>Dark theme</span>
                </label>
              </div>
            </div>
          )}

          {/* Flies Component */}
          {row.component === 'Flies' && (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Flies ({currentLanguage}):</strong></label>
                {row.fields.flies && row.fields.flies.map((fly, flyIndex) => (
                  <div key={flyIndex} style={{ background: 'white', padding: '15px',  marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <strong>Fly {flyIndex + 1}</strong>
                      <button
                        type="button"
                        onClick={() => handleArrayItemRemove(rowIndex, 'flies', flyIndex)}
                        style={{ padding: '3px 10px', background: '#f87171', color: 'white', border: 'none',  cursor: 'pointer', fontSize: '12px' }}
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      {renderImageUpload(
                        'Background Image',
                        fly.backgroundImage,
                        () => handleImageUpload(rowIndex, 'flies', flyIndex, 'backgroundImage'),
                        () => handleArrayItemChange(rowIndex, 'flies', flyIndex, 'backgroundImage', ''),
                        () => handleSelectImage(rowIndex, 'flies', flyIndex, 'backgroundImage')
                      )}
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Margin from edge (%) ({currentLanguage}):</label>
                      <input
                        type="number"
                        value={fly.marginFromEdge || 0}
                        onChange={(e) => handleArrayItemChange(rowIndex, 'flies', flyIndex, 'marginFromEdge', parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px',  border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Margin from top (%) ({currentLanguage}):</label>
                      <input
                        type="number"
                        value={fly.marginFromTop || 0}
                        onChange={(e) => handleArrayItemChange(rowIndex, 'flies', flyIndex, 'marginFromTop', parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px',  border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Rotation (degrees) ({currentLanguage}):</label>
                      <input
                        type="number"
                        value={fly.rotation || 0}
                        onChange={(e) => handleArrayItemChange(rowIndex, 'flies', flyIndex, 'rotation', parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px',  border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Scaling factor ({currentLanguage}):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={fly.scalingFactor || 1}
                        onChange={(e) => handleArrayItemChange(rowIndex, 'flies', flyIndex, 'scalingFactor', parseFloat(e.target.value) || 1)}
                        style={{ width: '100%', padding: '6px',  border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Transparency (0-100) ({currentLanguage}):</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={fly.transparency || 100}
                        onChange={(e) => handleArrayItemChange(rowIndex, 'flies', flyIndex, 'transparency', parseInt(e.target.value) || 100)}
                        style={{ width: '100%', padding: '6px',  border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={fly.showOnMobile || false}
                          onChange={(e) => handleArrayItemChange(rowIndex, 'flies', flyIndex, 'showOnMobile', e.target.checked)}
                        />
                        <span style={{ fontSize: '14px' }}>Show on mobile ({currentLanguage})</span>
                      </label>
                    </div>
                    
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={fly.stickToRightSide || false}
                          onChange={(e) => handleArrayItemChange(rowIndex, 'flies', flyIndex, 'stickToRightSide', e.target.checked)}
                        />
                        <span style={{ fontSize: '14px' }}>Stick to right side ({currentLanguage})</span>
                      </label>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleArrayItemAdd(rowIndex, 'flies', { backgroundImage: '', marginFromEdge: 0, marginFromTop: 0, rotation: 0, scalingFactor: 1, transparency: 100, showOnMobile: false, stickToRightSide: false })}
                  style={{ padding: '8px 16px', background: '#0002ff', color: 'white', border: 'none',  cursor: 'pointer' }}
                >
                  + Add Fly
                </button>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Blend Mode ({currentLanguage}):</strong></label>
                <select
                  value={row.fields.blendMode || 'normal'}
                  onChange={(e) => handleFieldChange(rowIndex, 'blendMode', e.target.value)}
                  style={{ width: '100%', padding: '8px',  border: '1px solid #cbd5e1' }}
                >
                  {CSS_BLEND_MODES.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={row.fields.hideOverflow || false}
                    onChange={(e) => handleFieldChange(rowIndex, 'hideOverflow', e.target.checked)}
                  />
                  <span>Hide overflow ({currentLanguage})</span>
                </label>
              </div>
            </div>
          )}

          {/* Slide Component */}
          {row.component === 'Slide' && (
            <div>
              {/* Left side */}
              <h4 style={{ marginTop: 0, marginBottom: '15px' }}>Left Side</h4>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Left Heading ({currentLanguage}):</strong></label>
                <input type="text" value={row.fields.leftHeading || ''} onChange={(e) => handleFieldChange(rowIndex, 'leftHeading', e.target.value)} style={{ width: '100%', padding: '8px',  border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Left Text ({currentLanguage}):</strong></label>
                <textarea value={row.fields.leftText || ''} onChange={(e) => handleFieldChange(rowIndex, 'leftText', e.target.value)} style={{ width: '100%', padding: '8px',  border: '1px solid #cbd5e1', minHeight: '80px' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Left Buttons ({currentLanguage}):</strong></label>
                {renderButtonList(
                  row.fields.leftButtons,
                  () => handleArrayItemAdd(rowIndex, 'leftButtons', { icon: '', title: '', link: '', openAsPopup: false, showAsButton: true }),
                  (btnIndex) => handleArrayItemRemove(rowIndex, 'leftButtons', btnIndex),
                  (btnIndex, field, value) => handleArrayItemChange(rowIndex, 'leftButtons', btnIndex, field, value),
                  (value, onChange) => renderEmojiPicker(rowIndex, 'leftButtons', value, onChange)
                )}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Left Background Color ({currentLanguage}):</strong></label>
                <input type="color" value={row.fields.leftBackgroundColor || '#ffffff'} onChange={(e) => handleFieldChange(rowIndex, 'leftBackgroundColor', e.target.value)} style={{ width: '100px', height: '40px' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.fields.leftDarkTheme || false} onChange={(e) => handleFieldChange(rowIndex, 'leftDarkTheme', e.target.checked)} />
                  <span>Left Dark Theme ({currentLanguage})</span>
                </label>
              </div>
              {renderImageUpload('Left Background Image', row.fields.leftBackgroundImage, () => handleImageUpload(rowIndex, 'leftBackgroundImage'), () => handleFieldChange(rowIndex, 'leftBackgroundImage', ''), () => handleSelectImage(rowIndex, 'leftBackgroundImage'))}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.fields.fitLeftBackground || false} onChange={(e) => handleFieldChange(rowIndex, 'fitLeftBackground', e.target.checked)} />
                  <span>Fit Left Background ({currentLanguage})</span>
                </label>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Minimal Left Height (vh) ({currentLanguage}):</strong></label>
                <input type="number" value={row.fields.minimalLeftHeight || 70} onChange={(e) => handleFieldChange(rowIndex, 'minimalLeftHeight', parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '8px',  border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.fields.hideLeftOnMobile || false} onChange={(e) => handleFieldChange(rowIndex, 'hideLeftOnMobile', e.target.checked)} />
                  <span>Hide Left on Mobile ({currentLanguage})</span>
                </label>
              </div>

              {/* Right side */}
              <h4 style={{ marginTop: '20px', marginBottom: '15px' }}>Right Side ({currentLanguage})</h4>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Right Heading ({currentLanguage}):</strong></label>
                <input type="text" value={row.fields.rightHeading || ''} onChange={(e) => handleFieldChange(rowIndex, 'rightHeading', e.target.value)} style={{ width: '100%', padding: '8px',  border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Right Text ({currentLanguage}):</strong></label>
                <textarea value={row.fields.rightText || ''} onChange={(e) => handleFieldChange(rowIndex, 'rightText', e.target.value)} style={{ width: '100%', padding: '8px',  border: '1px solid #cbd5e1', minHeight: '80px' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Right Buttons ({currentLanguage}):</strong></label>
                {renderButtonList(
                  row.fields.rightButtons,
                  () => handleArrayItemAdd(rowIndex, 'rightButtons', { icon: '', title: '', link: '', openAsPopup: false, showAsButton: true }),
                  (btnIndex) => handleArrayItemRemove(rowIndex, 'rightButtons', btnIndex),
                  (btnIndex, field, value) => handleArrayItemChange(rowIndex, 'rightButtons', btnIndex, field, value),
                  (value, onChange) => renderEmojiPicker(rowIndex, 'rightButtons', value, onChange)
                )}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Right Background Color ({currentLanguage}):</strong></label>
                <input type="color" value={row.fields.rightBackgroundColor || '#ffffff'} onChange={(e) => handleFieldChange(rowIndex, 'rightBackgroundColor', e.target.value)} style={{ width: '100px', height: '40px' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.fields.rightDarkTheme || false} onChange={(e) => handleFieldChange(rowIndex, 'rightDarkTheme', e.target.checked)} />
                  <span>Right Dark Theme ({currentLanguage})</span>
                </label>
              </div>
              {renderImageUpload('Right Background Image', row.fields.rightBackgroundImage, () => handleImageUpload(rowIndex, 'rightBackgroundImage'), () => handleFieldChange(rowIndex, 'rightBackgroundImage', ''), () => handleSelectImage(rowIndex, 'rightBackgroundImage'))}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.fields.fitRightBackground || false} onChange={(e) => handleFieldChange(rowIndex, 'fitRightBackground', e.target.checked)} />
                  <span>Fit Right Background ({currentLanguage})</span>
                </label>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Minimal Right Height (vh) ({currentLanguage}):</strong></label>
                <input type="number" value={row.fields.minimalRightHeight || 70} onChange={(e) => handleFieldChange(rowIndex, 'minimalRightHeight', parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '8px',  border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.fields.hideRightOnMobile || false} onChange={(e) => handleFieldChange(rowIndex, 'hideRightOnMobile', e.target.checked)} />
                  <span>Hide Right on Mobile ({currentLanguage})</span>
                </label>
              </div>

              {/* Global options */}
              <h4 style={{ marginTop: '20px', marginBottom: '15px' }}>Global Options ({currentLanguage})</h4>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.fields.largerSlide || false} onChange={(e) => handleFieldChange(rowIndex, 'largerSlide', e.target.checked)} />
                  <span>Larger Slide ({currentLanguage})</span>
                </label>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.fields.switchOrderOnMobile || false} onChange={(e) => handleFieldChange(rowIndex, 'switchOrderOnMobile', e.target.checked)} />
                  <span>Switch Order on Mobile ({currentLanguage})</span>
                </label>
              </div>
            </div>
          )}

          {/* Video Component */}
          {row.component === 'Video' && (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>YouTube Video URL ({currentLanguage}):</strong></label>
                <input type="text" value={row.fields.youtubeUrl || ''} onChange={(e) => handleFieldChange(rowIndex, 'youtubeUrl', e.target.value)} style={{ width: '100%', padding: '8px',  border: '1px solid #cbd5e1' }} placeholder="https://www.youtube.com/watch?v=..." />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Special Theme ({currentLanguage}):</strong></label>
                <select value={row.fields.specialTheme || 'default'} onChange={(e) => handleFieldChange(rowIndex, 'specialTheme', e.target.value)} style={{ width: '100%', padding: '8px',  border: '1px solid #cbd5e1' }}>
                  <option value="default">Default</option>
                  <option value="iphone">iPhone</option>
                  <option value="iphone-autoplay">iPhone + Autoplay</option>
                  <option value="autoplay">Autoplay</option>
                  <option value="autoplay-fullwidth">Autoplay + Fullwidth</option>
                </select>
              </div>
            </div>
          )}

          {/* Ranking Component */}
          {row.component === 'Ranking' && (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Ranks ({currentLanguage}):</strong></label>
                {row.fields.ranks && row.fields.ranks.map((rank, rankIndex) => (
                  <div key={rankIndex} style={{ background: 'white', padding: '15px',  marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <strong>Rank {rankIndex + 1}</strong>
                      <button type="button" onClick={() => handleArrayItemRemove(rowIndex, 'ranks', rankIndex)} style={{ padding: '3px 10px', background: '#f87171', color: 'white', border: 'none',  cursor: 'pointer', fontSize: '12px' }}>Remove</button>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Heading ({currentLanguage}):</label>
                      <input type="text" value={rank.heading || ''} onChange={(e) => handleArrayItemChange(rowIndex, 'ranks', rankIndex, 'heading', e.target.value)} style={{ width: '100%', padding: '6px',  border: '1px solid #cbd5e1' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Subheading ({currentLanguage}):</label>
                      <input type="text" value={rank.subheading || ''} onChange={(e) => handleArrayItemChange(rowIndex, 'ranks', rankIndex, 'subheading', e.target.value)} style={{ width: '100%', padding: '6px',  border: '1px solid #cbd5e1' }} />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => handleArrayItemAdd(rowIndex, 'ranks', { heading: '', subheading: '' })} style={{ padding: '8px 16px', background: '#0002ff', color: 'white', border: 'none',  cursor: 'pointer' }}>+ Add Rank</button>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.fields.darkMode || false} onChange={(e) => handleFieldChange(rowIndex, 'darkMode', e.target.checked)} />
                  <span>Dark Mode ({currentLanguage})</span>
                </label>
              </div>
              {renderImageUpload('Background Image', row.fields.backgroundImage, () => handleImageUpload(rowIndex, 'backgroundImage'), () => handleFieldChange(rowIndex, 'backgroundImage', ''), () => handleSelectImage(rowIndex, 'backgroundImage'))}
            </div>
          )}

          {/* References Component */}
          {row.component === 'References' && (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Reference Images ({currentLanguage}):</strong></label>
                {row.fields.images && row.fields.images.map((image, imgIndex) => (
                  <div key={imgIndex} style={{ background: 'white', padding: '15px',  marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <strong>Image {imgIndex + 1}</strong>
                      <button type="button" onClick={() => handleArrayItemRemove(rowIndex, 'images', imgIndex)} style={{ padding: '3px 10px', background: '#f87171', color: 'white', border: 'none',  cursor: 'pointer', fontSize: '12px' }}>Remove</button>
                    </div>
                    {renderImageUpload(
                      '',
                      image.imageUrl,
                      () => handleImageUpload(rowIndex, 'images', imgIndex, 'imageUrl'),
                      () => handleArrayItemChange(rowIndex, 'images', imgIndex, 'imageUrl', ''),
                      () => handleSelectImage(rowIndex, 'images', imgIndex, 'imageUrl')
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => handleArrayItemAdd(rowIndex, 'images', { imageUrl: '' })} style={{ padding: '8px 16px', background: '#0002ff', color: 'white', border: 'none',  cursor: 'pointer' }}>+ Add Image</button>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.fields.darkTheme || false} onChange={(e) => handleFieldChange(rowIndex, 'darkTheme', e.target.checked)} />
                  <span>Dark Theme</span>
                </label>
              </div>
            </div>
          )}

          {/* Reviews Component */}
          {row.component === 'Reviews' && (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}><strong>Reviews ({currentLanguage}):</strong></label>
                {row.fields.reviews && row.fields.reviews.map((review, reviewIndex) => (
                  <div key={reviewIndex} style={{ background: 'white', padding: '15px',  marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <strong>Review {reviewIndex + 1}</strong>
                      <button type="button" onClick={() => handleArrayItemRemove(rowIndex, 'reviews', reviewIndex)} style={{ padding: '3px 10px', background: '#f87171', color: 'white', border: 'none',  cursor: 'pointer', fontSize: '12px' }}>Remove</button>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Review Text ({currentLanguage}):</label>
                      <textarea value={review.text || ''} onChange={(e) => handleArrayItemChange(rowIndex, 'reviews', reviewIndex, 'text', e.target.value)} style={{ width: '100%', padding: '6px',  border: '1px solid #cbd5e1', minHeight: '80px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '14px' }}>Author ({currentLanguage}):</label>
                      <input type="text" value={review.author || ''} onChange={(e) => handleArrayItemChange(rowIndex, 'reviews', reviewIndex, 'author', e.target.value)} style={{ width: '100%', padding: '6px',  border: '1px solid #cbd5e1' }} />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => handleArrayItemAdd(rowIndex, 'reviews', { text: '', author: '' })} style={{ padding: '8px 16px', background: '#0002ff', color: 'white', border: 'none',  cursor: 'pointer' }}>+ Add Review</button>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.fields.darkTheme || false} onChange={(e) => handleFieldChange(rowIndex, 'darkTheme', e.target.checked)} />
                  <span>Dark Theme ({currentLanguage})</span>
                </label>
              </div>
            </div>
          )}
        </div>
      ))}
      <button
        onClick={handleAddComponent}
        style={{
          padding: '10px 20px',
          background: '#10b981',
          color: 'white',
          border: 'none',
          
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        + Add Component
      </button>

      <AssetManagerModal
        isOpen={assetModalOpen}
        onClose={() => setAssetModalOpen(false)}
        assets={cmsData?.uploads || []}
        onSelectAsset={handleAssetSelected}
      />
    </div>
  );
};

export default ComponentEditor;
