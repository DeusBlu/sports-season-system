import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAppDispatch } from '../store/hooks';
import { setAuth, clearAuth } from '../store/slices/authSlice';
import { loadUserSeasons, clearSeasons } from '../store/slices/seasonsSlice';

export default function AuthSync() {
  const { isAuthenticated, user, isLoading } = useAuth0();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Set auth state
        dispatch(setAuth({ isAuthenticated, user }));
        
        // Load user seasons automatically on login
        if (user.sub) {
          dispatch(loadUserSeasons(user.sub));
        }
      } else {
        // Clear auth and seasons on logout
        dispatch(clearAuth());
        dispatch(clearSeasons());
      }
    }
  }, [isAuthenticated, user, isLoading, dispatch]);

  return null; // This component doesn't render anything
}
