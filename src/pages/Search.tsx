
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search as SearchIcon, Filter, AlertTriangle, Calendar } from 'lucide-react';
import { AssistedPerson } from '@/types';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

type SearchResult = {
  id: string;
  assisted_person_id: string;
  description: string;
  created_at: string;
  updated_at: string;
  urgency: string;
  case_status: string;
  is_suspicious: boolean | null;
  is_recurrent: boolean | null;
  person: {
    full_name: string;
    city: string;
    neighborhood: string;
  };
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('pt-BR', options);
};

const Search = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const query = useQuery();
  const personId = query.get('person');
  
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [peopleResults, setPeopleResults] = useState<AssistedPerson[]>([]);
  const [peopleSearching, setPeopleSearching] = useState(false);
  
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      searchType: 'person',
      name: '',
      cpf: '',
      neighborhood: '',
      city: '',
      dateFrom: '',
      dateTo: ''
    }
  });
  
  const searchType = watch('searchType');
  
  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  // Se veio com ID de pessoa na URL, buscar casos dessa pessoa
  useEffect(() => {
    if (personId) {
      searchCasesByPerson(personId);
    }
  }, [personId]);
  
  const searchCasesByPerson = async (personId: string) => {
    try {
      setSearchLoading(true);
      
      const { data, error } = await supabase
        .from('assistance_cases')
        .select(`
          id,
          assisted_person_id,
          description,
          created_at,
          updated_at,
          urgency,
          case_status,
          is_suspicious,
          is_recurrent,
          person:assisted_persons (
            full_name,
            city,
            neighborhood
          )
        `)
        .eq('assisted_person_id', personId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setSearchResults(data || []);
      setHasSearched(true);
    } catch (error: any) {
      console.error('Erro na busca:', error);
      toast({
        title: "Erro na busca",
        description: error.message || "Ocorreu um erro ao buscar os casos.",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };
  
  const onSubmit = async (data: any) => {
    setHasSearched(true);
    
    try {
      if (searchType === 'person') {
        await searchPeople(data);
      } else {
        await searchCases(data);
      }
    } catch (error: any) {
      toast({
        title: "Erro na busca",
        description: error.message || "Ocorreu um erro ao realizar a busca.",
        variant: "destructive",
      });
    }
  };
  
  const searchPeople = async (data: any) => {
    setPeopleSearching(true);
    setPeopleResults([]);
    
    try {
      let query = supabase
        .from('assisted_persons')
        .select('*')
        .order('full_name', { ascending: true });
      
      if (data.name) {
        query = query.ilike('full_name', `%${data.name}%`);
      }
      
      if (data.cpf) {
        query = query.ilike('cpf', `%${data.cpf}%`);
      }
      
      if (data.neighborhood) {
        query = query.ilike('neighborhood', `%${data.neighborhood}%`);
      }
      
      if (data.city) {
        query = query.ilike('city', `%${data.city}%`);
      }
      
      const { data: results, error } = await query;
      
      if (error) throw error;
      
      setPeopleResults(results || []);
    } catch (error) {
      throw error;
    } finally {
      setPeopleSearching(false);
    }
  };
  
  const searchCases = async (data: any) => {
    setSearchLoading(true);
    setSearchResults([]);
    
    try {
      let query = supabase
        .from('assistance_cases')
        .select(`
          id,
          assisted_person_id,
          description,
          created_at,
          updated_at,
          urgency,
          case_status,
          is_suspicious,
          is_recurrent,
          person:assisted_persons (
            full_name,
            city,
            neighborhood
          )
        `)
        .order('created_at', { ascending: false });
      
      // Filtro por nome da pessoa assistida
      if (data.name) {
        const { data: peopleIds, error } = await supabase
          .from('assisted_persons')
          .select('id')
          .ilike('full_name', `%${data.name}%`);
          
        if (!error && peopleIds && peopleIds.length > 0) {
          query = query.in('assisted_person_id', peopleIds.map(p => p.id));
        } else {
          // Se não encontrar pessoas, não retornar resultados
          setSearchResults([]);
          setSearchLoading(false);
          return;
        }
      }
      
      // Filtro por bairro
      if (data.neighborhood) {
        const { data: peopleIds, error } = await supabase
          .from('assisted_persons')
          .select('id')
          .ilike('neighborhood', `%${data.neighborhood}%`);
          
        if (!error && peopleIds && peopleIds.length > 0) {
          query = query.in('assisted_person_id', peopleIds.map(p => p.id));
        } else {
          // Se não encontrar pessoas, não retornar resultados
          setSearchResults([]);
          setSearchLoading(false);
          return;
        }
      }
      
      // Filtro por cidade
      if (data.city) {
        const { data: peopleIds, error } = await supabase
          .from('assisted_persons')
          .select('id')
          .ilike('city', `%${data.city}%`);
          
        if (!error && peopleIds && peopleIds.length > 0) {
          query = query.in('assisted_person_id', peopleIds.map(p => p.id));
        } else {
          // Se não encontrar pessoas, não retornar resultados
          setSearchResults([]);
          setSearchLoading(false);
          return;
        }
      }
      
      // Filtro por data
      if (data.dateFrom) {
        query = query.gte('created_at', data.dateFrom);
      }
      
      if (data.dateTo) {
        // Adiciona um dia para incluir todo o último dia
        const endDate = new Date(data.dateTo);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt('created_at', endDate.toISOString());
      }
      
      const { data: results, error } = await query;
      
      if (error) throw error;
      
      setSearchResults(results || []);
    } catch (error) {
      throw error;
    } finally {
      setSearchLoading(false);
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
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Aberto</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Em Andamento</Badge>;
      case 'referred':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Encaminhado</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Fechado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
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
          <h1 className="text-2xl font-bold mb-2">Pesquisar</h1>
          <p className="text-gray-600">
            Busque por pessoas assistidas ou atendimentos realizados.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SearchIcon className="mr-2 h-5 w-5" />
              Critérios de Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-full sm:w-1/3">
                  <Label htmlFor="searchType">Tipo de Busca</Label>
                  <Select 
                    defaultValue="person" 
                    onValueChange={(value) => setValue('searchType', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="person">Pessoa Assistida</SelectItem>
                      <SelectItem value="case">Atendimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" placeholder="Nome completo ou parcial" {...register('name')} />
                </div>
                
                {searchType === 'person' && (
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" placeholder="CPF" {...register('cpf')} />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input id="neighborhood" placeholder="Bairro" {...register('neighborhood')} />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" placeholder="Cidade" {...register('city')} />
                </div>
              </div>
              
              {searchType === 'case' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateFrom">Data Inicial</Label>
                    <Input id="dateFrom" type="date" {...register('dateFrom')} />
                  </div>
                  <div>
                    <Label htmlFor="dateTo">Data Final</Label>
                    <Input id="dateTo" type="date" {...register('dateTo')} />
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => reset()}>
                  Limpar
                </Button>
                <Button type="submit" disabled={searchLoading || peopleSearching}>
                  {searchLoading || peopleSearching ? (
                    "Buscando..."
                  ) : (
                    <>
                      <SearchIcon className="mr-2 h-4 w-4" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Resultados de Pessoas */}
        {hasSearched && searchType === 'person' && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Resultados</h2>
              <Badge variant="outline" className="bg-gray-100">
                {peopleResults.length} pessoas encontradas
              </Badge>
            </div>
            
            {peopleResults.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h3 className="text-lg font-medium mb-2">Nenhum resultado encontrado</h3>
                <p className="text-gray-600 mb-4">
                  Tente ajustar os critérios de busca para encontrar pessoas cadastradas.
                </p>
                <Button variant="outline" onClick={() => navigate('/register-person')}>
                  Cadastrar Nova Pessoa
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {peopleResults.map((person) => (
                  <Card key={person.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <h3 className="font-bold mb-2">{person.full_name}</h3>
                      
                      <div className="space-y-1 text-sm mb-4">
                        <p>
                          <span className="font-medium">CPF:</span> {person.cpf || 'Não informado'}
                        </p>
                        <p>
                          <span className="font-medium">Nascimento:</span> {new Date(person.birth_date).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">Endereço:</span> {person.address}
                        </p>
                        <p>
                          <span className="font-medium">Bairro:</span> {person.neighborhood}, {person.city} - {person.state}
                        </p>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => searchCasesByPerson(person.id)}
                        >
                          Ver Atendimentos
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => navigate(`/register-case?person_id=${person.id}`)}
                        >
                          Novo Atendimento
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Resultados de Atendimentos */}
        {(hasSearched && searchType === 'case' || personId) && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Atendimentos</h2>
              <Badge variant="outline" className="bg-gray-100">
                {searchResults.length} atendimentos encontrados
              </Badge>
            </div>
            
            {searchResults.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h3 className="text-lg font-medium mb-2">Nenhum atendimento encontrado</h3>
                <p className="text-gray-600">
                  Não há registros de atendimento com os critérios informados.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {personId && searchResults.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <h3 className="font-medium text-blue-800">
                      Histórico de atendimentos: {searchResults[0].person?.full_name}
                    </h3>
                    <p className="text-sm text-blue-700">
                      {searchResults[0].person?.neighborhood}, {searchResults[0].person?.city}
                    </p>
                  </div>
                )}
                
                {searchResults.map((result) => (
                  <Card key={result.id} className={result.is_suspicious ? "border-red-200" : ""}>
                    <div className={`p-4 ${result.is_suspicious ? "bg-red-50" : ""}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">
                            {result.person?.full_name}
                            {result.is_suspicious && (
                              <AlertTriangle className="inline-block ml-2 h-4 w-4 text-red-500" />
                            )}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(result.created_at)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(result.case_status)}
                          {getUrgencyBadge(result.urgency)}
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm">
                        <p className="line-clamp-2">{result.description}</p>
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <div>
                          {result.is_recurrent && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                              Caso Recorrente
                            </Badge>
                          )}
                        </div>
                        <Button size="sm" onClick={() => navigate(`/case/${result.id}`)}>
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
