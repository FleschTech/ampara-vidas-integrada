
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, UserPlus, FileText, AlertTriangle, Search, MapPin, PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [alertCount, setAlertCount] = useState(0);
  const [caseCount, setCaseCount] = useState(0);
  const [recurrentCount, setRecurrentCount] = useState(0);
  const [recentCases, setRecentCases] = useState([]);
  const [neighborhoodData, setNeighborhoodData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Verificar autenticação
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Carregar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Contagem de alertas ativos
        const { count: alertCountResult, error: alertError } = await supabase
          .from('alerts')
          .select('id', { count: 'exact', head: true })
          .eq('is_resolved', false);
          
        if (alertError) throw alertError;
        setAlertCount(alertCountResult || 0);
        
        // Contagem total de atendimentos
        const { count: caseCountResult, error: caseError } = await supabase
          .from('assistance_cases')
          .select('id', { count: 'exact', head: true });
          
        if (caseError) throw caseError;
        setCaseCount(caseCountResult || 0);
        
        // Contagem de casos recorrentes
        const { count: recurrentCountResult, error: recurrentError } = await supabase
          .from('assistance_cases')
          .select('id', { count: 'exact', head: true })
          .eq('is_recurrent', true);
          
        if (recurrentError) throw recurrentError;
        setRecurrentCount(recurrentCountResult || 0);
        
        // Buscar casos recentes
        const { data: recentCasesData, error: recentError } = await supabase
          .from('assistance_cases')
          .select(`
            id,
            urgency,
            created_at,
            person:assisted_persons (
              full_name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (recentError) throw recentError;
        setRecentCases(recentCasesData || []);
        
        // Distribuição por bairro
        const { data: neighborhoodStats, error: neighborhoodError } = await supabase
          .from('assisted_persons')
          .select('neighborhood, id')
          .order('neighborhood');
          
        if (neighborhoodError) throw neighborhoodError;
        
        // Agregar dados por bairro
        const neighborhoodCounts = neighborhoodStats?.reduce((acc, item) => {
          const neighborhood = item.neighborhood;
          acc[neighborhood] = (acc[neighborhood] || 0) + 1;
          return acc;
        }, {});
        
        const neighborhoodChartData = Object.keys(neighborhoodCounts || {})
          .map(bairro => ({
            bairro,
            casos: neighborhoodCounts[bairro]
          }))
          .sort((a, b) => b.casos - a.casos)
          .slice(0, 5);
          
        setNeighborhoodData(neighborhoodChartData);
        
        // Dados mensais
        const { data: monthlyStats, error: monthlyError } = await supabase
          .from('assistance_cases')
          .select('created_at')
          .order('created_at');
          
        if (monthlyError) throw monthlyError;
        
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const currentYear = new Date().getFullYear();
        const monthlyCounts = monthlyStats?.reduce((acc, item) => {
          const date = new Date(item.created_at);
          // Apenas dados do ano atual
          if (date.getFullYear() === currentYear) {
            const month = date.getMonth();
            acc[month] = (acc[month] || 0) + 1;
          }
          return acc;
        }, {});
        
        const monthlyChartData = monthNames.map((mes, index) => ({
          mes,
          atendimentos: monthlyCounts ? (monthlyCounts[index] || 0) : 0
        }));
        
        setMonthlyData(monthlyChartData);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const getUrgencyBadge = (urgency) => {
    switch(urgency) {
      case 'critical':
        return <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">Crítica</span>;
      case 'high':
        return <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800">Alta</span>;
      case 'medium':
        return <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">Média</span>;
      default:
        return <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Baixa</span>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cabeçalho */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Nidus Sentinela</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.email} ({role})
            </span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Navegação Principal */}
      <nav className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4">
          <ul className="flex overflow-x-auto py-3 space-x-6">
            <li>
              <Button variant="link" className="text-white p-0" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            </li>
            <li>
              <Button variant="link" className="text-white p-0" onClick={() => navigate('/register-person')}>
                Cadastrar Pessoa
              </Button>
            </li>
            <li>
              <Button variant="link" className="text-white p-0" onClick={() => navigate('/register-case')}>
                Novo Atendimento
              </Button>
            </li>
            <li>
              <Button variant="link" className="text-white p-0" onClick={() => navigate('/search')}>
                Buscar
              </Button>
            </li>
            {(role === 'admin' || role === 'social_assistance') && (
              <li>
                <Button variant="link" className="text-white p-0" onClick={() => navigate('/alerts')}>
                  Alertas
                </Button>
              </li>
            )}
            {(role === 'social_assistance' || role === 'admin') && (
              <li>
                <Button variant="link" className="text-white p-0" onClick={() => navigate('/followups')}>
                  Acompanhamentos
                </Button>
              </li>
            )}
            {role === 'admin' && (
              <li>
                <Button variant="link" className="text-white p-0" onClick={() => navigate('/register')}>
                  Gerenciar Usuários
                </Button>
              </li>
            )}
            <li>
              <Button variant="link" className="text-white p-0" onClick={() => navigate('/profile')}>
                Meu Perfil
              </Button>
            </li>
            {role === 'admin' && (
              <li>
                <Button variant="link" className="text-white p-0" onClick={() => navigate('/settings')}>
                  Configurações
                </Button>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-6">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className={alertCount > 0 ? "bg-red-50 border-red-200" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                Alertas Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{alertCount}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Casos que necessitam de atenção
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Total de Atendimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{caseCount}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Registrados no sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-amber-500" />
                Casos Recorrentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{recurrentCount}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Pessoas com múltiplos registros
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alertas Recentes */}
        {alertCount > 0 && (role === 'admin' || role === 'social_assistance') && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertTitle>Atenção necessária</AlertTitle>
            <AlertDescription>
              Existem {alertCount} casos que precisam de acompanhamento urgente.
              <Button variant="link" className="text-red-600 p-0 ml-2 h-auto" onClick={() => navigate('/alerts')}>
                Ver alertas
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Bairro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={neighborhoodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bairro" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="casos" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evolução de Atendimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="atendimentos" stroke="#3b82f6" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Atendimentos Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Atendimentos Recentes</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/search')}>
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">Nome</th>
                    <th className="py-2 px-4 text-left">Data</th>
                    <th className="py-2 px-4 text-left">Urgência</th>
                    <th className="py-2 px-4 text-left">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCases.map((caso) => (
                    <tr key={caso.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{caso.person?.full_name || "Nome não disponível"}</td>
                      <td className="py-3 px-4">{formatDate(caso.created_at)}</td>
                      <td className="py-3 px-4">
                        {getUrgencyBadge(caso.urgency)}
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/case/${caso.id}`)}>
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                  
                  {recentCases.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-500">
                        Nenhum atendimento registrado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <Button onClick={() => navigate('/register-case')} className="bg-primary">
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Atendimento
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
