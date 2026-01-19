import React, { useState } from 'react';
import { fuzzyMatch } from '../utils';
// RentalAttendanceSection
export const RentalAttendanceSection = ({ cmsData }) => {
  const { attendanceRows, saveAttendanceRows, employeeRows } = cmsData;

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
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f4f4f5' }}
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
                  <button onClick={() => handleRemoveRow(index)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default RentalAttendanceSection;