"use client";

import { useSession } from "next-auth/react";
import { User } from "lucide-react";

const UserInfo = () => {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="bg-card/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          {session.user.name}
        </span>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
          {session.user?.role === "administrador" ? "Administrador" :
           session.user?.role === "organizador" ? "Organizador" :
           session.user?.role === "palestrante" ? "Palestrante" : "Participante"}
        </span>
      </div>
    </div>
  );
};

export default UserInfo;