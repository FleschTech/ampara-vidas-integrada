import { createContext, useContext, useEffect, useState } from 'react';
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
  const navigate = useNavigate();
  
  // Import auth and profile management methods
  const { updateProfile: updateUserProfile } = useProfileManagement();
  const { signIn, signUp, signOut } = useAuthMethods();
  
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

  // Wrapper for updateProfile to update the local state as well
  const updateProfile = async (profileData: Partial<Profile>): Promise<boolean> => {
    if (!user) return false;
    
    const success = await updateUserProfile(profileData, user.id);
    
    if (success) {
      // Update locally
      if (profile) {
        setProfile({ ...profile, ...profileData });
      }
      
      // Refresh profile data from server
      await refreshProfile();
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

