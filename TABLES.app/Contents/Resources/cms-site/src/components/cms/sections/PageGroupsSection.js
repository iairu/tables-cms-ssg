import React, { useState } from 'react';

const PageGroupsSection = ({ cmsData }) => {
  const { pageGroups, savePageGroups, pages } = cmsData;
  const [newGroupName, setNewGroupName] = useState('');

  const handleAddGroup = () => {
    if (newGroupName.trim() === '') return;
    const newGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      pageIds: [],
    };
    savePageGroups([...pageGroups, newGroup]);
    setNewGroupName('');
  };

  const handleDeleteGroup = (groupId) => {
    if (groupId === 'direct-pages') {
      alert("Cannot delete the default 'Direct Pages' group.");
      return;
    }
    const groupToDelete = pageGroups.find(g => g.id === groupId);
    if (groupToDelete.pageIds.length > 0) {
      alert('Cannot delete a group that contains pages. Please move the pages to another group first.');
      return;
    }
    const updatedGroups = pageGroups.filter(group => group.id !== groupId);
    savePageGroups(updatedGroups);
  };

  const handleUpdateGroupName = (groupId, newName) => {
    const updatedGroups = pageGroups.map(group =>
      group.id === groupId ? { ...group, name: newName } : group
    );
    savePageGroups(updatedGroups);
  };

  return (
    <section className="main-section active" id="page-groups">
      <header>
        <h1>Page Groups</h1>
      </header>
      <div className="component-table-container" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New group name"
            style={{ padding: '10px', marginRight: '10px', border: '1px solid #ccc', flexGrow: 1 }}
          />
          <button onClick={handleAddGroup} className="highlighted" style={{ padding: '10px 20px' }}>+ Add Group</button>
        </div>
        <table className="page-list-table">
          <thead>
            <tr>
              <th style={{ width: '60%' }}>Group Name</th>
              <th style={{ width: '20%' }}>Pages</th>
              <th style={{ width: '20%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageGroups.map(group => (
              <tr key={group.id}>
                <td>
                  <input
                    type="text"
                    value={group.name}
                    onChange={(e) => handleUpdateGroupName(group.id, e.target.value)}
                    disabled={group.id === 'direct-pages'}
                    style={{ padding: '10px', border: '1px solid #ccc', width: '100%', backgroundColor: group.id === 'direct-pages' ? '#f0f0f0' : 'white' }}
                  />
                </td>
                <td style={{ textAlign: 'center' }}>{group.pageIds.length}</td>
                <td style={{ textAlign: 'center' }}>
                  {group.id !== 'direct-pages' && (
                    <button onClick={() => handleDeleteGroup(group.id)} style={{ padding: '8px 12px' }}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PageGroupsSection;
