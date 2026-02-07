import React, { useState } from 'react';
import { fuzzyMatch } from '../utils';
import LockedInputWrapper from '../LockedInputWrapper';
// RentalInventorySection
export const RentalInventorySection = ({ cmsData }) => {
  const { inventoryRows, saveInventoryRows } = cmsData;
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultInventoryItem = {
    itemName: '',
    sku: '',
    quantity: '',
    location: '',
    supplier: '',
    status: 'In Stock',
    lastRestocked: '',
    notes: '',
    public: false
  };

  const handleAddItem = () => {
    saveInventoryRows([defaultInventoryItem, ...inventoryRows]);
  };

  const handleRemoveItem = (index) => {
    const newRows = inventoryRows.filter((_, i) => i !== index);
    saveInventoryRows(newRows);
  };

  const handleUpdateItem = (index, field, value) => {
    const newRows = [...inventoryRows];
    newRows[index][field] = value;
    saveInventoryRows(newRows);
  };

  const handleExpandItem = (index) => {
    setEditingItemIndex(index);
  };

  const handleCloseModal = () => {
    setEditingItemIndex(null);
  };

  const handleDeleteClick = (index) => {
    setItemToDelete(index);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete !== null) {
      handleRemoveItem(itemToDelete);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const editingItem = editingItemIndex !== null ? inventoryRows[editingItemIndex] : null;

  const filteredInventoryRows = inventoryRows.filter(item => {
    return (
      fuzzyMatch(item.itemName || '', searchQuery) ||
      fuzzyMatch(item.sku || '', searchQuery) ||
      fuzzyMatch(item.location || '', searchQuery) ||
      fuzzyMatch(item.supplier || '', searchQuery)
    );
  });

  if (editingItem) {
    return (
      <section className="main-section active" id="inventory-editor">
        <header style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 100, borderBottom: '1px solid #e5e7eb' }}>
          <h1>
            <span>Editing item {editingItem.itemName || '(Unnamed)'}</span>
          </h1>
          <div className="adjustment-buttons">
            <a href="#" onClick={(e) => { e.preventDefault(); handleCloseModal(); }}>← Back to Inventory</a>
          </div>
        </header>
        <div style={{ padding: '20px', maxWidth: '800px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Item Name: <span style={{ color: '#ef4444' }}>*</span></strong>
              <LockedInputWrapper fieldId={`inventory-${editingItemIndex}-itemName`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingItem.itemName || ''}
                  onChange={(e) => handleUpdateItem(editingItemIndex, 'itemName', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',

                    border: '1px solid #cbd5e1'
                  }}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>SKU:</strong>
              <LockedInputWrapper fieldId={`inventory-${editingItemIndex}-sku`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingItem.sku || ''}
                  onChange={(e) => handleUpdateItem(editingItemIndex, 'sku', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',

                    border: '1px solid #cbd5e1'
                  }}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Quantity:</strong>
              <LockedInputWrapper fieldId={`inventory-${editingItemIndex}-quantity`} cmsData={cmsData}>
                <input
                  type="number"
                  value={editingItem.quantity || ''}
                  onChange={(e) => handleUpdateItem(editingItemIndex, 'quantity', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',

                    border: '1px solid #cbd5e1'
                  }}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Location:</strong>
              <LockedInputWrapper fieldId={`inventory-${editingItemIndex}-location`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingItem.location || ''}
                  onChange={(e) => handleUpdateItem(editingItemIndex, 'location', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',

                    border: '1px solid #cbd5e1'
                  }}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Supplier:</strong>
              <LockedInputWrapper fieldId={`inventory-${editingItemIndex}-supplier`} cmsData={cmsData}>
                <input
                  type="text"
                  value={editingItem.supplier || ''}
                  onChange={(e) => handleUpdateItem(editingItemIndex, 'supplier', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',

                    border: '1px solid #cbd5e1'
                  }}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Status:</strong>
              <LockedInputWrapper fieldId={`inventory-${editingItemIndex}-status`} cmsData={cmsData}>
                <select
                  value={editingItem.status || ''}
                  onChange={(e) => handleUpdateItem(editingItemIndex, 'status', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',

                    border: '1px solid #cbd5e1'
                  }}
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="On Order">On Order</option>
                </select>
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Last Restocked:</strong>
              <LockedInputWrapper fieldId={`inventory-${editingItemIndex}-lastRestocked`} cmsData={cmsData}>
                <input
                  type="date"
                  value={editingItem.lastRestocked || ''}
                  onChange={(e) => handleUpdateItem(editingItemIndex, 'lastRestocked', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',

                    border: '1px solid #cbd5e1'
                  }}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Notes:</strong>
              <LockedInputWrapper fieldId={`inventory-${editingItemIndex}-notes`} cmsData={cmsData}>
                <textarea
                  value={editingItem.notes || ''}
                  onChange={(e) => handleUpdateItem(editingItemIndex, 'notes', e.target.value)}
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '5px',

                    border: '1px solid #cbd5e1'
                  }}
                />
              </LockedInputWrapper>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <LockedInputWrapper fieldId={`inventory-${editingItemIndex}-public`} cmsData={cmsData}>
                <input
                  type="checkbox"
                  checked={editingItem.public || false}
                  onChange={(e) => handleUpdateItem(editingItemIndex, 'public', e.target.checked)}
                  style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                />
              </LockedInputWrapper>
              <strong>Public (visible in catalog)</strong>
            </label>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="main-section active" id="rental-inventory">
      <header>
        <h1>Inventory</h1>
        <div className="adjustment-buttons">
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',

              border: '1px solid #cbd5e1',
              marginRight: '10px',
              width: '200px'
            }}
          />
          <a href="#" onClick={(e) => { e.preventDefault(); handleAddItem(); }} className="highlighted">+ Add Item</a>
        </div>
      </header>
      <div className="component-table-container">
        <table className="page-list-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Location</th>
              <th>Status</th>
              <th>Public</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventoryRows.map((item, index) => {
              const actualIndex = inventoryRows.indexOf(item);
              return (
                <tr key={actualIndex}>
                  <td>
                    <LockedInputWrapper fieldId={`inventory-${actualIndex}-itemName`} cmsData={cmsData}>
                      <input
                        type="text"
                        value={item.itemName || ''}
                        onChange={(e) => handleUpdateItem(actualIndex, 'itemName', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #cbd5e1',

                        }}
                      />
                    </LockedInputWrapper>
                  </td>
                  <td>
                    <LockedInputWrapper fieldId={`inventory-${actualIndex}-sku`} cmsData={cmsData}>
                      <input
                        type="text"
                        value={item.sku || ''}
                        onChange={(e) => handleUpdateItem(actualIndex, 'sku', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #cbd5e1',

                        }}
                      />
                    </LockedInputWrapper>
                  </td>
                  <td>
                    <LockedInputWrapper fieldId={`inventory-${actualIndex}-quantity`} cmsData={cmsData}>
                      <input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) => handleUpdateItem(actualIndex, 'quantity', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #cbd5e1',

                        }}
                      />
                    </LockedInputWrapper>
                  </td>
                  <td>
                    <LockedInputWrapper fieldId={`inventory-${actualIndex}-location`} cmsData={cmsData}>
                      <input
                        type="text"
                        value={item.location || ''}
                        onChange={(e) => handleUpdateItem(actualIndex, 'location', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #cbd5e1',

                        }}
                      />
                    </LockedInputWrapper>
                  </td>
                  <td>
                    <LockedInputWrapper fieldId={`inventory-${actualIndex}-status`} cmsData={cmsData}>
                      <select
                        value={item.status || ''}
                        onChange={(e) => handleUpdateItem(actualIndex, 'status', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #cbd5e1',

                        }}
                      >
                        <option value="In Stock">In Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                        <option value="On Order">On Order</option>
                      </select>
                    </LockedInputWrapper>
                  </td>
                  <td>
                    <LockedInputWrapper fieldId={`inventory-${actualIndex}-public`} cmsData={cmsData}>
                      <input
                        type="checkbox"
                        checked={item.public || false}
                        onChange={(e) => handleUpdateItem(actualIndex, 'public', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                    </LockedInputWrapper>
                  </td>
                  <td>
                    <button onClick={() => handleExpandItem(actualIndex)} style={{ marginRight: '5px' }}>Expand</button>
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
              Are you sure you want to delete this item? This action cannot be undone.
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

export default RentalInventorySection;
