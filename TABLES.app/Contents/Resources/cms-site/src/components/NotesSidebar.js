import React, { useState, useEffect } from 'react';

const NotesSidebar = ({ isOpen, onClose }) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const savedNotes = localStorage.getItem('tables-notes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  const handleNoteChange = (e) => {
    setNotes(e.target.value);
    localStorage.setItem('tables-notes', e.target.value);
  };

  return (
    <aside style={{
      position: 'sticky',
      top: '66px',
      right: '0',
      width: '300px',
      height: 'calc(100vh - 66px)',
      backgroundColor: '#f8f9fa',
      borderLeft: '1px solid #00000020',
      transition: 'right 0.3s',
      padding: '20px',
      zIndex: 101,
      display: isOpen ? 'flex' : 'none',
      flexDirection: 'column'
    }}>
      <textarea
        value={notes}
        onChange={handleNoteChange}
        style={{
          flexGrow: 1,
          width: '100%',
          padding: '10px',
          border: '1px solid #ced4da',
          resize: 'none',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
        placeholder="Your sticky notes..."
      />
    </aside>
  );
};

export default NotesSidebar;
