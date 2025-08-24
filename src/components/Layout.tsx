import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthButton } from './AuthButton';
import { usePermissions, PERMISSIONS } from '../hooks/usePermissions';
import { Shield } from 'lucide-react';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const canViewAllSeasons = hasPermission(PERMISSIONS.VIEW_ALL_SEASONS);

  return (
    <div className={styles.layout}>
      {/* Top Navigation */}
      <header className={styles.topNav}>
        <div className={styles.navBrand}>
          <h1>Sports Season System</h1>
        </div>
        <div className={styles.navCenter}>
          <nav className={styles.topNavLinks}>
            <Link 
              to="/hockey" 
              className={location.pathname.startsWith('/hockey') ? 'active' : ''}
            >
              Hockey
            </Link>
          </nav>
        </div>
        <div className={styles.navAuth}>
          <AuthButton />
        </div>
      </header>

      <div className={styles.mainContainer}>
        {/* Left Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            <Link 
              to="/hockey/seasons" 
              className={location.pathname.includes('/seasons') ? 'active' : ''}
            >
              Seasons
            </Link>
            <Link 
              to="/hockey/manage-seasons" 
              className={location.pathname.includes('/manage-seasons') ? 'active' : ''}
            >
              Manage Seasons
            </Link>
            {canViewAllSeasons && (
              <Link 
                to="/admin" 
                className={`${location.pathname.includes('/admin') ? 'active' : ''} ${styles.adminLink}`}
              >
                <Shield style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                System Admin
              </Link>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
