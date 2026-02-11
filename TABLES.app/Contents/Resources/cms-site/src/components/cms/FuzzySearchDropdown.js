import React, { useState, useRef, useEffect } from 'react';
import { fuzzyMatch } from './utils';

const FuzzySearchDropdown = ({ options, value, onChange, placeholder, onFocus, onBlur, disabled, style }) => {
  const [inputValue, setInputValue] = useState(value);
  const [showOptions, setShowOptions] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const query = e.target.value;
    setInputValue(query);
    if (query) {
      const matchedOptions = options.filter((option) =>
        fuzzyMatch(option.fullName || '', query)
      );
      setFilteredOptions(matchedOptions);
      setShowOptions(true);
    } else {
      setFilteredOptions([]);
      setShowOptions(false);
    }
  };

  const handleOptionClick = (option) => {
    onChange(option.fullName);
    setInputValue(option.fullName);
    setShowOptions(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={(e) => {
          setShowOptions(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          if (onBlur) onBlur(e);
        }}
        disabled={disabled}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px',
          border: '1px solid #cbd5e1',
          ...(style || {})
        }}
      />
      {showOptions && (
        <ul
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',

            listStyle: 'none',
            padding: 0,
            margin: 0,
            zIndex: 100
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li
                key={index}
                onClick={() => handleOptionClick(option)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #e2e8f0'
                }}
              >
                {option.fullName}
              </li>
            ))
          ) : (
            <li style={{ padding: '10px', color: '#64748b' }}>No matches found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default FuzzySearchDropdown;
