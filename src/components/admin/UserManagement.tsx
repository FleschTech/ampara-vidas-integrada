
import { useState, useEffect } from 'react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCreateInput, UserRole } from '@/types';
import { UserPlus, Users, RefreshCw } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  role: z.enum(['hospital', 'social_assistance', 'police', 'admin', 'tutelar_council']),
  organization: z.string().optional(),
  phone: z.string().optional()
});

export const UserManagement = () => {
  const { createUser, listUsers, updateUserRole, loading } = useUserManagement();
  const [users, setUsers] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [updatingRole, setUpdatingRole] = useState(false);
  
  const form = useForm<UserCreateInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'hospital',
      organization: '',
      phone: ''
    }
  });
  
  // Carregar lista de usuários
  useEffect(() => {
    const loadUsers = async () => {
      const usersList = await listUsers();
      setUsers(usersList);
    };
    
    loadUsers();
  }, [listUsers, refreshTrigger]);
  
  // Criar novo usuário
  const handleCreateUser = async (data: UserCreateInput) => {
    const result = await createUser(data);
    if (result) {
      form.reset();
      setRefreshTrigger(prev => prev + 1);
    }
  };
  
  // Atualizar papel do usuário
  const handleUpdateRole = async () => {
    if (!selectedUser || !selectedRole) return;
    
    setUpdatingRole(true);
    try {
      const result = await updateUserRole(selectedUser, selectedRole);
      if (result) {
        setSelectedUser(null);
        setSelectedRole(null);
        setRefreshTrigger(prev => prev + 1);
      }
    } finally {
      setUpdatingRole(false);
    }
  };
  
  // Traduzir papel para exibição
  const translateRole = (role: UserRole) => {
    switch (role) {
      case 'hospital': return 'Hospital';
      case 'social_assistance': return 'Assistência Social';
      case 'police': return 'Polícia';
      case 'admin': return 'Administrador';
      case 'tutelar_council': return 'Conselho Tutelar';
      default: return role;
    }
  };
  
  return (
    <Tabs defaultValue="list">
      <TabsList className="mb-4">
        <TabsTrigger value="list">
          <Users className="h-4 w-4 mr-2" />
          Listar Usuários
        </TabsTrigger>
        <TabsTrigger value="create">
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Usuário
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="list">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Usuários do Sistema</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setRefreshTrigger(prev => prev + 1)}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-4 text-left font-medium">Nome</th>
                    <th className="h-10 px-4 text-left font-medium">Email</th>
                    <th className="h-10 px-4 text-left font-medium">Papel</th>
                    <th className="h-10 px-4 text-left font-medium">Organização</th>
                    <th className="h-10 px-4 text-left font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="p-4">{user.name}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">{translateRole(user.role)}</td>
                      <td className="p-4">{user.organization || '-'}</td>
                      <td className="p-4">
                        <Select 
                          value={selectedUser === user.id ? selectedRole || undefined : undefined}
                          onValueChange={(value: UserRole) => {
                            setSelectedUser(user.id);
                            setSelectedRole(value);
                          }}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Alterar papel" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hospital">Hospital</SelectItem>
                            <SelectItem value="social_assistance">Assistência Social</SelectItem>
                            <SelectItem value="police">Polícia</SelectItem>
                            <SelectItem value="tutelar_council">Conselho Tutelar</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {selectedUser && selectedRole && (
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={handleUpdateRole} 
                  disabled={updatingRole}
                >
                  {updatingRole ? 'Atualizando...' : 'Confirmar Alteração'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="create">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Usuário</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para criar um novo usuário no sistema.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateUser)}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Papel</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o papel" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hospital">Hospital</SelectItem>
                            <SelectItem value="social_assistance">Assistência Social</SelectItem>
                            <SelectItem value="police">Polícia</SelectItem>
                            <SelectItem value="tutelar_council">Conselho Tutelar</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organização (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da organização" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Usuário'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
