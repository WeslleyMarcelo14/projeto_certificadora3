"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../../../../../lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDoc,
  increment,
} from "firebase/firestore";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { toast, Toaster } from "sonner";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  User,
} from "lucide-react";

type Palestra = {
  id: string;
  tema: string;
  data: string;
  horario: string;
  local: string;
  palestrante: string;
  vagas: number;
  inscritos: number;
  criadoPor?: string;
  criadoPorEmail?: string;
};

type Participante = {
  id: string;
  palestraId: string;
  nome: string;
  email: string;
  presente: boolean;
  dataInscricao: string;
};

export default function GerenciarParticipantes() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [palestra, setPalestra] = useState<Palestra | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [atualizando, setAtualizando] = useState<string | null>(null);

  const podeGerenciarParticipantes = session?.user?.role === "administrador" || session?.user?.role === "organizador";

  // Redirecionamento
  useEffect(() => {
    if (status !== "loading" && (!session || !podeGerenciarParticipantes)) {
      router.push('/dashboard');
    }
  }, [session, status, router, podeGerenciarParticipantes]);

  // Carregar palestra
  useEffect(() => {
    if (!podeGerenciarParticipantes || !id || !session?.user?.id) return;

    const unsubscribePalestra = onSnapshot(
      doc(db, "palestras", id as string),
      (snapshot) => {
        if (snapshot.exists()) {
          const palestraData = {
            id: snapshot.id,
            ...snapshot.data(),
          } as Palestra;
          
          // Verificar se organizador pode acessar esta palestra
          if (session.user.role?.trim() === 'organizador') {
            const podeAcessar = palestraData.criadoPor === session.user.id || 
                              palestraData.criadoPorEmail === session.user.email;
            
            if (!podeAcessar) {
              toast.error("Você só pode ver participantes de palestras que criou");
              router.push('/admin/palestras');
              return;
            }
          }
          
          setPalestra(palestraData);
        } else {
          toast.error("Palestra não encontrada");
          router.push('/admin/palestras');
        }
      },
      (error) => {
        console.error("Erro ao carregar palestra:", error);
        toast.error("Erro ao carregar palestra");
      }
    );

    return () => unsubscribePalestra();
  }, [podeGerenciarParticipantes, id, router, session?.user?.id, session?.user?.email, session?.user?.role]);

  // Carregar inscrições
  useEffect(() => {
    if (!podeGerenciarParticipantes || !id) return;

    const unsubscribeParticipantes = onSnapshot(
      query(collection(db, "participantes"), where("palestraId", "==", id)),
      (snapshot) => {
        const participantesData: Participante[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          palestraId: doc.data().palestraId,
          nome: doc.data().nome,
          email: doc.data().email,
          presente: doc.data().presente || false,
          dataInscricao: doc.data().dataInscricao,
        }));
        setParticipantes(participantesData);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar participantes:", error);
        toast.error("Erro ao carregar participantes");
        setLoading(false);
      }
    );

    return () => unsubscribeParticipantes();
  }, [podeGerenciarParticipantes, id]);

  const togglePresenca = async (participanteId: string, presencaAtual: boolean) => {
    setAtualizando(participanteId);
    try {
      await updateDoc(doc(db, "participantes", participanteId), {
        presente: !presencaAtual,
      });
      toast.success(`Presença ${!presencaAtual ? 'confirmada' : 'removida'} com sucesso!`);
    } catch (error) {
      console.error("Erro ao atualizar presença:", error);
      toast.error("Erro ao atualizar presença");
    } finally {
      setAtualizando(null);
    }
  };

  const removerParticipante = async (participanteId: string, nomeParticipante: string) => {
    if (!confirm(`Tem certeza que deseja remover ${nomeParticipante} desta palestra?`)) {
      return;
    }

    setAtualizando(participanteId);
    try {
      await deleteDoc(doc(db, "participantes", participanteId));

      // Decrementar contador de inscritos na palestra
      if (palestra) {
        await updateDoc(doc(db, "palestras", palestra.id), {
          inscritos: increment(-1),
        });
      }

      toast.success("Participante removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover participante:", error);
      toast.error("Erro ao remover participante");
    } finally {
      setAtualizando(null);
    }
  };

  const participantesFiltrados = participantes.filter(participante =>
    participante.nome.toLowerCase().includes(busca.toLowerCase()) ||
    participante.email.toLowerCase().includes(busca.toLowerCase())
  );

  const estatisticas = {
    total: participantes.length,
    presentes: participantes.filter(p => p.presente).length,
    ausentes: participantes.filter(p => !p.presente).length,
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !podeGerenciarParticipantes || !palestra) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/admin/palestras')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Gerenciar Participantes
                </span>
              </h1>
              <p className="text-muted-foreground mt-1">
                {palestra.tema}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Informações da Palestra */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Informações da Palestra</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(palestra.data + "T00:00").toLocaleDateString("pt-BR", { timeZone: "UTC" })}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {palestra.horario}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {palestra.local}
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              {palestra.palestrante}
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border border-border p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-2xl font-bold text-foreground">{estatisticas.total}</p>
                <p className="text-muted-foreground">Total de Inscritos</p>
              </div>
            </div>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border border-border p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-success mr-3" />
              <div>
                <p className="text-2xl font-bold text-foreground">{estatisticas.presentes}</p>
                <p className="text-muted-foreground">Presenças Confirmadas</p>
              </div>
            </div>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border border-border p-6">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-muted-foreground mr-3" />
              <div>
                <p className="text-2xl font-bold text-foreground">{estatisticas.ausentes}</p>
                <p className="text-muted-foreground">Ainda não Confirmaram</p>
              </div>
            </div>
          </div>
        </div>

        {/* Busca */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar participante por nome ou email..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Participantes */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Participantes Inscritos ({participantesFiltrados.length})
          </h3>

          {participantesFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {busca ? "Nenhum participante encontrado" : "Nenhum participante inscrito"}
              </h3>
              <p className="text-muted-foreground">
                {busca ? "Tente buscar com outros termos" : "Ainda não há inscrições para esta palestra."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {participantesFiltrados.map((participante) => (
                <div
                  key={participante.id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${participante.presente
                      ? 'bg-success/5 border-success/20'
                      : 'bg-muted/10 border-border'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className={`w-3 h-3 rounded-full mr-3 ${participante.presente ? 'bg-success' : 'bg-muted-foreground'
                          }`} />
                        <h4 className="font-semibold text-foreground">
                          {participante.nome}
                        </h4>
                        {participante.presente && (
                          <CheckCircle className="h-4 w-4 text-success ml-2" />
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {participante.email}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Inscrito em: {new Date(participante.dataInscricao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => togglePresenca(participante.id, participante.presente)}
                        disabled={atualizando === participante.id}
                        variant={participante.presente ? "outline" : "default"}
                        size="sm"
                      >
                        {atualizando === participante.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        ) : participante.presente ? (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Marcar Ausente
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar Presente
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={() => removerParticipante(participante.id, participante.nome)}
                        disabled={atualizando === participante.id}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}