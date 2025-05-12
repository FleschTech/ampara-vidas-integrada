
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Se já estiver logado, redirecionar para o dashboard
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/10 to-background">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Nidus Sentinela</h1>
          <nav>
            <Button variant="outline" onClick={() => navigate('/login')}>Entrar</Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <section className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Sistema de Proteção para Mulheres e Crianças Vulneráveis
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Uma plataforma integrada para assistência e monitoramento de casos de vulnerabilidade,
              possibilitando ações mais eficientes e coordenadas entre hospitais, assistência social e delegacias.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/login')}>
                Acessar o Sistema
              </Button>
            </div>
          </section>

          <section className="grid md:grid-cols-3 gap-6 mb-20">
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-bold mb-3">Cadastro Unificado</h3>
              <p className="text-muted-foreground">
                Registro centralizado de atendimentos a mulheres e crianças em situação de vulnerabilidade,
                permitindo o acompanhamento completo do histórico de cada caso.
              </p>
            </div>

            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-bold mb-3">Alertas Automáticos</h3>
              <p className="text-muted-foreground">
                Sistema inteligente que identifica casos recorrentes e emite alertas automáticos para
                Assistência Social, agilizando intervenções necessárias.
              </p>
            </div>

            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-bold mb-3">Integração Multisetorial</h3>
              <p className="text-muted-foreground">
                Comunicação eficiente entre hospitais, serviço social e delegacias, garantindo
                ações coordenadas e efetivas na proteção de mulheres e crianças vulneráveis.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">&copy; 2025 Nidus Sentinela - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
