import { FC, ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactElement;
  requiresAuth?: boolean;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, requiresAuth = true }) => {
  const { isAuthenticated, startup, loading } = useAuth();
  const location = useLocation();

  // Show a loading state or return null while authentication state is loading
  if (loading) {
    // You can return a loading spinner or null here
    return null; // or return <LoadingSpinner /> if you have one
  }

  // Allow access to the homepage (/) without authentication
  if (location.pathname === '/') {
    return children;
  }

  // Allow access to login and register pages without authentication
  if (['/login', '/signup', '/create-startup'].includes(location.pathname)) {
    return children;
  }

  console.log('isAuthenticated', isAuthenticated);

  // If the route requires authentication and the user is not authenticated, redirect to login
  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user is not associated with a startup, redirect to create-startup
  if (
    requiresAuth &&
    isAuthenticated &&
    !['/logout', '/profile'].includes(location.pathname) &&
    !startup
  ) {
    return <Navigate to="/no-startup" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
