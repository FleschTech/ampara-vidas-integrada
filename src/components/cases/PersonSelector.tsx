
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Check, Loader, Search, UserPlus } from 'lucide-react';
import { AssistedPerson } from '@/types';

interface PersonSelectorProps {
  selectedPerson: string | null;
  setSelectedPerson: (id: string | null) => void;
}

export const PersonSelector = ({ selectedPerson, setSelectedPerson }: PersonSelectorProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<AssistedPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentPersons, setRecentPersons] = useState<AssistedPerson[]>([]);
  
  // Carregar pessoas recentes
  useEffect(() => {
    const fetchRecentPersons = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('assisted_persons')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        setRecentPersons(data || []);
      } catch (error: any) {
        console.error('Erro ao buscar pessoas recentes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentPersons();
  }, []);
  
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        description: "Digite um termo para buscar",
      });
      return;
    }
    
    try {
      setLoading(true);
      // Busca por nome ou CPF
      const { data, error } = await supabase
        .from('assisted_persons')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%, cpf.eq.${searchTerm}`)
        .limit(10);
        
      if (error) throw error;
      
      setSearchResults(data || []);
      
      if (data && data.length === 0) {
        toast({
          description: "Nenhuma pessoa encontrada com esses dados",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro na busca",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };
  
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Selecionar Pessoa Assistida</h3>
      
      <Tabs defaultValue="search">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="search">Buscar Pessoa</TabsTrigger>
          <TabsTrigger value="recent">Registros Recentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-grow">
                <Input
                  placeholder="Digite nome ou CPF"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <RadioGroup
                value={selectedPerson || ""}
                onValueChange={setSelectedPerson}
                className="space-y-2"
              >
                {searchResults.map((person) => (
                  <div
                    key={person.id}
                    className={`border rounded-md p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer ${
                      selectedPerson === person.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedPerson(person.id)}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={person.id} id={`person-${person.id}`} />
                      <div>
                        <p className="font-medium">{person.full_name}</p>
                        <p className="text-sm text-gray-500">
                          {person.cpf ? `CPF: ${person.cpf} • ` : ''}
                          {`${calculateAge(person.birth_date)} anos • ${person.city} - ${person.state}`}
                        </p>
                      </div>
                    </div>
                    {selectedPerson === person.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                ))}
              </RadioGroup>
            )}
            
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => navigate('/register-person')}
                className="w-full"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar Nova Pessoa
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="recent">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recentPersons.length > 0 ? (
            <RadioGroup
              value={selectedPerson || ""}
              onValueChange={setSelectedPerson}
              className="space-y-2"
            >
              {recentPersons.map((person) => (
                <div
                  key={person.id}
                  className={`border rounded-md p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer ${
                    selectedPerson === person.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedPerson(person.id)}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={person.id} id={`recent-person-${person.id}`} />
                    <div>
                      <p className="font-medium">{person.full_name}</p>
                      <p className="text-sm text-gray-500">
                        {person.cpf ? `CPF: ${person.cpf} • ` : ''}
                        {`${calculateAge(person.birth_date)} anos • ${person.city} - ${person.state}`}
                      </p>
                    </div>
                  </div>
                  {selectedPerson === person.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              ))}
            </RadioGroup>
          ) : (
            <p className="text-center py-4 text-gray-500">
              Nenhuma pessoa registrada recentemente.
            </p>
          )}
          
          <div className="text-center mt-4">
            <Button
              variant="outline"
              onClick={() => navigate('/register-person')}
              className="w-full"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Cadastrar Nova Pessoa
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
