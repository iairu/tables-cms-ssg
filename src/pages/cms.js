import React, { useState, useEffect } from 'react';
import SideMenu from '../components/SideMenu';
import useCMSData from '../hooks/useCMSData';
import ComponentEditor from '../components/cms/ComponentEditor';
import { fuzzyMatch } from '../components/cms/utils';
import '../styles/cms.css';
import {
  PagesSection,
  BlogSection,
  CatsSection,
  SettingsSection,
  ACLSection,
  ExtensionsSection
} from '../components/cms/sections';

const CMSPage = () => {
  const [currentSection, setCurrentSection] = useState('pages');
  const [disableFurtherNavigation, setDisableFurtherNavigation] = useState(false);
  const [hasRunInitialNavigation, setHasRunInitialNavigation] = useState(false);
  const cmsData = useCMSData();

  // Navigation logic on mount - only runs once when data is loaded
  useEffect(() => {
    if (typeof window === 'undefined' || hasRunInitialNavigation || !cmsData.isDataLoaded) {
      return;
    }

    // Mark that we've run the initial navigation check
    setHasRunInitialNavigation(true);

    // Check settings first - if siteTitle or vercelApiKey is empty, navigate to settings
    if (!cmsData.settings.siteTitle || cmsData.settings.siteTitle === '' ||
        !cmsData.settings.vercelApiKey || cmsData.settings.vercelApiKey === '') {
      setCurrentSection('settings');
      setDisableFurtherNavigation(true);
      return;
    }

    // Check if any extension is enabled
    const extensions = cmsData.extensions;
    const hasEnabledExtension =
      extensions['pages-extension-enabled'] ||
      extensions['blog-extension-enabled'] ||
      extensions['pedigree-extension-enabled'] ||
      extensions['rental-extension-enabled'];

    if (!hasEnabledExtension) {
      // No extensions enabled, navigate to extensions page
      setCurrentSection('extensions');
      setDisableFurtherNavigation(true);
      return;
    }

    // Navigate to first enabled extension
    if (extensions['pages-extension-enabled']) {
      setCurrentSection('pages');
    } else if (extensions['blog-extension-enabled']) {
      setCurrentSection('blog');
    } else if (extensions['pedigree-extension-enabled']) {
      setCurrentSection('cats');
    } else if (extensions['rental-extension-enabled']) {
      setCurrentSection('rental-inventory');
    }
  }, [cmsData.isDataLoaded, hasRunInitialNavigation, cmsData.settings.siteTitle, cmsData.settings.vercelApiKey, cmsData.extensions]);

  if (typeof window === 'undefined') {
    return null;
  }

  const handleSectionChange = (sectionId) => {
    setCurrentSection(sectionId);
  };

  const handleManualBuild = (localOnly = false) => {
    if (cmsData.manualTriggerBuild) {
      cmsData.manualTriggerBuild(localOnly);
    }
  };

  return (
    <div className="cms-container">
      <SideMenu
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        isBuilding={cmsData.isBuilding}
        lastSaved={cmsData.lastSaved}
        onBuildClick={handleManualBuild}
        canBuild={cmsData.canBuild}
        buildCooldownSeconds={cmsData.buildCooldownSeconds}
        domain={cmsData.settings.domain}
        vercelApiKey={cmsData.settings.vercelApiKey}
      />
      <main>

        {currentSection === 'pages' && <PagesSection cmsData={cmsData} />}
        {currentSection === 'blog' && <BlogSection cmsData={cmsData} />}
        {currentSection === 'cats' && <CatsSection cmsData={cmsData} />}
        {currentSection === 'settings' && <SettingsSection cmsData={cmsData} />}
        {currentSection === 'acl' && <ACLSection cmsData={cmsData} />}
        {currentSection === 'extensions' && <ExtensionsSection cmsData={cmsData} />}
        {currentSection === 'rental-inventory' && <RentalInventorySection cmsData={cmsData} />}
        {currentSection === 'rental-attendance' && <RentalAttendanceSection cmsData={cmsData} />}
        {currentSection === 'rental-contacts' && <RentalContactsSection cmsData={cmsData} />}
        {currentSection === 'rental-reservations' && <RentalReservationsSection cmsData={cmsData} />}
        {currentSection === 'rental-calendar' && <RentalCalendarSection cmsData={cmsData} />}
      </main>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// RentalInventorySection - keeping in main file for now
const RentalInventorySection = ({ cmsData }) => {
  const { inventoryRows, saveInventoryRows } = cmsData;
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultInventoryItem = {
    itemName: '',
    sku: '',
    quantity: '',
    location: '',
    supplier: '',
    status: 'In Stock',
    lastRestocked: '',
    notes: '',
    public: false
  };

  const handleAddItem = () => {
    saveInventoryRows([defaultInventoryItem, ...inventoryRows]);
  };

  const handleRemoveItem = (index) => {
    const newRows = inventoryRows.filter((_, i) => i !== index);
    saveInventoryRows(newRows);
  };

  const handleUpdateItem = (index, field, value) => {
    const newRows = [...inventoryRows];
    newRows[index][field] = value;
    saveInventoryRows(newRows);
  };

  const handleExpandItem = (index) => {
    setEditingItemIndex(index);
  };

  const handleCloseModal = () => {
    setEditingItemIndex(null);
  };

  const handleDeleteClick = (index) => {
    setItemToDelete(index);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete !== null) {
      handleRemoveItem(itemToDelete);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const editingItem = editingItemIndex !== null ? inventoryRows[editingItemIndex] : null;

  const filteredInventoryRows = inventoryRows.filter(item => {
    return (
      fuzzyMatch(item.itemName || '', searchQuery) ||
      fuzzyMatch(item.sku || '', searchQuery) ||
      fuzzyMatch(item.location || '', searchQuery) ||
      fuzzyMatch(item.supplier || '', searchQuery)
    );
  });

  if (editingItem) {
    return (
      <section className="main-section active" id="inventory-editor">
        <header style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 100, borderBottom: '1px solid #e5e7eb' }}>
          <h1>
            <span>Editing item {editingItem.itemName || '(Unnamed)'}</span>
          </h1>
          <div className="adjustment-buttons">
            <a href="#" onClick={(e) => { e.preventDefault(); handleCloseModal(); }}>← Back to Inventory</a>
          </div>
        </header>
        <div style={{ padding: '20px', maxWidth: '800px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Item Name: <span style={{ color: '#ef4444' }}>*</span></strong>
              <input
                type="text"
                value={editingItem.itemName || ''}
                onChange={(e) => handleUpdateItem(editingItemIndex, 'itemName', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>SKU:</strong>
              <input
                type="text"
                value={editingItem.sku || ''}
                onChange={(e) => handleUpdateItem(editingItemIndex, 'sku', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Quantity:</strong>
              <input
                type="number"
                value={editingItem.quantity || ''}
                onChange={(e) => handleUpdateItem(editingItemIndex, 'quantity', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Location:</strong>
              <input
                type="text"
                value={editingItem.location || ''}
                onChange={(e) => handleUpdateItem(editingItemIndex, 'location', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Supplier:</strong>
              <input
                type="text"
                value={editingItem.supplier || ''}
                onChange={(e) => handleUpdateItem(editingItemIndex, 'supplier', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Status:</strong>
              <select
                value={editingItem.status || ''}
                onChange={(e) => handleUpdateItem(editingItemIndex, 'status', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              >
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="On Order">On Order</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Last Restocked:</strong>
              <input
                type="date"
                value={editingItem.lastRestocked || ''}
                onChange={(e) => handleUpdateItem(editingItemIndex, 'lastRestocked', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Notes:</strong>
              <textarea
                value={editingItem.notes || ''}
                onChange={(e) => handleUpdateItem(editingItemIndex, 'notes', e.target.value)}
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editingItem.public || false}
                onChange={(e) => handleUpdateItem(editingItemIndex, 'public', e.target.checked)}
                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
              />
              <strong>Public (visible in catalog)</strong>
            </label>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="main-section active" id="rental-inventory">
      <header>
        <h1>Inventory</h1>
        <div className="adjustment-buttons">
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              marginRight: '10px',
              width: '200px'
            }}
          />
          <a href="#" onClick={(e) => { e.preventDefault(); handleAddItem(); }} className="highlighted">+ Add Item</a>
        </div>
      </header>
      <div className="component-table-container">
        <table className="page-list-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Location</th>
              <th>Status</th>
              <th>Public</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventoryRows.map((item, index) => {
              const actualIndex = inventoryRows.indexOf(item);
              return (
              <tr key={actualIndex}>
                <td>
                  <input
                    type="text"
                    value={item.itemName || ''}
                    onChange={(e) => handleUpdateItem(actualIndex, 'itemName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.sku || ''}
                    onChange={(e) => handleUpdateItem(actualIndex, 'sku', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.quantity || ''}
                    onChange={(e) => handleUpdateItem(actualIndex, 'quantity', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.location || ''}
                    onChange={(e) => handleUpdateItem(actualIndex, 'location', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                </td>
                <td>
                  <select
                    value={item.status || ''}
                    onChange={(e) => handleUpdateItem(actualIndex, 'status', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="On Order">On Order</option>
                  </select>
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={item.public || false}
                    onChange={(e) => handleUpdateItem(actualIndex, 'public', e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td>
                  <button onClick={() => handleExpandItem(actualIndex)} style={{ marginRight: '5px' }}>Expand</button>
                  <button onClick={() => handleDeleteClick(actualIndex)}>Delete</button>
                </td>
              </tr>
              );
            })}
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
            borderRadius: '8px',
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
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={handleConfirmDelete} style={{
                padding: '8px 16px',
                borderRadius: '4px',
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

// RentalAttendanceSection - keeping in main file for now
const RentalAttendanceSection = ({ cmsData }) => {
  const { attendanceRows, saveAttendanceRows } = cmsData;

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
                  <input
                    type="text"
                    value={row.employeeName}
                    onChange={(e) => handleUpdateRow(index, 'employeeName', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
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
                    onChange={(e) => handleUpdateRow(index, 'timeIn', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
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

const RentalContactsSection = ({ cmsData }) => {
  const { contactRows, saveContactRows } = cmsData;
  const [editingContactIndex, setEditingContactIndex] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultContact = {
    fullName: '',
    email: '',
    phone: '',
    contactType: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    dateAdded: '',
    preferredContact: '',
    status: '',
    notes: '',
    reservationHistory: '',
    totalReservations: '',
    lastReservationDate: '',
    creditScore: '',
    paymentMethod: '',
    emergencyContact: '',
    emergencyPhone: '',
    identificationNumber: '',
    dateOfBirth: '',
    preferences: ''
  };

  const handleAddContact = () => {
    const newContact = {
      ...defaultContact,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    saveContactRows([newContact, ...contactRows]);
  };

  const handleRemoveContact = (index) => {
    const newRows = contactRows.filter((_, i) => i !== index);
    saveContactRows(newRows);
  };

  const handleUpdateContact = (index, field, value) => {
    const newRows = [...contactRows];
    newRows[index][field] = value;
    saveContactRows(newRows);
  };

  const handleExpandContact = (index) => {
    setEditingContactIndex(index);
  };

  const handleCloseModal = () => {
    setEditingContactIndex(null);
  };

  const handleDeleteClick = (index) => {
    setContactToDelete(index);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (contactToDelete !== null) {
      handleRemoveContact(contactToDelete);
      setDeleteModalOpen(false);
      setContactToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setContactToDelete(null);
  };

  const editingContact = editingContactIndex !== null ? contactRows[editingContactIndex] : null;

  // Filter contacts based on fuzzy search query
  const filteredContactRows = contactRows.filter(contact => {
    return (
      fuzzyMatch(contact.fullName || '', searchQuery) ||
      fuzzyMatch(contact.email || '', searchQuery) ||
      fuzzyMatch(contact.phone || '', searchQuery) ||
      fuzzyMatch(contact.contactType || '', searchQuery) ||
      fuzzyMatch(contact.company || '', searchQuery)
    );
  });

  if (editingContact) {
    return (
      <section className="main-section active" id="rental-contacts-editor">
        <header style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 100, borderBottom: '1px solid #e5e7eb' }}>
          <h1>
            <span>Editing contact {editingContact.fullName || '(Unnamed)'}</span>
          </h1>
          <div className="adjustment-buttons">
            <a href="#" onClick={(e) => { e.preventDefault(); handleCloseModal(); }}>← Back to Contacts</a>
          </div>
        </header>
        <div style={{ padding: '20px', maxWidth: '800px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Full Name: <span style={{ color: '#ef4444' }}>*</span></strong>
              <input
                type="text"
                value={editingContact.fullName || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'fullName', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Email: <span style={{ color: '#ef4444' }}>*</span></strong>
              <input
                type="email"
                value={editingContact.email || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'email', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Phone:</strong>
              <input
                type="tel"
                value={editingContact.phone || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'phone', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Contact Type: <span style={{ color: '#ef4444' }}>*</span></strong>
              <select
                value={editingContact.contactType || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'contactType', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              >
                <option value="">Select type</option>
                <option value="Client">Client</option>
                <option value="Buyer">Buyer</option>
                <option value="Renter">Renter</option>
                <option value="Lead">Lead</option>
                <option value="Partner">Partner</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Company:</strong>
              <input
                type="text"
                value={editingContact.company || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'company', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Address:</strong>
              <input
                type="text"
                value={editingContact.address || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'address', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>City:</strong>
              <input
                type="text"
                value={editingContact.city || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'city', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>State/Province:</strong>
              <input
                type="text"
                value={editingContact.state || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'state', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Zip Code:</strong>
              <input
                type="text"
                value={editingContact.zipCode || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'zipCode', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Country:</strong>
              <input
                type="text"
                value={editingContact.country || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'country', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Date Added:</strong>
              <input
                type="date"
                value={editingContact.dateAdded || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'dateAdded', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Preferred Contact Method:</strong>
              <select
                value={editingContact.preferredContact || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'preferredContact', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              >
                <option value="">Select method</option>
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
                <option value="SMS">SMS</option>
                <option value="Mail">Mail</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Status:</strong>
              <select
                value={editingContact.status || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'status', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              >
                <option value="">Select status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
                <option value="Blacklisted">Blacklisted</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Date of Birth:</strong>
              <input
                type="date"
                value={editingContact.dateOfBirth || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'dateOfBirth', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Identification Number:</strong>
              <input
                type="text"
                value={editingContact.identificationNumber || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'identificationNumber', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Total Reservations:</strong>
              <input
                type="number"
                value={editingContact.totalReservations || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'totalReservations', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Last Reservation Date:</strong>
              <input
                type="date"
                value={editingContact.lastReservationDate || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'lastReservationDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Credit Score:</strong>
              <input
                type="number"
                value={editingContact.creditScore || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'creditScore', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Payment Method:</strong>
              <input
                type="text"
                value={editingContact.paymentMethod || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'paymentMethod', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Emergency Contact:</strong>
              <input
                type="text"
                value={editingContact.emergencyContact || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'emergencyContact', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Emergency Phone:</strong>
              <input
                type="tel"
                value={editingContact.emergencyPhone || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'emergencyPhone', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Preferences:</strong>
              <textarea
                value={editingContact.preferences || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'preferences', e.target.value)}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Reservation History:</strong>
              <textarea
                value={editingContact.reservationHistory || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'reservationHistory', e.target.value)}
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Notes:</strong>
              <textarea
                value={editingContact.notes || ''}
                onChange={(e) => handleUpdateContact(editingContactIndex, 'notes', e.target.value)}
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </label>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="main-section active" id="rental-contacts">
      <header>
        <h1>Contacts</h1>
        <div className="adjustment-buttons">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              marginRight: '10px',
              width: '200px'
            }}
          />
          <a href="#" onClick={(e) => { e.preventDefault(); handleAddContact(); }} className="highlighted">+ Add Contact</a>
        </div>
      </header>
      <div className="component-table-container">
        <table className="page-list-table">
          <thead>
            <tr>
              <th>Full Name <span style={{ color: '#ef4444' }}>*</span></th>
              <th>Email <span style={{ color: '#ef4444' }}>*</span></th>
              <th>Phone</th>
              <th>Contact Type <span style={{ color: '#ef4444' }}>*</span></th>
              <th>Company</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContactRows.map((contact, index) => {
              // Find the actual index in the original contactRows array
              const actualIndex = contactRows.indexOf(contact);
              return (
              <tr key={actualIndex}>
                <td>
                  <input
                    type="text"
                    value={contact.fullName || ''}
                    onChange={(e) => handleUpdateContact(actualIndex, 'fullName', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                </td>
                <td>
                  <input
                    type="email"
                    value={contact.email || ''}
                    onChange={(e) => handleUpdateContact(actualIndex, 'email', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                </td>
                <td>
                  <input
                    type="tel"
                    value={contact.phone || ''}
                    onChange={(e) => handleUpdateContact(actualIndex, 'phone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                </td>
                <td>
                  <select
                    value={contact.contactType || ''}
                    onChange={(e) => handleUpdateContact(actualIndex, 'contactType', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Client">Client</option>
                    <option value="Buyer">Buyer</option>
                    <option value="Renter">Renter</option>
                    <option value="Lead">Lead</option>
                    <option value="Partner">Partner</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={contact.company || ''}
                    onChange={(e) => handleUpdateContact(actualIndex, 'company', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                </td>
                <td>
                  <select
                    value={contact.status || ''}
                    onChange={(e) => handleUpdateContact(actualIndex, 'status', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => handleExpandContact(actualIndex)} style={{ marginRight: '5px' }}>Expand</button>
                  <button onClick={() => handleDeleteClick(actualIndex)}>Delete</button>
                </td>
              </tr>
              );
            })}
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
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.25rem' }}>Confirm Delete</h2>
            <p style={{ marginBottom: '25px', color: '#64748b' }}>
              Are you sure you want to delete this contact? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={handleCancelDelete} style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={handleConfirmDelete} style={{
                padding: '8px 16px',
                borderRadius: '4px',
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

const RentalReservationsSection = ({ cmsData }) => {
  const { reservationRows, saveReservationRows, inventoryRows, contactRows } = cmsData;

  const handleAddRow = () => {
    const newRow = {
      id: Date.now().toString(),
      customerName: '',
      itemName: '',
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
                    {contactRows.map(contact => (
                      <option key={contact.email} value={contact.fullName}>{contact.fullName}</option>
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

const RentalCalendarSection = ({ cmsData }) => {
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
          <div key={day} style={{ padding: '10px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #ccc', background: '#f0f0f0' }}>{day}</div>
        ))}
        {calendarDays.map(day => {
          const dateString = day.toISOString().slice(0, 10);
          const reservations = reservationsByDate[dateString] || [];
          return (
            <div key={day.toString()} style={{ padding: '10px', border: '1px solid #ccc', minHeight: '100px', background: day.getMonth() === currentDate.getMonth() ? 'white' : '#f9f9f9' }}>
              <div>{day.getDate()}</div>
              <div>
                {reservations.map(res => (
                  <div key={res.id} style={{ fontSize: '12px', background: '#e0e7ff', padding: '2px', borderRadius: '2px', marginTop: '2px' }}>
                    {res.itemName} - {res.customerName}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};


export default CMSPage;

export const Head = () => (
  <>
    <title>CMS - TABLES</title>
    <meta name="description" content="TABLES Content Management System" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </>
);
