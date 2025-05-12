
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
        // Se ainda estiver carregando o estado de autenticação, aguardar
        if (loading) {
          console.log("Autenticação ainda carregando, aguardando...");
          return;
        }
        
        // Se não houver usuário, sem acesso
        if (!user) {
          console.log("Sem usuário, negando acesso");
          setHasAccess(false);
          setIsCheckingRole(false);
          return;
        }
        
        // Verificar se o usuário tem uma função definida, caso contrário tentar atualizar o perfil
        if (!role) {
          console.log("Função de usuário não encontrada, tentando atualizar perfil");
          await refreshProfile();
        }
        
        console.log("Função do usuário:", role, "Funções permitidas:", allowedRoles);
        
        // Se há uma função e ela está nas funções permitidas, conceder acesso
        if (role && allowedRoles.includes(role)) {
          console.log("Acesso concedido para usuário com função:", role);
          setHasAccess(true);
        } else {
          console.log("Acesso negado para usuário com função:", role);
          setHasAccess(false);
          
          // Mostrar toast apenas se houver um usuário mas a função não for permitida
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
        console.error("Erro ao verificar permissões do usuário:", error);
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
    console.log("Redirecionando para login, sem usuário");
    return <Navigate to="/login" replace />;
  }
  
  if (!hasAccess) {
    console.log("Redirecionando para dashboard, sem acesso para esta função de usuário");
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log("Renderizando conteúdo protegido para usuário com função apropriada");
  return <>{children}</>;
};

export default RoleProtectedRoute;
