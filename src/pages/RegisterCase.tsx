
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AssistedPerson, AssistanceCaseInput, UrgencyLevel, SuspicionType } from '@/types';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Esquema de validação
const caseSchema = z.object({
  assisted_person_id: z.string().uuid(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres" }),
  is_suspicious: z.boolean(),
  suspicion_type: z.enum(['physical_abuse', 'psychological_abuse', 'sexual_abuse', 'negligence', 'other']).optional(),
});

type FormValues = z.infer<typeof caseSchema>;

const RegisterCase = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const query = useQuery();
  const personId = query.get('person_id');
  
  const [submitting, setSubmitting] = useState(false);
  const [people, setPeople] = useState<AssistedPerson[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<AssistedPerson | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      urgency: 'medium',
      is_suspicious: false,
    }
  });
  
  const isSuspicious = watch('is_suspicious');
  
  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  // Carregar pessoa assistida se ID vier na URL
  useEffect(() => {
    const loadPerson = async () => {
      if (personId) {
        try {
          const { data, error } = await supabase
            .from('assisted_persons')
            .select('*')
            .eq('id', personId)
            .single();
            
          if (error) throw error;
          
          if (data) {
            setSelectedPerson(data);
            setValue('assisted_person_id', data.id);
          }
        } catch (error) {
          console.error('Erro ao carregar dados da pessoa:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados da pessoa selecionada.",
            variant: "destructive",
          });
        }
      }
    };
    
    loadPerson();
  }, [personId, setValue]);
  
  // Pesquisar pessoas
  const searchPeople = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('assisted_persons')
        .select('*')
        .ilike('full_name', `%${searchTerm}%`)
        .order('full_name', { ascending: true })
        .limit(10);
        
      if (error) throw error;
      
      setPeople(data || []);
    } catch (error) {
      console.error('Erro na busca:', error);
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar pessoas no sistema.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  const selectPerson = (person: AssistedPerson) => {
    setSelectedPerson(person);
    setValue('assisted_person_id', person.id);
    setPeople([]);
    setSearchTerm('');
  };
  
  const onSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true);
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Garantindo que todos os campos obrigatórios estão presentes
      const caseData: AssistanceCaseInput = {
        assisted_person_id: data.assisted_person_id,
        registered_by: user.id,
        urgency: data.urgency,
        case_status: 'open',
        description: data.description,
        is_suspicious: data.is_suspicious,
        suspicion_type: data.is_suspicious ? data.suspicion_type : null
      };
      
      const { data: newCase, error } = await supabase
        .from('assistance_cases')
        .insert([caseData])
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Sucesso!",
        description: "Atendimento registrado com sucesso.",
      });
      
      // Redirecionar para detalhes do caso
      if (newCase && newCase[0]) {
        navigate(`/case/${newCase[0].id}`);
      } else {
        reset();
      }
    } catch (error: any) {
      toast({
        title: "Erro ao registrar atendimento",
        description: error.message || "Ocorreu um erro ao registrar o atendimento.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
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
        
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Registrar Novo Atendimento</CardTitle>
            <CardDescription>
              Registre informações sobre o atendimento realizado.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Seleção da pessoa */}
              <div className="space-y-1">
                <h3 className="font-medium text-md">Pessoa Assistida</h3>
                <div className="border-t border-gray-200 pt-3"></div>
              </div>
              
              {!selectedPerson ? (
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Buscar por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button 
                      type="button" 
                      onClick={searchPeople} 
                      disabled={isSearching || !searchTerm.trim()}
                    >
                      {isSearching ? 'Buscando...' : 'Buscar'}
                    </Button>
                  </div>
                  
                  {people.length > 0 ? (
                    <div className="border rounded-md max-h-60 overflow-y-auto">
                      <ul className="divide-y">
                        {people.map((person) => (
                          <li 
                            key={person.id} 
                            className="p-3 hover:bg-gray-100 cursor-pointer"
                            onClick={() => selectPerson(person)}
                          >
                            <div className="font-medium">{person.full_name}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(person.birth_date).toLocaleDateString()} | {person.neighborhood}, {person.city}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : searchTerm && !isSearching ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-2">Nenhuma pessoa encontrada com esse nome.</p>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => navigate('/register-person')}
                      >
                        Cadastrar Nova Pessoa
                      </Button>
                    </div>
                  ) : null}
                  
                  <div className="text-center">
                    <Button 
                      type="button" 
                      variant="link"
                      onClick={() => navigate('/register-person')}
                    >
                      Cadastrar Nova Pessoa
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{selectedPerson.full_name}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedPerson.birth_date).toLocaleDateString()} | {selectedPerson.neighborhood}, {selectedPerson.city}
                      </p>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedPerson(null);
                        setValue('assisted_person_id', '');
                      }}
                    >
                      Alterar
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Detalhes do atendimento */}
              {selectedPerson && (
                <>
                  <div className="space-y-1 pt-4">
                    <h3 className="font-medium text-md">Detalhes do Atendimento</h3>
                    <div className="border-t border-gray-200 pt-3"></div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="urgency">Urgência <span className="text-red-500">*</span></Label>
                      <Select 
                        defaultValue="medium"
                        onValueChange={(value: UrgencyLevel) => setValue("urgency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível de urgência" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="critical">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.urgency && (
                        <p className="text-sm text-red-500">{errors.urgency.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição do Atendimento <span className="text-red-500">*</span></Label>
                      <Textarea 
                        id="description"
                        placeholder="Descreva detalhadamente o atendimento realizado..."
                        className="min-h-[150px]"
                        {...register("description")}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500">{errors.description.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="is_suspicious"
                          checked={isSuspicious}
                          onCheckedChange={(checked) => setValue("is_suspicious", checked)}
                        />
                        <Label htmlFor="is_suspicious" className="font-medium text-red-700">
                          Caso suspeito de violência/abuso
                        </Label>
                      </div>
                      <p className="text-sm text-gray-500">
                        Marque esta opção se houver indícios de qualquer tipo de violência ou abuso.
                      </p>
                    </div>
                    
                    {isSuspicious && (
                      <div className="space-y-2">
                        <Label htmlFor="suspicion_type">Tipo de Suspeita <span className="text-red-500">*</span></Label>
                        <Select 
                          onValueChange={(value: SuspicionType) => setValue("suspicion_type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de suspeita" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="physical_abuse">Violência física</SelectItem>
                            <SelectItem value="psychological_abuse">Violência psicológica</SelectItem>
                            <SelectItem value="sexual_abuse">Violência sexual</SelectItem>
                            <SelectItem value="negligence">Negligência</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.suspicion_type && (
                          <p className="text-sm text-red-500">{errors.suspicion_type.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={submitting || !selectedPerson}
              >
                {submitting ? 'Registrando...' : 'Registrar Atendimento'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterCase;
