import React, { useState } from 'react';
import { fuzzyMatch } from '../utils';
export const RentalEmployeesSection = ({ cmsData }) => {
  const { employeeRows, saveEmployeeRows } = cmsData;
  const [editingEmployeeIndex, setEditingEmployeeIndex] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultEmployee = {
    fullName: '',
    email: '',
    phone: '',
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

  const handleAddEmployee = () => {
    const newEmployee = {
      ...defaultEmployee,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    saveEmployeeRows([newEmployee, ...employeeRows]);
  };

  const handleRemoveEmployee = (index) => {
    const newRows = employeeRows.filter((_, i) => i !== index);
    saveEmployeeRows(newRows);
  };

  const handleUpdateEmployee = (index, field, value) => {
    const newRows = [...employeeRows];
    newRows[index][field] = value;
    saveEmployeeRows(newRows);
  };

  const handleExpandEmployee = (index) => {
    setEditingEmployeeIndex(index);
  };

  const handleCloseModal = () => {
    setEditingEmployeeIndex(null);
  };

  const handleDeleteClick = (index) => {
    setEmployeeToDelete(index);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (employeeToDelete !== null) {
      handleRemoveEmployee(employeeToDelete);
      setDeleteModalOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  const editingEmployee = editingEmployeeIndex !== null ? employeeRows[editingEmployeeIndex] : null;

  // Filter employees based on fuzzy search query
  const filteredEmployeeRows = employeeRows.filter(employee => {
    return (
      fuzzyMatch(employee.fullName || '', searchQuery) ||
      fuzzyMatch(employee.email || '', searchQuery) ||
      fuzzyMatch(employee.phone || '', searchQuery) ||
      fuzzyMatch(employee.company || '', searchQuery)
    );
  });

  if (editingEmployee) {
    return (
      <section className="main-section active" id="rental-employees-editor">
        <header style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 100, borderBottom: '1px solid #e5e7eb' }}>
          <h1>
            <span>Editing employee {editingEmployee.fullName || '(Unnamed)'}</span>
          </h1>
          <div className="adjustment-buttons">
            <a href="#" onClick={(e) => { e.preventDefault(); handleCloseModal(); }}>← Back to Employees</a>
          </div>
        </header>
        <div style={{ padding: '20px', maxWidth: '800px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Full Name: <span style={{ color: '#ef4444' }}>*</span></strong>
              <input
                type="text"
                value={editingEmployee.fullName || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'fullName', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
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
                value={editingEmployee.email || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'email', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
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
                value={editingEmployee.phone || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'phone', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Company:</strong>
              <input
                type="text"
                value={editingEmployee.company || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'company', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
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
                value={editingEmployee.address || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'address', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
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
                value={editingEmployee.city || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'city', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
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
                value={editingEmployee.state || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'state', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
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
                value={editingEmployee.zipCode || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'zipCode', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
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
                value={editingEmployee.country || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'country', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
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
                value={editingEmployee.dateAdded || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'dateAdded', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Preferred Contact Method:</strong>
              <select
                value={editingEmployee.preferredContact || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'preferredContact', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
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
                value={editingEmployee.status || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'status', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
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
                value={editingEmployee.dateOfBirth || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'dateOfBirth', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
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
                value={editingEmployee.identificationNumber || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'identificationNumber', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
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
                value={editingEmployee.totalReservations || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'totalReservations', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
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
                value={editingEmployee.lastReservationDate || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'lastReservationDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
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
                value={editingEmployee.creditScore || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'creditScore', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
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
                value={editingEmployee.paymentMethod || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'paymentMethod', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
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
                value={editingEmployee.emergencyContact || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'emergencyContact', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
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
                value={editingEmployee.emergencyPhone || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'emergencyPhone', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Preferences:</strong>
              <textarea
                value={editingEmployee.preferences || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'preferences', e.target.value)}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Reservation History:</strong>
              <textarea
                value={editingEmployee.reservationHistory || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'reservationHistory', e.target.value)}
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Notes:</strong>
              <textarea
                value={editingEmployee.notes || ''}
                onChange={(e) => handleUpdateEmployee(editingEmployeeIndex, 'notes', e.target.value)}
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  
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
    <section className="main-section active" id="rental-employees">
      <header>
        <h1>Employees</h1>
        <div className="adjustment-buttons">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              
              border: '1px solid #cbd5e1',
              marginRight: '10px',
              width: '200px'
            }}
          />
          <a href="#" onClick={(e) => { e.preventDefault(); handleAddEmployee(); }} className="highlighted">+ Add Employee</a>
        </div>
      </header>
      <div className="component-table-container">
        <table className="page-list-table">
          <thead>
            <tr>
              <th>Full Name <span style={{ color: '#ef4444' }}>*</span></th>
              <th>Email <span style={{ color: '#ef4444' }}>*</span></th>
              <th>Phone</th>
              <th>Company</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployeeRows.map((employee, index) => {
              // Find the actual index in the original employeeRows array
              const actualIndex = employeeRows.indexOf(employee);
              return (
              <tr key={actualIndex}>
                <td>
                  <input
                    type="text"
                    value={employee.fullName || ''}
                    onChange={(e) => handleUpdateEmployee(actualIndex, 'fullName', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      
                    }}
                  />
                </td>
                <td>
                  <input
                    type="email"
                    value={employee.email || ''}
                    onChange={(e) => handleUpdateEmployee(actualIndex, 'email', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      
                    }}
                  />
                </td>
                <td>
                  <input
                    type="tel"
                    value={employee.phone || ''}
                    onChange={(e) => handleUpdateEmployee(actualIndex, 'phone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={employee.company || ''}
                    onChange={(e) => handleUpdateEmployee(actualIndex, 'company', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      
                    }}
                  />
                </td>
                <td>
                  <select
                    value={employee.status || ''}
                    onChange={(e) => handleUpdateEmployee(actualIndex, 'status', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      
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
                  <button onClick={() => handleExpandEmployee(actualIndex)} style={{ marginRight: '5px' }}>Expand</button>
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
              Are you sure you want to delete this employee? This action cannot be undone.
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

export default RentalEmployeesSection;
