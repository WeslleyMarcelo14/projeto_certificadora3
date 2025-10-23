"use client";
import { useState, useMemo, useEffect } from "react";
import { db } from "../firebase/page";
import { collection, onSnapshot } from "firebase/firestore";

type Palestra = {
  id: string;
  tema: string;
};

type Inscricao = {
  id: string;
  palestraId: string;
  presente?: boolean;
};

const userProfiles = {
  administrador: {
    name: "Admin Henry",
    email: "admin@aaaaaaa.com",
    role: "administrador",
  },
  organizador: {
    name: "Organizador",
    email: "organizador@gmail.com",
    role: "organizador",
  },
  palestrante: {
    name: "Palestrante Maria",
    email: "palestrante@gmail.com",
    role: "palestrante",
  },
  participante: {
    name: "Participante João",
    email: "participante@gmail.com",
    role: "participante",
  },
};

type UserRole = keyof typeof userProfiles;

export default function Relatorios() {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("administrador");
  const { role: papel } = userProfiles[currentUserRole];
  const [palestras, setPalestras] = useState<Palestra[]>([]);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const podeVerRelatorio = papel === "organizador" || papel === "administrador";

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
        const palestrasData: Palestra[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          tema: doc.data().tema,
        } as Palestra));
        setPalestras(palestrasData);
      }
    );
    const unsubInscricoes = onSnapshot(
      collection(db, "inscricoes"),
      (snapshot) => {
        const inscricoesData: Inscricao[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          palestraId: doc.data().palestraId,
          presente: doc.data().presente,
        } as Inscricao));
        setInscricoes(inscricoesData);
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
    const percentualPresenca =
      totalInscricoes > 0
        ? ((presencasConfirmadas / totalInscricoes) * 100).toFixed(1)
        : "0.0";

    const porPalestra = palestras.map((p) => {
      const inscricoesP = inscricoes.filter((i) => i.palestraId === p.id);
      const presentesP = inscricoesP.filter((i) => i.presente).length;
      const percentualP =
        inscricoesP.length > 0
          ? ((presentesP / inscricoesP.length) * 100).toFixed(1)
          : "0.0";
      return {
        tema: p.tema,
        totalInscritos: inscricoesP.length,
        presentes: presentesP,
        percentual: percentualP,
      };
    });

    return {
      totalPalestras,
      totalInscricoes,
      presencasConfirmadas,
      percentualPresenca,
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background">
        <p className="text-2xl text-foreground">Carregando relatórios...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary/30 to-background">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-card rounded-xl shadow-lg p-6 mb-8 border border-border">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">
            Visualizar como:
          </h2>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(userProfiles) as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => setCurrentUserRole(role)}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${currentUserRole === role
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
              >
                {userProfiles[role].name}
              </button>
            ))}
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-foreground">
          Relatórios de Palestras
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary to-primary-hover rounded-xl shadow-lg p-6 text-primary-foreground">
            <h3 className="text-lg font-semibold mb-2 opacity-90">
              Total de Palestras
            </h3>
            <p className="text-4xl font-bold">{relatorios.totalPalestras}</p>
          </div>

          <div className="bg-gradient-to-br from-accent to-primary rounded-xl shadow-lg p-6 text-accent-foreground">
            <h3 className="text-lg font-semibold mb-2 opacity-90">
              Total de Inscrições
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

          <div className="bg-gradient-to-br from-secondary to-muted rounded-xl shadow-lg p-6 text-secondary-foreground">
            <h3 className="text-lg font-semibold mb-2">Taxa de Presença</h3>
            <p className="text-4xl font-bold">
              {relatorios.percentualPresenca}%
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-accent p-6">
            <h2 className="text-2xl font-bold text-primary-foreground">
              Detalhamento por Palestra
            </h2>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      Palestra
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-foreground">
                      Inscritos
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-foreground">
                      Presentes
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-foreground">
                      Taxa de Presença
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {relatorios.porPalestra.map((rel, idx) => (
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
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full font-semibold ${parseFloat(rel.percentual) >= 70
                            ? "bg-success/20 text-success"
                            : parseFloat(rel.percentual) >= 40
                              ? "bg-accent/20 text-accent"
                              : "bg-destructive/20 text-destructive"
                            }`}
                        >
                          {rel.percentual}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}