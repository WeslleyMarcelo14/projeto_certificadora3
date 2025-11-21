"use client";
import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

type Palestra = {
  id: string;
  tema: string;
  criadoPor?: string;
  criadoPorEmail?: string;
};

type Inscricao = {
  id: string;
  palestraId: string;
  presente?: boolean;
};

export default function Relatorios() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [palestras, setPalestras] = useState<Palestra[]>([]);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const papel = session?.user?.role || 'participante';
  const podeVerRelatorio = papel === "palestrante" || papel === "organizador" || papel === "administrador";

  // Redireciona se não estiver logado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/');
    }
  }, [session, status, router]);

  // Carregar dados de palestras e inscrições
  useEffect(() => {
    if (!podeVerRelatorio) {
      setLoading(false);
      return () => { };
    }

    setLoading(true);
    const unsubPalestras = onSnapshot(
      collection(db, "palestras"),
      (snapshot) => {
        const todasPalestras: Palestra[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          tema: doc.data().tema,
          criadoPor: doc.data().criadoPor,
          criadoPorEmail: doc.data().criadoPorEmail,
        } as Palestra));
        
        // Filtrar palestras baseado no papel do usuário
        let palestrasFiltradas = todasPalestras;
        if (papel === "palestrante") {
          // Palestrantes veem apenas suas próprias palestras
          palestrasFiltradas = todasPalestras.filter(palestra => 
            palestra.criadoPor === session?.user?.id || 
            palestra.criadoPorEmail === session?.user?.email
          );
        }
        // Organizadores e administradores veem todas as palestras
        
        setPalestras(palestrasFiltradas);
      }
    );
    const unsubInscricoes = onSnapshot(
      collection(db, "participantes"), // Usando a coleção correta
      (snapshot) => {
        const todasInscricoes: Inscricao[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          palestraId: doc.data().palestraId,
          presente: doc.data().presente,
        } as Inscricao));
        
        setInscricoes(todasInscricoes);
        setLoading(false);
      }
    );

    return () => {
      unsubPalestras();
      unsubInscricoes();
    };
  }, [podeVerRelatorio]);

  const relatorios = useMemo(() => {
    const totalPalestras = palestras.length;
    const totalInscricoes = inscricoes.length;
    const presencasConfirmadas = inscricoes.filter((i) => i.presente).length;


    const porPalestra = palestras.map((p) => {
      const inscricoesP = inscricoes.filter((i) => i.palestraId === p.id);
      const presentesP = inscricoesP.filter((i) => i.presente).length;
      return {
        tema: p.tema,
        totalInscritos: inscricoesP.length,
        presentes: presentesP,
      };
    });

    return {
      totalPalestras,
      totalInscricoes,
      presencasConfirmadas,
      porPalestra,
    };
  }, [palestras, inscricoes]);

  if (!podeVerRelatorio) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary/30 to-background">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="bg-destructive/10 border border-destructive rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">
              Acesso Negado
            </h2>
            <p className="text-muted-foreground">
              Você não tem permissão para visualizar relatórios.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-2xl text-foreground">Carregando relatórios...</p>
      </div>
    );
  }

  // Se não estiver logado, não renderiza nada (aguarda redirect)
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary/30 to-background">
      <main className="flex-1 container mx-auto px-4 py-8">


        <h1 className="text-4xl font-bold mb-8 text-foreground">
          {papel === "palestrante" ? "Relatórios das Minhas Palestras" : "Relatórios de Palestras"}
        </h1>

        {papel === "palestrante" && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              💡 Como palestrante, você visualiza apenas os relatórios das palestras que criou.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary to-primary-hover rounded-xl shadow-lg p-6 text-primary-foreground">
            <h3 className="text-lg font-semibold mb-2 opacity-90">
              {papel === "palestrante" ? "Minhas Palestras" : "Total de Palestras"}
            </h3>
            <p className="text-4xl font-bold">{relatorios.totalPalestras}</p>
          </div>

          <div className="bg-gradient-to-br from-accent to-primary rounded-xl shadow-lg p-6 text-accent-foreground">
            <h3 className="text-lg font-semibold mb-2 opacity-90">
              {papel === "palestrante" ? "Inscrições nas Minhas Palestras" : "Total de Inscrições"}
            </h3>
            <p className="text-4xl font-bold">{relatorios.totalInscricoes}</p>
          </div>

          <div className="bg-gradient-to-br from-success to-success/80 rounded-xl shadow-lg p-6 text-success-foreground">
            <h3 className="text-lg font-semibold mb-2 opacity-90">
              Presenças Confirmadas
            </h3>
            <p className="text-4xl font-bold">
              {relatorios.presencasConfirmadas}
            </p>
          </div>


        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-accent p-6">
            <h2 className="text-2xl font-bold text-primary-foreground">
              {papel === "palestrante" ? "Detalhamento das Minhas Palestras" : "Detalhamento por Palestra"}
            </h2>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      Nome da Palestra
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-foreground">
                      Inscritos
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-foreground">
                      Presentes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {relatorios.porPalestra.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 px-4 text-center text-muted-foreground">
                        {papel === "palestrante" 
                          ? "Você ainda não criou nenhuma palestra." 
                          : "Nenhuma palestra encontrada."}
                      </td>
                    </tr>
                  ) : (
                    relatorios.porPalestra.map((rel, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-card-foreground">
                          {rel.tema}
                        </td>
                        <td className="py-4 px-4 text-center text-muted-foreground">
                          {rel.totalInscritos}
                        </td>
                        <td className="py-4 px-4 text-center text-success font-semibold">
                          {rel.presentes}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}