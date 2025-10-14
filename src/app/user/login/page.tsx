//user/login/page.tsx
"use client";
import React, { useState } from "react";

export default function page() {
  const [form, setForm] = useState({
    email: "",
    senha: "",
  });
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setMensagem("");
    if (form.email && form.senha) {
      setMensagem("Login realizado com sucesso!");
      setForm({ email: "", senha: "" });
      // Idealmente, você receberia um token aqui e o salvaria
      // para redirecionar o usuário ou gerenciar a sessão.
    } else {
      setErro("Email ou senha inválidos.");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-8 border border-gray-200 rounded-lg shadow bg-white">
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Digite seu email"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-700">Senha</label>
          <input
            type="password"
            name="senha"
            value={form.senha}
            onChange={handleChange}
            required
            placeholder="Digite sua senha"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition">Entrar</button>
      </form>
      {mensagem && <p className="text-green-600 mt-6 text-center font-semibold">{mensagem}</p>}
      {erro && <p className="text-red-600 mt-2 text-center font-semibold">{erro}</p>}
    </div>
  );
}