
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, UserPlus, FileText, AlertTriangle, Search, MapPin, PlusCircle } from 'lucide-react';

// Dados de exemplo para os gráficos
const barData = [
  { bairro: 'Centro', casos: 15 },
  { bairro: 'Jardim', casos: 8 },
  { bairro: 'São José', casos: 12 },
  { bairro: 'Industrial', casos: 5 },
  { bairro: 'Vila Nova', casos: 9 },
];

const lineData = [
  { mes: 'Jan', atendimentos: 4 },
  { mes: 'Fev', atendimentos: 7 },
  { mes: 'Mar', atendimentos: 5 },
  { mes: 'Abr', atendimentos: 10 },
  { mes: 'Mai', atendimentos: 8 },
  { mes: 'Jun', atendimentos: 12 },
];

const Dashboard = () => {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [alertCount, setAlertCount] = useState(0);
  const [caseCount, setCaseCount] = useState(0);
  const [recurrentCount, setRecurrentCount] = useState(0);
  const [recentCases, setRecentCases] = useState([]);
  
  // Verificar autenticação
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Aqui seria feita a chamada à API para buscar os dados reais
  useEffect(() => {
    if (user) {
      // Simulação de dados
      setAlertCount(5);
      setCaseCount(42);
      setRecurrentCount(8);
      setRecentCases([
        {id: '1', name: 'Maria Silva', date: '12/05/2025', urgency: 'alta'},
        {id: '2', name: 'Ana Santos', date: '10/05/2025', urgency: 'média'},
        {id: '3', name: 'Pedro Oliveira', date: '08/05/2025', urgency: 'baixa'},
      ]);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

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
            <li>
              <Button variant="link" className="text-white p-0" onClick={() => navigate('/alerts')}>
                Alertas
              </Button>
            </li>
            {role === 'social_assistance' && (
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
        {alertCount > 0 && (
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
                  <BarChart data={barData}>
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
                  <LineChart data={lineData}>
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
                      <td className="py-3 px-4">{caso.name}</td>
                      <td className="py-3 px-4">{caso.date}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          caso.urgency === 'alta' ? 'bg-red-100 text-red-800' :
                          caso.urgency === 'média' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {caso.urgency}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/case/${caso.id}`)}>
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
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
