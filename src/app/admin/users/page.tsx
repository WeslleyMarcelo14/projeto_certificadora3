"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { toast } from "sonner";
import { 
  Users, 
  Shield, 
  Edit, 
  Trash2, 
  Plus, 
  Search,
  UserCheck,
  Crown,
  Mic,
  User
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

const roleInfo = {
  participante: { 
    label: "Participante", 
    icon: User, 
    color: "text-blue-600 bg-blue-100",
    description: "Pode se inscrever em palestras e gerar certificados"
  },
  palestrante: { 
    label: "Palestrante", 
    icon: Mic, 
    color: "text-green-600 bg-green-100",
    description: "Pode criar e gerenciar suas próprias palestras"
  },
  organizador: { 
    label: "Organizador", 
    icon: UserCheck, 
    color: "text-orange-600 bg-orange-100",
    description: "Pode gerenciar todas as palestras e ver relatórios"
  },
  administrador: { 
    label: "Administrador", 
    icon: Crown, 
    color: "text-red-600 bg-red-100",
    description: "Acesso total ao sistema, incluindo gestão de usuários"
  }
};

export default function AdminUsers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Verificar se é administrador
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/dashboard");
    } else if (status === "authenticated" && session.user?.role !== "administrador") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  // Carregar usuários
  useEffect(() => {
    if (session?.user?.role === "administrador") {
      fetchUsers();
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        toast.error('Erro ao carregar usuários');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        toast.success('Cargo atualizado com sucesso!');
        fetchUsers(); // Recarregar lista
      } else {
        toast.error('Erro ao atualizar cargo');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`/api/users?userId=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Usuário removido com sucesso!');
        fetchUsers(); // Recarregar lista
      } else {
        toast.error('Erro ao remover usuário');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
    }
  };

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não for admin, será redirecionado, mas evita flash de conteúdo
  if (!session || session.user?.role !== "administrador") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex-shrink-0">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Gestão de Usuários
                </span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
                Gerencie cargos e permissões dos usuários do sistema
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {Object.entries(roleInfo).map(([role, info]) => {
            const count = users.filter(u => u.role === role).length;
            const Icon = info.icon;
            
            return (
              <div key={role} className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-border">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">
                      {info.label}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{count}</p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-full ${info.color} flex-shrink-0`}>
                    <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filtros */}
        <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-border mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium text-foreground mb-2 block">
                Buscar usuários
              </Label>
              <Input
                id="search"
                placeholder="Digite nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="sm:w-48 lg:w-64">
              <Label htmlFor="role-filter" className="text-sm font-medium text-foreground mb-2 block">
                Filtrar por cargo
              </Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os cargos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os cargos</SelectItem>
                  <SelectItem value="participante">Participante</SelectItem>
                  <SelectItem value="palestrante">Palestrante</SelectItem>
                  <SelectItem value="organizador">Organizador</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-accent p-6">
            <h2 className="text-2xl font-bold text-primary-foreground flex items-center gap-3">
              <Users className="h-6 w-6" />
              Usuários do Sistema ({filteredUsers.length})
            </h2>
          </div>

          <div className="p-6">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum usuário encontrado
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedRole !== "all" 
                    ? "Tente ajustar os filtros de busca"
                    : "Não há usuários cadastrados no sistema"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => {
                  const roleConfig = roleInfo[user.role as keyof typeof roleInfo];
                  const RoleIcon = roleConfig?.icon || User;
                  
                  return (
                    <div
                      key={user.id}
                      className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-muted/20 rounded-lg border border-border hover:bg-muted/40 transition-colors gap-4"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                          {user.image ? (
                            <img 
                              src={user.image} 
                              alt={user.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{user.name}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <div className="text-left sm:text-right">
                          <div className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${roleConfig?.color || 'text-gray-600 bg-gray-100'}`}>
                            <RoleIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">{roleConfig?.label || user.role}</span>
                            <span className="sm:hidden">{roleConfig?.label?.slice(0,4) || user.role}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 hidden lg:block max-w-[200px]">
                            {roleConfig?.description || 'Cargo não definido'}
                          </p>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                          <Select
                            value={user.role}
                            onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                          >
                            <SelectTrigger className="w-full sm:w-32 lg:w-40 text-xs sm:text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="participante">Participante</SelectItem>
                              <SelectItem value="palestrante">Palestrante</SelectItem>
                              <SelectItem value="organizador">Organizador</SelectItem>
                              <SelectItem value="administrador">Administrador</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteUser(user.id)}
                            disabled={user.id === session?.user?.id}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline ml-2">Remover</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Instruções */}
        <div className="mt-6 sm:mt-8 bg-primary/5 rounded-xl p-4 sm:p-6 border border-primary/20">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm sm:text-base">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Como gerenciar usuários
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <div>
              <p className="mb-2">
                <strong>✅ Alteração automática:</strong> Os usuários são automaticamente adicionados quando fazem login com Google.
              </p>
              <p>
                <strong>🔄 Mudança de cargo:</strong> Use o dropdown para alterar o cargo de qualquer usuário.
              </p>
            </div>
            <div>
              <p className="mb-2">
                <strong>🗑️ Remoção:</strong> Clique no botão vermelho para remover um usuário (exceto você mesmo).
              </p>
              <p>
                <strong>🔍 Filtros:</strong> Use a busca e filtros para encontrar usuários específicos.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}