
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Database, Bell, Lock, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

// Define the super admin email
const SUPER_ADMIN_EMAIL = 'kkauaritter@gmail.com';

const Settings = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if the current user is a super admin
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;
  
  // User can access admin features if they are the super admin or have admin role
  const canAccessAdmin = isSuperAdmin || role === 'admin';

  if (!canAccessAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <Button variant="outline" className="mb-4" onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>Acesso Restrito</CardTitle>
              <CardDescription>
                Você não tem permissão para acessar esta página.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Lock className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Permissão Negada</h3>
                <p className="text-gray-500 mb-4">
                  Apenas administradores podem acessar as configurações do sistema.
                </p>
                <Button onClick={() => navigate('/dashboard')}>
                  Voltar para o Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
          <h1 className="text-2xl font-bold mb-2">Configurações do Sistema</h1>
          <p className="text-gray-600">
            Gerencie usuários, permissões e configurações do sistema.
          </p>
        </div>
        
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="new-user" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Novo Usuário
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissões
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Dados
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alertas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>
                  Adicione, edite ou remova usuários do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Lock className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Funcionalidade em Desenvolvimento</h3>
                  <p className="text-gray-500 mb-4">
                    O módulo de gerenciamento de usuários está sendo implementado e estará disponível em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="new-user">
            <Card>
              <CardHeader>
                <CardTitle>Criar Novo Usuário</CardTitle>
                <CardDescription>
                  Cadastre um novo usuário no sistema com perfil específico.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminUsersTab />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Permissões</CardTitle>
                <CardDescription>
                  Configure perfis de acesso e permissões dos usuários.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Lock className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Funcionalidade em Desenvolvimento</h3>
                  <p className="text-gray-500 mb-4">
                    O módulo de gerenciamento de permissões está sendo implementado e estará disponível em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Dados</CardTitle>
                <CardDescription>
                  Configure importação, exportação e limpeza de dados.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Lock className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Funcionalidade em Desenvolvimento</h3>
                  <p className="text-gray-500 mb-4">
                    O módulo de gerenciamento de dados está sendo implementado e estará disponível em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>Configuração de Alertas</CardTitle>
                <CardDescription>
                  Configure regras de alertas e notificações do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Lock className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Funcionalidade em Desenvolvimento</h3>
                  <p className="text-gray-500 mb-4">
                    O módulo de configuração de alertas está sendo implementado e estará disponível em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
