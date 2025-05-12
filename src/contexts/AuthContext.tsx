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
  
  // Import auth and profile management methods
  const { updateProfile: updateUserProfile } = useProfileManagement();
  const { signIn, signUp, signOut } = useAuthMethods();
  
  // Function to refresh profile data
  const refreshProfile = async (): Promise<void> => {
    if (!user) {
      console.log("Cannot refresh profile: No user logged in");
      return;
    }
    
    try {
      console.log("Refreshing profile for user:", user.id);
      
      // Add a flag to prevent concurrent refreshes
      if (refreshingProfile.current) {
        console.log("Profile refresh already in progress, skipping");
        return;
      }
      
      refreshingProfile.current = true;
      const userProfile = await fetchProfile(user.id);
      
      if (userProfile) {
        console.log("Profile refreshed successfully:", userProfile);
        setProfile(userProfile);
        setRole(userProfile.role);
      } else {
        console.warn("Failed to refresh profile: No profile data returned");
      }
      refreshingProfile.current = false;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      refreshingProfile.current = false;
    }
  };

  // Set up auth state listener and check current session
  useEffect(() => {
    const setupAuth = async () => {
      try {
        console.log("Setting up auth state listener");
        // First set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log("Auth state changed:", event, "Session:", newSession ? "exists" : "null");
            
            // Update session and user synchronously
            setSession(newSession);
            setUser(newSession?.user ?? null);
            
            // If session is null, clear profile and role
            if (!newSession) {
              console.log("Clearing profile and role due to no session");
              setProfile(null);
              setRole(null);
            }
          }
        );
        
        // Then check current session
        console.log("Checking current session");
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        console.log("Current session:", currentSession ? "exists" : "null");
        
        // Update session and user synchronously
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // If there's a user, fetch profile separately to avoid recursion
        if (currentSession?.user) {
          console.log("User exists, fetching profile");
          // Important: use setTimeout to avoid recursion cycle problems
          setTimeout(async () => {
            try {
              const userProfile = await fetchProfile(currentSession.user.id);
              
              if (userProfile) {
                console.log("Profile fetched successfully:", userProfile);
                setProfile(userProfile);
                setRole(userProfile.role);
              } else {
                console.warn("No profile data returned");
              }
              
              setAuthChecked(true);
              setLoading(false);
            } catch (profileError) {
              console.error("Error fetching profile:", profileError);
              setAuthChecked(true);
              setLoading(false);
            }
          }, 0);
        } else {
          console.log("No user, skipping profile fetch");
          setAuthChecked(true);
          setLoading(false);
        }
        
        return () => {
          console.log("Cleaning up auth subscription");
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthChecked(true);
        setLoading(false);
      }
    };
    
    setupAuth();
  }, []);

  // Wrapper for updateProfile to update the local state as well
  const updateProfile = async (profileData: Partial<Profile>): Promise<boolean> => {
    if (!user) {
      console.error("Cannot update profile: No user logged in");
      return false;
    }
    
    console.log("Updating profile with data:", profileData);
    const success = await updateUserProfile(profileData, user.id);
    
    if (success) {
      console.log("Profile updated successfully, updating local state");
      // Update locally
      if (profile) {
        setProfile({ ...profile, ...profileData });
      }
      
      // Refresh profile data from server
      await refreshProfile();
    } else {
      console.error("Failed to update profile");
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
