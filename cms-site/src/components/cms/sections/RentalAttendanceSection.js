import React, { useState } from 'react';
import { fuzzyMatch } from '../utils';
// RentalAttendanceSection
export const RentalAttendanceSection = ({ cmsData }) => {
  const { attendanceRows, saveAttendanceRows, employeeRows } = cmsData;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleAddRow = () => {
    const newRow = {
      id: Date.now().toString(),
      employeeName: '',
      date: new Date().toISOString().slice(0, 10),
      timeIn: new Date().toTimeString().slice(0, 5),
      timeOut: ''
    };
    saveAttendanceRows([newRow, ...attendanceRows]);
  };

  const handleUpdateRow = (index, field, value) => {
    const newRows = [...attendanceRows];
    newRows[index][field] = value;
    saveAttendanceRows(newRows);
  };

  const handleRemoveRow = (index) => {
    const newRows = attendanceRows.filter((_, i) => i !== index);
    saveAttendanceRows(newRows);
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
    <section className="main-section active" id="rental-attendance">
      <header>
        <h1>Attendance</h1>
        <div className="adjustment-buttons">
          <a href="#" onClick={(e) => { e.preventDefault(); handleAddRow(); }} className="highlighted">+ Add Record</a>
        </div>
      </header>
      <div className="component-table-container">
        <table className="page-list-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Date</th>
              <th>Time In</th>
              <th>Clock Out</th>
              <th>Time Out</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRows.map((row, index) => (
              <tr key={row.id}>
                <td>
                  <select
                    value={row.employeeName}
                    onChange={(e) => handleUpdateRow(index, 'employeeName', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
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
                    value={row.date}
                    onChange={(e) => handleUpdateRow(index, 'date', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </td>
                <td>
                  <input
                    type="time"
                    value={row.timeIn}
                    readOnly
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1',  backgroundColor: '#f4f4f5' }}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={!!row.timeOut}
                    onChange={(e) => {
                      const newTimeOut = e.target.checked ? new Date().toTimeString().slice(0, 5) : '';
                      handleUpdateRow(index, 'timeOut', newTimeOut);
                    }}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </td>
                <td>
                  <input
                    type="time"
                    value={row.timeOut}
                    disabled={!row.timeOut}
                    onChange={(e) => handleUpdateRow(index, 'timeOut', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
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

export default RentalAttendanceSection;