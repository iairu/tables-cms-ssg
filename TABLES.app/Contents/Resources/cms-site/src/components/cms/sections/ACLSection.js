import React from 'react';

const ACLSection = ({ cmsData }) => {
  const { acl, saveAcl } = cmsData;

  const handleToggle = (key) => {
    saveAcl({ ...acl, [key]: !acl[key] });
  };

  return (
    <section className="main-section active" id="acl">
      <header>
        <h1>Access Control List</h1>
      </header>
      <div>
        <table className="page-list-table">
          <thead>
            <tr>
              <th>Permission</th>
              <th>Enabled</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(acl).map(key => (
              <tr key={key}>
                <td>{key}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={acl[key]}
                    onChange={() => handleToggle(key)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ACLSection;