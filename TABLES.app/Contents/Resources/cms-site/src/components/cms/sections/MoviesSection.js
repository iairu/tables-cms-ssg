import React, { useState, useEffect } from 'react';
import LockedInputWrapper from '../LockedInputWrapper';
// If you have a LoadingContext, you can import/use it here
// import { useLoading } from '../../../context/LoadingContext';
// import { createNavigation } from '../../../utils/navigation';
// import '../../../styles/MassActions.css';

const MOVIE_STATUSES = [
  'planned',
  'watching',
  'completed',
  'on-hold',
  'dropped'
];

const MoviesSection = ({ cmsData }) => {
  const { settings, movieList, saveMovieList } = cmsData;
  const apiKey = settings?.omdbApiKey;
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const [massActionsOpen, setMassActionsOpen] = useState(false);

  // Add Movie Modal
  const [addMovieModalOpen, setAddMovieModalOpen] = useState(false);
  const [newMovie, setNewMovie] = useState({
    Title: '',
    Year: '',
    imdbID: '',
    Poster: '',
    status: 'watching',
    started: '',
    finished: ''
  });

  // OMDb Modal
  const [omdbModalOpen, setOmdbModalOpen] = useState(false);

  useEffect(() => {
    // Any loading logic if needed
  }, []);

  const search = async () => {
    if (!apiKey) {
      alert('Please provide an OMDb API key in the settings.');
      return;
    }
    if (!searchQuery) return;
    const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(searchQuery)}&apikey=${apiKey}`);
    const data = await response.json();
    if (data.Search) {
      setResults(data.Search);
    } else {
      setResults([]);
    }
    setOmdbModalOpen(true);
  };

  // Helper to get unique key for a movie (imdbID if present, else Title+Year)
  const getMovieKey = (movie) => {
    return movie.imdbID ? movie.imdbID : `${movie.Title || ''}_${movie.Year || ''}`;
  };

  // Always add to the top of the list
  const addToList = (movie) => {
    // Add default state fields if missing
    const movieWithState = {
      ...movie,
      status: movie.status || 'watching',
      started: movie.started || '',
      finished: movie.finished || ''
    };
    // Check for duplicate by imdbID or Title+Year
    if ((movieList || []).some(m => getMovieKey(m) === getMovieKey(movieWithState))) return;
    const newList = [movieWithState, ...(movieList || [])];
    saveMovieList(newList);
  };

  const removeFromList = (movieKey) => {
    const newList = (movieList || []).filter(m => getMovieKey(m) !== movieKey);
    saveMovieList(newList);
    setSelectedMovies(selectedMovies.filter(id => id !== movieKey));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedMovies((filteredMovies || []).map(m => getMovieKey(m)));
    } else {
      setSelectedMovies([]);
    }
  };

  const handleSelectMovie = (e, movieKey) => {
    if (e.target.checked) {
      setSelectedMovies([...selectedMovies, movieKey]);
    } else {
      setSelectedMovies(selectedMovies.filter(id => id !== movieKey));
    }
  };

  const handleDeleteClick = (movieKey) => {
    setMovieToDelete(movieKey);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedMovies.length > 0) {
      const updatedList = (movieList || []).filter(m => !selectedMovies.includes(getMovieKey(m)));
      saveMovieList(updatedList);
      setSelectedMovies([]);
    } else if (movieToDelete) {
      removeFromList(movieToDelete);
      setMovieToDelete(null);
    }
    setDeleteModalOpen(false);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setMovieToDelete(null);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'default';
    }
    setSortConfig({ key, direction });
  };

  const filteredMovies = (movieList || []).filter(movie => {
    return (
      (movie.Title && movie.Title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (movie.Year && movie.Year.includes(searchQuery)) ||
      (movie.imdbID && movie.imdbID.includes(searchQuery)) ||
      (movie.status && movie.status.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (movie.started && movie.started.includes(searchQuery)) ||
      (movie.finished && movie.finished.includes(searchQuery))
    );
  });

  const sortedMovies = React.useMemo(() => {
    let sortableMovies = [...filteredMovies];
    if (sortConfig.direction !== 'default' && sortConfig.key) {
      sortableMovies.sort((a, b) => {
        let aVal, bVal;
        switch (sortConfig.key) {
          case 'title':
            aVal = (a.Title || '').toLowerCase();
            bVal = (b.Title || '').toLowerCase();
            break;
          case 'year':
            aVal = parseInt(a.Year, 10) || 0;
            bVal = parseInt(b.Year, 10) || 0;
            break;
          case 'imdbID':
            aVal = (a.imdbID || '').toLowerCase();
            bVal = (b.imdbID || '').toLowerCase();
            break;
          case 'status':
            aVal = (a.status || '').toLowerCase();
            bVal = (b.status || '').toLowerCase();
            break;
          case 'started':
            aVal = a.started || '';
            bVal = b.started || '';
            break;
          case 'finished':
            aVal = a.finished || '';
            bVal = b.finished || '';
            break;
          default:
            aVal = '';
            bVal = '';
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableMovies;
  }, [filteredMovies, sortConfig]);

  // Add Movie Modal handlers
  const handleOpenAddMovieModal = () => {
    setNewMovie({
      Title: '',
      Year: '',
      imdbID: '',
      Poster: '',
      status: 'watching',
      started: '',
      finished: ''
    });
    setAddMovieModalOpen(true);
  };

  const handleCloseAddMovieModal = () => {
    setAddMovieModalOpen(false);
    setNewMovie({
      Title: '',
      Year: '',
      imdbID: '',
      Poster: '',
      status: 'watching',
      started: '',
      finished: ''
    });
  };

  const handleAddMovieInputChange = (e) => {
    const { name, value } = e.target;
    setNewMovie(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddMovieSubmit = (e) => {
    e.preventDefault();
    // Validate required fields
    if (!newMovie.Title || !newMovie.Year) {
      alert('Please fill in Title and Year.');
      return;
    }
    // Check for duplicate by imdbID or Title+Year
    if ((movieList || []).some(m => getMovieKey(m) === getMovieKey(newMovie))) {
      alert('A movie with this imdbID or Title+Year already exists in your list.');
      return;
    }
    addToList(newMovie);
    handleCloseAddMovieModal();
  };

  // Handler for changing status/date for a movie
  const handleMovieFieldChange = (movieKey, field, value) => {
    const updatedList = (movieList || []).map(m => {
      if (getMovieKey(m) === movieKey) {
        return { ...m, [field]: value };
      }
      return m;
    });
    saveMovieList(updatedList);
  };

  // OMDb Modal close handler
  const handleCloseOmdbModal = () => {
    setOmdbModalOpen(false);
  };

  return (
    <section className="main-section active" id="movies" style={{ width: '100%' }}>
      {/* Highlight Banner for Add Movie */}
      <div
        style={{
          background: 'linear-gradient(90deg, #e0e7ff 0%, #f9fafb 100%)',
          padding: '24px 32px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#1d4ed8', fontWeight: 600 }}>Add a new movie</h2>
          <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '1rem' }}>
            You can add a movie manually or search OMDb to add from their database.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a
            href="#"
            onClick={e => { e.preventDefault(); handleOpenAddMovieModal(); }}
            className="highlighted"
            style={{
              padding: '10px 22px',
              background: '#1d4ed8',
              color: 'white',
              fontWeight: 500,
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            + Add Movie
          </a>
        </div>
      </div>

      <header>
        <h1 style={{ fontWeight: 700, fontSize: '2rem', color: '#1e293b' }}>Movies</h1>
        <div className="adjustment-buttons" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '10px 14px',
              border: '1.5px solid #cbd5e1',
              marginRight: '0px',
              width: '220px',
              fontSize: '1rem',
              background: '#f9fafb'
            }}
          />
          <button
            onClick={search}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: '#1d4ed8',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '1rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
              marginRight: '0px',
              transition: 'background 0.2s'
            }}
          >
            Search OMDb
          </button>
          {selectedMovies.length > 0 && (
            <div className="mass-actions-container" style={{ position: 'relative' }}>
              <button
                onClick={() => setMassActionsOpen(!massActionsOpen)}
                className="mass-actions-button"
                style={{
                  padding: '10px 18px',
                  background: '#f97316',
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
                }}
              >
                Mass Actions ({selectedMovies.length})
              </button>
              {massActionsOpen && (
                <div
                  className="mass-actions-dropdown"
                  style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    zIndex: 10,
                    minWidth: '180px',
                    padding: '8px 0'
                  }}
                >
                  <button
                    onClick={() => { setDeleteModalOpen(true); setMassActionsOpen(false); }}
                    className="mass-actions-dropdown-button"
                    style={{
                      width: '100%',
                      padding: '10px 18px',
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontWeight: 500,
                      fontSize: '1rem',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      <div className="component-table-container" style={{ marginTop: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', background: '#fff', padding: '18px' }}>
        <table className="page-list-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '12px 8px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedMovies.length === filteredMovies.length && filteredMovies.length > 0}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </th>
              <th
                onClick={() => handleSort('title')}
                style={{ cursor: 'pointer', padding: '12px 8px', fontWeight: 600, color: '#334155' }}
              >
                Title
                {sortConfig.key === 'title' && (
                  <span style={{ marginLeft: '5px' }}>{sortConfig.direction === 'asc' ? '🔼' : sortConfig.direction === 'desc' ? '🔽' : ''}</span>
                )}
              </th>
              <th
                onClick={() => handleSort('year')}
                style={{ cursor: 'pointer', padding: '12px 8px', fontWeight: 600, color: '#334155' }}
              >
                Year
                {sortConfig.key === 'year' && (
                  <span style={{ marginLeft: '5px' }}>{sortConfig.direction === 'asc' ? '🔼' : sortConfig.direction === 'desc' ? '🔽' : ''}</span>
                )}
              </th>
              <th
                onClick={() => handleSort('imdbID')}
                style={{ cursor: 'pointer', padding: '12px 8px', fontWeight: 600, color: '#334155' }}
              >
                imdbID
                {sortConfig.key === 'imdbID' && (
                  <span style={{ marginLeft: '5px' }}>{sortConfig.direction === 'asc' ? '🔼' : sortConfig.direction === 'desc' ? '🔽' : ''}</span>
                )}
              </th>
              <th
                onClick={() => handleSort('status')}
                style={{ cursor: 'pointer', padding: '12px 8px', fontWeight: 600, color: '#334155' }}
              >
                Status
                {sortConfig.key === 'status' && (
                  <span style={{ marginLeft: '5px' }}>{sortConfig.direction === 'asc' ? '🔼' : sortConfig.direction === 'desc' ? '🔽' : ''}</span>
                )}
              </th>
              <th
                onClick={() => handleSort('started')}
                style={{ cursor: 'pointer', padding: '12px 8px', fontWeight: 600, color: '#334155' }}
              >
                Started
                {sortConfig.key === 'started' && (
                  <span style={{ marginLeft: '5px' }}>{sortConfig.direction === 'asc' ? '🔼' : sortConfig.direction === 'desc' ? '🔽' : ''}</span>
                )}
              </th>
              <th
                onClick={() => handleSort('finished')}
                style={{ cursor: 'pointer', padding: '12px 8px', fontWeight: 600, color: '#334155' }}
              >
                Finished
                {sortConfig.key === 'finished' && (
                  <span style={{ marginLeft: '5px' }}>{sortConfig.direction === 'asc' ? '🔼' : sortConfig.direction === 'desc' ? '🔽' : ''}</span>
                )}
              </th>
              <th style={{ padding: '12px 8px', fontWeight: 600, color: '#334155' }}>Poster</th>
              <th style={{ padding: '12px 8px', fontWeight: 600, color: '#334155' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedMovies.map(movie => {
              const movieKey = getMovieKey(movie);
              return (
                <tr key={movieKey} style={{ borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
                  <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                    <input
                      type="checkbox"
                      onChange={(e) => handleSelectMovie(e, movieKey)}
                      checked={selectedMovies.includes(movieKey)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '10px 8px', fontWeight: 500 }}>{movie.Title}</td>
                  <td style={{ padding: '10px 8px', color: '#64748b' }}>{movie.Year}</td>
                  <td style={{ padding: '10px 8px', color: '#64748b' }}>{movie.imdbID || <span style={{ color: '#b91c1c', fontStyle: 'italic' }}>N/A</span>}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <LockedInputWrapper fieldId={`movie-${movieKey}-status`} cmsData={cmsData}>
                      <select
                        value={movie.status || 'watching'}
                        onChange={e => handleMovieFieldChange(movieKey, 'status', e.target.value)}
                        style={{
                          padding: '6px 10px',
                          fontSize: '1rem',
                          background: '#f9fafb',
                          border: '1.5px solid #cbd5e1'
                        }}
                      >
                        {MOVIE_STATUSES.map(status => (
                          <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                        ))}
                      </select>
                    </LockedInputWrapper>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <LockedInputWrapper fieldId={`movie-${movieKey}-started`} cmsData={cmsData}>
                      <input
                        type="date"
                        value={movie.started || ''}
                        onChange={e => handleMovieFieldChange(movieKey, 'started', e.target.value)}
                        style={{
                          padding: '6px 10px',
                          fontSize: '1rem',
                          background: '#f9fafb',
                          border: '1.5px solid #cbd5e1'
                        }}
                      />
                    </LockedInputWrapper>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <LockedInputWrapper fieldId={`movie-${movieKey}-finished`} cmsData={cmsData}>
                      <input
                        type="date"
                        value={movie.finished || ''}
                        onChange={e => handleMovieFieldChange(movieKey, 'finished', e.target.value)}
                        style={{
                          padding: '6px 10px',
                          fontSize: '1rem',
                          background: '#f9fafb',
                          border: '1.5px solid #cbd5e1'
                        }}
                      />
                    </LockedInputWrapper>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    {movie.Poster && movie.Poster !== 'N/A' ? (
                      <img src={movie.Poster} alt={movie.Title} style={{ width: '60px', height: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }} />
                    ) : (
                      <span style={{ color: '#64748b', fontStyle: 'italic' }}>No poster</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <button
                      onClick={() => handleDeleteClick(movieKey)}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '1rem',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
            {sortedMovies.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '1.1rem' }}>
                  No movies found in your list.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* OMDb Search Results Modal */}
      {omdbModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000
          }}
        >
          <div
            style={{
              background: 'white',
              maxWidth: '900px',
              width: '95%',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
              padding: '32px 24px 24px 24px',
              position: 'relative'
            }}
          >
            <button
              onClick={handleCloseOmdbModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                color: '#64748b',
                cursor: 'pointer',
                fontWeight: 700,
                zIndex: 1
              }}
              aria-label="Close OMDb Results"
            >
              ×
            </button>
            <h2 style={{ fontWeight: 600, fontSize: '1.2rem', color: '#1e293b', marginBottom: '18px', textAlign: 'center' }}>OMDb Search Results</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
              {results.map((item) => {
                const itemKey = getMovieKey(item);
                return (
                  <div key={itemKey} style={{
                    border: '1.5px solid #e5e7eb',
                    padding: '18px',
                    width: '240px',
                    background: '#f9fafb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '10px', fontWeight: 600, color: '#334155', textAlign: 'center' }}>
                      {item.Title} <span style={{ color: '#64748b', fontWeight: 400 }}>({item.Year})</span>
                    </h3>
                    {item.Poster && item.Poster !== 'N/A' ? (
                      <img src={item.Poster} alt={item.Title} style={{ width: '100%', height: 'auto', marginBottom: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }} />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '320px',
                        background: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        fontStyle: 'italic'
                      }}>No poster</div>
                    )}
                    <button
                      onClick={() => addToList(item)}
                      disabled={(movieList || []).some(m => getMovieKey(m) === itemKey)}
                      style={{
                        padding: '10px 18px',
                        border: 'none',
                        backgroundColor: (movieList || []).some(m => getMovieKey(m) === itemKey) ? '#cbd5e1' : '#22c55e',
                        color: 'white',
                        cursor: (movieList || []).some(m => getMovieKey(m) === itemKey) ? 'not-allowed' : 'pointer',
                        width: '100%',
                        fontWeight: 500,
                        fontSize: '1rem',
                        marginTop: '10px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
                      }}
                    >
                      {(movieList || []).some(m => getMovieKey(m) === itemKey) ? 'Added' : 'Add to my list'}
                    </button>
                  </div>
                );
              })}
              {results.length === 0 && (
                <div style={{ color: '#64748b', fontSize: '1.05rem', fontStyle: 'italic', marginTop: '12px' }}>
                  No OMDb results yet. Try searching above!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Movie Modal */}
      {addMovieModalOpen && (
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
          zIndex: 3000
        }}>
          <form
            onSubmit={handleAddMovieSubmit}
            style={{
              backgroundColor: 'white',
              padding: '32px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.13)',
              maxWidth: '420px',
              width: '95%',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '1.25rem', fontWeight: 600, color: '#1d4ed8' }}>Add Movie</h2>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              <span style={{ fontWeight: 500 }}>Title:</span>
              <input
                type="text"
                name="Title"
                value={newMovie.Title}
                onChange={handleAddMovieInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1rem',
                  background: '#f9fafb'
                }}
                required
              />
            </label>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              <span style={{ fontWeight: 500 }}>Year:</span>
              <input
                type="text"
                name="Year"
                value={newMovie.Year}
                onChange={handleAddMovieInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1rem',
                  background: '#f9fafb'
                }}
                required
              />
            </label>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              <span style={{ fontWeight: 500 }}>imdbID (optional):</span>
              <input
                type="text"
                name="imdbID"
                value={newMovie.imdbID}
                onChange={handleAddMovieInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1rem',
                  background: '#f9fafb'
                }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              <span style={{ fontWeight: 500 }}>Poster URL (optional):</span>
              <input
                type="text"
                name="Poster"
                value={newMovie.Poster}
                onChange={handleAddMovieInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1rem',
                  background: '#f9fafb'
                }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              <span style={{ fontWeight: 500 }}>Status:</span>
              <select
                name="status"
                value={newMovie.status}
                onChange={handleAddMovieInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1rem',
                  background: '#f9fafb'
                }}
              >
                {MOVIE_STATUSES.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </label>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              <span style={{ fontWeight: 500 }}>Started Date:</span>
              <input
                type="date"
                name="started"
                value={newMovie.started}
                onChange={handleAddMovieInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1rem',
                  background: '#f9fafb'
                }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              <span style={{ fontWeight: 500 }}>Finished Date:</span>
              <input
                type="date"
                name="finished"
                value={newMovie.finished}
                onChange={handleAddMovieInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1rem',
                  background: '#f9fafb'
                }}
              />
            </label>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="button"
                onClick={handleCloseAddMovieModal}
                style={{
                  padding: '10px 18px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: 'white',
                  color: '#334155',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  backgroundColor: '#1d4ed8',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '1rem'
                }}
              >
                Add Movie
              </button>
            </div>
          </form>
        </div>
      )}

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
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.25rem', fontWeight: 600, color: '#ef4444' }}>Confirm Delete</h2>
            <p style={{ marginBottom: '25px', color: '#64748b', fontSize: '1rem' }}>
              {selectedMovies.length > 0
                ? `Are you sure you want to delete ${selectedMovies.length} selected movie(s)?`
                : 'Are you sure you want to delete this movie?'} This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={handleCancelDelete} style={{
                padding: '10px 18px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: 'white',
                color: '#334155',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '1rem'
              }}>Cancel</button>
              <button onClick={handleConfirmDelete} style={{
                padding: '10px 18px',
                border: 'none',
                backgroundColor: '#ef4444',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '1rem'
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MoviesSection;
