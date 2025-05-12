
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Settings,
  UserPlus,
  Users,
  AlertTriangle,
  Calendar,
  FileText,
  ArrowUpRight,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Interface para os dados estatísticos
interface DashboardStats {
  totalUsers: number;
  totalCases: number;
  alertsGenerated: number;
  followUpsScheduled: number;
  casesByCategory: { name: string; value: number }[];
  casesByStatus: { name: string; value: number }[];
  alertsByType: { name: string; value: number }[];
}

const Dashboard = () => {
  const { user, profile, role, loading } = useAuth();
  const navigate = useNavigate();
  const [realtimeSubscribed, setRealtimeSubscribed] = useState(false);
  
  // Função para buscar estatísticas do Supabase
  const fetchStatistics = async (): Promise<DashboardStats> => {
    try {
      // Contagem de usuários
      const { count: usersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) throw usersError;
      
      // Contagem de casos
      const { count: casesCount, error: casesError } = await supabase
        .from('assistance_cases')
        .select('*', { count: 'exact', head: true });
      
      if (casesError) throw casesError;
      
      // Contagem de alertas
      const { count: alertsCount, error: alertsError } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true });
      
      if (alertsError) throw alertsError;
      
      // Contagem de acompanhamentos
      const { count: followupsCount, error: followupsError } = await supabase
        .from('social_followups')
        .select('*', { count: 'exact', head: true });
      
      if (followupsError) throw followupsError;
      
      // Casos por categoria (tipo de suspeita)
      const { data: casesByCategory, error: categoriesError } = await supabase
        .from('assistance_cases')
        .select('suspicion_type, count')
        .not('suspicion_type', 'is', null)
        .group('suspicion_type');
        
      if (categoriesError) throw categoriesError;
      
      // Casos por status
      const { data: casesByStatus, error: statusError } = await supabase
        .from('assistance_cases')
        .select('case_status, count')
        .group('case_status');
        
      if (statusError) throw statusError;
      
      // Alertas por tipo
      const { data: alertsByType, error: alertTypesError } = await supabase
        .from('alerts')
        .select('alert_type, count')
        .group('alert_type');
        
      if (alertTypesError) throw alertTypesError;
      
      // Formatar dados para gráficos
      const formattedCasesByCategory = casesByCategory?.map(item => ({
        name: translateSuspicionType(item.suspicion_type),
        value: parseInt(item.count)
      })) || [];
      
      const formattedCasesByStatus = casesByStatus?.map(item => ({
        name: translateCaseStatus(item.case_status),
        value: parseInt(item.count)
      })) || [];
      
      const formattedAlertsByType = alertsByType?.map(item => ({
        name: translateAlertType(item.alert_type),
        value: parseInt(item.count)
      })) || [];
      
      return {
        totalUsers: usersCount || 0,
        totalCases: casesCount || 0,
        alertsGenerated: alertsCount || 0,
        followUpsScheduled: followupsCount || 0,
        casesByCategory: formattedCasesByCategory,
        casesByStatus: formattedCasesByStatus,
        alertsByType: formattedAlertsByType
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      // Fallback para dados simulados em caso de erro
      return {
        totalUsers: 0,
        totalCases: 0,
        alertsGenerated: 0,
        followUpsScheduled: 0,
        casesByCategory: [],
        casesByStatus: [],
        alertsByType: []
      };
    }
  };

  // Traduzir tipos de suspeita para exibição
  const translateSuspicionType = (type: string | null) => {
    switch(type) {
      case 'physical_abuse': return 'Abuso Físico';
      case 'psychological_abuse': return 'Abuso Psicológico';
      case 'sexual_abuse': return 'Abuso Sexual';
      case 'negligence': return 'Negligência';
      case 'other': return 'Outros';
      default: return 'Não especificado';
    }
  };

  // Traduzir status de caso para exibição
  const translateCaseStatus = (status: string) => {
    switch(status) {
      case 'open': return 'Aberto';
      case 'in_progress': return 'Em Andamento';
      case 'referred': return 'Encaminhado';
      case 'closed': return 'Encerrado';
      default: return status;
    }
  };

  // Traduzir tipos de alerta para exibição
  const translateAlertType = (type: string) => {
    switch(type) {
      case 'recurrence': return 'Reincidência';
      case 'high_risk': return 'Alto Risco';
      case 'suspicious': return 'Caso Suspeito';
      default: return type || 'Não especificado';
    }
  };

  // Usar React Query para gerenciar o estado e cache dos dados
  const { data: statistics = { 
    totalUsers: 0, 
    totalCases: 0, 
    alertsGenerated: 0, 
    followUpsScheduled: 0,
    casesByCategory: [],
    casesByStatus: [],
    alertsByType: []
  }, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchStatistics,
    enabled: !!user, // Só busca dados quando o usuário estiver autenticado
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
  });

  // Cores para os gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Configurar escuta em tempo real para atualizações
  useEffect(() => {
    if (!user || realtimeSubscribed) return;

    // Assinar para mudanças em várias tabelas
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'users'
      }, () => {
        refetch();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'assistance_cases'
      }, () => {
        refetch();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'alerts'
      }, () => {
        refetch();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'social_followups'
      }, () => {
        refetch();
      })
      .subscribe();

    setRealtimeSubscribed(true);

    // Limpar inscrição ao desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, realtimeSubscribed, refetch]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Componente para o botão de cadastro rápido para administradores
  const AdminQuickAddButton = () => {
    if (role !== 'admin') return null;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Ações Administrativas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90" 
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

  // Componente para os cards de estatísticas
  const StatCard = ({ 
    icon: Icon, 
    title, 
    description, 
    value, 
    loading, 
    trendUp = true 
  }: { 
    icon: React.ElementType; 
    title: string;
    description: string;
    value: number;
    loading: boolean;
    trendUp?: boolean;
  }) => (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between bg-muted/50 pb-2">
        <div className="flex flex-col">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Icon className="h-4 w-4" />
            {title}
          </CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </div>
        <div className={`flex items-center rounded-md ${trendUp ? 'text-green-600' : 'text-amber-600'} text-xs font-medium`}>
          <ArrowUpRight className={`h-3 w-3 ${trendUp ? '' : 'rotate-180'}`} />
          <span>{trendUp ? '+' : '-'}4%</span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-3xl font-bold">
          {loading ? (
            <div className="h-8 w-12 animate-pulse rounded bg-muted"></div>
          ) : (
            value
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Dashboard</h1>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => navigate('/register-person')} 
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            title="Total de Usuários"
            description="Número total de usuários cadastrados"
            value={statistics.totalUsers}
            loading={statsLoading}
            trendUp={true}
          />

          <StatCard
            icon={FileText}
            title="Total de Casos"
            description="Número total de casos registrados"
            value={statistics.totalCases}
            loading={statsLoading}
            trendUp={true}
          />

          <StatCard
            icon={AlertTriangle}
            title="Alertas Gerados"
            description="Número de alertas gerados pelo sistema"
            value={statistics.alertsGenerated}
            loading={statsLoading}
            trendUp={false}
          />

          <StatCard
            icon={Calendar}
            title="Acompanhamentos"
            description="Número de acompanhamentos agendados"
            value={statistics.followUpsScheduled}
            loading={statsLoading}
            trendUp={true}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Casos por Categoria</CardTitle>
              <CardDescription>Distribuição de casos por tipo de suspeita</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {statistics.casesByCategory.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statistics.casesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statistics.casesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} casos`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-64 w-full flex-col items-center justify-center rounded-md border border-dashed p-4">
                  <PieChartIcon className="h-16 w-16 text-muted-foreground/60" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Não há dados suficientes para exibir
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Casos por Status</CardTitle>
              <CardDescription>Distribuição de casos por situação atual</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {statistics.casesByStatus.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statistics.casesByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statistics.casesByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} casos`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-64 w-full flex-col items-center justify-center rounded-md border border-dashed p-4">
                  <PieChartIcon className="h-16 w-16 text-muted-foreground/60" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Não há dados suficientes para exibir
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Alertas por Tipo</CardTitle>
              <CardDescription>Distribuição de alertas por tipo</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {statistics.alertsByType.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={statistics.alertsByType}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Quantidade" fill="#8884d8">
                        {statistics.alertsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-64 w-full flex-col items-center justify-center rounded-md border border-dashed p-4">
                  <BarChartIcon className="h-16 w-16 text-muted-foreground/60" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Não há dados suficientes para exibir
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
