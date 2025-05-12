
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
  const { user, role, loading } = useAuth();
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    const checkAccess = async () => {
      try {
        // If still loading auth state, wait
        if (loading) return;
        
        // If no user, no access
        if (!user) {
          setHasAccess(false);
          setIsCheckingRole(false);
          return;
        }
        
        // If we have a role and it's in allowed roles, grant access
        if (role && allowedRoles.includes(role)) {
          setHasAccess(true);
        } else {
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
  }, [user, role, loading, allowedRoles]);
  
  if (loading || isCheckingRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export default RoleProtectedRoute;
