"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { FcGoogle } from "react-icons/fc";
import { LogOut, User } from "lucide-react";

const GoogleAuthButton = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button disabled className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        Carregando...
      </Button>
    );
  }

  if (session) {
    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <div className="bg-card/60 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 border border-border flex-1 sm:flex-none">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[120px] sm:max-w-none">
              {session.user?.name}
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
            <span className="bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium flex-shrink-0">
              {session.user?.role === "administrador" ? "Admin" :
               session.user?.role === "organizador" ? "Org" :
               session.user?.role === "palestrante" ? "Palestrante" : "Participante"}
            </span>
          </div>
        </div>
        <Button
          onClick={() => signOut()}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 sm:gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 text-xs sm:text-sm w-full sm:w-auto justify-center"
        >
          <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="sm:hidden">Sair</span>
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="flex items-center gap-2 sm:gap-3 bg-card/90 backdrop-blur-sm text-foreground border border-border hover:bg-card hover:shadow-lg hover:scale-105 transition-all duration-300 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 text-sm sm:text-base lg:text-lg font-medium rounded-lg w-full sm:w-auto justify-center"
    >
      <FcGoogle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
      <span className="hidden sm:inline">Entrar com Google</span>
      <span className="sm:hidden">Entrar</span>
    </Button>
  );
};

export default GoogleAuthButton;