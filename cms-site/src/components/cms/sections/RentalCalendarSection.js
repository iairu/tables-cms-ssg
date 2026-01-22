import React, { useState } from 'react';
import { fuzzyMatch } from '../utils';
export const RentalCalendarSection = ({ cmsData }) => {
  const { reservationRows } = cmsData;
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const calendarDays = [];
  let date = new Date(startDate);
  while (date <= endDate) {
    calendarDays.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  const reservationsByDate = {};
  if(reservationRows) {
    reservationRows.forEach(res => {
      const start = new Date(res.startDate);
      const end = new Date(res.endDate);
      let d = new Date(start);
      while (d <= end) {
        const dateString = d.toISOString().slice(0, 10);
        if (!reservationsByDate[dateString]) {
          reservationsByDate[dateString] = [];
        }
        reservationsByDate[dateString].push(res);
        d.setDate(d.getDate() + 1);
      }
    });
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <section className="main-section active" id="rental-calendar">
      <header>
        <h1>Calendar</h1>
        <div className="adjustment-buttons">
          <button onClick={prevMonth}>&lt; Prev</button>
          <span style={{ margin: '0 10px', fontWeight: 'bold' }}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth}>Next &gt;</button>
        </div>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', border: '1px solid #ccc' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{ padding: '10px', fontWeight: 'bold', textAlign: 'center', borderRight: '1px solid #ccc', background: '#f0f0f0' }}>{day}</div>
        ))}
        {calendarDays.map(day => {
          const dateString = day.toISOString().slice(0, 10);
          const reservations = reservationsByDate[dateString] || [];
          return (
            <div key={day.toString()} style={{ padding: '10px', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc', minHeight: '100px', background: day.getMonth() === currentDate.getMonth() ? 'white' : '#f9f9f9' }}>
              <div>{day.getDate()}</div>
              <div>
                {reservations.map(res => {
                  // Generate a unique color for each responsibleEmployee
                  // We'll use a hash function to map the responsibleEmployee string to a color
                  function stringToColor(str) {
                    if (!str) return '#e0e7ff';
                    let hash = 0;
                    for (let i = 0; i < str.length; i++) {
                      hash = str.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    // Generate color in HSL for better distribution
                    const hue = Math.abs(hash) % 360;
                    return `hsl(${hue}, 70%, 85%)`;
                  }
                  const bgColor = stringToColor(res.responsibleEmployee);
                  return (
                    <div
                      key={res.id}
                      style={{
                        fontSize: '12px',
                        background: bgColor,
                        padding: '2px',
                        
                        marginTop: '2px'
                      }}
                    >
                      <b>{res.itemName}</b><br />
                      {res.customerName}<br />
                      <i>{res.responsibleEmployee}</i>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RentalCalendarSection;
