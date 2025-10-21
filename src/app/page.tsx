import Link from "next/link";
import { Button } from "../components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary/30 to-background">
      <main className="wflex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl text-center">
          <div className="mb-8">
            <h1 className="h-24 text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-7 animate-fade-in">
              Meninas Digitais
            </h1>
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Sistema de Gerenciamento de Palestras
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Plataforma para organização, inscrição e acompanhamento de palestras e eventos acadêmicos da UTFPR-CP
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="../palestra/">
              <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300">
                Ver Palestras
              </Button>
            </Link>
            <Link href="/relatorios/">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300">
                Acessar Relatórios
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-card rounded-xl shadow-lg p-6 border border-border hover:shadow-xl transition-shadow duration-300">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Palestras</h3>
              <p className="text-muted-foreground">
                Explore e inscreva-se em palestras sobre tecnologia, inovação e empreendedorismo
              </p>
            </div>

            <div className="bg-card rounded-xl shadow-lg p-6 border border-border hover:shadow-xl transition-shadow duration-300">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Gestão</h3>
              <p className="text-muted-foreground">
                Organize eventos, gerencie inscrições e acompanhe a participação em tempo real
              </p>
            </div>

            <div className="bg-card rounded-xl shadow-lg p-6 border border-border hover:shadow-xl transition-shadow duration-300">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Relatórios</h3>
              <p className="text-muted-foreground">
                Visualize estatísticas detalhadas e indicadores de presença e engajamento
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
