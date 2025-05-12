
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { AssistedPersonInput } from '@/types';

// Esquema de validação
const pessoaSchema = z.object({
  full_name: z.string().min(3, { message: "Nome completo deve ter pelo menos 3 caracteres" }),
  cpf: z.string().optional(),
  birth_date: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    return birthDate < today;
  }, { message: "Data de nascimento inválida" }),
  gender: z.string().min(1, { message: "Selecione o gênero" }),
  address: z.string().min(3, { message: "Endereço é obrigatório" }),
  neighborhood: z.string().min(1, { message: "Bairro é obrigatório" }),
  city: z.string().min(1, { message: "Cidade é obrigatória" }),
  state: z.string().min(2, { message: "Estado é obrigatório" }),
  zip_code: z.string().optional(),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof pessoaSchema>;

const RegisterPerson = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<FormValues>({
    resolver: zodResolver(pessoaSchema),
    defaultValues: {
      state: 'SC',
    }
  });

  // Redirecionar se não estiver autenticado
  useState(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true);

      // Formatando a data para o formato correto de armazenamento
      const formattedData: AssistedPersonInput = {
        ...data,
        birth_date: new Date(data.birth_date).toISOString().split('T')[0],
      };

      const { data: newPerson, error } = await supabase
        .from('assisted_persons')
        .insert([formattedData])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Pessoa assistida cadastrada com sucesso.",
      });

      // Opção: Redirecionar para criação de atendimento
      if (newPerson && newPerson[0]) {
        navigate(`/register-case?person_id=${newPerson[0].id}`);
      } else {
        reset();
      }
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Ocorreu um erro ao cadastrar a pessoa assistida.",
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
            <CardTitle className="text-2xl">Cadastrar Pessoa Assistida</CardTitle>
            <CardDescription>
              Insira os dados da pessoa assistida para cadastro no sistema.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Dados Pessoais */}
              <div className="space-y-1">
                <h3 className="font-medium text-md">Dados Pessoais</h3>
                <div className="border-t border-gray-200 pt-3"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo <span className="text-red-500">*</span></Label>
                  <Input 
                    id="full_name"
                    placeholder="Nome completo da pessoa"
                    {...register("full_name")}
                  />
                  {errors.full_name && (
                    <p className="text-sm text-red-500">{errors.full_name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input 
                    id="cpf"
                    placeholder="000.000.000-00"
                    {...register("cpf")}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Data de Nascimento <span className="text-red-500">*</span></Label>
                  <Input 
                    id="birth_date"
                    type="date"
                    {...register("birth_date")}
                  />
                  {errors.birth_date && (
                    <p className="text-sm text-red-500">{errors.birth_date.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gênero <span className="text-red-500">*</span></Label>
                  <Select 
                    onValueChange={(value) => setValue("gender", value)}
                    defaultValue=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Feminino">Feminino</SelectItem>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Não-Binário">Não-Binário</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-red-500">{errors.gender.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input 
                    id="phone"
                    placeholder="(00) 00000-0000"
                    {...register("phone")}
                  />
                </div>
              </div>
              
              {/* Endereço */}
              <div className="space-y-1 pt-4">
                <h3 className="font-medium text-md">Endereço</h3>
                <div className="border-t border-gray-200 pt-3"></div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Logradouro <span className="text-red-500">*</span></Label>
                  <Input 
                    id="address"
                    placeholder="Rua, número, complemento"
                    {...register("address")}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro <span className="text-red-500">*</span></Label>
                  <Input 
                    id="neighborhood"
                    placeholder="Bairro"
                    {...register("neighborhood")}
                  />
                  {errors.neighborhood && (
                    <p className="text-sm text-red-500">{errors.neighborhood.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zip_code">CEP</Label>
                  <Input 
                    id="zip_code"
                    placeholder="00000-000"
                    {...register("zip_code")}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade <span className="text-red-500">*</span></Label>
                  <Input 
                    id="city"
                    placeholder="Cidade"
                    {...register("city")}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">Estado <span className="text-red-500">*</span></Label>
                  <Select 
                    defaultValue="SC"
                    onValueChange={(value) => setValue("state", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">AC</SelectItem>
                      <SelectItem value="AL">AL</SelectItem>
                      <SelectItem value="AP">AP</SelectItem>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="BA">BA</SelectItem>
                      <SelectItem value="CE">CE</SelectItem>
                      <SelectItem value="DF">DF</SelectItem>
                      <SelectItem value="ES">ES</SelectItem>
                      <SelectItem value="GO">GO</SelectItem>
                      <SelectItem value="MA">MA</SelectItem>
                      <SelectItem value="MT">MT</SelectItem>
                      <SelectItem value="MS">MS</SelectItem>
                      <SelectItem value="MG">MG</SelectItem>
                      <SelectItem value="PA">PA</SelectItem>
                      <SelectItem value="PB">PB</SelectItem>
                      <SelectItem value="PR">PR</SelectItem>
                      <SelectItem value="PE">PE</SelectItem>
                      <SelectItem value="PI">PI</SelectItem>
                      <SelectItem value="RJ">RJ</SelectItem>
                      <SelectItem value="RN">RN</SelectItem>
                      <SelectItem value="RS">RS</SelectItem>
                      <SelectItem value="RO">RO</SelectItem>
                      <SelectItem value="RR">RR</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="SP">SP</SelectItem>
                      <SelectItem value="SE">SE</SelectItem>
                      <SelectItem value="TO">TO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => reset()}>
                Limpar Formulário
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar Cadastro'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPerson;
