
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, UserCheck, AlertTriangle, FileText, Check, X } from 'lucide-react';
import { SocialFollowup, SocialFollowupInput } from '@/types';

// Esquema de validação
const followupSchema = z.object({
  case_id: z.string().uuid({ message: "É necessário selecionar um caso" }),
  visit_date: z.string().optional(),
  report: z.string().min(10, { message: "O relatório deve ter pelo menos 10 caracteres" }),
  action_taken: z.string().optional(),
});

type FormValues = z.infer<typeof followupSchema>;

const SocialFollowups = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  
  const [submitting, setSubmitting] = useState(false);
  const [recentFollowups, setRecentFollowups] = useState<any[]>([]);
  const [pendingAlerts, setPendingAlerts] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<FormValues>({
    resolver: zodResolver(followupSchema),
  });
  
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
  
  // Carregar dados iniciais
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        setDashboardLoading(true);
        
        // Buscar acompanhamentos recentes
        const { data: followups, error: followupsError } = await supabase
          .from('social_followups')
          .select(`
            id,
            case_id,
            visit_date,
            report,
            action_taken,
            created_at,
            case:assistance_cases (
              id, 
              person:assisted_persons (
                full_name
              )
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (followupsError) throw followupsError;
        setRecentFollowups(followups || []);
        
        // Buscar alertas pendentes
        const { data: alerts, error: alertsError } = await supabase
          .from('alerts')
          .select(`
            id,
            description,
            created_at,
            case_id,
            case:assistance_cases (
              urgency,
              person:assisted_persons (
                full_name,
                neighborhood,
                city
              )
            )
          `)
          .eq('is_resolved', false)
          .order('created_at', { ascending: false });
          
        if (alertsError) throw alertsError;
        setPendingAlerts(alerts || []);
      } catch (error: any) {
        console.error('Erro ao carregar dados do dashboard:', error);
        toast({
          title: "Erro ao carregar dados",
          description: error.message || "Não foi possível carregar os dados iniciais.",
          variant: "destructive",
        });
      } finally {
        setDashboardLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user]);
  
  const searchCases = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setSearchLoading(true);
      
      // Primeiro buscar pessoas que correspondam ao termo de busca
      const { data: people, error: peopleError } = await supabase
        .from('assisted_persons')
        .select('id, full_name')
        .ilike('full_name', `%${searchTerm}%`)
        .limit(10);
        
      if (peopleError) throw peopleError;
      
      if (people && people.length > 0) {
        // Buscar casos relacionados a essas pessoas
        const { data: cases, error: casesError } = await supabase
          .from('assistance_cases')
          .select(`
            id,
            urgency,
            description,
            created_at,
            is_suspicious,
            person:assisted_persons (
              full_name,
              neighborhood,
              city
            )
          `)
          .in('assisted_person_id', people.map(p => p.id))
          .order('created_at', { ascending: false });
          
        if (casesError) throw casesError;
        setSearchResults(cases || []);
      } else {
        setSearchResults([]);
      }
    } catch (error: any) {
      console.error('Erro na busca:', error);
      toast({
        title: "Erro na busca",
        description: error.message || "Ocorreu um erro ao buscar casos.",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };
  
  const selectCase = (caseId: string, personName: string) => {
    setValue('case_id', caseId);
    setSearchTerm(personName);
    setSearchResults([]);
  };
  
  const onSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true);

      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      const followupData: SocialFollowupInput = {
        case_id: data.case_id,
        performed_by: user.id,
        report: data.report,
        visit_date: data.visit_date || null,
        action_taken: data.action_taken || null
      };
      
      const { error } = await supabase
        .from('social_followups')
        .insert([followupData]);
        
      if (error) throw error;
      
      // Atualizar status do caso para "in_progress" se estiver "open"
      const { error: updateError } = await supabase
        .from('assistance_cases')
        .update({ case_status: 'in_progress' })
        .eq('id', data.case_id)
        .eq('case_status', 'open');
        
      if (updateError) {
        console.error('Erro ao atualizar status do caso:', updateError);
      }
      
      toast({
        title: "Sucesso!",
        description: "Acompanhamento registrado com sucesso.",
      });
      
      // Limpar formulário
      reset();
      setSearchTerm('');
      
      // Recarregar acompanhamentos recentes
      const { data: updatedFollowups } = await supabase
        .from('social_followups')
        .select(`
          id,
          case_id,
          visit_date,
          report,
          action_taken,
          created_at,
          case:assistance_cases (
            id, 
            person:assisted_persons (
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (updatedFollowups) {
        setRecentFollowups(updatedFollowups);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao registrar acompanhamento",
        description: error.message || "Ocorreu um erro ao registrar o acompanhamento.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
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
      
      // Remover alerta da lista
      setPendingAlerts(alerts => alerts.filter(a => a.id !== alertId));
      
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
  
  if (loading || dashboardLoading) {
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
          <h1 className="text-2xl font-bold mb-2">Acompanhamentos Sociais</h1>
          <p className="text-gray-600">
            Gerencie acompanhamentos sociais e registre visitas domiciliares.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna da Esquerda - Dashboard */}
          <div className="lg:col-span-1 space-y-6">
            {/* Alertas Pendentes */}
            <Card className={pendingAlerts.length > 0 ? "border-red-200" : ""}>
              <CardHeader className={`pb-3 ${pendingAlerts.length > 0 ? "bg-red-50" : ""}`}>
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                  Alertas Pendentes
                </CardTitle>
                <CardDescription>
                  {pendingAlerts.length} alerta(s) aguardando ação
                </CardDescription>
              </CardHeader>
              <CardContent className="py-3">
                {pendingAlerts.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <Check className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Não há alertas pendentes no momento.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingAlerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium">{alert.case?.person?.full_name}</h4>
                          {alert.case?.urgency && getUrgencyBadge(alert.case.urgency)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {alert.case?.person?.neighborhood}, {alert.case?.person?.city}
                        </p>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/case/${alert.case_id}`)}
                          >
                            Ver Caso
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            Resolver
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {pendingAlerts.length > 3 && (
                      <div className="text-center pt-2">
                        <Button variant="link" onClick={() => navigate('/alerts')}>
                          Ver todos os alertas
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Acompanhamentos Recentes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Acompanhamentos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                {recentFollowups.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Nenhum acompanhamento registrado ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentFollowups.map((followup) => (
                      <div key={followup.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                        <h4 className="font-medium">
                          {followup.case?.person?.full_name || "Nome não disponível"}
                        </h4>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Calendar className="h-3 w-3 mr-1" />
                          {followup.visit_date ? (
                            <span>Visita em {new Date(followup.visit_date).toLocaleDateString()}</span>
                          ) : (
                            <span>Sem visita presencial</span>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(`/case/${followup.case_id}`)}
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Coluna da Direita - Formulário e Ações */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="new">
              <TabsList className="mb-4">
                <TabsTrigger value="new">Novo Acompanhamento</TabsTrigger>
                <TabsTrigger value="search">Buscar Casos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="new">
                <Card>
                  <CardHeader>
                    <CardTitle>Registrar Acompanhamento Social</CardTitle>
                    <CardDescription>
                      Registre informações sobre visitas domiciliares e acompanhamentos realizados.
                    </CardDescription>
                  </CardHeader>
                  
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                      {/* Selecionar Caso */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Caso/Pessoa Assistida</label>
                        <div className="flex space-x-2">
                          <div className="flex-1">
                            <Input
                              placeholder="Buscar por nome da pessoa..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                          <Button 
                            type="button" 
                            onClick={searchCases} 
                            disabled={searchLoading || !searchTerm.trim()}
                            variant="outline"
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                        {errors.case_id && (
                          <p className="text-sm text-red-500 mt-1">{errors.case_id.message}</p>
                        )}
                        
                        {/* Resultados da busca */}
                        {searchResults.length > 0 && (
                          <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
                            <ul className="divide-y">
                              {searchResults.map((result) => (
                                <li 
                                  key={result.id} 
                                  className="p-3 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => selectCase(result.id, result.person.full_name)}
                                >
                                  <div className="font-medium">{result.person.full_name}</div>
                                  <div className="text-sm text-gray-500">
                                    {result.person.neighborhood}, {result.person.city}
                                    {result.is_suspicious && (
                                      <span className="ml-2 text-red-600 flex items-center">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Caso suspeito
                                      </span>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      {/* Data da Visita */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Data da Visita</label>
                        <Input 
                          type="date"
                          max={new Date().toISOString().split('T')[0]}
                          {...register("visit_date")}
                        />
                        <p className="text-xs text-gray-500">
                          Deixe em branco se não houve visita domiciliar.
                        </p>
                      </div>
                      
                      {/* Relatório */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Relatório de Acompanhamento <span className="text-red-500">*</span></label>
                        <Textarea 
                          placeholder="Descreva detalhadamente o acompanhamento realizado..."
                          className="min-h-[150px]"
                          {...register("report")}
                        />
                        {errors.report && (
                          <p className="text-sm text-red-500 mt-1">{errors.report.message}</p>
                        )}
                      </div>
                      
                      {/* Ações Tomadas */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Ações Realizadas</label>
                        <Textarea 
                          placeholder="Descreva as ações ou encaminhamentos realizados..."
                          {...register("action_taken")}
                        />
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          reset();
                          setSearchTerm('');
                          setSearchResults([]);
                        }}
                      >
                        Limpar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={submitting}
                      >
                        {submitting ? 'Registrando...' : 'Registrar Acompanhamento'}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="search">
                <Card>
                  <CardHeader>
                    <CardTitle>Buscar Casos para Acompanhamento</CardTitle>
                    <CardDescription>
                      Pesquise por casos que necessitam de acompanhamento social.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="Buscar por nome da pessoa assistida..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button 
                          onClick={searchCases} 
                          disabled={searchLoading || !searchTerm.trim()}
                        >
                          {searchLoading ? "Buscando..." : "Buscar"}
                        </Button>
                      </div>
                      
                      {searchResults.length > 0 ? (
                        <div className="space-y-3 mt-4">
                          {searchResults.map((result) => (
                            <Card key={result.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium">
                                      {result.person.full_name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      {result.person.neighborhood}, {result.person.city}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    {getUrgencyBadge(result.urgency)}
                                    {result.is_suspicious && (
                                      <Badge className="bg-red-100 text-red-800">Suspeito</Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="mt-2 text-sm">
                                  <p className="line-clamp-2">{result.description}</p>
                                </div>
                                
                                <div className="mt-3 flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => navigate(`/case/${result.id}`)}
                                  >
                                    Ver Detalhes
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => {
                                      setValue('case_id', result.id);
                                      setSearchTerm(result.person.full_name);
                                    }}
                                  >
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Acompanhar
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : searchTerm && !searchLoading ? (
                        <div className="text-center py-8">
                          <X className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                          <h3 className="text-lg font-medium mb-1">Nenhum resultado encontrado</h3>
                          <p className="text-gray-500">
                            Tente buscar usando outro nome ou termo.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialFollowups;
