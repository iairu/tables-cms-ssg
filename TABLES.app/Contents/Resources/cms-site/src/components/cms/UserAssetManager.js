import React, { useState, useEffect, useRef } from 'react';
import AssetGrid from './AssetGrid';

const styles = {
  container: {
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    width: '100%',
  },
  header: {
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '10px',
    marginBottom: '20px',
    fontSize: '24px',
    fontWeight: 600,
    color: '#1a202c',
  },
  uploadButton: {
    display: 'inline-block',
    padding: '10px 20px',
    background: '#0002ff',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '20px',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#718096',
  },
  emptyState: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#718096',
    border: '2px dashed #e2e8f0',
  },
  searchInput: {
    display: 'block',
    width: '100%',
    maxWidth: '350px',
    marginBottom: '20px',
    padding: '8px 12px',
    fontSize: '15px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    boxSizing: 'border-box',
  }
};

function fuzzyMatch(str, query) {
  // Simple fuzzy match: all query chars must appear in order in str (case-insensitive)
  str = str.toLowerCase();
  query = query.toLowerCase();
  let strIdx = 0, queryIdx = 0;
  while (strIdx < str.length && queryIdx < query.length) {
    if (str[strIdx] === query[queryIdx]) {
      queryIdx++;
    }
    strIdx++;
  }
  return queryIdx === query.length;
}

const UserAssetManager = ({ assets, onPageLoad, onUpload, onDelete, onReplace }) => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadAssets = async () => {
      setLoading(true);
      if (onPageLoad) {
        await onPageLoad();
      }
      setLoading(false);
    };
    loadAssets();
  }, [onPageLoad]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !onUpload) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        const fileData = event.target.result;
        await onUpload({ fileData, fileName: file.name });
    };
    reader.readAsDataURL(file);

    // Reset the file input so the same file can be selected again
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (filename) => {
    if (window.confirm(`Are you sure you want to delete ${filename}?`)) {
      if (onDelete) {
        onDelete(filename);
      }
    }
  };

  const handleReplace = (filename) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file || !onReplace) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
          const fileData = event.target.result;
          await onReplace(filename, { fileData, fileName: file.name });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const triggerUpload = () => {
    fileInputRef.current.click();
  }

  // Fuzzy filter assets by filename (or name property)
  const filteredAssets = search.trim()
    ? assets.filter(asset => {
        const name = asset.filename || asset.name || '';
        return fuzzyMatch(name, search.trim());
      })
    : assets;

  if (loading) {
    return <section className="main-section" style={styles.loading}>Loading assets...</section>;
  }

  return (
    <section className="main-section" style={styles.container}>
      <h2 style={styles.header}>User Asset Manager</h2>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleUpload} 
        style={{ display: 'none' }} 
        accept="image/*"
      />
      <button onClick={triggerUpload} style={styles.uploadButton}>
        Upload New Asset (max. 2MB)
      </button>
      <input
        type="text"
        placeholder="Search assets..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={styles.searchInput}
        aria-label="Search assets"
      />
      {filteredAssets.length === 0 ? (
        <div style={styles.emptyState}>
          <p>
            {assets.length === 0
              ? 'No assets found. Upload your first asset to get started!'
              : 'No assets match your search.'}
          </p>
        </div>
      ) : (
        <AssetGrid
          assets={filteredAssets}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
};

export default UserAssetManager;
