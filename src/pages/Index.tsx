
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // If already logged in, redirect to dashboard
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
            <Button variant="outline" onClick={() => navigate('/login')}>Sign In</Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <section className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Protection System for Vulnerable Women and Children
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              An integrated platform for assistance and monitoring of vulnerability cases,
              enabling more efficient and coordinated actions between hospitals, social services, and police.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/login')}>
                Access the System
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/register')}>
                Create an Account
              </Button>
            </div>
          </section>

          <section className="grid md:grid-cols-3 gap-6 mb-20">
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-bold mb-3">Unified Registration</h3>
              <p className="text-muted-foreground">
                Centralized registration of assistance to women and children in vulnerable situations,
                allowing complete tracking of each case's history.
              </p>
            </div>

            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-bold mb-3">Automatic Alerts</h3>
              <p className="text-muted-foreground">
                Intelligent system that identifies recurring cases and issues automatic alerts to
                Social Services, speeding up necessary interventions.
              </p>
            </div>

            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-bold mb-3">Multi-sector Integration</h3>
              <p className="text-muted-foreground">
                Efficient communication between hospitals, social services, and police, ensuring
                coordinated and effective actions in protecting vulnerable women and children.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">&copy; 2025 Nidus Sentinela - All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
