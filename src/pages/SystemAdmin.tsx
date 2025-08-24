import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Trash2, Crown, Users, Calendar, Shield } from 'lucide-react';
import { getSeasonStatusLabel, getSeasonStatusColor } from '../constants/seasonStatus';
import { usePermissions, PERMISSIONS } from '../hooks/usePermissions';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadAllSeasons, adminDeleteSeason, selectAllSeasons, selectSeasonsLoading } from '../store/slices/seasonsSlice';
import styles from './SystemAdmin.module.css';

export default function SystemAdmin() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const dispatch = useAppDispatch();
  
  // Redux state
  const allSeasons = useAppSelector(selectAllSeasons);
  const loading = useAppSelector(selectSeasonsLoading);
  
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Check if user has permission to view this page
  const canViewAllSeasons = hasPermission(PERMISSIONS.VIEW_ALL_SEASONS);
  const canDeleteSeasons = hasPermission(PERMISSIONS.DELETE_SEASONS);

  useEffect(() => {
    if (!permissionsLoading && isAuthenticated && canViewAllSeasons) {
      dispatch(loadAllSeasons());
    }
  }, [dispatch, isAuthenticated, canViewAllSeasons, permissionsLoading]);

  const handleDeleteSeason = async (seasonId: string) => {
    if (!canDeleteSeasons || !confirm('Are you sure you want to delete this season? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(seasonId);
      const accessToken = await getAccessTokenSilently();
      // Use Redux to delete season
      await dispatch(adminDeleteSeason({ seasonId, accessToken }));
    } catch (error) {
      console.error('Failed to delete season:', error);
      alert('Failed to delete season. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (permissionsLoading) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.loadingState}>
          <div className={styles.stateContent}>
            <div className={styles.spinner}></div>
            <p className={styles.stateMessage}>Loading permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.errorState}>
          <div className={styles.stateContent}>
            <Shield className={styles.stateIcon} style={{ color: '#9ca3af' }} />
            <h1 className={styles.stateTitle}>Authentication Required</h1>
            <p className={styles.stateMessage}>Please log in to access the System Admin panel.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!canViewAllSeasons) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.errorState}>
          <div className={styles.stateContent}>
            <Shield className={styles.stateIcon} style={{ color: '#f87171' }} />
            <h1 className={styles.stateTitle}>Access Denied</h1>
            <p className={styles.stateMessage}>You don't have permission to view all seasons.</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Required permission: <code>admin:view_all_seasons</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminContent}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={styles.adminHeader}>
            <h1 className={styles.adminTitle}>
              <Shield style={{ width: '2rem', height: '2rem', color: '#3b82f6' }} />
              <span>System Administration</span>
            </h1>
            <p className={styles.adminSubtitle}>
              View and manage all seasons across the system
            </p>
            
            {/* Permission indicators */}
            <div className={styles.permissionIndicators}>
              <div className={`${styles.permissionBadge} ${canViewAllSeasons ? styles.permissionGranted : styles.permissionDenied}`}>
                <span>View All Seasons</span>
                {canViewAllSeasons ? '✓' : '✗'}
              </div>
              <div className={`${styles.permissionBadge} ${canDeleteSeasons ? styles.permissionGranted : styles.permissionDenied}`}>
                <span>Delete Seasons</span>
                {canDeleteSeasons ? '✓' : '✗'}
              </div>
            </div>
          </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.stateContent}>
              <div className={styles.spinner}></div>
              <p className={styles.stateMessage}>Loading all seasons...</p>
            </div>
          </div>
        ) : allSeasons.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.stateContent}>
              <Calendar className={styles.stateIcon} style={{ color: '#9ca3af' }} />
              <h3 className={styles.stateTitle}>No seasons found</h3>
              <p className={styles.stateMessage}>There are no seasons in the system yet.</p>
            </div>
          </div>
        ) : (
          <div className={styles.seasonsGrid}>
            {allSeasons.map((season) => (
              <div key={season.id} className={styles.seasonCard}>
                <div className={styles.seasonHeader}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={styles.seasonTitleRow}>
                      <Crown style={{ width: '1.5rem', height: '1.5rem', color: '#eab308' }} />
                      <h3 className={styles.seasonTitle}>
                        {season.name}
                      </h3>
                      <span className={`${styles.statusBadge} ${
                        season.status ? getSeasonStatusColor(season.status) : 'bg-gray-100 text-gray-800 border-gray-300'
                      }`}>
                        {season.status ? getSeasonStatusLabel(season.status) : 'Unknown'}
                      </span>
                    </div>
                    
                    <div className={styles.seasonInfo}>
                      <div className={`${styles.infoBox} ${styles.infoBoxGame}`}>
                        <Calendar style={{ width: '1.25rem', height: '1.25rem' }} />
                        <span style={{ fontWeight: 500 }}>{season.game || 'Hockey'}</span>
                      </div>
                      <div className={`${styles.infoBox} ${styles.infoBoxPlayers}`}>
                        <Users style={{ width: '1.25rem', height: '1.25rem' }} />
                        <span style={{ fontWeight: 500 }}>{season.numberOfPlayers || 0} players</span>
                      </div>
                      <div className={`${styles.infoBox} ${styles.infoBoxOwner}`}>
                        <div>
                          <span className={styles.infoLabel}>Owner:</span>
                          <span className={`${styles.infoValue} ${styles.ownerValue}`}>{season.ownerId || 'Unknown'}</span>
                        </div>
                      </div>
                      <div className={`${styles.infoBox} ${styles.infoBoxDate}`}>
                        <div>
                          <span className={styles.infoLabel}>Created:</span>
                          <span className={styles.infoValue}>{
                            season.createdAt ? new Date(season.createdAt).toLocaleDateString() : 'Unknown'
                          }</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {canDeleteSeasons && (
                    <div style={{ marginLeft: '1.5rem' }}>
                      <button
                        onClick={() => handleDeleteSeason(season.id!)}
                        disabled={deleteLoading === season.id}
                        className={styles.deleteButton}
                      >
                        {deleteLoading === season.id ? (
                          <div className={styles.spinner} style={{ width: '1rem', height: '1rem' }}></div>
                        ) : (
                          <>
                            <Trash2 style={{ width: '1rem', height: '1rem' }} />
                            Delete Season
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
