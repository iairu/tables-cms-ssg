import React, { useState } from 'react';
import { fuzzyMatch } from '../utils';
export const RentalReservationsSection = ({ cmsData }) => {
  const { reservationRows, saveReservationRows, inventoryRows, customerRows, employeeRows } = cmsData;

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
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
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
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
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
                    onChange={(e) => handleUpdateRow(index, 'responsibleEmployee', e.targe.value)}
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
                    value={row.startDate}
                    onChange={(e) => handleUpdateRow(index, 'startDate', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={row.endDate}
                    onChange={(e) => handleUpdateRow(index, 'endDate', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </td>
                <td>
                  <select
                    value={row.status}
                    onChange={(e) => handleUpdateRow(index, 'status', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Picked Up">Picked Up</option>
                    <option value="Returned">Returned</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
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

export default RentalReservationsSection;
