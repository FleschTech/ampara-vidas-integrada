
import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
  const { user, role, loading, refreshProfile } = useAuth();
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    const checkAccess = async () => {
      try {
        // If still loading auth state, wait
        if (loading) {
          console.log("Auth still loading, waiting...");
          return;
        }
        
        // If no user, no access
        if (!user) {
          console.log("No user, denying access");
          setHasAccess(false);
          setIsCheckingRole(false);
          return;
        }
        
        // Double-check that we have the role, if not try to refresh the profile
        if (!role) {
          console.log("No role found, attempting to refresh profile");
          await refreshProfile();
        }
        
        console.log("User role:", role, "Allowed roles:", allowedRoles);
        
        // If we have a role and it's in allowed roles, grant access
        if (role && allowedRoles.includes(role)) {
          console.log("Access granted for role:", role);
          setHasAccess(true);
        } else {
          console.log("Access denied for role:", role);
          setHasAccess(false);
          
          // Show toast only if there's a user but role isn't allowed
          if (role) {
            toast({
              title: "Acesso negado",
              description: "Você não tem permissão para acessar esta página.",
              variant: "destructive",
            });
          }
        }
        
        setIsCheckingRole(false);
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        setHasAccess(false);
        setIsCheckingRole(false);
      }
    };
    
    checkAccess();
  }, [user, role, loading, allowedRoles, refreshProfile]);
  
  if (loading || isCheckingRole) {
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
  
  if (!hasAccess) {
    console.log("Redirecting to dashboard, no access");
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log("Rendering protected content");
  return <>{children}</>;
};

export default RoleProtectedRoute;
