"use client";
import React, { useState, useEffect, useMemo } from "react";
import { db } from "../firebase/page"; // Ajuste o caminho se necessário
import { collection, onSnapshot } from "firebase/firestore";

// --- Tipos de Dados (do Firestore) ---
type Palestra = {
  id: string;
  tema: string;
};

type Inscricao = {
  id: string;
  palestraId: string;
  presente?: boolean; // O campo de presença
};

// ... (userProfiles continua o mesmo) ...
const userProfiles = {
  administrador: {
    name: "Admin Henry",
    email: "admin@aaaaaaa.com",
    role: "administrador",
  },
  organizador: {
    name: "Organizador ???",
    email: "organizador@gmail.com",
    role: "organizador",
  },
  palestrante: {
    name: "Palestrante Maria",
    email: "palestrante@gmail.com",
    role: "palestrante",
  },
  participante: {
    name: "Participante Joao",
    email: "participante@gmail.com",
    role: "participante",
  },
};
type UserRole = keyof typeof userProfiles;

// --- Componente da Página ---
export default function RelatoriosPage() {
  const [currentUserRole, setCurrentUserRole] =
    useState<UserRole>("administrador");
  const {
    name: usuarioNome,
    email: usuarioEmail,
    role: papel,
  } = userProfiles[currentUserRole];

  // --- Estados para os dados do Firestore ---
  const [palestras, setPalestras] = useState<Palestra[]>([]);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);

  // RF 6.1: Acesso Restrito
  const podeVerRelatorio = papel === "organizador" || papel === "administrador";

  // --- Efeitos para buscar dados (apenas se tiver permissão) ---
  useEffect(() => {
    if (!podeVerRelatorio) {
      setLoading(false);
      return () => {}; // Retorna função vazia
    }
    
    setLoading(true);
    const unsubPalestras = onSnapshot(
      collection(db, "palestras"),
      (snapshot) => {
        const palestrasData: Palestra[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          tema: doc.data().tema, // Pega só o ID e o tema
        } as Palestra));
        setPalestras(palestrasData);
        setLoading(false);
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

    // Limpa as inscrições
    return () => {
        unsubPalestras();
        unsubInscricoes();
    };
  }, [podeVerRelatorio]); // Roda de novo se o usuário mudar


  // --- Cálculos dos Relatórios (RF 6.2, 6.4, 6.5) ---
  const relatorios = useMemo(() => {
    // RF 6.2
    const totalPalestras = palestras.length;
    const totalInscritos = inscricoes.length;
    
    // RF 6.4
    const totalPresentes = inscricoes.filter(i => i.presente === true).length;
    const taxaPresencaGeral = totalInscritos > 0 
      ? (totalPresentes / totalInscritos) * 100 
      : 0;

    // RF 6.2 e 6.4 (por palestra)
    const detalhesPorPalestra = palestras.map((palestra) => {
      const inscritosNaPalestra = inscricoes.filter(
        (i) => i.palestraId === palestra.id
      );
      const presentesNaPalestra = inscritosNaPalestra.filter(
        (i) => i.presente === true
      ).length;
      
      const taxaPresencaPalestra = inscritosNaPalestra.length > 0
        ? (presentesNaPalestra / inscritosNaPalestra.length) * 100
        : 0;

      return {
        id: palestra.id,
        tema: palestra.tema,
        inscritos: inscritosNaPalestra.length,
        presentes: presentesNaPalestra,
        taxaPresenca: taxaPresencaPalestra,
      };
    });

    // RF 6.5 (Engajamento simples: Top 5 por Inscrição)
    const rankingEngajamento = [...detalhesPorPalestra] // Copia o array
      .sort((a, b) => b.inscritos - a.inscritos) // Ordena por mais inscritos
      .slice(0, 5); // Pega o Top 5

    return {
      totalPalestras,
      totalInscritos,
      totalPresentes,
      taxaPresencaGeral,
      detalhesPorPalestra,
      rankingEngajamento
    };
  }, [palestras, inscricoes]);


  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
        {/* ... (Seletor de usuário) ... */}
        <label
          htmlFor="role-select"
          className="block text-sm font-medium text-gray-800 mb-2"
        >
          Simular login como:
        </label>
        <select
          id="role-select"
          value={currentUserRole}
          onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="administrador">Administrador</option>
          <option value="organizador">Organizador</option>
          <option value="palestrante">Palestrante</option>
          <option value="participante">Participante</option>
        </select>
        <p className="text-xs text-gray-600 mt-2">
          Logado como:{" "}
          <span className="font-semibold text-gray-900">
            {usuarioNome} ({usuarioEmail})
          </span>
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">
        Painel de Relatórios
      </h2>

      {/* RF 6.1: Controle de Acesso */}
      {podeVerRelatorio ? (
        <>
          {loading ? (
            <p className="text-center text-gray-500">Carregando dados...</p>
          ) : (
            <div>
              {/* --- Cards de Resumo (RF 6.2 e 6.4) --- */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-100 rounded p-4 text-center">
                  <span className="block text-2xl font-bold">{relatorios.totalPalestras}</span>
                  <span className="text-gray-700">Palestras</span>
                </div>
                <div className="bg-green-100 rounded p-4 text-center">
                  <span className="block text-2xl font-bold">{relatorios.totalInscritos}</span>
                  <span className="text-gray-700">Inscrições</span>
                </div>
                <div className="bg-teal-100 rounded p-4 text-center">
                  <span className="block text-2xl font-bold">{relatorios.totalPresentes}</span>
                  <span className="text-gray-700">Presentes</span>
                </div>
                <div className="bg-yellow-100 rounded p-4 text-center">
                  <span className="block text-2xl font-bold">{relatorios.taxaPresencaGeral.toFixed(1)}%</span>
                  <span className="text-gray-700">Taxa de Presença</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* --- Tabela de Detalhes (RF 6.2 e 6.4) --- */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">
                    Detalhes por Palestra
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 border">Tema</th>
                          <th className="p-2 border text-center">Inscritos</th>
                          <th className="p-2 border text-center">Presentes</th>
                          <th className="p-2 border text-center">Taxa (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relatorios.detalhesPorPalestra.map((p) => (
                          <tr key={p.id} className="border-t">
                            <td className="p-2 border">{p.tema}</td>
                            <td className="p-2 border text-center">{p.inscritos}</td>
                            <td className="p-2 border text-center">{p.presentes}</td>
                            <td className="p-2 border text-center">{p.taxaPresenca.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* --- Tabela de Engajamento (RF 6.5) --- */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Top 5 Engajamento (por Inscrição)
                  </h3>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 border">Tema</th>
                        <th className="p-2 border text-center">Inscritos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatorios.rankingEngajamento.map((p) => (
                        <tr key={p.id} className="border-t">
                          <td className="p-2 border">{p.tema}</td>
                          <td className="p-2 border text-center">{p.inscritos}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        // --- Mensagem de Acesso Restrito (RF 6.1) ---
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <h3 className="text-xl font-bold text-red-700">Acesso Restrito</h3>
          <p className="text-gray-600 mt-2">
            Somente organizadores e administradores podem visualizar os
            relatórios.
          </p>
        </div>
      )}
    </div>
  );
}