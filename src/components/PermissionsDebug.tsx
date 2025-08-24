import React from 'react';
import { usePermissions, PERMISSIONS } from '../hooks/usePermissions';

export const PermissionsDebug: React.FC = () => {
  const { permissions, hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return <div>Loading permissions...</div>;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px', 
      zIndex: 1000,
      maxWidth: '300px',
      fontSize: '12px'
    }}>
      <h4>Permissions Debug</h4>
      <p><strong>Raw permissions:</strong> {JSON.stringify(permissions)}</p>
      <p><strong>VIEW_ALL_SEASONS:</strong> {hasPermission(PERMISSIONS.VIEW_ALL_SEASONS) ? '✅' : '❌'}</p>
      <p><strong>DELETE_SEASONS:</strong> {hasPermission(PERMISSIONS.DELETE_SEASONS) ? '✅' : '❌'}</p>
      <p><strong>Expected permissions:</strong> admin:view_all_seasons, admin:delete_seasons</p>
    </div>
  );
};
