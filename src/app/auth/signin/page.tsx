"use client";

import { signIn, getProviders } from "next-auth/react";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "../../../components/ui/button";

export default function SignIn() {
  const [providers, setProviders] = useState<any>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    fetchProviders();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-border">
        <h1 className="text-3xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Entrar
          </span>
        </h1>
        
        <div className="space-y-4">
          {providers &&
            Object.values(providers).map((provider: any) => (
              <div key={provider.name}>
                <Button
                  onClick={() => signIn(provider.id, { callbackUrl: '/dashboard' })}
                  className="w-full flex items-center justify-center gap-3 bg-card/90 backdrop-blur-sm text-foreground border border-border hover:bg-card hover:shadow-lg hover:scale-105 transition-all duration-300 px-8 py-6 text-lg font-medium rounded-lg"
                >
                  <FcGoogle className="h-6 w-6" />
                  Entrar com {provider.name}
                </Button>
              </div>
            ))}
        </div>
        
        <div className="mt-8 text-center">
          <a 
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Voltar para a página inicial
          </a>
        </div>
      </div>
    </div>
  );
}