"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import GoogleAuthButton from "./GoogleAuthButton";

const LandingHero = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redireciona para dashboard se já estiver logado
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace('/dashboard');
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Elementos responsivos */}
      <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-12 sm:w-20 h-12 sm:h-20 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-20 sm:w-32 h-20 sm:h-32 bg-accent/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10 py-8 sm:py-12">
        {/* Logo/Imagem */}
        <div className="mb-8 sm:mb-12 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur-xl opacity-20 animate-pulse"></div>
            <Image 
              src="/mulher.svg" 
              alt="Meninas Digitais" 
              width={240}
              height={240}
              className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 mx-auto relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Título com gradiente */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Meninas Digitais
          </span>
        </h1>
        
        {/* Subtítulo */}
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground/80 font-medium mb-6 sm:mb-8 px-2">
          Sistema de Gerenciamento de Palestras
        </h2>

        {/* Descrição */}
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-12 sm:mb-16 max-w-3xl mx-auto leading-relaxed font-light px-2">
          Plataforma moderna para organização, inscrição e acompanhamento de palestras 
          e eventos acadêmicos da UTFPR-CP. Conecte-se e transforme o futuro da tecnologia.
        </p>

        {/* Botão de Login */}
        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative">
              <GoogleAuthButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingHero;