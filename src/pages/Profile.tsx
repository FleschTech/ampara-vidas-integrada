import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Building, Phone } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  organization: z.string().optional(),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user, profile, loading, updateProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      organization: '',
      phone: '',
    }
  });
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  // Fill the form with profile data
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        organization: profile.organization || '',
        phone: profile.phone || '',
      });
    }
  }, [profile, reset]);
  
  // Refresh profile data when component mounts
  useEffect(() => {
    if (user && !loading && !profile) {
      // Only refresh if we don't already have a profile
      refreshProfile();
    }
  }, [user, loading, profile, refreshProfile]);
  
  const onSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true);
      console.log("Updating profile with data:", data);
      await updateProfile(data);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro ao atualizar seu perfil.",
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
        
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Meu Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="py-2 flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center mb-1">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    <Label htmlFor="email">E-mail</Label>
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    O e-mail não pode ser alterado.
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center mb-1">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    <Label htmlFor="name">Nome Completo</Label>
                  </div>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Seu nome completo"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center mb-1">
                    <Building className="h-4 w-4 mr-2 text-primary" />
                    <Label htmlFor="organization">Organização/Instituição</Label>
                  </div>
                  <Input
                    id="organization"
                    {...register("organization")}
                    placeholder="Sua instituição ou local de trabalho"
                  />
                </div>
                
                <div>
                  <div className="flex items-center mb-1">
                    <Phone className="h-4 w-4 mr-2 text-primary" />
                    <Label htmlFor="phone">Telefone de Contato</Label>
                  </div>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <Label className="mb-1">Função no Sistema</Label>
                  <div className="bg-gray-50 p-3 rounded-md">
                    {profile?.role === 'admin' && <span className="font-medium text-primary">Administrador</span>}
                    {profile?.role === 'hospital' && <span className="font-medium text-blue-600">Hospital / Unidade de Saúde</span>}
                    {profile?.role === 'social_assistance' && <span className="font-medium text-green-600">Assistência Social</span>}
                    {profile?.role === 'police' && <span className="font-medium text-purple-600">Delegacia / Polícia</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    A função é atribuída por administradores e não pode ser alterada.
                  </p>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
