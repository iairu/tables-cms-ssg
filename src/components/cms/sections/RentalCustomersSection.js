import React, { useState } from 'react';
import { fuzzyMatch } from '../utils';
export const RentalCustomersSection = ({ cmsData }) => {
  const { customerRows, saveCustomerRows } = cmsData;
  const [editingCustomerIndex, setEditingCustomerIndex] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [CustomerToDelete, setCustomerToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultCustomer = {
    fullName: '',
    email: '',
    phone: '',
    contactType: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    dateAdded: '',
    preferredContact: '',
    status: '',
    notes: '',
    reservationHistory: '',
    totalReservations: '',
    lastReservationDate: '',
    creditScore: '',
    paymentMethod: '',
    emergencyContact: '',
    emergencyPhone: '',
    identificationNumber: '',
    dateOfBirth: '',
    preferences: ''
  };

  const handleAddCustomer = () => {
    const newCustomer = {
      ...defaultCustomer,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    saveCustomerRows([newCustomer, ...customerRows]);
  };

  const handleRemoveCustomer = (index) => {
    const newRows = customerRows.filter((_, i) => i !== index);
    saveCustomerRows(newRows);
  };

  const handleUpdateCustomer = (index, field, value) => {
    const newRows = [...customerRows];
    newRows[index][field] = value;
    saveCustomerRows(newRows);
  };

  const handleExpandCustomer = (index) => {
    setEditingCustomerIndex(index);
  };

  const handleCloseModal = () => {
    setEditingCustomerIndex(null);
  };

  const handleDeleteClick = (index) => {
    setCustomerToDelete(index);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (CustomerToDelete !== null) {
      handleRemoveCustomer(CustomerToDelete);
      setDeleteModalOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setCustomerToDelete(null);
  };

  const editingCustomer = editingCustomerIndex !== null ? customerRows[editingCustomerIndex] : null;

  // Filter Customers based on fuzzy search query
  const filteredCustomerRows = customerRows.filter(Customer => {
    return (
      fuzzyMatch(Customer.fullName || '', searchQuery) ||
      fuzzyMatch(Customer.email || '', searchQuery) ||
      fuzzyMatch(Customer.phone || '', searchQuery) ||
      fuzzyMatch(Customer.contactType || '', searchQuery) ||
      fuzzyMatch(Customer.company || '', searchQuery)
    );
  });

  if (editingCustomer) {
    return (
      <section className="main-section active" id="rental-Customers-editor">
        <header style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 100, borderBottom: '1px solid #e5e7eb' }}>
          <h1>
            <span>Editing Customer {editingCustomer.fullName || '(Unnamed)'}</span>
          </h1>
          <div className="adjustment-buttons">
            <a href="#" onClick={(e) => { e.preventDefault(); handleCloseModal(); }}>← Back to Customers</a>
          </div>
        </header>
        <div style={{ padding: '20px', maxWidth: '800px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Full Name: <span style={{ color: '#ef4444' }}>*</span></strong>
              <input
                type="text"
                value={editingCustomer.fullName || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'fullName', e.target.value)}
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
              <strong>Email: <span style={{ color: '#ef4444' }}>*</span></strong>
              <input
                type="email"
                value={editingCustomer.email || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'email', e.target.value)}
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
              <strong>Phone:</strong>
              <input
                type="tel"
                value={editingCustomer.phone || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'phone', e.target.value)}
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
              <strong>Contact Type: <span style={{ color: '#ef4444' }}>*</span></strong>
              <select
                value={editingCustomer.contactType || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'contactType', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              >
                <option value="">Select type</option>
                <option value="Client">Client</option>
                <option value="Buyer">Buyer</option>
                <option value="Renter">Renter</option>
                <option value="Lead">Lead</option>
                <option value="Partner">Partner</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Company:</strong>
              <input
                type="text"
                value={editingCustomer.company || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'company', e.target.value)}
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
              <strong>Address:</strong>
              <input
                type="text"
                value={editingCustomer.address || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'address', e.target.value)}
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
              <strong>City:</strong>
              <input
                type="text"
                value={editingCustomer.city || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'city', e.target.value)}
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
              <strong>State/Province:</strong>
              <input
                type="text"
                value={editingCustomer.state || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'state', e.target.value)}
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
              <strong>Zip Code:</strong>
              <input
                type="text"
                value={editingCustomer.zipCode || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'zipCode', e.target.value)}
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
              <strong>Country:</strong>
              <input
                type="text"
                value={editingCustomer.country || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'country', e.target.value)}
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
              <strong>Date Added:</strong>
              <input
                type="date"
                value={editingCustomer.dateAdded || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'dateAdded', e.target.value)}
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
              <strong>Preferred Contact Method:</strong>
              <select
                value={editingCustomer.preferredContact || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'preferredContact', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              >
                <option value="">Select method</option>
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
                <option value="SMS">SMS</option>
                <option value="Mail">Mail</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Status:</strong>
              <select
                value={editingCustomer.status || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'status', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              >
                <option value="">Select status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
                <option value="Blacklisted">Blacklisted</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Date of Birth:</strong>
              <input
                type="date"
                value={editingCustomer.dateOfBirth || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'dateOfBirth', e.target.value)}
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
              <strong>Identification Number:</strong>
              <input
                type="text"
                value={editingCustomer.identificationNumber || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'identificationNumber', e.target.value)}
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
              <strong>Total Reservations:</strong>
              <input
                type="number"
                value={editingCustomer.totalReservations || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'totalReservations', e.target.value)}
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
              <strong>Last Reservation Date:</strong>
              <input
                type="date"
                value={editingCustomer.lastReservationDate || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'lastReservationDate', e.target.value)}
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
              <strong>Credit Score:</strong>
              <input
                type="number"
                value={editingCustomer.creditScore || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'creditScore', e.target.value)}
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
              <strong>Payment Method:</strong>
              <input
                type="text"
                value={editingCustomer.paymentMethod || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'paymentMethod', e.target.value)}
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
              <strong>Emergency Contact:</strong>
              <input
                type="text"
                value={editingCustomer.emergencyContact || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'emergencyContact', e.target.value)}
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
              <strong>Emergency Phone:</strong>
              <input
                type="tel"
                value={editingCustomer.emergencyPhone || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'emergencyPhone', e.target.value)}
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
              <strong>Preferences:</strong>
              <textarea
                value={editingCustomer.preferences || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'preferences', e.target.value)}
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
              <strong>Reservation History:</strong>
              <textarea
                value={editingCustomer.reservationHistory || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'reservationHistory', e.target.value)}
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
              <strong>Notes:</strong>
              <textarea
                value={editingCustomer.notes || ''}
                onChange={(e) => handleUpdateCustomer(editingCustomerIndex, 'notes', e.target.value)}
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
        </div>
      </section>
    );
  }

  return (
    <section className="main-section active" id="rental-Customers">
      <header>
        <h1>Customers</h1>
        <div className="adjustment-buttons">
          <input
            type="text"
            placeholder="Search Customers..."
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
          <a href="#" onClick={(e) => { e.preventDefault(); handleAddCustomer(); }} className="highlighted">+ Add Customer</a>
        </div>
      </header>
      <div className="component-table-container">
        <table className="page-list-table">
          <thead>
            <tr>
              <th>Full Name <span style={{ color: '#ef4444' }}>*</span></th>
              <th>Email <span style={{ color: '#ef4444' }}>*</span></th>
              <th>Phone</th>
              <th>Contact Type <span style={{ color: '#ef4444' }}>*</span></th>
              <th>Company</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomerRows.map((Customer, index) => {
              // Find the actual index in the original CustomerRows array
              const actualIndex = customerRows.indexOf(Customer);
              return (
              <tr key={actualIndex}>
                <td>
                  <input
                    type="text"
                    value={Customer.fullName || ''}
                    onChange={(e) => handleUpdateCustomer(actualIndex, 'fullName', e.target.value)}
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
                    type="email"
                    value={Customer.email || ''}
                    onChange={(e) => handleUpdateCustomer(actualIndex, 'email', e.target.value)}
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
                    type="tel"
                    value={Customer.phone || ''}
                    onChange={(e) => handleUpdateCustomer(actualIndex, 'phone', e.target.value)}
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
                    value={Customer.contactType || ''}
                    onChange={(e) => handleUpdateCustomer(actualIndex, 'contactType', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Client">Client</option>
                    <option value="Buyer">Buyer</option>
                    <option value="Renter">Renter</option>
                    <option value="Lead">Lead</option>
                    <option value="Partner">Partner</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={Customer.company || ''}
                    onChange={(e) => handleUpdateCustomer(actualIndex, 'company', e.target.value)}
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
                    value={Customer.status || ''}
                    onChange={(e) => handleUpdateCustomer(actualIndex, 'status', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => handleExpandCustomer(actualIndex)} style={{ marginRight: '5px' }}>Expand</button>
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
              Are you sure you want to delete this Customer? This action cannot be undone.
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

export default RentalCustomersSection;
