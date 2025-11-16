"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "Erro de configuração do servidor.";
      case "AccessDenied":
        return "Acesso negado. Você cancelou o login.";
      case "Verification":
        return "Token expirado ou inválido.";
      default:
        return "Ocorreu um erro durante o login.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-border text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Erro de Autenticação
        </h1>
        
        <p className="text-muted-foreground mb-8">
          {getErrorMessage(error)}
        </p>
        
        <div className="space-y-4">
          <Link href="/auth/signin">
            <Button className="w-full">
              Tentar Novamente
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full">
              Voltar ao Início
            </Button>
          </Link>
        </div>
        
        {error && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Código do erro: {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}