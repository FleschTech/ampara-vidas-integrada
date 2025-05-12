
import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CaseDocumentInput, FollowupDocumentInput } from '@/types';

export const useDocuments = () => {
  // Upload de documentos para casos
  const uploadCaseDocument = useCallback(async (documentData: CaseDocumentInput) => {
    try {
      const { file, case_id, uploaded_by, description } = documentData;
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${case_id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `cases/${fileName}`;
      
      // Upload do arquivo para o storage
      const { error: uploadError, data } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Registrar documento no banco
      const { error: dbError } = await supabase
        .from('case_documents')
        .insert({
          case_id,
          file_path: filePath,
          file_name: file.name,
          file_type: file.type,
          uploaded_by,
          description
        });
        
      if (dbError) throw dbError;
      
      toast({
        title: 'Documento enviado',
        description: 'O documento foi enviado com sucesso.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao enviar documento:', error);
      toast({
        title: 'Erro ao enviar documento',
        description: error.message || 'Ocorreu um erro ao tentar enviar o documento.',
        variant: 'destructive',
      });
      return false;
    }
  }, []);
  
  // Upload de documentos para acompanhamentos
  const uploadFollowupDocument = useCallback(async (documentData: FollowupDocumentInput) => {
    try {
      const { file, followup_id, uploaded_by, description } = documentData;
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${followup_id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `followups/${fileName}`;
      
      // Upload do arquivo para o storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Registrar documento no banco
      const { error: dbError } = await supabase
        .from('followup_documents')
        .insert({
          followup_id,
          file_path: filePath,
          file_name: file.name,
          file_type: file.type,
          uploaded_by,
          description
        });
        
      if (dbError) throw dbError;
      
      toast({
        title: 'Documento enviado',
        description: 'O documento foi enviado com sucesso.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao enviar documento:', error);
      toast({
        title: 'Erro ao enviar documento',
        description: error.message || 'Ocorreu um erro ao tentar enviar o documento.',
        variant: 'destructive',
      });
      return false;
    }
  }, []);
  
  // Obter URL para visualização de um documento
  const getDocumentUrl = useCallback(async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600); // URL válida por 1 hora
        
      if (error) throw error;
      
      return data.signedUrl;
    } catch (error: any) {
      console.error('Erro ao obter URL do documento:', error);
      return null;
    }
  }, []);
  
  // Listar documentos de um caso
  const listCaseDocuments = useCallback(async (caseId: string) => {
    try {
      const { data, error } = await supabase
        .from('case_documents')
        .select('*')
        .eq('case_id', caseId)
        .order('uploaded_at', { ascending: false });
        
      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Erro ao listar documentos do caso:', error);
      return [];
    }
  }, []);
  
  // Listar documentos de um acompanhamento
  const listFollowupDocuments = useCallback(async (followupId: string) => {
    try {
      const { data, error } = await supabase
        .from('followup_documents')
        .select('*')
        .eq('followup_id', followupId)
        .order('uploaded_at', { ascending: false });
        
      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Erro ao listar documentos do acompanhamento:', error);
      return [];
    }
  }, []);
  
  return {
    uploadCaseDocument,
    uploadFollowupDocument,
    getDocumentUrl,
    listCaseDocuments,
    listFollowupDocuments
  };
};
