
import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, refreshProfile } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      // If still loading auth state, wait
      if (loading) {
        console.log("Auth still loading, waiting...");
        return;
      }
      
      // If there's a user but we're not sure about the profile, refresh it
      if (user && !loading) {
        console.log("User authenticated, ensuring profile is loaded");
        try {
          await refreshProfile();
        } catch (error) {
          console.error("Error refreshing profile in ProtectedRoute:", error);
        }
      }
      
      setIsChecking(false);
    };
    
    checkAuth();
  }, [user, loading, refreshProfile]);
  
  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    console.log("Redirecting to login, no user");
    return <Navigate to="/login" replace />;
  }
  
  console.log("Rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;
