'use client';

// Use um desses imports - teste qual funciona no seu projeto
import { Checkbox } from '../../../components/ui/checkbox';
import { Label } from '../../../components/ui/label';
// OU se o alias @/ estiver configurado:
// import { Checkbox } from '@/components/ui/checkbox';
// import { Label } from '@/components/ui/label';

import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSocialLogin = (provider: string) => {
    setSelectedProvider(provider);
    console.log(`Login com ${provider}`);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login com email/senha:', { email, password });
  };

  const socialOptions = [
    { id: 'google', label: 'Continuar com o Google' },
    { id: 'microsoft', label: 'Continuar com a Microsoft' },
    { id: 'apple', label: 'Continuar com a Apple' },
    { id: 'phone', label: 'Continuar com o telefone' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        {/* Cabeçalho */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Entrar ou cadastrar
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Você vai poder aproveitar respostas inteligentes e, além disso, carregar imagens, arquivos e muito mais.
          </p>
        </div>

        {/* Opções de Login Social */}
        <div className="mt-8 space-y-4">
          {socialOptions.map((option, index) => (
            <div 
              key={option.id}
              className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              onClick={() => handleSocialLogin(option.id)}
            >
              <Checkbox 
                id={option.id} 
                checked={selectedProvider === option.id}
                onCheckedChange={() => handleSocialLogin(option.id)}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label 
                htmlFor={option.id} 
                className="flex-1 cursor-pointer text-base font-medium text-gray-700"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>

        {/* Divisor */}
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Ou</span>
          </div>
        </div>

        {/* Login com Email e Senha */}
        <form className="mt-6 space-y-4" onSubmit={handleEmailLogin}>
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </Label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </Label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Sua senha"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-md font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Entrar
          </button>
        </form>

        {/* Links adicionais */}
        <div className="mt-6 text-center space-y-3">
          <Link 
            href="/" 
            className="block text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors"
          >
            ← Voltar para a página inicial
          </Link>
          <div className="space-x-4">
            <a href="#" className="text-blue-600 hover:text-blue-500 text-sm transition-colors">
              Esqueceu sua senha?
            </a>
            <span className="text-gray-400">•</span>
            <a href="#" className="text-blue-600 hover:text-blue-500 text-sm transition-colors">
              Criar conta
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}