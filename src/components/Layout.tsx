import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { AuthButton } from './AuthButton';
import { usePermissions, PERMISSIONS } from '../hooks/usePermissions';
import { useAppSelector } from '../store/hooks';
import { selectAllUserSeasons } from '../store/slices/seasonsSlice';
import { Shield, Crown, Users } from 'lucide-react';
import { getSeasonStatusLabel } from '../constants/seasonStatus';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth0();
  const { hasPermission } = usePermissions();
  const canViewAllSeasons = hasPermission(PERMISSIONS.VIEW_ALL_SEASONS);
  
  // Get seasons from Redux store
  const allUserSeasons = useAppSelector(selectAllUserSeasons);
  
  // Filter for hockey seasons only
  const userSeasons = allUserSeasons.filter(season => 
    !season.sportsType || season.sportsType === 'Hockey' || season.game?.toLowerCase().includes('hockey')
  );

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
              className={location.pathname.startsWith('/hockey') ? styles.active : ''}
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
            {/* Seasons Heading (non-clickable) */}
            <div style={{ 
              padding: '0.75rem 1rem', 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: 'rgba(255, 255, 255, 0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em' 
            }}>
              Seasons
            </div>
            
            {/* Individual Season Links */}
            {userSeasons.length > 0 ? (
              userSeasons.map(season => (
                <Link
                  key={season.id}
                  to={`/hockey/seasons/${season.id}`}
                  className={location.pathname.includes(`/seasons/${season.id}`) ? styles.active : ''}
                  style={{
                    paddingLeft: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {season.ownerId === user?.sub ? (
                      <Crown style={{ width: '0.875rem', height: '0.875rem', color: '#fbbf24' }} />
                    ) : (
                      <Users style={{ width: '0.875rem', height: '0.875rem', color: '#3b82f6' }} />
                    )}
                    <span>{season.name}</span>
                  </div>
                  {season.status && (
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '0.25rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.8)'
                    }}>
                      {getSeasonStatusLabel(season.status)}
                    </span>
                  )}
                </Link>
              ))
            ) : (
              isAuthenticated && (
                <div style={{
                  paddingLeft: '2rem',
                  padding: '0.75rem 2rem',
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontStyle: 'italic'
                }}>
                  No seasons yet
                </div>
              )
            )}
            
            <Link 
              to="/hockey/manage-seasons" 
              className={location.pathname.includes('/manage-seasons') ? styles.active : ''}
            >
              Manage Seasons
            </Link>
            {canViewAllSeasons && (
              <>
                <div className={styles.separator}></div>
                <Link 
                  to="/admin" 
                  className={location.pathname.includes('/admin') ? styles.active : ''}
                >
                  <Shield style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                  System Admin
                </Link>
              </>
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
