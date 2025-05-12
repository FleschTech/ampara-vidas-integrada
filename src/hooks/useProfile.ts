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

// Function to fetch profile using RPC function to avoid recursion
export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    // Using the RPC function to avoid recursion
    const { data: roleData, error: roleError } = await supabase
      .rpc('get_user_role', { user_id: userId });
    
    if (roleError) {
      console.error('Error fetching user role:', roleError);
      return null;
    }
    
    // Now fetch the complete profile with the role we know
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return null;
    }

    return profileData as Profile;
  } catch (error) {
    console.error('Error in fetchProfile:', error);
    return null;
  }
};

export const useProfileManagement = () => {
  const updateProfile = async (profileData: Partial<Profile>, userId: string) => {
    try {
      if (!userId) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
      });
      
      return true;
    } catch (error: any) {
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
