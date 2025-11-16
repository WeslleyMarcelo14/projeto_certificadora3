"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function TestAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Teste de Autenticação</h1>
      
      <div className="bg-gray-100 p-4 rounded">
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Sessão:</strong> {session ? "Ativa" : "Inativa"}</p>
        {session && (
          <div className="mt-2">
            <p><strong>Nome:</strong> {session.user?.name}</p>
            <p><strong>Email:</strong> {session.user?.email}</p>
            <p><strong>ID:</strong> {session.user?.id}</p>
          </div>
        )}
      </div>

      <div className="space-x-4">
        {!session ? (
          <button
            onClick={() => signIn("google")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Login com Google
          </button>
        ) : (
          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Links de Teste:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><a href="/api/auth/providers" className="text-blue-600 hover:underline">Ver Providers</a></li>
          <li><a href="/api/auth/session" className="text-blue-600 hover:underline">Ver Sessão (JSON)</a></li>
          <li><a href="/api/auth/signin" className="text-blue-600 hover:underline">Página de Login</a></li>
        </ul>
      </div>
    </div>
  );
}