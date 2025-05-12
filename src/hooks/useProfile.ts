
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

// Função para buscar perfil do usuário
export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log("Buscando perfil do usuário:", userId);
    
    // Buscar dados do usuário na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (userError) {
      console.error('Erro ao buscar perfil do usuário:', userError);
      return null;
    }
    
    console.log("Dados do usuário:", userData);

    if (userData) {
      return userData as Profile;
    }
    
    return null;
  } catch (error) {
    console.error('Erro em fetchProfile:', error);
    return null;
  }
};

export const useProfileManagement = () => {
  const updateProfile = async (profileData: Partial<Profile>, userId: string) => {
    try {
      console.log("Atualizando perfil do usuário:", userId, "com dados:", profileData);
      if (!userId) throw new Error('Usuário não autenticado');

      // Atualizar o perfil na tabela users
      const { error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
      });
      
      return true;
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      
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
