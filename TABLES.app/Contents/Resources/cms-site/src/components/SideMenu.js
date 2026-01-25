import React, { useState, memo } from 'react';
import { Link } from 'gatsby';

const pathFromSection = {
  pages: 'pages',
  'page-groups': 'page-groups',
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

const SideMenu = memo(({ currentSection, isBuilding, lastSaved, onBuildClick, canBuild, buildCooldownSeconds, domain, vercelApiKey }) => {
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
                  <i className="fa fa-file" style={{ marginRight: '8px' }}></i>
                  Pages
                </Link>
              )}
              {extensions['pages-extension-enabled'] && (
                <Link
                  to={`/cms/${pathFromSection['page-groups']}`}
                  className={currentSection === 'page-groups' ? 'active' : ''}
                >
                  <i className="fa fa-layer-group" style={{ marginRight: '8px' }}></i>
                  Page Groups
                </Link>
              )}
              {extensions['blog-extension-enabled'] && (
                <Link
                  to={`/cms/${pathFromSection.blog}`}
                  className={currentSection === 'blog' ? 'active' : ''}
                >
                  <i className="fa fa-blog" style={{ marginRight: '8px' }}></i>
                  Blog
                </Link>
              )}
              {extensions['pedigree-extension-enabled'] && (
                <Link
                  to={`/cms/${pathFromSection.cats}`}
                  className={currentSection === 'cats' ? 'active' : ''}
                >
                  <i className="fa fa-paw" style={{ marginRight: '8px' }}></i>
                  Pedigree
                </Link>
              )}
              {extensions['rental-extension-enabled'] && (
                <div>
                      <Link to={`/cms/${pathFromSection['rental-inventory']}`} className={currentSection === 'rental-inventory' ? 'active' : ''}>
                        <i className="fa fa-box" style={{ marginRight: '8px' }}></i>
                        Inventory
                      </Link>
                      <Link to={`/cms/${pathFromSection['rental-attendance']}`} className={currentSection === 'rental-attendance' ? 'active' : ''}>
                        <i className="fa fa-calendar-check" style={{ marginRight: '8px' }}></i>
                        Attendance
                      </Link>
                      <Link to={`/cms/${pathFromSection['rental-customers']}`} className={currentSection === 'rental-customers' ? 'active' : ''}>
                        <i className="fa fa-users" style={{ marginRight: '8px' }}></i>
                        Customers
                      </Link>
                      <Link to={`/cms/${pathFromSection['rental-employees']}`} className={currentSection === 'rental-employees' ? 'active' : ''}>
                        <i className="fa fa-user-tie" style={{ marginRight: '8px' }}></i>
                        Employees
                      </Link>
                      <Link to={`/cms/${pathFromSection['rental-reservations']}`} className={currentSection === 'rental-reservations' ? 'active' : ''}>
                        <i className="fa fa-clipboard-list" style={{ marginRight: '8px' }}></i>
                        Reservations
                      </Link>
                      <Link to={`/cms/${pathFromSection['rental-calendar']}`} className={currentSection === 'rental-calendar' ? 'active' : ''}>
                        <i className="fa fa-calendar" style={{ marginRight: '8px' }}></i>
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
          <i className="fa fa-cog" style={{ marginRight: '8px' }}></i>
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
          <i className="fa fa-puzzle-piece" style={{ marginRight: '8px' }}></i>
          Extensions
        </Link>
        <Link
          to="/cms/uploads"
          className={currentSection === 'uploads' ? 'active' : ''}
        >
          <i className="fa fa-upload" style={{ marginRight: '8px' }}></i>
          Uploads
        </Link>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </aside>
  );
});

export default SideMenu;