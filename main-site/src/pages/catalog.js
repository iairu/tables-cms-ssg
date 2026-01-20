import React, { useState, useEffect } from 'react';
import { navigate } from 'gatsby';

const CatalogPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/inventory.json')
      .then(res => res.json())
      .then(data => {
        const publicItems = data.filter(item => item.public);
        setInventory(publicItems);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching inventory data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (inventory.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div>No items in catalog.</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
            Catalog
          </h1>
          <nav>
            <a href="/" style={{ color: 'white', textDecoration: 'none' }}>Home</a>
          </nav>
        </div>
      </header>
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {inventory.map(item => (
            <div key={item.sku} style={{
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>{item.itemName}</h2>
              <p style={{ color: '#64748b' }}>SKU: {item.sku}</p>
              <p style={{ color: '#64748b' }}>Quantity: {item.quantity}</p>
              <p style={{ color: '#64748b' }}>Location: {item.location}</p>
              <p style={{ color: '#64748b' }}>Status: {item.status}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CatalogPage;
