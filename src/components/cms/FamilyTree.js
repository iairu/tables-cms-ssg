import React from 'react';

const FamilyTree = ({ cat, allCats, onClose }) => {
  const findCatByName = (name) => allCats.find((c) => c.fullName === name);

  const renderAncestor = (cat, level) => {
    if (!cat) {
      return null;
    }

    const sire = cat.sire ? findCatByName(cat.sire) : null;
    const dam = cat.dam ? findCatByName(cat.dam) : null;

    return (
      <div style={{ paddingLeft: '20px', borderLeft: '1px solid #ccc', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
          <div style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <strong style={{ fontSize: '1.1em' }}>{cat.fullName}</strong>
            <div style={{ fontSize: '0.9em', color: '#555' }}>
              {cat.breed}
            </div>
            {cat.geneticTests && (
              <div style={{ fontSize: '0.8em', color: '#777', marginTop: '5px' }}>
                <strong>Genetic Tests:</strong> {cat.geneticTests}
              </div>
            )}
          </div>
        </div>
        {level > 0 && (sire || dam) && (
          <div style={{ marginLeft: '20px', paddingTop: '10px' }}>
            {renderAncestor(sire, level - 1)}
            {renderAncestor(dam, level - 1)}
          </div>
        )}
      </div>
    );
  };

  return (
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
        maxWidth: '90%',
        width: '1200px',
        maxHeight: '90%',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ marginTop: 0 }}>Family Tree for {cat.fullName}</h2>
          <button onClick={onClose} style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}>Close</button>
        </div>
        <div>
          {renderAncestor(cat, 4)}
        </div>
      </div>
    </div>
  );
};

export default FamilyTree;