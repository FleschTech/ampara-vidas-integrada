
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  LineChart,
  PieChart,
  Settings,
  UserPlus,
  Users,
  AlertTriangle,
  Calendar,
  FileText,
} from 'lucide-react';

const Dashboard = () => {
  const { user, profile, role, loading } = useAuth();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalCases: 0,
    alertsGenerated: 0,
    followUpsScheduled: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Simulação de dados estatísticos
    setStatistics({
      totalUsers: 150,
      totalCases: 320,
      alertsGenerated: 85,
      followUpsScheduled: 120,
    });
  }, []);

  // Botão de cadastro rápido para administradores
  const AdminQuickAddButton = () => {
    if (role !== 'admin') return null;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="text-lg font-medium mb-3">Ações Administrativas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            className="flex items-center justify-center gap-2" 
            onClick={() => navigate('/register-person')}
          >
            <UserPlus className="h-5 w-5" />
            Cadastrar Nova Pessoa
          </Button>
          <Button 
            variant="outline"
            className="flex items-center justify-center gap-2" 
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-5 w-5" />
            Configurações do Sistema
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Dashboard</h1>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => navigate('/register-person')} className="flex items-center justify-center gap-2">
              <UserPlus className="h-5 w-5" />
              Cadastrar Pessoa
            </Button>
            <Button variant="outline" onClick={() => navigate('/search')} className="flex items-center justify-center gap-2">
              <Users className="h-5 w-5" />
              Consultar Cadastro
            </Button>
          </div>
        </div>

        {/* Botão de cadastro rápido para administradores */}
        <AdminQuickAddButton />

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total de Usuários
              </CardTitle>
              <CardDescription>Número total de usuários cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total de Casos
              </CardTitle>
              <CardDescription>Número total de casos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.totalCases}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alertas Gerados
              </CardTitle>
              <CardDescription>Número de alertas gerados pelo sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.alertsGenerated}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Acompanhamentos
              </CardTitle>
              <CardDescription>Número de acompanhamentos agendados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.followUpsScheduled}</div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Casos por Categoria</CardTitle>
              <CardDescription>Distribuição de casos por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart className="h-64 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usuários Ativos ao Longo do Tempo</CardTitle>
              <CardDescription>Número de usuários ativos por mês</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart className="h-64 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertas por Tipo</CardTitle>
              <CardDescription>Distribuição de alertas por tipo</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
