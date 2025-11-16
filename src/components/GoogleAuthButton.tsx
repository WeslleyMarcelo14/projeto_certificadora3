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
      <div className="flex items-center gap-4">
        <div className="bg-card/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {session.user?.name}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
              {session.user?.role === "administrador" ? "Admin" :
               session.user?.role === "organizador" ? "Organizador" :
               session.user?.role === "palestrante" ? "Palestrante" : "Participante"}
            </span>
          </div>
        </div>
        <Button
          onClick={() => signOut()}
          variant="outline"
          className="flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="flex items-center gap-3 bg-card/90 backdrop-blur-sm text-foreground border border-border hover:bg-card hover:shadow-lg hover:scale-105 transition-all duration-300 px-8 py-6 text-lg font-medium rounded-lg"
    >
      <FcGoogle className="h-6 w-6" />
      Entrar com Google
    </Button>
  );
};

export default GoogleAuthButton;