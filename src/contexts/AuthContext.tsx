
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';
import { fetchProfile, Profile, useProfileManagement } from '@/hooks/useProfile';
import { useAuthMethods } from '@/hooks/useAuth';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string, role?: UserRole) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  updateProfile: (profile: Partial<Profile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const refreshingProfile = useRef(false);
  const navigate = useNavigate();
  
  // Importar métodos de autenticação e gerenciamento de perfil
  const { updateProfile: updateUserProfile } = useProfileManagement();
  const { signIn, signUp, signOut } = useAuthMethods();
  
  // Função para atualizar o perfil
  const refreshProfile = async (): Promise<void> => {
    if (!user) {
      console.log("Não é possível atualizar o perfil: Nenhum usuário logado");
      return;
    }
    
    try {
      console.log("Atualizando perfil do usuário:", user.id);
      
      // Adicionar uma flag para evitar atualizações concorrentes
      if (refreshingProfile.current) {
        console.log("Atualização de perfil já em andamento, pulando");
        return;
      }
      
      refreshingProfile.current = true;
      const userProfile = await fetchProfile(user.id);
      
      if (userProfile) {
        console.log("Perfil atualizado com sucesso:", userProfile);
        setProfile(userProfile);
        setRole(userProfile.role);
      } else {
        console.warn("Falha ao atualizar perfil: Nenhum dado de perfil retornado");
      }
      refreshingProfile.current = false;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      refreshingProfile.current = false;
    }
  };

  // Configurar listener de estado de autenticação e verificar sessão atual
  useEffect(() => {
    const setupAuth = async () => {
      try {
        console.log("Configurando listener de estado de autenticação");
        // Primeiro configurar o listener de estado de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log("Estado de autenticação alterado:", event, "Sessão:", newSession ? "existe" : "null");
            
            // Atualizar sessão e usuário sincronamente
            setSession(newSession);
            setUser(newSession?.user ?? null);
            
            // Se sessão for nula, limpar perfil e função
            if (!newSession) {
              console.log("Limpando perfil e função devido à ausência de sessão");
              setProfile(null);
              setRole(null);
            }
          }
        );
        
        // Então verificar a sessão atual
        console.log("Verificando sessão atual");
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        console.log("Sessão atual:", currentSession ? "existe" : "null");
        
        // Atualizar sessão e usuário sincronamente
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Se houver um usuário, buscar perfil separadamente para evitar recursão
        if (currentSession?.user) {
          console.log("Usuário existe, buscando perfil");
          // Importante: usar setTimeout para evitar problemas de ciclo de recursão
          setTimeout(async () => {
            try {
              const userProfile = await fetchProfile(currentSession.user.id);
              
              if (userProfile) {
                console.log("Perfil do usuário buscado com sucesso:", userProfile);
                setProfile(userProfile);
                setRole(userProfile.role);
              } else {
                console.warn("Nenhum dado de perfil retornado");
              }
              
              setAuthChecked(true);
              setLoading(false);
            } catch (profileError) {
              console.error("Erro ao buscar perfil do usuário:", profileError);
              setAuthChecked(true);
              setLoading(false);
            }
          }, 0);
        } else {
          console.log("Sem usuário, pulando busca de perfil");
          setAuthChecked(true);
          setLoading(false);
        }
        
        return () => {
          console.log("Limpando inscrição de autenticação");
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        setAuthChecked(true);
        setLoading(false);
      }
    };
    
    setupAuth();
  }, []);

  // Wrapper para updateProfile para atualizar o estado local também
  const updateProfile = async (profileData: Partial<Profile>): Promise<boolean> => {
    if (!user) {
      console.error("Não é possível atualizar o perfil: Nenhum usuário logado");
      return false;
    }
    
    console.log("Atualizando perfil com dados:", profileData);
    const success = await updateUserProfile(profileData, user.id);
    
    if (success) {
      console.log("Perfil atualizado com sucesso, atualizando estado local");
      // Atualizar localmente
      if (profile) {
        setProfile({ ...profile, ...profileData });
      }
      
      // Buscar dados de perfil atualizados do servidor
      await refreshProfile();
    } else {
      console.error("Falha ao atualizar perfil");
    }
    
    return success;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
