'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, increment, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Calendar, Clock, MapPin, Users, ExternalLink, X } from 'lucide-react';

interface Palestra {
  id: string;
  tema: string;
  data: string;
  horario: string;
  local: string;
  descricao: string;
  palestrante: string;
  palestranteEmail?: string;
  vagas: number;
  participantes: number;
  materiais?: { nome: string; conteudo: string; descricao?: string }[];
  criadoPor?: string;
  criadoPorEmail?: string;
}

export default function PalestrasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [palestras, setPalestras] = useState<Palestra[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPalestras, setFilteredPalestras] = useState<Palestra[]>([]);
  const [inscricoes, setInscricoes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    const unsubscribePalestras = carregarPalestras();
    if (session?.user?.email) {
      carregarInscricoes();
    }

    return () => {
      if (unsubscribePalestras) {
        unsubscribePalestras();
      }
    };
  }, [status, session, router]);

  useEffect(() => {
    const filtered = palestras.filter(palestra =>
      (palestra.tema || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (palestra.palestrante || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (palestra.descricao || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPalestras(filtered);
  }, [searchTerm, palestras]);

  const carregarPalestras = () => {
    const unsubscribe = onSnapshot(
      collection(db, 'palestras'),
      async (snapshot) => {
        const palestrasData = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            
            // Contar participantes inscritos dinamicamente
            const participantesQuery = query(
              collection(db, 'participantes'),
              where('palestraId', '==', docSnap.id)
            );
            const participantesSnapshot = await getDocs(participantesQuery);
            const numParticipantes = participantesSnapshot.size;
            
            // Se o contador no banco está desatualizado, corrigir
            if (data.inscritos !== numParticipantes) {
              await updateDoc(doc(db, 'palestras', docSnap.id), {
                inscritos: numParticipantes
              });
            }
            
            return {
              id: docSnap.id,
              tema: data.tema,
              data: data.data,
              horario: data.horario,
              local: data.local,
              descricao: data.descricao,
              palestrante: data.palestrante,
              vagas: data.vagas,
              participantes: numParticipantes,
              materiais: data.materiais || []
            };
          })
        ) as Palestra[];

        setPalestras(palestrasData);
        setFilteredPalestras(palestrasData);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar palestras:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  };

  const carregarInscricoes = async () => {
    try {
      const inscricoesQuery = query(
        collection(db, 'participantes'),
        where('email', '==', session?.user?.email)
      );
      const inscricoesSnapshot = await getDocs(inscricoesQuery);
      const inscricoesSet = new Set<string>();
      
      inscricoesSnapshot.docs.forEach(doc => {
        inscricoesSet.add(doc.data().palestraId);
      });
      
      setInscricoes(inscricoesSet);
    } catch (error) {
      console.error('Erro ao carregar inscrições:', error);
    }
  };

  const inscreverNaPalestra = async (palestraId: string) => {
    if (!session?.user?.email || !session?.user?.name) return;

    try {
      // Verificar se já está inscrito
      if (inscricoes.has(palestraId)) {
        alert('Você já está inscrito nesta palestra!');
        return;
      }

      // Verificar vagas disponíveis
      const palestraDoc = await getDoc(doc(db, 'palestras', palestraId));
      const palestraData = palestraDoc.data();
      
      // Verificar se o usuário é o criador da palestra
      if (palestraData && (
        palestraData.criadoPor === session.user.id || 
        palestraData.criadoPorEmail === session.user.email ||
        palestraData.palestranteEmail === session.user.email
      )) {
        alert('Você não pode se inscrever na sua própria palestra!');
        return;
      }
      
      if (palestraData && (palestraData.inscritos || 0) >= palestraData.vagas) {
        alert('Esta palestra não possui mais vagas disponíveis!');
        return;
      }

      // Criar documento do participante
      const participanteId = `${palestraId}_${session.user.email}`;
      await setDoc(doc(db, 'participantes', participanteId), {
        nome: session.user.name,
        email: session.user.email,
        palestraId,
        dataInscricao: new Date().toISOString(),
        presente: false
      });

      // Incrementar contador de inscritos
      await updateDoc(doc(db, 'palestras', palestraId), {
        inscritos: increment(1)
      });

      // Atualizar estado local das inscrições
      setInscricoes(prev => new Set([...prev, palestraId]));
      
      alert('Inscrição realizada com sucesso!');
    } catch (error) {
      console.error('Erro ao inscrever na palestra:', error);
      alert('Erro ao realizar inscrição. Tente novamente.');
    }
  };

  const cancelarInscricao = async (palestraId: string) => {
    if (!session?.user?.email) return;

    if (!confirm('Tem certeza que deseja cancelar sua inscrição nesta palestra?')) {
      return;
    }

    try {
      // Remover documento do participante
      const participanteId = `${palestraId}_${session.user.email}`;
      await deleteDoc(doc(db, 'participantes', participanteId));

      // Decrementar contador de inscritos
      await updateDoc(doc(db, 'palestras', palestraId), {
        inscritos: increment(-1)
      });

      // Atualizar estado local das inscrições
      setInscricoes(prev => {
        const newSet = new Set(prev);
        newSet.delete(palestraId);
        return newSet;
      });
      
      alert('Inscrição cancelada com sucesso!');
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      alert('Erro ao cancelar inscrição. Tente novamente.');
    }
  };

  const formatarData = (data: string) => {
    if (!data) return 'Data não informada';
    try {
      const date = new Date(data);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Carregando palestras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Palestras Disponíveis
          </h1>
          <p className="text-muted-foreground">
            Explore e se inscreva nas palestras disponíveis
          </p>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Pesquisar palestras por título, palestrante ou descrição..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lista de Palestras */}
        {filteredPalestras.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              {searchTerm ? 'Nenhuma palestra encontrada' : 'Nenhuma palestra disponível'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Tente usar outros termos de pesquisa'
                : 'Novas palestras serão adicionadas em breve'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPalestras.map((palestra) => (
              <div 
                key={palestra.id} 
                className="bg-card rounded-xl shadow-md p-4 sm:p-6 border border-border hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-card-foreground mb-2">
                      {palestra.tema || 'Título não informado'}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-4 mb-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="truncate">{palestra.data ? formatarData(palestra.data) : 'Data não informada'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="truncate">{palestra.horario || 'Horário não informado'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="truncate">{palestra.local || 'Local não informado'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="whitespace-nowrap">{palestra.participantes || 0}/{palestra.vagas} vagas</span>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">
                      <strong>Palestrante:</strong> {palestra.palestrante || 'Palestrante não informado'}
                    </p>

                    <p className="text-card-foreground mb-4">
                      {palestra.descricao || 'Descrição não informada'}
                    </p>

                    {/* Materiais */}
                    {palestra.materiais && palestra.materiais.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-card-foreground mb-2">
                          Materiais Importantes:
                        </h4>
                        <div className="space-y-2">
                          {palestra.materiais.map((material, index) => (
                            <a
                              key={index}
                              href={material.conteudo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                              {material.nome}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <div className="flex flex-col gap-2 w-full lg:w-auto">
                      {/* Botão Ver Detalhes - SEMPRE visível */}
                      <Button 
                        onClick={() => router.push(`/palestra/${palestra.id}`)}
                        variant="outline"
                        className="w-full lg:w-auto"
                      >
                        Ver Detalhes
                      </Button>
                      
                      {/* Botão de Ação Principal */}
                      {(() => {
                        // Verificar se é o criador da palestra
                        const isCriador = palestra.criadoPor === session?.user?.id || 
                                         palestra.criadoPorEmail === session?.user?.email ||
                                         palestra.palestranteEmail === session?.user?.email;
                        
                        if (isCriador) {
                          return (
                            <Button disabled variant="secondary" className="w-full lg:w-auto">
                              Sua Palestra
                            </Button>
                          );
                        }
                        
                        if (inscricoes.has(palestra.id)) {
                          return (
                            <div className="flex flex-col gap-2 w-full lg:w-auto">
                              <Button disabled variant="outline" className="w-full lg:w-auto text-sm">
                                ✓ Inscrito
                              </Button>
                              <Button 
                                onClick={() => cancelarInscricao(palestra.id)}
                                variant="destructive"
                                size="sm"
                                className="w-full lg:w-auto text-sm"
                              >
                                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                Cancelar Inscrição
                              </Button>
                            </div>
                          );
                        }
                        
                        if (palestra.participantes >= palestra.vagas) {
                          return (
                            <Button disabled className="w-full lg:w-auto">
                              Vagas Esgotadas
                            </Button>
                          );
                        }
                        
                        return (
                          <Button 
                            onClick={() => inscreverNaPalestra(palestra.id)}
                            className="w-full lg:w-auto"
                          >
                            Inscrever-se
                          </Button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}