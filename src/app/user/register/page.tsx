//user/register/page.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    papel: "participante",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Usuário cadastrado:", form);
    alert("Usuário cadastrado com sucesso! Redirecionando para o login...");
    router.push('/user/login');
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border border-gray-200 rounded-lg shadow bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Cadastro de Usuário</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Nome:</label>
          <input
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
            placeholder="Digite seu nome"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email:</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Digite seu email"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Senha:</label>
          <input
            type="password"
            name="senha"
            value={form.senha}
            onChange={handleChange}
            required
            placeholder="Digite sua senha"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Papel:</label>
          <select
            name="papel"
            value={form.papel}
            onChange={handleChange}
            required
            title="Selecione o papel do usuário"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="organizador">Organizador</option>
            <option value="palestrante">Palestrante</option>
            <option value="participante">Participante</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Cadastrar</button>
      </form>
    </div>
  );
}