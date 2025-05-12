
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { AssistanceCaseInput } from '@/types';
import CaseForm from '@/components/cases/CaseForm';

const RegisterCase = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Verificar se o usuário está logado
  if (!authLoading && !user) {
    navigate('/login');
    return null;
  }
  
  const handleSubmit = async (data: AssistanceCaseInput) => {
    try {
      setIsSubmitting(true);
      
      // Enviar dados para o banco
      const { error, data: newCase } = await supabase
        .from('assistance_cases')
        .insert(data)
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Atendimento registrado",
        description: "O atendimento foi registrado com sucesso.",
      });
      
      // Redirecionar para a página do caso criado
      navigate(`/case/${newCase.id}`);
    } catch (error: any) {
      console.error('Erro ao registrar atendimento:', error);
      toast({
        title: "Erro ao registrar atendimento",
        description: error.message || "Ocorreu um erro ao registrar o atendimento.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <Button variant="outline" className="mb-4" onClick={() => navigate('/dashboard')}>
          Voltar ao Dashboard
        </Button>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Registrar Novo Atendimento</h1>
          <p className="text-gray-600">
            Preencha os dados do atendimento realizado a uma mulher ou criança em situação de vulnerabilidade.
          </p>
        </div>
        
        <CaseForm onFormSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>
    </div>
  );
};

export default RegisterCase;
