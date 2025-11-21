"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { toast, Toaster } from "sonner";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Save,
  ArrowLeft,
  Plus,
} from "lucide-react";

export default function NovaPalestra() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState({
    tema: "",
    data: "",
    horario: "",
    local: "",
    palestrante: "",
    palestranteEmail: "",
    vagas: 0,
    descricao: "",
  });

  const podecriarPalestras = session?.user?.role === "administrador" || session?.user?.role === "organizador" || session?.user?.role === "palestrante";

  // Redirecionamento
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/dashboard');
    } else if (status === "authenticated" && !podecriarPalestras) {
      router.push('/dashboard');
    }
  }, [session, status, router, podecriarPalestras]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tema || !formData.data || !formData.horario || !formData.local || !formData.palestrante || !formData.palestranteEmail || !formData.vagas) {
      toast.error("Todos os campos obrigatórios devem ser preenchidos");
      return;
    }

    setSalvando(true);
    try {
      await addDoc(collection(db, "palestras"), {
        tema: formData.tema,
        data: formData.data,
        horario: formData.horario,
        local: formData.local,
        palestrante: formData.palestrante,
        palestranteEmail: formData.palestranteEmail,
        vagas: Number(formData.vagas),
        inscritos: 0,
        descricao: formData.descricao,
        materiais: [],
        criadoPor: session?.user?.id, // ID do usuário que está criando
        criadoPorEmail: session?.user?.email, // Email para referência
        criadoEm: new Date().toISOString(),
      });

      toast.success("Palestra criada com sucesso!");
      router.push('/admin/palestras');
    } catch (error) {
      console.error("Erro ao criar palestra:", error);
      toast.error("Erro ao criar palestra");
    } finally {
      setSalvando(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !podecriarPalestras) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/admin/palestras')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Nova Palestra
                </span>
              </h1>
              <p className="text-muted-foreground">
                Criar uma nova palestra no sistema
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Tema */}
            <div>
              <Label htmlFor="tema" className="text-sm font-medium text-foreground">
                Tema da Palestra *
              </Label>
              <Input
                id="tema"
                value={formData.tema}
                onChange={(e) => handleInputChange("tema", e.target.value)}
                placeholder="Digite o tema da palestra"
                className="mt-1"
                required
              />
            </div>

            {/* Data e Horário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data" className="text-sm font-medium text-foreground">
                  Data *
                </Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => handleInputChange("data", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="horario" className="text-sm font-medium text-foreground">
                  Horário *
                </Label>
                <Input
                  id="horario"
                  value={formData.horario}
                  onChange={(e) => handleInputChange("horario", e.target.value)}
                  placeholder="Ex: 14:00 - 16:00"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            {/* Local */}
            <div>
              <Label htmlFor="local" className="text-sm font-medium text-foreground">
                Local *
              </Label>
              <Input
                id="local"
                value={formData.local}
                onChange={(e) => handleInputChange("local", e.target.value)}
                placeholder="Digite o local da palestra"
                className="mt-1"
                required
              />
            </div>

            {/* Palestrante */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="palestrante" className="text-sm font-medium text-foreground">
                  Nome do Palestrante *
                </Label>
                <Input
                  id="palestrante"
                  value={formData.palestrante}
                  onChange={(e) => handleInputChange("palestrante", e.target.value)}
                  placeholder="Nome completo"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="palestranteEmail" className="text-sm font-medium text-foreground">
                  Email do Palestrante *
                </Label>
                <Input
                  id="palestranteEmail"
                  type="email"
                  value={formData.palestranteEmail}
                  onChange={(e) => handleInputChange("palestranteEmail", e.target.value)}
                  placeholder="email@exemplo.com"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            {/* Vagas */}
            <div>
              <Label htmlFor="vagas" className="text-sm font-medium text-foreground">
                Número de Vagas *
              </Label>
              <Input
                id="vagas"
                type="number"
                min="1"
                value={formData.vagas}
                onChange={(e) => handleInputChange("vagas", parseInt(e.target.value) || 0)}
                placeholder="Quantidade de vagas disponíveis"
                className="mt-1"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="descricao" className="text-sm font-medium text-foreground">
                Descrição
              </Label>
              <textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                placeholder="Descrição detalhada da palestra (opcional)"
                className="mt-1 w-full p-3 border border-border rounded-lg bg-background text-foreground min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={salvando}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {salvando ? "Criando..." : "Criar Palestra"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/palestras')}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}