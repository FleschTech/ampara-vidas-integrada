
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';

export type Profile = {
  id: string;
  name: string;
  role: UserRole;
  organization?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
};

// Function to fetch staff profile
export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log("Fetching staff profile for user:", userId);
    
    // Get the profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error fetching staff profile:', profileError);
      return null;
    }
    
    console.log("Profile data from DB:", profileData);

    if (profileData) {
      // The role is now directly in the profiles table
      return profileData as Profile;
    }
    
    return null;
  } catch (error) {
    console.error('Error in fetchProfile:', error);
    return null;
  }
};

export const useProfileManagement = () => {
  const updateProfile = async (profileData: Partial<Profile>, userId: string) => {
    try {
      console.log("Updating staff profile for user:", userId, "with data:", profileData);
      if (!userId) throw new Error('Usuário não autenticado');

      // Use service role client to bypass RLS
      // Note: You'd need to implement this through a backend API endpoint
      // as you shouldn't expose service role keys in frontend code
      const { error } = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, profileData })
      }).then(res => res.json());

      if (error) throw new Error(error);

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
      });
      
      return true;
    } catch (error: any) {
      console.error("Error updating staff profile:", error);
      
      toast({
        title: 'Erro ao atualizar perfil', 
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    updateProfile
  };
};
