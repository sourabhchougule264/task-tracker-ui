import React, { useEffect } from 'react';
import { useAppSelector } from '../../store';

/**
 * Debug component to log auth state changes
 * Remove this in production
 */
const AuthDebugger: React.FC = () => {
  const auth = useAppSelector((state) => state.auth);

  useEffect(() => {
    console.log('🔍 Auth State Changed:', {
      isAuthenticated: auth.isAuthenticated,
      loading: auth.loading,
      hasUser: !!auth.user,
      user: auth.user,
      error: auth.error,
    });
  }, [auth]);

  return null; // This component doesn't render anything
};

export default AuthDebugger;

