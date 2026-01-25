import React, { useState } from 'react';
import { fuzzyMatch } from '../utils';

const PageGroupsSection = ({ cmsData }) => {
  const { pageGroups, savePageGroups, pages, settings } = cmsData;
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddGroup = () => {
    const newGroup = {
      id: Date.now().toString(),
      name: '',
      pageIds: [],
      translations: {},
    };
    savePageGroups([newGroup, ...pageGroups]);
  };

  const handleDeleteGroup = (groupId) => {
    if (groupId === 'direct-pages') {
      alert("Cannot delete the default page group.");
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

  const getLocalizedGroupName = (group, lang) => {
    if (group.id === 'direct-pages') {
        return 'Direct pages';
    }
    if (lang === settings?.defaultLang) {
        return group.name || '';
    }
    return group.translations?.[lang]?.name || '';
  };

  const handleUpdateGroupName = (groupId, lang, newName) => {
    const updatedGroups = pageGroups.map(group => {
        if (group.id !== groupId) {
            return group;
        }

        const newGroup = { ...group };
        if (lang === settings?.defaultLang) {
            newGroup.name = newName;
        } else {
            newGroup.translations = {
                ...(group.translations || {}),
                [lang]: {
                    name: newName,
                },
            };
        }

        // Ensure default language is not in translations
        if (newGroup.translations && (settings?.defaultLang in newGroup.translations)) {
            delete newGroup.translations[settings.defaultLang];
        }

        return newGroup;
    });
    savePageGroups(updatedGroups);
  };

  const filteredPageGroups = (pageGroups || []).filter(group => {
    return fuzzyMatch(group.name || '', searchQuery);
  });

  return (
    <section className="main-section active" id="page-groups">
      <header>
        <h1>Page Groups</h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Page groups are for combining multiple pages into a dropdown menu in the deployed site. You can assign a page to a group by editing it in the 'Pages' section.
        </p>
        <div className="adjustment-buttons">
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              marginRight: '10px',
              width: '200px'
            }}
          />
          <a href="#" onClick={(e) => { e.preventDefault(); handleAddGroup(); }} className="highlighted">+ Add Group</a>
        </div>
      </header>
      <div className="component-table-container">
        <table className="page-list-table">
          <thead>
            <tr>
              {(settings?.languages || [{ code: 'en', name: 'English' }]).map(lang => (
                <th key={lang.code}>Group Name ({lang.code})</th>
              ))}
              <th style={{ width: '20%' }}>Pages</th>
              <th style={{ width: '20%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPageGroups.map(group => (
              <tr key={group.id}>
                {(settings?.languages || [{ code: 'en', name: 'English' }]).map(lang => (
                  <td key={lang.code}>
                    <input
                      type="text"
                      value={getLocalizedGroupName(group, lang.code)}
                      onChange={(e) => handleUpdateGroupName(group.id, lang.code, e.target.value)}
                      disabled={group.id === 'direct-pages'}
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', backgroundColor: group.id === 'direct-pages' ? '#f0f0f0' : 'white' }}
                    />
                  </td>
                ))}
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

