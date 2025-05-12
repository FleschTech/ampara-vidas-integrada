
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, AlertTriangle, Clock, UserCheck, Upload, Download, 
  Send, Calendar, Files, CheckCircle, Activity, AlertCircle 
} from 'lucide-react';
import { AssistanceCase, AssistedPerson, SocialFollowup } from '@/types';

const formatStatus = (status: string) => {
  switch (status) {
    case 'open':
      return { label: 'Aberto', color: 'bg-blue-100 text-blue-800' };
    case 'in_progress':
      return { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' };
    case 'referred':
      return { label: 'Encaminhado', color: 'bg-purple-100 text-purple-800' };
    case 'closed':
      return { label: 'Fechado', color: 'bg-gray-100 text-gray-800' };
    default:
      return { label: status, color: 'bg-gray-100 text-gray-800' };
  }
};

const formatUrgency = (urgency: string) => {
  switch (urgency) {
    case 'low':
      return { label: 'Baixa', color: 'bg-green-100 text-green-800' };
    case 'medium':
      return { label: 'Média', color: 'bg-yellow-100 text-yellow-800' };
    case 'high':
      return { label: 'Alta', color: 'bg-orange-100 text-orange-800' };
    case 'critical':
      return { label: 'Crítica', color: 'bg-red-100 text-red-800' };
    default:
      return { label: urgency, color: 'bg-gray-100 text-gray-800' };
  }
};

const formatSuspicion = (type: string) => {
  switch (type) {
    case 'physical_abuse':
      return 'Violência física';
    case 'psychological_abuse':
      return 'Violência psicológica';
    case 'sexual_abuse':
      return 'Violência sexual';
    case 'negligence':
      return 'Negligência';
    case 'other':
      return 'Outro';
    default:
      return type;
  }
};

const CaseDetails = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { caseId } = useParams();
  
  const [caseFetchLoading, setCaseFetchLoading] = useState(true);
  const [caseData, setCaseData] = useState<AssistanceCase | null>(null);
  const [personData, setPersonData] = useState<AssistedPerson | null>(null);
  const [followups, setFollowups] = useState<SocialFollowup[]>([]);
  const [referralData, setReferralData] = useState<any>(null);
  
  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  // Carregar dados do caso
  useEffect(() => {
    const fetchCaseData = async () => {
      if (!caseId) return;
      
      try {
        setCaseFetchLoading(true);
        
        // Buscar dados do caso
        const { data: caseData, error: caseError } = await supabase
          .from('assistance_cases')
          .select('*')
          .eq('id', caseId)
          .single();
          
        if (caseError) throw caseError;
        
        if (!caseData) {
          navigate('/dashboard');
          return;
        }
        
        setCaseData(caseData);
        
        // Buscar dados da pessoa
        const { data: personData, error: personError } = await supabase
          .from('assisted_persons')
          .select('*')
          .eq('id', caseData.assisted_person_id)
          .single();
          
        if (personError) throw personError;
        setPersonData(personData);
        
        // Buscar acompanhamentos sociais
        const { data: followupsData, error: followupsError } = await supabase
          .from('social_followups')
          .select('*')
          .eq('case_id', caseId)
          .order('created_at', { ascending: false });
          
        if (followupsError) throw followupsError;
        setFollowups(followupsData || []);
        
        // Buscar encaminhamento para a polícia, se houver
        const { data: referralData, error: referralError } = await supabase
          .from('police_referrals')
          .select('*')
          .eq('case_id', caseId)
          .maybeSingle();
          
        if (!referralError) {
          setReferralData(referralData);
        }
      } catch (error: any) {
        console.error('Erro ao carregar dados do caso:', error);
        toast({
          title: "Erro ao carregar dados",
          description: error.message || "Não foi possível carregar os detalhes do caso.",
          variant: "destructive",
        });
      } finally {
        setCaseFetchLoading(false);
      }
    };
    
    fetchCaseData();
  }, [caseId, navigate]);
  
  if (loading || caseFetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!caseData || !personData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Caso não encontrado</h2>
          <p className="text-gray-500 mb-4">Os detalhes deste caso não puderam ser carregados.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const status = formatStatus(caseData.case_status);
  const urgency = formatUrgency(caseData.urgency);
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <Button variant="outline" className="mb-4" onClick={() => navigate('/dashboard')}>
          Voltar ao Dashboard
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna da Esquerda - Dados da Pessoa */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Pessoa Assistida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{personData.full_name}</h3>
                  <p className="text-sm text-gray-600">
                    {personData.cpf && `CPF: ${personData.cpf}`}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Data de Nascimento:</span>{' '}
                    {new Date(personData.birth_date).toLocaleDateString()}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Gênero:</span> {personData.gender}
                  </div>
                  {personData.phone && (
                    <div className="text-sm">
                      <span className="font-medium">Telefone:</span> {personData.phone}
                    </div>
                  )}
                </div>
                
                <div className="pt-2 border-t border-gray-200">
                  <h4 className="font-medium mb-2">Endereço</h4>
                  <p className="text-sm">{personData.address}</p>
                  <p className="text-sm">{personData.neighborhood}, {personData.city} - {personData.state}</p>
                  {personData.zip_code && <p className="text-sm">CEP: {personData.zip_code}</p>}
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/search?person=${personData.id}`)}>
                    Ver Histórico Completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Coluna Central e Direita - Detalhes do Caso */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Atendimento
                    {caseData.is_suspicious && (
                      <Badge variant="outline" className="ml-2 bg-red-50 text-red-800 border-red-200">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Caso Suspeito
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Registrado em {new Date(caseData.created_at).toLocaleDateString()} {new Date(caseData.created_at).toLocaleTimeString()}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={status.color}>
                    {status.label}
                  </Badge>
                  <Badge className={urgency.color}>
                    Urgência: {urgency.label}
                  </Badge>
                </div>
              </CardHeader>
              
              <Tabs defaultValue="details">
                <CardContent>
                  <TabsList className="mb-4">
                    <TabsTrigger value="details">Detalhes</TabsTrigger>
                    <TabsTrigger value="followups">
                      Acompanhamentos {followups.length > 0 && `(${followups.length})`}
                    </TabsTrigger>
                    <TabsTrigger value="documents">Documentos</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Descrição do Atendimento</h3>
                      <div className="bg-gray-50 p-3 rounded-md text-sm">
                        {caseData.description}
                      </div>
                    </div>
                    
                    {caseData.is_suspicious && (
                      <div>
                        <h3 className="font-medium mb-2 text-red-700 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Informações de Suspeita
                        </h3>
                        <div className="bg-red-50 p-3 rounded-md text-sm border border-red-200">
                          <p><span className="font-medium">Tipo de Suspeita:</span> {caseData.suspicion_type && formatSuspicion(caseData.suspicion_type)}</p>
                          {caseData.is_recurrent && (
                            <p className="mt-2 font-medium text-red-700">
                              Este é um caso recorrente que pode indicar um padrão.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {referralData && (
                      <div>
                        <h3 className="font-medium mb-2 text-purple-700 flex items-center">
                          <Send className="h-4 w-4 mr-1" />
                          Encaminhamento para Delegacia
                        </h3>
                        <div className="bg-purple-50 p-3 rounded-md text-sm border border-purple-200">
                          <p><span className="font-medium">Data de Encaminhamento:</span> {new Date(referralData.referral_date).toLocaleDateString()}</p>
                          <p><span className="font-medium">Status:</span> {referralData.status}</p>
                          <p className="mt-2"><span className="font-medium">Detalhes:</span> {referralData.report_details}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Botões de ação de acordo com o perfil do usuário */}
                    <div className="border-t border-gray-200 pt-4 flex flex-wrap gap-2">
                      {role === 'social_assistance' && (
                        <Button onClick={() => navigate(`/followup/new?case_id=${caseId}`)}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Registrar Acompanhamento
                        </Button>
                      )}
                      
                      {(role === 'social_assistance' || role === 'hospital') && !referralData && (
                        <Button variant="destructive" onClick={() => navigate(`/refer-police?case_id=${caseId}`)}>
                          <Send className="mr-2 h-4 w-4" />
                          Encaminhar para Delegacia
                        </Button>
                      )}
                      
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Gerar PDF
                      </Button>
                      
                      <Button variant="outline" onClick={() => navigate(`/case-upload?case_id=${caseId}`)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload de Documentos
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="followups">
                    {followups.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="mx-auto h-12 w-12 mb-2 opacity-20" />
                        <p>Nenhum acompanhamento social registrado para este caso.</p>
                        
                        {role === 'social_assistance' && (
                          <Button 
                            className="mt-4" 
                            onClick={() => navigate(`/followup/new?case_id=${caseId}`)}
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Registrar Acompanhamento
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {followups.map((followup) => (
                          <Card key={followup.id}>
                            <CardHeader className="py-3">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                                  <CardTitle className="text-sm font-medium">
                                    {followup.visit_date 
                                      ? `Visita em ${new Date(followup.visit_date).toLocaleDateString()}`
                                      : 'Acompanhamento sem visita'
                                    }
                                  </CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                  {new Date(followup.created_at).toLocaleDateString()}
                                </CardDescription>
                              </div>
                            </CardHeader>
                            <CardContent className="py-2 text-sm">
                              <p className="font-medium mb-1">Relatório:</p>
                              <p className="mb-3">{followup.report}</p>
                              
                              {followup.action_taken && (
                                <>
                                  <p className="font-medium mb-1">Ação Realizada:</p>
                                  <p>{followup.action_taken}</p>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                        
                        {role === 'social_assistance' && (
                          <div className="pt-2">
                            <Button 
                              onClick={() => navigate(`/followup/new?case_id=${caseId}`)}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Adicionar Novo Acompanhamento
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="documents">
                    <div className="text-center py-8 text-gray-500">
                      <Files className="mx-auto h-12 w-12 mb-2 opacity-20" />
                      <p>Funcionalidade de documentos em desenvolvimento.</p>
                      
                      <Button 
                        className="mt-4" 
                        variant="outline"
                        onClick={() => navigate(`/case-upload?case_id=${caseId}`)}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload de Documentos
                      </Button>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
              
              <CardFooter className="bg-gray-50 border-t flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  ID: {caseId}
                </div>
                
                {/* Status actions based on role */}
                {(role === 'hospital' || role === 'social_assistance' || role === 'admin') && caseData.case_status !== 'closed' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Aqui seria implementada a lógica para atualizar o status
                      toast({
                        title: "Funcionalidade em desenvolvimento",
                        description: "A atualização de status será implementada em breve.",
                      });
                    }}
                  >
                    <CheckCircle className="mr-2 h-3 w-3" />
                    {caseData.case_status === 'open' ? 'Iniciar Acompanhamento' : 
                     caseData.case_status === 'in_progress' ? 'Encerrar Caso' : 
                     'Atualizar Status'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
