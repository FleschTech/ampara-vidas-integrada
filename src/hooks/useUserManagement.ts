
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserCreateInput, UserRole } from '@/types';

export const useUserManagement = () => {
  const [loading, setLoading] = useState(false);

  // Função para criar um novo usuário (apenas para administradores)
  const createUser = async (userData: UserCreateInput) => {
    try {
      setLoading(true);
      
      // Verificar se o email já está em uso
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', userData.email)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingUsers) {
        throw new Error('Este email já está em uso');
      }
      
      // Criar usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          role: userData.role,
          organization: userData.organization || null
        }
      });
      
      if (authError) throw authError;
      
      toast({
        title: 'Usuário criado',
        description: `O usuário ${userData.name} foi criado com sucesso.`,
      });
      
      return authData.user;
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      
      toast({
        title: 'Erro ao criar usuário',
        description: error.message || 'Ocorreu um erro ao tentar criar o usuário.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Função para atualizar papel de um usuário
  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      setLoading(true);
      
      // Atualizar papel do usuário
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        title: 'Papel atualizado',
        description: 'O papel do usuário foi atualizado com sucesso.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar papel do usuário:', error);
      
      toast({
        title: 'Erro ao atualizar papel',
        description: error.message || 'Ocorreu um erro ao tentar atualizar o papel do usuário.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Função para listar todos os usuários (apenas para administradores)
  const listUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Erro ao listar usuários:', error);
      
      toast({
        title: 'Erro ao listar usuários',
        description: error.message || 'Ocorreu um erro ao tentar listar os usuários.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  return {
    createUser,
    updateUserRole,
    listUsers,
    loading
  };
};
