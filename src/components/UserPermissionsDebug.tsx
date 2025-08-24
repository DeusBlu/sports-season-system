import { useAuth0 } from '@auth0/auth0-react';
import { usePermissions } from '../hooks/usePermissions';

export function UserPermissionsDebug() {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { permissions, hasPermission } = usePermissions();

  const checkAccessToken = async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE
        }
      });
      console.log('Access Token:', token);
      
      // Decode JWT to see claims (for debugging only)
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token Payload:', payload);
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  };

  if (!isAuthenticated) {
    return <div className="p-4 bg-gray-100 rounded">User not authenticated</div>;
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg space-y-4">
      <h3 className="font-bold text-lg">User Permissions Debug</h3>
      
      <div>
        <h4 className="font-semibold">User ID:</h4>
        <p className="text-sm text-gray-600">{user?.sub}</p>
      </div>

      <div>
        <h4 className="font-semibold">Email:</h4>
        <p className="text-sm text-gray-600">{user?.email}</p>
      </div>

      <div>
        <h4 className="font-semibold">Permissions ({permissions.length}):</h4>
        {permissions.length > 0 ? (
          <ul className="list-disc list-inside text-sm text-gray-600">
            {permissions.map((perm, index) => (
              <li key={index}>{perm}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-red-600">No permissions found</p>
        )}
      </div>

      <div>
        <h4 className="font-semibold">Permission Checks:</h4>
        <div className="text-sm space-y-1">
          <p>Create Season: {hasPermission('create:season') ? '✅' : '❌'}</p>
          <p>Delete Season: {hasPermission('delete:season') ? '✅' : '❌'}</p>
          <p>Admin Access: {hasPermission('admin:access') ? '✅' : '❌'}</p>
        </div>
      </div>

      <div>
        <h4 className="font-semibold">Full User Object:</h4>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <button 
        onClick={checkAccessToken}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Check Access Token
      </button>
    </div>
  );
}
