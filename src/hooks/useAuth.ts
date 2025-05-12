
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';

export const useAuthMethods = () => {
  const navigate = useNavigate();

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Tentando fazer login com o email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log("Login bem sucedido:", data);

      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo de volta!`,
      });

      navigate('/dashboard');
      return true;
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      
      toast({
        title: 'Erro ao fazer login',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole = 'hospital') => {
    try {
      console.log("Tentando cadastrar novo usuário com:", { email, name, role });
      
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
      
      console.log("Cadastro bem sucedido:", data);

      toast({
        title: 'Conta criada com sucesso',
        description: 'Verifique seu email para confirmar o cadastro.',
      });

      navigate('/login');
      return true;
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      
      toast({
        title: 'Erro ao criar conta', 
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const signOut = async () => {
    try {
      console.log("Tentando fazer logout");
      
      await supabase.auth.signOut();
      
      console.log("Logout bem sucedido");
      
      navigate('/login');
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
      });
      return true;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return false;
    }
  };

  return {
    signIn,
    signUp,
    signOut
  };
};
