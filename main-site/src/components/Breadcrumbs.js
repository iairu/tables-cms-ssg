import React from 'react';
import { t } from '../utils/localization';

/**
 * Breadcrumbs component for navigation
 * @param {Object} props
 * @param {Array} props.items - Array of breadcrumb items [{label, href}]
 * @param {string} props.currentLanguage - Current language code
 */
const Breadcrumbs = ({ items = [], currentLanguage = 'en' }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb"
      style={{
        padding: '1rem 0',
        fontSize: '0.875rem',
        color: '#64748b'
      }}
    >
      <ol style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        gap: '0.5rem'
      }}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {index > 0 && (
                <span 
                  style={{ 
                    color: '#cbd5e0',
                    userSelect: 'none'
                  }}
                  aria-hidden="true"
                >
                  /
                </span>
              )}
              {isLast ? (
                <span 
                  style={{ 
                    color: '#0f172a',
                    fontWeight: '500'
                  }}
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <a 
                  href={item.href}
                  style={{
                    color: '#667eea',
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = '#764ba2';
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = '#667eea';
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;