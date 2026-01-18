import React, { useState } from 'react';
import { fuzzyMatch } from '../utils';

const CatsSection = ({ cmsData }) => {
  const { catRows, saveCatRows } = cmsData;
  const [editingCatIndex, setEditingCatIndex] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultCat = {
    titlesBeforeName: '',
    fullName: '',
    titlesAfterName: '',
    emsColor: '',
    breed: '',
    gender: '',
    dateOfBirth: '',
    geneticTests: '',
    breedingStation: '',
    countryCode: '',
    alternativeName: '',
    printNameLine1: '',
    printNameLine2: '',
    dateOfDeath: '',
    originalRegNo: '',
    lastRegNo: '',
    regNo2: '',
    regNo3: '',
    notes: '',
    breeder: '',
    currentOwner: '',
    countryOfOrigin: '',
    countryOfCurrentResidence: '',
    ownershipNotes: '',
    personalInfo: '',
    dateOfLastOwnershipChange: ''
  };

  const handleAddCat = () => {
    saveCatRows([defaultCat, ...catRows]);
  };

  const handleRemoveCat = (index) => {
    const newRows = catRows.filter((_, i) => i !== index);
    saveCatRows(newRows);
  };

  const handleUpdateCat = (index, field, value) => {
    const newRows = [...catRows];
    newRows[index][field] = value;
    saveCatRows(newRows);
  };

  const handleExpandCat = (index) => {
    setEditingCatIndex(index);
  };

  const handleCloseModal = () => {
    setEditingCatIndex(null);
  };

  const handleDeleteClick = (index) => {
    setCatToDelete(index);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (catToDelete !== null) {
      handleRemoveCat(catToDelete);
      setDeleteModalOpen(false);
      setCatToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setCatToDelete(null);
  };

  const editingCat = editingCatIndex !== null ? catRows[editingCatIndex] : null;

  // Filter cats based on fuzzy search query
  const filteredCatRows = catRows.filter(cat => {
    return (
      fuzzyMatch(cat.fullName || '', searchQuery) ||
      fuzzyMatch(cat.titlesBeforeName || '', searchQuery) ||
      fuzzyMatch(cat.titlesAfterName || '', searchQuery) ||
      fuzzyMatch(cat.breed || '', searchQuery) ||
      fuzzyMatch(cat.emsColor || '', searchQuery)
    );
  });

  if (editingCat) {
    return (
      <section className="main-section active" id="cats-editor">
        <header style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 100, borderBottom: '1px solid #e5e7eb' }}>
          <h1>
            <span>Editing cat {editingCat.fullName || '(Unnamed)'}</span>
          </h1>
          <div className="adjustment-buttons">
            <a href="#" onClick={(e) => { e.preventDefault(); handleCloseModal(); }}>← Back to Cats registry</a>
          </div>
        </header>
        <div style={{ padding: '20px', maxWidth: '800px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Titles Before Name:</strong>
              <input
                type="text"
                value={editingCat.titlesBeforeName || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'titlesBeforeName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Full Name: <span style={{ color: '#ef4444' }}>*</span></strong>
              <input
                type="text"
                value={editingCat.fullName || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'fullName', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Titles After Name:</strong>
              <input
                type="text"
                value={editingCat.titlesAfterName || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'titlesAfterName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>EMS Color:</strong>
              <input
                type="text"
                value={editingCat.emsColor || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'emsColor', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Breed:</strong>
              <input
                type="text"
                value={editingCat.breed || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'breed', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Gender: <span style={{ color: '#ef4444' }}>*</span></strong>
              <select
                value={editingCat.gender || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'gender', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Date of Birth:</strong>
              <input
                type="date"
                value={editingCat.dateOfBirth || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'dateOfBirth', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Genetic Tests:</strong>
              <textarea
                value={editingCat.geneticTests || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'geneticTests', e.target.value)}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Breeding Station:</strong>
              <input
                type="text"
                value={editingCat.breedingStation || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'breedingStation', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Country Code:</strong>
              <input
                type="text"
                value={editingCat.countryCode || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'countryCode', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Alternative Name:</strong>
              <input
                type="text"
                value={editingCat.alternativeName || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'alternativeName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Print Name Line 1:</strong>
              <input
                type="text"
                value={editingCat.printNameLine1 || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'printNameLine1', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Print Name Line 2:</strong>
              <input
                type="text"
                value={editingCat.printNameLine2 || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'printNameLine2', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Date of Death:</strong>
              <input
                type="date"
                value={editingCat.dateOfDeath || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'dateOfDeath', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Original Reg No:</strong>
              <input
                type="text"
                value={editingCat.originalRegNo || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'originalRegNo', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Last Reg No:</strong>
              <input
                type="text"
                value={editingCat.lastRegNo || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'lastRegNo', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Reg No 2:</strong>
              <input
                type="text"
                value={editingCat.regNo2 || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'regNo2', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Reg No 3:</strong>
              <input
                type="text"
                value={editingCat.regNo3 || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'regNo3', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Notes:</strong>
              <textarea
                value={editingCat.notes || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'notes', e.target.value)}
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Breeder:</strong>
              <input
                type="text"
                value={editingCat.breeder || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'breeder', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Current Owner:</strong>
              <input
                type="text"
                value={editingCat.currentOwner || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'currentOwner', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Country of Origin:</strong>
              <input
                type="text"
                value={editingCat.countryOfOrigin || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'countryOfOrigin', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Country of Current Residence:</strong>
              <input
                type="text"
                value={editingCat.countryOfCurrentResidence || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'countryOfCurrentResidence', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Ownership Notes:</strong>
              <textarea
                value={editingCat.ownershipNotes || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'ownershipNotes', e.target.value)}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Personal Info:</strong>
              <textarea
                value={editingCat.personalInfo || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'personalInfo', e.target.value)}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Date of Last Ownership Change:</strong>
              <input
                type="date"
                value={editingCat.dateOfLastOwnershipChange || ''}
                onChange={(e) => handleUpdateCat(editingCatIndex, 'dateOfLastOwnershipChange', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="main-section active" id="cats">
      <header>
        <h1>Cats</h1>
        <div className="adjustment-buttons">
          <input
            type="text"
            placeholder="Search cats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              marginRight: '10px',
              width: '200px'
            }}
          />
          <a href="#" onClick={(e) => { e.preventDefault(); handleAddCat(); }} className="highlighted">+ Add Cat</a>
        </div>
      </header>
      <div className="component-table-container">
        <table className="page-list-table">
          <thead>
            <tr>
              <th>Titles Before Name</th>
              <th>Full Name <span style={{ color: '#ef4444' }}>*</span></th>
              <th>Titles After Name</th>
              <th>EMS Color</th>
              <th>Breed</th>
              <th>Gender <span style={{ color: '#ef4444' }}>*</span></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCatRows.map((cat, index) => {
              // Find the actual index in the original catRows array
              const actualIndex = catRows.indexOf(cat);
              return (
              <tr key={actualIndex}>
                <td>
                  <input
                    type="text"
                    value={cat.titlesBeforeName || ''}
                    onChange={(e) => handleUpdateCat(actualIndex, 'titlesBeforeName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={cat.fullName || ''}
                    onChange={(e) => handleUpdateCat(actualIndex, 'fullName', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={cat.titlesAfterName || ''}
                    onChange={(e) => handleUpdateCat(actualIndex, 'titlesAfterName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={cat.emsColor || ''}
                    onChange={(e) => handleUpdateCat(actualIndex, 'emsColor', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={cat.breed || ''}
                    onChange={(e) => handleUpdateCat(actualIndex, 'breed', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                </td>
                <td>
                  <select
                    value={cat.gender || ''}
                    onChange={(e) => handleUpdateCat(actualIndex, 'gender', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => handleExpandCat(actualIndex)} style={{ marginRight: '5px' }}>Expand</button>
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
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.25rem' }}>Confirm Delete</h2>
            <p style={{ marginBottom: '25px', color: '#64748b' }}>
              Are you sure you want to delete this cat entry? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={handleCancelDelete} style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={handleConfirmDelete} style={{
                padding: '8px 16px',
                borderRadius: '4px',
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

export default CatsSection;