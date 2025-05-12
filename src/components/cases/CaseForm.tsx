
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
import { AssistanceCaseInput, UrgencyLevel } from '@/types';

interface CaseFormProps {
  onFormSubmit: (data: AssistanceCaseInput) => Promise<void>;
  isLoading: boolean;
}

const CaseForm = ({ onFormSubmit, isLoading }: CaseFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [isSuspicious, setIsSuspicious] = useState(false);
  const [suspicionType, setSuspicionType] = useState<string | null>(null);
  
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
  }, [user, setValue]);
  
  const onSubmit = async (data: AssistanceCaseInput) => {
    // Update form data with selected person ID
    if (!selectedPerson) {
      toast({
        title: "Erro",
        description: "Selecione uma pessoa para continuar",
        variant: "destructive",
      });
      return;
    }
    
    data.assisted_person_id = selectedPerson;
    data.is_suspicious = isSuspicious;
    
    if (isSuspicious && suspicionType) {
      data.suspicion_type = suspicionType as any;
    } else {
      data.suspicion_type = null;
    }
    
    await onFormSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
    </form>
  );
};

export default CaseForm;
