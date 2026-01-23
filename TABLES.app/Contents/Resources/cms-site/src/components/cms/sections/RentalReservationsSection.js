import React, { useState } from 'react';
import { fuzzyMatch } from '../utils';
export const RentalReservationsSection = ({ cmsData }) => {
  const { reservationRows, saveReservationRows, inventoryRows, customerRows, employeeRows } = cmsData;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleAddRow = () => {
    const newRow = {
      id: Date.now().toString(),
      customerName: '',
      itemName: '',
      responsibleEmployee: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      status: 'Confirmed'
    };
    saveReservationRows([newRow, ...reservationRows]);
  };

  const handleUpdateRow = (index, field, value) => {
    const newRows = [...reservationRows];
    newRows[index][field] = value;
    saveReservationRows(newRows);
  };

  const handleRemoveRow = (index) => {
    const newRows = reservationRows.filter((_, i) => i !== index);
    saveReservationRows(newRows);
  };

  const handleDeleteClick = (index) => {
    setItemToDelete(index);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete !== null) {
      handleRemoveRow(itemToDelete);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <section className="main-section active" id="rental-reservations">
      <header>
        <h1>Reservations</h1>
        <div className="adjustment-buttons">
          <a href="#" onClick={(e) => { e.preventDefault(); handleAddRow(); }} className="highlighted">+ Add Reservation</a>
        </div>
      </header>
      <div className="component-table-container">
        <table className="page-list-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Item Name</th>
              <th>Responsible Employee</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservationRows.map((row, index) => (
              <tr key={row.id}>
                <td>
                  <select
                    value={row.customerName}
                    onChange={(e) => handleUpdateRow(index, 'customerName', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">Select Customer</option>
                    {customerRows.map(customer => (
                      <option key={customer.email} value={customer.fullName}>{customer.fullName}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={row.itemName}
                    onChange={(e) => handleUpdateRow(index, 'itemName', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">Select Item</option>
                    {inventoryRows.map(item => (
                      <option key={item.sku} value={item.itemName}>{item.itemName}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={row.responsibleEmployee}
                    onChange={(e) => handleUpdateRow(index, 'responsibleEmployee', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">Select Employee</option>
                    {employeeRows.map(employee => (
                      <option key={employee.email} value={employee.fullName}>{employee.fullName}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="date"
                    value={row.startDate}
                    onChange={(e) => handleUpdateRow(index, 'startDate', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1' }}
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={row.endDate}
                    onChange={(e) => handleUpdateRow(index, 'endDate', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1' }}
                  />
                </td>
                <td>
                  <select
                    value={row.status}
                    onChange={(e) => handleUpdateRow(index, 'status', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Picked Up">Picked Up</option>
                    <option value="Returned">Returned</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => handleDeleteClick(index)}>Delete</button>
                </td>
              </tr>
            ))}
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

export default RentalReservationsSection;
