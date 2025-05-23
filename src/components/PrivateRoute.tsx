
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

interface PrivateRouteProps {
  children: ReactNode;
  allowedRole?: UserRole;
}

const PrivateRoute = ({ children, allowedRole }: PrivateRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse-opacity text-3xl font-semibold text-wealth-primary">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the location they were trying to access for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is specified, check if user has that role
  if (allowedRole && user?.role !== allowedRole) {
    // Redirect admins to admin dashboard, employees to map view
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/properties/map'} />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
