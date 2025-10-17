//relatorios/page.tsx
"use client";
import React, { useState } from "react";

const userProfiles = {
  administrador: {
    name: 'Admin Henry',
    email: 'admin@aaaaaaa.com',
    role: 'administrador',
  },
  organizador: {
    name: 'Organizador ???',
    email: 'organizador@gmail.com',
    role: 'organizador',
  },
  palestrante: {
    name: 'Palestrante Maria',
    email: 'palestrante@gmail.com',
    role: 'palestrante',
  },
  participante: {
    name: 'Participante Joao',
    email: 'participante@gmail.com',
    role: 'participante',
  },
};

type UserRole = keyof typeof userProfiles;

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
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('administrador');
  const { name: usuarioNome, email: usuarioEmail, role: papel } = userProfiles[currentUserRole];

  const podeVerRelatorio = papel === "organizador" || papel === "administrador";

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
        <label htmlFor="role-select" className="block text-sm font-medium text-gray-800 mb-2">
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
          Logado como: <span className="font-semibold text-gray-900">{usuarioNome} ({usuarioEmail})</span>
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Painel de Relatórios</h2>

      {podeVerRelatorio ? (
        <>
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
          <h3 className="text-lg font-semibold mb-4">Detalhes por Palestra</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Tema</th>
                <th className="p-2 border">Inscritos</th>
                <th className="p-2 border">Presentes</th>
              </tr>
            </thead>
            <tbody>
              {relatorio.palestras.map((p, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2 border">{p.tema}</td>
                  <td className="p-2 border text-center">{p.inscritos}</td>
                  <td className="p-2 border text-center">{p.presentes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <h3 className="text-xl font-bold text-red-700">Acesso Restrito</h3>
          <p className="text-gray-600 mt-2">
            Somente organizadores e administradores podem visualizar os relatórios.
          </p>
        </div>
      )}
    </div>
  );
}