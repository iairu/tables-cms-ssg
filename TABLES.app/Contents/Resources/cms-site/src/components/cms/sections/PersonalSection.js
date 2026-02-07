import React, { useState } from 'react';
import { fuzzyMatch } from '../utils';
import FuzzySearchDropdown from '../FuzzySearchDropdown';
import AssetManagerModal from '../AssetManagerModal';
import LockedInputWrapper from '../LockedInputWrapper';

const PersonalSection = ({ cmsData }) => {
  const { userRows, saveUserRows, uploadFile } = cmsData;
  const [editingUserIndex, setEditingUserIndex] = React.useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [assetModalOpen, setAssetModalOpen] = React.useState(false);
  const [assetModalTarget, setAssetModalTarget] = React.useState(null);

  const defaultUser = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    hobbies: '',
    interests: '',
    favoriteMusic: '',
    favoriteMovies: '',
    favoriteBooks: '',
    languagesSpoken: '',
    occupation: '',
    relationshipStatus: '',
    pets: '',
    dietaryPreferences: '',
    travelHistory: '',
    emergencyContact: '',
    notes: ''
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    border: '1px solid #cbd5e1'
  };

  const textareaStyle = {
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    border: '1px solid #cbd5e1'
  };

  // --- Asset upload/select logic ---
  const handleImageUpload = (field) => {
    if (!uploadFile) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileData = event.target.result;
        const newUrl = await uploadFile({ fileData, fileName: file.name });
        if (newUrl) {
          handleUpdateUser(editingUserIndex, field, newUrl);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSelectImage = (field) => {
    setAssetModalTarget({ field });
    setAssetModalOpen(true);
  };

  const handleAssetSelected = (asset) => {
    if (assetModalTarget) {
      handleUpdateUser(editingUserIndex, assetModalTarget.field, asset.url);
    }
    setAssetModalOpen(false);
    setAssetModalTarget(null);
  };

  const handleClearImage = (field) => {
    handleUpdateUser(editingUserIndex, field, '');
  };

  // Render image upload/select UI for a single field
  const renderImageUpload = (label, value, onUpload, onClear, onSelect) => (
    <div style={{ marginBottom: '10px' }}>
      <label style={{ display: 'block', marginBottom: '5px' }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {value ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={value} alt={label} style={{ width: 60, height: 60, objectFit: 'cover', border: '1px solid #e5e7eb' }} />
            <button type="button" onClick={onClear} style={{ padding: '4px 10px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}>Remove</button>
          </div>
        ) : (
          <span style={{ color: '#64748b', fontSize: '13px' }}>No image selected</span>
        )}
        <button type="button" onClick={onUpload} style={{ padding: '4px 10px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}>Upload</button>
        <button type="button" onClick={onSelect} style={{ padding: '4px 10px', background: '#f1f5f9', color: '#2563eb', border: '1px solid #2563eb50', cursor: 'pointer' }}>Select</button>
      </div>
    </div>
  );

  const handleAddUser = () => {
    saveUserRows([defaultUser, ...userRows]);
  };

  const handleRemoveUser = (index) => {
    const newRows = userRows.filter((_, i) => i !== index);
    saveUserRows(newRows);
  };

  const handleUpdateUser = (index, field, value) => {
    const newRows = [...userRows];
    newRows[index][field] = value;
    saveUserRows(newRows);
  };

  const handleExpandUser = (index) => {
    setEditingUserIndex(index);
  };

  const handleCloseModal = () => {
    setEditingUserIndex(null);
  };

  const handleDeleteClick = (index) => {
    setUserToDelete(index);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete !== null) {
      handleRemoveUser(userToDelete);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const editingUser = editingUserIndex !== null ? userRows[editingUserIndex] : null;

  const filteredUserRows = userRows.filter(user => {
    return (
      fuzzyMatch(user.firstName || '', searchQuery) ||
      fuzzyMatch(user.lastName || '', searchQuery) ||
      fuzzyMatch(user.email || '', searchQuery) ||
      fuzzyMatch(user.phone || '', searchQuery) ||
      fuzzyMatch(user.address || '', searchQuery)
    );
  });

  if (editingUser) {
    return (
      <section className="main-section active" id="users-editor">
        <header style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 100, borderBottom: '1px solid #e5e7eb' }}>
          <h1>
            <span>Editing user {editingUser.firstName + ' ' + editingUser.lastName || ''}</span>
          </h1>
          <div className="adjustment-buttons">
            <a href="#" onClick={(e) => { e.preventDefault(); handleCloseModal(); }}>← Back to Users registry</a>
          </div>
        </header>
        <div style={{ padding: '20px', maxWidth: '800px' }}>
          {/* User Data Fields */}
          <h2>User Data</h2>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>First Name:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-firstName`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingUser.firstName || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'firstName', e.target.value)}
                  style={inputStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Last Name:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-lastName`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingUser.lastName || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'lastName', e.target.value)}
                  style={inputStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Date of Birth:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-dateOfBirth`} cmsData={cmsData}>
                <input
                  type="date"
                  value={editingUser.dateOfBirth || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'dateOfBirth', e.target.value)}
                  style={inputStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Gender:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-gender`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingUser.gender || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'gender', e.target.value)}
                  style={inputStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Email:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-email`} cmsData={cmsData}>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'email', e.target.value)}
                  style={inputStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Phone:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-phone`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'phone', e.target.value)}
                  style={inputStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Address:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-address`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingUser.address || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'address', e.target.value)}
                  style={inputStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Occupation:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-occupation`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingUser.occupation || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'occupation', e.target.value)}
                  style={inputStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Relationship Status:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-relationshipStatus`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingUser.relationshipStatus || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'relationshipStatus', e.target.value)}
                  style={inputStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Pets:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-pets`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingUser.pets || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'pets', e.target.value)}
                  style={inputStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Dietary Preferences:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-dietaryPreferences`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingUser.dietaryPreferences || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'dietaryPreferences', e.target.value)}
                  style={inputStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Travel History:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-travelHistory`} cmsData={cmsData}>
                <textarea
                  value={editingUser.travelHistory || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'travelHistory', e.target.value)}
                  style={textareaStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Emergency Contact:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-emergencyContact`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingUser.emergencyContact || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'emergencyContact', e.target.value)}
                  style={inputStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Notes:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-notes`} cmsData={cmsData}>
                <textarea
                  value={editingUser.notes || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'notes', e.target.value)}
                  style={textareaStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Hobbies:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-hobbies`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingUser.hobbies || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'hobbies', e.target.value)}
                  style={inputStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Interests:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-interests`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingUser.interests || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'interests', e.target.value)}
                  style={inputStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Favorite Music:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-favoriteMusic`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingUser.favoriteMusic || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'favoriteMusic', e.target.value)}
                  style={inputStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Favorite Movies:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-favoriteMovies`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingUser.favoriteMovies || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'favoriteMovies', e.target.value)}
                  style={inputStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Favorite Books:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-favoriteBooks`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingUser.favoriteBooks || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'favoriteBooks', e.target.value)}
                  style={inputStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Languages Spoken:</strong>
              <LockedInputWrapper fieldId={`user-${editingUserIndex}-languagesSpoken`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingUser.languagesSpoken || ''}
                  onChange={(e) => handleUpdateUser(editingUserIndex, 'languagesSpoken', e.target.value)}
                  style={inputStyle}
                />
              </LockedInputWrapper>
            </label>
          </div>
        </div>
        <AssetManagerModal
          isOpen={assetModalOpen}
          onClose={() => setAssetModalOpen(false)}
          assets={null}
          onSelectAsset={handleAssetSelected}
        />
      </section>
    );
  }

  return (
    <section className="main-section active" id="users">
      <header>
        <h1>Personal Records</h1>
        <div className="adjustment-buttons">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              marginRight: '10px',
              width: '200px'
            }}
          />
          <a href="#" onClick={(e) => { e.preventDefault(); handleAddUser(); }} className="highlighted">+ Add User</a>
        </div>
      </header>
      <div className="component-table-container">
        <table className="page-list-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Occupation</th>
              <th>Relationship Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUserRows.map((user) => {
              const actualIndex = userRows.indexOf(user);
              return (
                <tr key={actualIndex}>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.occupation}</td>
                  <td>{user.relationshipStatus}</td>
                  <td>
                    <button onClick={() => handleExpandUser(actualIndex)} style={{ marginRight: '5px' }}>Expand</button>
                    <button onClick={() => handleDeleteClick(actualIndex)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {deleteModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.25rem' }}>Confirm Delete</h2>
            <p style={{ marginBottom: '25px', color: '#64748b' }}>
              Are you sure you want to delete this user entry? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={handleCancelDelete} style={{
                padding: '8px 16px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={handleConfirmDelete} style={{
                padding: '8px 16px',
                border: 'none',
                backgroundColor: '#ef4444',
                color: 'white',
                cursor: 'pointer'
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PersonalSection;
