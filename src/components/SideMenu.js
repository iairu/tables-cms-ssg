import React, { useState } from 'react';
import { Link } from 'gatsby';

const pathFromSection = {
  pages: 'pages',
  blog: 'blog',
  cats: 'pedigree',
  'rental-inventory': 'inventory',
  'rental-attendance': 'attendance',
  'rental-customers': 'customers',
  'rental-employees': 'employees',
  'rental-reservations': 'reservations',
  'rental-calendar': 'calendar',
  settings: 'settings',
  extensions: 'extensions'
};

const SideMenu = ({ currentSection, isBuilding, lastSaved, onBuildClick, canBuild, buildCooldownSeconds, domain, vercelApiKey }) => {
  const [isRentalSubMenuOpen, setIsRentalSubMenuOpen] = useState(false);
  let extensions = {};
  try {
    extensions = JSON.parse(localStorage.getItem('extensions') || '{}');
  } catch (e) {
    extensions = {};
  }

  const handleBuildClick = (e, localOnly = false) => {
    e.preventDefault();
    if (onBuildClick && !isBuilding && canBuild) {
      onBuildClick(localOnly);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRentalSubMenu = (e) => {
    e.preventDefault();
    setIsRentalSubMenuOpen(!isRentalSubMenuOpen);
  };

  return (
    <aside className="side-menu">
      <div>
        <h3>Content</h3>
        {(() => {
          
          return (
            <>
              {extensions['pages-extension-enabled'] && (
                <Link
                  to={`/cms/${pathFromSection.pages}`}
                  className={currentSection === 'pages' ? 'active' : ''}
                >
                  Pages
                </Link>
              )}
              {extensions['blog-extension-enabled'] && (
                <Link
                  to={`/cms/${pathFromSection.blog}`}
                  className={currentSection === 'blog' ? 'active' : ''}
                >
                  Blog
                </Link>
              )}
              {extensions['pedigree-extension-enabled'] && (
                <Link
                  to={`/cms/${pathFromSection.cats}`}
                  className={currentSection === 'cats' ? 'active' : ''}
                >
                  Pedigree
                </Link>
              )}
              {extensions['rental-extension-enabled'] && (
                <div>
                      <Link to={`/cms/${pathFromSection['rental-inventory']}`} className={currentSection === 'rental-inventory' ? 'active' : ''}>
                        Inventory
                      </Link>
                      <Link to={`/cms/${pathFromSection['rental-attendance']}`} className={currentSection === 'rental-attendance' ? 'active' : ''}>
                        Attendance
                      </Link>
                      <Link to={`/cms/${pathFromSection['rental-customers']}`} className={currentSection === 'rental-customers' ? 'active' : ''}>
                        Customers
                      </Link>
                      <Link to={`/cms/${pathFromSection['rental-employees']}`} className={currentSection === 'rental-employees' ? 'active' : ''}>
                        Employees
                      </Link>
                      <Link to={`/cms/${pathFromSection['rental-reservations']}`} className={currentSection === 'rental-reservations' ? 'active' : ''}>
                        Reservations
                      </Link>
                      <Link to={`/cms/${pathFromSection['rental-calendar']}`} className={currentSection === 'rental-calendar' ? 'active' : ''}>
                        Calendar
                      </Link>
                    </div>
              )}
            </>
          );
        })()}
        {/* <a 
          href="#components" 
          onClick={(e) => handleClick(e, 'components')}
          className={currentSection === 'components' ? 'active' : ''}
        >
          Components
        </a>*/}
      </div>
      <div>
        <h3>Configuration</h3>
        <Link
          to={`/cms/${pathFromSection.settings}`}
          className={currentSection === 'settings' ? 'active' : ''}
        >
          Settings
        </Link>
        {/* <a 
          href="#acl" 
          onClick={(e) => handleClick(e, 'acl')}
          className={currentSection === 'acl' ? 'active' : ''}
        >
          ACL
        </a>*/}
        <Link
          to={`/cms/${pathFromSection.extensions}`}
          className={currentSection === 'extensions' ? 'active' : ''}
        >
          Extensions
        </Link>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </aside>
  );
};

export default SideMenu;