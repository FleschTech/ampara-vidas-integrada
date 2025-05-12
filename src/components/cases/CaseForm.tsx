
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormControl } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SuspicionTypeSelector } from './SuspicionTypeSelector';
import { PersonSelector } from './PersonSelector';
import { DocumentUploader } from '@/components/documents/DocumentUploader';
import { AssistanceCaseInput, UrgencyLevel } from '@/types';

interface CaseFormProps {
  onFormSubmit: (data: AssistanceCaseInput) => Promise<void>;
  isLoading: boolean;
  caseId?: string; // ID do caso para quando for upload de documentos em caso existente
}

const CaseForm = ({ onFormSubmit, isLoading, caseId }: CaseFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [isSuspicious, setIsSuspicious] = useState(false);
  const [suspicionType, setSuspicionType] = useState<string | null>(null);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<AssistanceCaseInput>({
    defaultValues: {
      urgency: 'medium',
      is_suspicious: false,
    }
  });
  
  useEffect(() => {
    if (user) {
      setValue('registered_by', user.id);
    }
    
    // Se tiver caseId, mostrar upload de documentos diretamente
    if (caseId) {
      setShowDocumentUpload(true);
    }
  }, [user, setValue, caseId]);
  
  const onSubmit = async (data: AssistanceCaseInput) => {
    // Update form data with selected person ID
    if (!selectedPerson && !caseId) {
      toast({
        title: "Erro",
        description: "Selecione uma pessoa para continuar",
        variant: "destructive",
      });
      return;
    }
    
    if (!caseId) {
      data.assisted_person_id = selectedPerson!;
      data.is_suspicious = isSuspicious;
      
      if (isSuspicious && suspicionType) {
        data.suspicion_type = suspicionType as any;
      } else {
        data.suspicion_type = null;
      }
    }
    
    await onFormSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {!caseId && (
        <>
          <Card>
            <CardContent className="pt-6">
              <PersonSelector 
                selectedPerson={selectedPerson} 
                setSelectedPerson={setSelectedPerson} 
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="urgency">Nível de Urgência</Label>
                <Controller
                  name="urgency"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a urgência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.urgency && (
                  <p className="text-sm text-red-500">{errors.urgency.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição do Atendimento</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descreva detalhadamente o atendimento"
                  rows={5}
                  {...register("description", { 
                    required: "Descrição é obrigatória"
                  })}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_suspicious" 
                  checked={isSuspicious}
                  onCheckedChange={(checked) => {
                    setIsSuspicious(checked as boolean);
                  }}
                />
                <label
                  htmlFor="is_suspicious"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Caso Suspeito (Possível violência ou abuso)
                </label>
              </div>
              
              {isSuspicious && (
                <SuspicionTypeSelector
                  suspicionType={suspicionType}
                  setSuspicionType={setSuspicionType}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
      
      <Tabs 
        defaultValue={caseId ? "docs" : "form"}
        value={showDocumentUpload ? "docs" : "form"}
        onValueChange={(value) => setShowDocumentUpload(value === "docs")}
      >
        <TabsList className="grid w-full grid-cols-2">
          {!caseId && (
            <TabsTrigger value="form">Dados do Atendimento</TabsTrigger>
          )}
          <TabsTrigger value="docs">Documentos</TabsTrigger>
        </TabsList>
        
        {!caseId && (
          <TabsContent value="form" className="mt-4">
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="w-4 h-4 mr-2 border-t-2 border-r-2 border-white rounded-full animate-spin" />
                    Registrando...
                  </span>
                ) : (
                  "Registrar Atendimento"
                )}
              </Button>
            </div>
          </TabsContent>
        )}
        
        <TabsContent value="docs" className="mt-4">
          {(caseId || selectedPerson) ? (
            <Card>
              <CardContent className="pt-6">
                <DocumentUploader caseId={caseId} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  Para adicionar documentos, primeiro complete e salve as informações do atendimento.
                </p>
              </CardContent>
            </Card>
          )}
          
          {!caseId && (
            <div className="flex justify-between mt-4">
              <Button type="button" variant="outline" onClick={() => setShowDocumentUpload(false)}>
                Voltar para o Formulário
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="w-4 h-4 mr-2 border-t-2 border-r-2 border-white rounded-full animate-spin" />
                    Registrando...
                  </span>
                ) : (
                  "Registrar Atendimento"
                )}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </form>
  );
};

export default CaseForm;
