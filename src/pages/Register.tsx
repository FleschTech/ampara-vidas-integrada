
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/types';

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

const Register = () => {
  const { user, signUp, role } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<FormValues>({
    defaultValues: {
      role: 'hospital'
    }
  });
  
  const password = watch("password");
  
  // Verificar se o usuário tem permissão para acessar esta página
  useEffect(() => {
    if (role !== 'admin') {
      navigate('/dashboard');
      toast({
        title: 'Acesso restrito',
        description: 'Você não tem permissão para acessar esta página.',
        variant: 'destructive',
      });
    }
  }, [role, navigate]);
  
  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      await signUp(data.email, data.password, data.name, data.role);
    } finally {
      setLoading(false);
    }
  };

  // Se não for administrador, não renderizar o conteúdo da página
  if (role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Alert variant="destructive" className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertTitle>Acesso restrito</AlertTitle>
          <AlertDescription>
            Apenas administradores têm permissão para registrar novos usuários.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md border shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
          <CardDescription>
            Registre um novo usuário no sistema
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input 
                id="name" 
                placeholder="Nome completo" 
                {...register("name", { 
                  required: "Nome é obrigatório",
                  minLength: {
                    value: 3,
                    message: "Nome deve ter pelo menos 3 caracteres"
                  }
                })}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu.email@exemplo.com" 
                {...register("email", { 
                  required: "Email é obrigatório",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido"
                  }
                })}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="********" 
                  {...register("password", { 
                    required: "Senha é obrigatória",
                    minLength: {
                      value: 6,
                      message: "A senha deve ter pelo menos 6 caracteres"
                    }
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="********" 
                  {...register("confirmPassword", { 
                    required: "Confirmação de senha é obrigatória",
                    validate: value => 
                      value === password || "As senhas não coincidem"
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Função do Usuário</Label>
              <Select 
                defaultValue="hospital"
                onValueChange={(value: UserRole) => setValue("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função do usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="social_assistance">Assistência Social</SelectItem>
                  <SelectItem value="police">Polícia</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center">
                  <span className="w-4 h-4 mr-2 border-t-2 border-r-2 border-white rounded-full animate-spin" />
                  Registrando...
                </span>
              ) : (
                <span className="flex items-center">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Registrar Usuário
                </span>
              )}
            </Button>
            <p className="mt-4 text-sm text-center text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">
                Voltar para o login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;
