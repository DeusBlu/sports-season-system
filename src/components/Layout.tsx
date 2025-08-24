import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthButton } from './AuthButton';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="layout">
      {/* Top Navigation */}
      <header className="top-nav">
        <div className="nav-brand">
          <h1>Sports Season System</h1>
        </div>
        <div className="nav-center">
          <nav className="top-nav-links">
            <Link 
              to="/hockey" 
              className={location.pathname.startsWith('/hockey') ? 'active' : ''}
            >
              Hockey
            </Link>
          </nav>
        </div>
        <div className="nav-auth">
          <AuthButton />
        </div>
      </header>

      <div className="layout-body">
        {/* Left Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <Link 
              to="/hockey/schedule" 
              className={location.pathname.includes('/schedule') ? 'active' : ''}
            >
              Schedule
            </Link>
            <Link 
              to="/hockey/manage-seasons" 
              className={location.pathname.includes('/manage-seasons') ? 'active' : ''}
            >
              Manage Seasons
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
