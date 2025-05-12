
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { UserRole } from '@/types';

type Profile = {
  id: string;
  name: string;
  role: UserRole;
  organization?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // This function fetches profile using direct SQL query to avoid recursion
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      // Using the RPC function to avoid recursion
      const { data, error } = await supabase
        .rpc('get_user_role', { user_id: userId })
        .then(async (roleResult) => {
          if (roleResult.error) {
            console.error('Error fetching user role:', roleResult.error);
            return { data: null, error: roleResult.error };
          }
          
          // Now fetch the complete profile with the role we know
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
            
          return { data: profileData, error: profileError };
        });

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };
  
  // Function to refresh profile data
  const refreshProfile = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const userProfile = await fetchProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
        setRole(userProfile.role);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  useEffect(() => {
    const setupAuth = async () => {
      try {
        // First set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            // Update session and user synchronously
            setSession(newSession);
            setUser(newSession?.user ?? null);
            
            // If session is null, clear profile and role
            if (!newSession) {
              setProfile(null);
              setRole(null);
            }
          }
        );
        
        // Then check current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        // Update session and user synchronously
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // If there's a user, fetch profile separately to avoid recursion
        if (currentSession?.user) {
          setTimeout(async () => {
            const userProfile = await fetchProfile(currentSession.user.id);
            if (userProfile) {
              setProfile(userProfile);
              setRole(userProfile.role);
            }
            setLoading(false);
          }, 0);
        } else {
          setLoading(false);
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };
    
    setupAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo de volta!`,
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer login',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole = 'hospital') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (error) throw error;

      toast({
        title: 'Conta criada com sucesso',
        description: 'Verifique seu email para confirmar o cadastro.',
      });

      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Erro ao criar conta',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
    });
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;

      // Update locally and refresh from server
      if (profile) {
        setProfile({ ...profile, ...profileData });
      }
      
      // Refresh profile data from server
      await refreshProfile();

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message,
        variant: 'destructive',
      });
    }
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
