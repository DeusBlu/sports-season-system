import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';

export interface UserPermissions {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isLoading: boolean;
}

export const usePermissions = (): UserPermissions => {
  const { user, isLoading: authLoading, getAccessTokenSilently } = useAuth0();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (authLoading || !user) {
        setPermissionsLoading(false);
        return;
      }

      try {
        // Get access token which contains permissions
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });

        // Decode the token to get permissions
        const payload = JSON.parse(atob(token.split('.')[1]));
        const tokenPermissions = payload.permissions || [];
        
        console.log('Access token payload:', payload);
        console.log('Token permissions:', tokenPermissions);
        
        setPermissions(tokenPermissions);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        
        // Fallback: try to get permissions from user object
        let fallbackPermissions: string[] = [];
        if (user) {
          const possibleClaims = [
            user['urn:sports-season-system:api/permissions'],
            user[`${import.meta.env.VITE_AUTH0_AUDIENCE}/permissions`],
            user.permissions,
            user['https://sports-season-system.com/permissions'],
            user['urn:sports-season-system:api']?.permissions
          ];
          
          for (const claim of possibleClaims) {
            if (Array.isArray(claim)) {
              fallbackPermissions = claim;
              break;
            }
          }
        }
        
        console.log('Fallback permissions from user object:', fallbackPermissions);
        setPermissions(fallbackPermissions);
      } finally {
        setPermissionsLoading(false);
      }
    };

    fetchPermissions();
  }, [authLoading, user, getAccessTokenSilently]);

  const isLoading = authLoading || permissionsLoading;

  const hasPermission = (permission: string): boolean => {
    if (isLoading) return false;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (perms: string[]): boolean => {
    if (isLoading) return false;
    return perms.some(perm => permissions.includes(perm));
  };

  const hasAllPermissions = (perms: string[]): boolean => {
    if (isLoading) return false;
    return perms.every(perm => permissions.includes(perm));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading
  };
};

// Common permission constants
export const PERMISSIONS = {
  // Season management
  CREATE_SEASON: 'create:season',
  READ_SEASON: 'read:season',
  UPDATE_SEASON: 'update:season',
  DELETE_SEASON: 'delete:season',
  
  // Game management
  CREATE_GAME: 'create:game',
  READ_GAME: 'read:game',
  UPDATE_GAME: 'update:game',
  DELETE_GAME: 'delete:game',
  
  // User management
  MANAGE_USERS: 'manage:users',
  READ_USERS: 'read:users',
  
  // Admin permissions
  ADMIN_ACCESS: 'admin:access',
  SYSTEM_SETTINGS: 'manage:system',
  VIEW_ALL_SEASONS: 'admin:view_all_seasons',
  DELETE_SEASONS: 'admin:delete_seasons'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
