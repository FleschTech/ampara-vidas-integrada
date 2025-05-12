
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

type AlertPerson = {
  full_name: string;
  neighborhood: string;
  city: string;
};

type AlertCase = {
  assisted_person_id: string;
  urgency: string;
  description: string;
  person: AlertPerson;
};

type Alert = {
  id: string;
  case_id: string;
  alert_type: string;
  description: string;
  created_at: string;
  is_resolved: boolean | null;
  resolved_at: string | null;
  case: AlertCase;
};

const Alerts = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [resolvedAlerts, setResolvedAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  // Verificar permissões - apenas assistência social e admin devem ter acesso
  useEffect(() => {
    if (!loading && user && role !== 'social_assistance' && role !== 'admin') {
      toast({
        title: "Acesso restrito",
        description: "Você não tem permissão para acessar essa página.",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [role, loading, user, navigate]);
  
  // Carregar alertas
  useEffect(() => {
    const fetchAlerts = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Buscar alertas não resolvidos
        const { data: activeAlertsData, error: activeError } = await supabase
          .from('alerts')
          .select(`
            id,
            case_id,
            alert_type,
            description,
            created_at,
            is_resolved,
            resolved_at,
            case:assistance_cases!inner(
              assisted_person_id,
              urgency,
              description,
              person:assisted_persons!inner(
                full_name,
                neighborhood,
                city
              )
            )
          `)
          .eq('is_resolved', false)
          .order('created_at', { ascending: false });
          
        if (activeError) throw activeError;
        
        // Process data to match the expected format
        const processedActiveAlerts = activeAlertsData?.map(alert => ({
          ...alert,
          case: {
            ...alert.case[0],
            person: alert.case[0].person[0]
          }
        })) || [];
        
        setActiveAlerts(processedActiveAlerts as Alert[]);
        
        // Buscar alertas resolvidos
        const { data: resolvedAlertsData, error: resolvedError } = await supabase
          .from('alerts')
          .select(`
            id,
            case_id,
            alert_type,
            description,
            created_at,
            is_resolved,
            resolved_at,
            case:assistance_cases!inner(
              assisted_person_id,
              urgency,
              description,
              person:assisted_persons!inner(
                full_name,
                neighborhood,
                city
              )
            )
          `)
          .eq('is_resolved', true)
          .order('resolved_at', { ascending: false })
          .limit(10);
          
        if (resolvedError) throw resolvedError;
        
        // Process data to match the expected format
        const processedResolvedAlerts = resolvedAlertsData?.map(alert => ({
          ...alert,
          case: {
            ...alert.case[0],
            person: alert.case[0].person[0]
          }
        })) || [];
        
        setResolvedAlerts(processedResolvedAlerts as Alert[]);
      } catch (error: any) {
        console.error('Erro ao carregar alertas:', error);
        toast({
          title: "Erro ao carregar alertas",
          description: error.message || "Não foi possível carregar os alertas.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAlerts();
  }, [user]);
  
  const handleResolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ 
          is_resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);
        
      if (error) throw error;
      
      // Atualizar as listas de alertas
      setActiveAlerts(prevAlerts => {
        const alertToMove = prevAlerts.find(alert => alert.id === alertId);
        if (alertToMove) {
          // Remover da lista de ativos
          const newActiveAlerts = prevAlerts.filter(alert => alert.id !== alertId);
          
          // Adicionar à lista de resolvidos
          const resolvedAlert = {
            ...alertToMove,
            is_resolved: true,
            resolved_at: new Date().toISOString()
          };
          setResolvedAlerts(prev => [resolvedAlert, ...prev]);
          
          return newActiveAlerts;
        }
        return prevAlerts;
      });
      
      toast({
        title: "Alerta resolvido",
        description: "O alerta foi marcado como resolvido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao resolver alerta",
        description: error.message || "Ocorreu um erro ao tentar resolver o alerta.",
        variant: "destructive",
      });
    }
  };
  
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  
  const getUrgencyBadge = (urgency: string) => {
    switch(urgency) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Crítica</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Alta</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Média</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800 border-green-200">Baixa</Badge>;
    }
  };
  
  const getAlertTypeBadge = (type: string) => {
    switch(type) {
      case 'recurrence':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Recorrência</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <Button variant="outline" className="mb-4" onClick={() => navigate('/dashboard')}>
          Voltar ao Dashboard
        </Button>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Alertas de Casos Suspeitos</h1>
          <p className="text-gray-600">
            Gerencie e acompanhe alertas de recorrências e casos suspeitos que necessitam de atenção.
          </p>
        </div>
        
        <Tabs defaultValue="active">
          <TabsList className="mb-6">
            <TabsTrigger value="active" className="relative">
              Alertas Ativos
              {activeAlerts.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {activeAlerts.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Alertas Resolvidos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {activeAlerts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-medium mb-2">Sem alertas ativos</h2>
                <p className="text-gray-600 mb-4">
                  Não há alertas pendentes de atenção no momento.
                </p>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Voltar ao Dashboard
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeAlerts.map((alert) => (
                  <Card key={alert.id} className="border-red-200">
                    <CardHeader className="bg-red-50 border-b border-red-100 pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center text-red-800">
                            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                            Alerta: {alert.case?.person?.full_name || "Nome não disponível"}
                          </CardTitle>
                          <CardDescription>
                            Criado em {new Date(alert.created_at).toLocaleDateString()} | 
                            {getAlertTypeBadge(alert.alert_type)} |
                            {alert.case?.person?.neighborhood}, {alert.case?.person?.city}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.case?.urgency && getUrgencyBadge(alert.case.urgency)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 pb-4">
                      <div className="mb-4">
                        <h3 className="font-medium mb-1">Descrição do Alerta:</h3>
                        <p className="text-sm">{alert.description}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="font-medium mb-1">Detalhes do Caso:</h3>
                        <p className="text-sm">{alert.case?.description?.substring(0, 150)}...</p>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <Button 
                          variant="outline" 
                          onClick={() => navigate(`/case/${alert.case_id}`)}
                        >
                          Ver Detalhes do Caso
                        </Button>
                        
                        <Button 
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          Marcar como Resolvido
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="resolved">
            {resolvedAlerts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Info className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-xl font-medium mb-2">Sem histórico de alertas</h2>
                <p className="text-gray-600">
                  Nenhum alerta foi resolvido ainda.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {resolvedAlerts.map((alert) => (
                  <Card key={alert.id} className="opacity-80">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                            Resolvido: {alert.case?.person?.full_name || "Nome não disponível"}
                          </CardTitle>
                          <CardDescription>
                            Resolvido em {alert.resolved_at ? new Date(alert.resolved_at).toLocaleDateString() : 'N/A'} | 
                            {getAlertTypeBadge(alert.alert_type)}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-3 pb-3">
                      <div className="mb-2">
                        <h3 className="font-medium mb-1">Descrição do Alerta:</h3>
                        <p className="text-sm">{alert.description}</p>
                      </div>
                      
                      <div className="flex justify-end items-center pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/case/${alert.case_id}`)}
                        >
                          Ver Caso
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const getUrgencyBadge = (urgency: string) => {
  switch(urgency) {
    case 'critical':
      return <Badge className="bg-red-100 text-red-800 border-red-200">Crítica</Badge>;
    case 'high':
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Alta</Badge>;
    case 'medium':
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Média</Badge>;
    default:
      return <Badge className="bg-green-100 text-green-800 border-green-200">Baixa</Badge>;
  }
};

const getAlertTypeBadge = (type: string) => {
  switch(type) {
    case 'recurrence':
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Recorrência</Badge>;
    default:
      return <Badge>{type}</Badge>;
  }
};

export default Alerts;
