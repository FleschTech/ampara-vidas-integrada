
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Database, Bell, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Settings = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Verificar se o usuário tem permissão para acessar esta página
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (role === 'admin') {
        setIsAdmin(true);
      } else {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar as configurações do sistema.",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
    }
  }, [user, role, loading, navigate, toast]);
  
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
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Configurações do Sistema</h1>
          <p className="text-gray-600">
            Gerencie usuários, permissões e configurações do sistema.
          </p>
        </div>
        
        {isAdmin && (
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuários
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
        )}
      </div>
    </div>
  );
};

export default Settings;
