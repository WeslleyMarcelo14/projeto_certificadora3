'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSocialLogin = async (provider: string) => {
    setSelectedProvider(provider);
    setError('');
    setLoading(true);
    
    console.log(`Iniciando login com ${provider}`);
    
    // Simulando delay de autenticação
    setTimeout(() => {
      setLoading(false);
      // Aqui você integrará com Firebase/Google/Microsoft
      console.log(`Login realizado com ${provider}`);
      
      // Redirecionar após login bem-sucedido
      router.push('/');
    }, 1500);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validações básicas
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor, insira um email válido');
      setLoading(false);
      return;
    }

    console.log('Tentando login com:', { email, password });

    // Simulando autenticação com API
    try {
      // Aqui você substituirá por uma chamada real à API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulando credenciais válidas
      if (email === 'admin@admin.com' && password === '123456') {
        console.log('Login bem-sucedido!');
        
        // Salvar no localStorage (em produção use cookies seguros)
        localStorage.setItem('user', JSON.stringify({
          email: email,
          name: 'Usuário Admin',
          loggedIn: true
        }));
        
        // Redirecionar para a página inicial
        router.push('/');
      } else {
        setError('Email ou senha incorretos');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const socialOptions = [
    { id: 'google', label: 'Continuar com o Google' },
    { id: 'microsoft', label: 'Continuar com a Microsoft' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        {/* Cabeçalho */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Entrar ou cadastrar
          </h2>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Opções de Login Social */}
        <div className="mt-8 space-y-4">
          {socialOptions.map((option) => (
            <div 
              key={option.id}
              className={`flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
              onClick={() => !loading && handleSocialLogin(option.id)}
            >
              <input
                type="checkbox"
                id={option.id}
                checked={selectedProvider === option.id}
                onChange={() => !loading && handleSocialLogin(option.id)}
                disabled={loading}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label 
                htmlFor={option.id} 
                className={`flex-1 cursor-pointer text-base font-medium text-gray-700 ${
                  loading ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {option.label}
                {loading && selectedProvider === option.id && (
                  <span className="ml-2 text-blue-600">Carregando...</span>
                )}
              </label>
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

        {/* Formulário de Email/Senha */}
        <form className="mt-6 space-y-4" onSubmit={handleEmailLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              placeholder="Sua senha"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-2.5 px-4 rounded-md font-medium transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Credenciais de teste */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm text-center">
            <strong>Teste:</strong> admin@admin.com / 123456
          </p>
        </div>

        {/* Links extras */}
        <div className="text-center space-y-3">
          <div className="space-x-4 text-sm">
            <a href="#" className="text-blue-600 hover:text-blue-500 transition-colors">
              Esqueceu sua senha?
            </a>
            <span className="text-gray-400">•</span>
            <a href="#" className="text-blue-600 hover:text-blue-500 transition-colors">
              Criar conta
            </a>
          </div>
          
          <div className="pt-2">
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors"
            >
              ← Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}