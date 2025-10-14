"use client";
import React from "react";
import { useSession } from "next-auth/react";

// Simulação de dados
const relatorio = {
  totalPalestras: 5,
  totalInscritos: 42,
  taxaPresenca: "80%",
  engajamento: "Alto",
  palestras: [
    { tema: "React Moderno", inscritos: 15, presentes: 12 },
    { tema: "Next.js Avançado", inscritos: 10, presentes: 8 },
    { tema: "Tailwind na Prática", inscritos: 7, presentes: 7 },
    { tema: "Autenticação Segura", inscritos: 5, presentes: 4 },
    { tema: "DevOps para Iniciantes", inscritos: 5, presentes: 3 },
  ],
};

export default function RelatoriosPage() {
  const { data: session } = useSession();
  const papel = (session?.user as any)?.role;

  if (papel !== "organizador" && papel !== "administrador") {
    return (
      <div className="max-w-xl mx-auto mt-16 p-8 bg-white rounded shadow text-center">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Acesso restrito</h2>
        <p className="text-gray-600">Somente organizadores e administradores podem visualizar os relatórios.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Painel de Relatórios</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-100 rounded p-4 text-center">
          <span className="block text-lg font-bold">{relatorio.totalPalestras}</span>
          <span className="text-gray-700">Palestras</span>
        </div>
        <div className="bg-green-100 rounded p-4 text-center">
          <span className="block text-lg font-bold">{relatorio.totalInscritos}</span>
          <span className="text-gray-700">Inscritos</span>
        </div>
        <div className="bg-yellow-100 rounded p-4 text-center">
          <span className="block text-lg font-bold">{relatorio.taxaPresenca}</span>
          <span className="text-gray-700">Taxa de Presença</span>
        </div>
        <div className="bg-purple-100 rounded p-4 text-center">
          <span className="block text-lg font-bold">{relatorio.engajamento}</span>
          <span className="text-gray-700">Engajamento</span>
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-4">Palestras</h3>
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Tema</th>
            <th className="p-2">Inscritos</th>
            <th className="p-2">Presentes</th>
          </tr>
        </thead>
        <tbody>
          {relatorio.palestras.map((p, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2">{p.tema}</td>
              <td className="p-2">{p.inscritos}</td>
              <td className="p-2">{p.presentes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
