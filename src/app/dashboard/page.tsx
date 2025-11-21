"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import GoogleAuthButton from "../../components/GoogleAuthButton";
import { Calendar, BarChart3, Users, ArrowRight, Settings } from "lucide-react";
import { db } from "../../lib/firebase";
import { where } from "firebase/firestore";
import { setupCountListener, setupFirestoreListener } from "../../lib/firestore-utils";

type Participante = {
  id: string;
  palestraId: string;
  nome: string;
  email: string;
  presente?: boolean;
};

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [totalPalestras, setTotalPalestras] = useState<number>(0);
  const [minhasInscricoes, setMinhasInscricoes] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Função para normalizar o role (remover espaços)
  const getUserRole = () => {
    return session?.user?.role?.trim().toLowerCase() || 'participante';
  };

  const isAdmin = () => getUserRole() === 'administrador';
  const isOrganizer = () => getUserRole() === 'organizador';
  const isPalestrante = () => getUserRole() === 'palestrante';
  const hasElevatedPermissions = () => isAdmin() || isOrganizer() || isPalestrante();

  // Redireciona para home se não estiver logado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/');
    }
  }, [status, router]);

  // Buscar dados do Firebase usando utilitários seguros
  useEffect(() => {
    if (!session?.user?.email) return;

    let cleanupPalestras: (() => void) | null = null;
    let cleanupParticipantes: (() => void) | null = null;

    const setupListeners = () => {
      try {
        // Para palestrantes, contar apenas suas próprias palestras
        if (isPalestrante()) {
          // Buscar palestras criadas por este palestrante
          cleanupPalestras = setupFirestoreListener(
            "palestras",
            (palestrasData: any[]) => {
              const minhasPalestras = palestrasData.filter(palestra => 
                palestra.criadoPor === session.user.id || 
                palestra.criadoPorEmail === session.user.email
              );
              setTotalPalestras(minhasPalestras.length);
            },
            (error) => {
              console.error("Erro ao buscar palestras:", error);
              setLoading(false);
            }
          );
        } else {
          // Organizadores, administradores e participantes veem todas as palestras
          cleanupPalestras = setupCountListener(
            "palestras",
            (count) => setTotalPalestras(count),
            (error) => {
              console.error("Erro ao buscar palestras:", error);
              setLoading(false);
            }
          );
        }

        // Setup participantes listener - participantes veem suas inscrições
        // Organizadores e admins veem suas inscrições como participantes
        cleanupParticipantes = setupFirestoreListener<Participante>(
          "participantes",
          (participantesData) => {
            setMinhasInscricoes(participantesData.length);
            setLoading(false);
          },
          (error) => {
            console.error("Erro ao buscar participantes:", error);
            setLoading(false);
          },
          [where("email", "==", session.user.email)]
        );
      } catch (error) {
        console.error("Erro ao configurar listeners:", error);
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      if (cleanupPalestras) cleanupPalestras();
      if (cleanupParticipantes) cleanupParticipantes();
    };
  }, [session?.user?.email, session?.user?.id, session?.user?.role]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Evita flash de conteúdo antes do redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Bem-vindo(a), {session.user?.name}!
                </span>
              </h1>
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
                  Escolha uma das opções abaixo para começar sua jornada
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <GoogleAuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Card Palestras */}
          <Link href="/palestra" className="group">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-border hover:shadow-2xl hover:border-primary/50 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2 relative overflow-hidden h-[320px] sm:h-[360px] flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                  Palestras
                </h3>
                <p className="text-muted-foreground mb-4 sm:mb-6 leading-relaxed flex-grow text-sm sm:text-base line-clamp-3">
                  Explore e inscreva-se em palestras sobre tecnologia, inovação e empreendedorismo
                </p>
                <div className="flex items-center text-primary font-semibold group-hover:text-accent transition-colors mt-auto text-sm sm:text-base">
                  Acessar Palestras
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </Link>

          {/* Card Relatórios - apenas para administradores e organizadores */}
          {hasElevatedPermissions() && (
            <Link href="/relatorios" className="group">
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-border hover:shadow-2xl hover:border-accent/50 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2 relative overflow-hidden h-[320px] sm:h-[360px] flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-accent" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                  Relatórios
                </h3>
                <p className="text-muted-foreground mb-4 sm:mb-6 leading-relaxed flex-grow text-sm sm:text-base line-clamp-3">
                  Visualize estatísticas detalhadas e indicadores de presença e engajamento
                </p>
                <div className="flex items-center text-accent font-semibold group-hover:text-primary transition-colors mt-auto text-sm sm:text-base">
                  Ver Relatórios
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </div>
            </Link>
          )}

          {/* Card Gerenciar Palestras - para administradores e organizadores */}
          {hasElevatedPermissions() && (
            <Link href="/admin/palestras" className="group">
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-border hover:shadow-2xl hover:border-orange-500/50 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2 relative overflow-hidden h-[320px] sm:h-[360px] flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Settings className="h-8 w-8 sm:h-10 sm:w-10 text-orange-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                    Gerenciar Palestras
                  </h3>
                  <p className="text-muted-foreground mb-4 sm:mb-6 leading-relaxed flex-grow text-sm sm:text-base line-clamp-3">
                    Adicione materiais, descrições e gerencie o conteúdo das palestras
                  </p>
                  <div className="flex items-center text-orange-500 font-semibold group-hover:text-accent transition-colors mt-auto text-sm sm:text-base">
                    Gerenciar Conteúdo
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Card Gestão - só aparece para administradores */}
          {isAdmin() && (
            <Link href="/admin/users" className="group">
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-border hover:shadow-2xl hover:border-success/50 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2 relative overflow-hidden h-[320px] sm:h-[360px] flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-success/20 to-success/10 rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 sm:h-10 sm:w-10 text-success" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                    Gestão de Usuários
                  </h3>
                  <p className="text-muted-foreground mb-4 sm:mb-6 leading-relaxed flex-grow text-sm sm:text-base line-clamp-3">
                    Gerencie cargos e permissões dos usuários do sistema (Administradores)
                  </p>
                  <div className="flex items-center text-success font-semibold group-hover:text-accent transition-colors mt-auto text-sm sm:text-base">
                    Gerenciar Usuários
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          )}

        </div>

        {/* Estatísticas rápidas (opcional) */}
        <div className="mt-12 sm:mt-16 lg:mt-20 bg-card/60 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 border border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5"></div>
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-8 text-center">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Resumo Rápido
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="text-center group">
                <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                  {loading ? (
                    <div className="animate-pulse bg-muted rounded w-12 h-10 mx-auto"></div>
                  ) : (
                    totalPalestras
                  )}
                </div>
                <div className="text-muted-foreground font-medium">
                  {isPalestrante() ? "Minhas Palestras" : "Palestras Disponíveis"}
                </div>
                {isPalestrante() && (
                  <div className="text-xs text-muted-foreground/70 mt-1">
                    Palestras que você criou
                  </div>
                )}
              </div>
              <div className="text-center group">
                <div className="text-4xl font-bold text-accent mb-2 group-hover:scale-110 transition-transform duration-300">
                  {loading ? (
                    <div className="animate-pulse bg-muted rounded w-12 h-10 mx-auto"></div>
                  ) : (
                    minhasInscricoes
                  )}
                </div>
                <div className="text-muted-foreground font-medium">Minhas Inscrições</div>
                <div className="text-xs text-muted-foreground/70 mt-1">
                  Como participante
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;