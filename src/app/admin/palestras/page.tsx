"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import {
    collection,
    doc,
    onSnapshot,
    updateDoc,
    addDoc,
    deleteDoc,
    query,
    orderBy,
} from "firebase/firestore";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { toast, Toaster } from "sonner";
import {
    Calendar,
    Clock,
    MapPin,
    User,
    Users,
    FileText,
    Link2,
    Upload,
    Trash2,
    Edit3,
    Save,
    X,
    Plus,
    Eye,
} from "lucide-react";

type Palestra = {
    id: string;
    tema: string;
    data: string;
    horario: string;
    local: string;
    palestrante: string;
    palestranteEmail: string;
    vagas: number;
    inscritos: number;
    descricao?: string;
    materiais?: Material[];
};

type Material = {
    id: string;
    nome: string;
    conteudo: string;
    descricao?: string;
};

export default function AdminPalestras() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [palestras, setPalestras] = useState<Palestra[]>([]);
    const [loading, setLoading] = useState(true);
    const [editandoPalestra, setEditandoPalestra] = useState<string | null>(null);
    const [novoMaterial, setNovoMaterial] = useState<{
        nome: string;
        conteudo: string;
        descricao: string;
    }>({
        nome: "",
        conteudo: "",
        descricao: "",
    });
    const [mostrandoMateriais, setMostrandoMateriais] = useState<string | null>(null);

    const podeGerenciarPalestras = session?.user?.role === "administrador" || session?.user?.role === "organizador";

    // Redirecionamento
    useEffect(() => {
        if (status !== "loading" && (!session || !podeGerenciarPalestras)) {
            router.push('/dashboard');
        }
    }, [session, status, router, podeGerenciarPalestras]);

    // Carregar palestras
    useEffect(() => {
        if (!podeGerenciarPalestras) return;

        const unsubscribe = onSnapshot(
            query(collection(db, "palestras"), orderBy("data", "asc")),
            (snapshot) => {
                const palestrasData: Palestra[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    tema: doc.data().tema,
                    data: doc.data().data,
                    horario: doc.data().horario,
                    local: doc.data().local,
                    palestrante: doc.data().palestrante,
                    palestranteEmail: doc.data().palestranteEmail,
                    vagas: doc.data().vagas,
                    inscritos: doc.data().inscritos || 0,
                    descricao: doc.data().descricao || "",
                    materiais: doc.data().materiais || [],
                }));
                setPalestras(palestrasData);
                setLoading(false);
            },
            (error) => {
                console.error("Erro ao buscar palestras:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [podeGerenciarPalestras]);

    const adicionarMaterial = async (palestraId: string) => {
        if (!novoMaterial.nome.trim() || !novoMaterial.conteudo.trim()) {
            toast.error("Nome e conteúdo são obrigatórios");
            return;
        }

        try {
            const palestra = palestras.find(p => p.id === palestraId);
            if (!palestra) return;

            const materialId = Date.now().toString();
        const materiaisAtualizados = [
            ...(palestra.materiais || []),
            {
                id: materialId,
                nome: novoMaterial.nome,
                conteudo: novoMaterial.conteudo,
                descricao: novoMaterial.descricao,
            },
        ];            await updateDoc(doc(db, "palestras", palestraId), {
                materiais: materiaisAtualizados,
            });

            setNovoMaterial({ nome: "", conteudo: "", descricao: "" });
            toast.success("Material adicionado com sucesso!");
        } catch (error) {
            console.error("Erro ao adicionar material:", error);
            toast.error("Erro ao adicionar material");
        }
    };

    const removerMaterial = async (palestraId: string, materialId: string) => {
        try {
            const palestra = palestras.find(p => p.id === palestraId);
            if (!palestra) return;

            const materiaisAtualizados = palestra.materiais?.filter(m => m.id !== materialId) || [];

            await updateDoc(doc(db, "palestras", palestraId), {
                materiais: materiaisAtualizados,
            });

            toast.success("Material removido com sucesso!");
        } catch (error) {
            console.error("Erro ao remover material:", error);
            toast.error("Erro ao remover material");
        }
    };

    const deletarPalestra = async (palestraId: string, temaPalestra: string) => {
        if (!confirm(`Tem certeza que deseja deletar a palestra "${temaPalestra}"? Esta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/palestras/${palestraId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao deletar palestra');
            }

            toast.success("Palestra deletada com sucesso!");
        } catch (error) {
            console.error("Erro ao deletar palestra:", error);
            toast.error(`Erro ao deletar palestra: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    };

    const atualizarDescricao = async (palestraId: string, descricao: string) => {
        try {
            await updateDoc(doc(db, "palestras", palestraId), {
                descricao: descricao,
            });

            setEditandoPalestra(null);
            toast.success("Descrição atualizada com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar descrição:", error);
            toast.error("Erro ao atualizar descrição");
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/10 to-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session || !podeGerenciarPalestras) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
            <Toaster position="top-right" />

            {/* Header */}
            <header className="bg-card/50 backdrop-blur-sm shadow-sm border-b border-border">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                    Gerenciar Palestras
                                </span>
                            </h1>
                            <p className="text-muted-foreground">
                                Adicione materiais, descrições e gerencie o conteúdo das palestras
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => router.push('/admin/palestras/nova')}
                                variant="default"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Nova Palestra
                            </Button>
                            <Button
                                onClick={() => router.push('/dashboard')}
                                variant="outline"
                            >
                                Voltar ao Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {palestras.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                            Nenhuma palestra encontrada
                        </h3>
                        <p className="text-muted-foreground">
                            Vá para a seção de palestras para criar uma nova palestra.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {palestras.map((palestra) => (
                            <div
                                key={palestra.id}
                                className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-8"
                            >
                                {/* Cabeçalho da Palestra */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-foreground mb-4">
                                            {palestra.tema}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-muted-foreground">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                {new Date(palestra.data + "T00:00").toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 mr-2" />
                                                {palestra.horario}
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="h-4 w-4 mr-2" />
                                                {palestra.local}
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="h-4 w-4 mr-2" />
                                                {palestra.inscritos}/{palestra.vagas} inscritos
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <Button
                                            onClick={() => router.push(`/admin/palestras/${palestra.id}`)}
                                            variant="default"
                                            size="sm"
                                        >
                                            <Edit3 className="h-4 w-4 mr-2" />
                                            Editar Palestra
                                        </Button>
                                        <Button
                                            onClick={() => router.push(`/admin/palestras/${palestra.id}/participantes`)}
                                            variant="secondary"
                                            size="sm"
                                        >
                                            <Users className="h-4 w-4 mr-2" />
                                            Participantes ({palestra.inscritos})
                                        </Button>
                                        <Button
                                            onClick={() => setMostrandoMateriais(
                                                mostrandoMateriais === palestra.id ? null : palestra.id
                                            )}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            {mostrandoMateriais === palestra.id ? "Ocultar" : "Gerenciar Links"}
                                        </Button>
                                        <Button
                                            onClick={() => deletarPalestra(palestra.id, palestra.tema)}
                                            variant="destructive"
                                            size="sm"
                                            className="text-white"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Deletar
                                        </Button>
                                    </div>
                                </div>

                                {/* Área expandida com materiais */}
                                {mostrandoMateriais === palestra.id && (
                                    <div className="border-t border-border pt-6 space-y-6">

                                        {/* Descrição */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-lg font-semibold text-foreground flex items-center">
                                                    <FileText className="h-5 w-5 mr-2" />
                                                    Descrição
                                                </h3>
                                                <Button
                                                    onClick={() => setEditandoPalestra(
                                                        editandoPalestra === palestra.id ? null : palestra.id
                                                    )}
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    {editandoPalestra === palestra.id ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                                                </Button>
                                            </div>

                                            {editandoPalestra === palestra.id ? (
                                                <div className="space-y-3">
                                                    <textarea
                                                        defaultValue={palestra.descricao}
                                                        className="w-full p-3 border border-border rounded-lg bg-background text-foreground min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                                        placeholder="Adicione uma descrição detalhada da palestra..."
                                                        id={`desc-${palestra.id}`}
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => {
                                                                const textarea = document.getElementById(`desc-${palestra.id}`) as HTMLTextAreaElement;
                                                                atualizarDescricao(palestra.id, textarea.value);
                                                            }}
                                                            size="sm"
                                                        >
                                                            <Save className="h-4 w-4 mr-2" />
                                                            Salvar
                                                        </Button>
                                                        <Button
                                                            onClick={() => setEditandoPalestra(null)}
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            Cancelar
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground bg-muted/20 p-4 rounded-lg">
                                                    {palestra.descricao || "Nenhuma descrição adicionada ainda. Clique no ícone de edição para adicionar."}
                                                </p>
                                            )}
                                        </div>

                                        {/* Materiais */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                                                <Link2 className="h-5 w-5 mr-2" />
                                                Links Importantes
                                            </h3>

                                            {/* Lista de materiais */}
                                            {palestra.materiais && palestra.materiais.length > 0 ? (
                                                <div className="space-y-3 mb-6">
                                                    {palestra.materiais.map((material) => (
                                                        <div
                                                            key={material.id}
                                                            className="bg-muted/20 p-4 rounded-lg border border-border"
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center mb-2">
                                                                        <Link2 className="h-4 w-4 mr-2 text-primary" />
                                                                        <span className="font-medium text-foreground">{material.nome}</span>
                                                                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                                                            link
                                                                        </span>
                                                                    </div>
                                                                    {material.descricao && (
                                                                        <p className="text-sm text-muted-foreground mb-2">{material.descricao}</p>
                                                                    )}
                                                                    <div className="text-sm text-muted-foreground font-mono bg-background/50 p-2 rounded border">
                                                                        <a
                                                                            href={material.conteudo}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-primary hover:underline"
                                                                        >
                                                                            {material.conteudo}
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    onClick={() => removerMaterial(palestra.id, material.id)}
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground bg-muted/10 p-4 rounded-lg mb-6">
                                                    Nenhum material adicionado ainda.
                                                </p>
                                            )}

                                            {/* Formulário para adicionar material */}
                                            <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                                                <h4 className="font-semibold text-foreground mb-4 flex items-center">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Adicionar Novo Link
                                                </h4>
                                                <div className="mb-4">
                                                    <Label htmlFor="nome" className="text-sm font-medium text-foreground">
                                                        Nome do Link
                                                    </Label>
                                                    <Input
                                                        id="nome"
                                                        value={novoMaterial.nome}
                                                        onChange={(e) => setNovoMaterial({ ...novoMaterial, nome: e.target.value })}
                                                        placeholder="Ex: Slides da apresentação"
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <Label htmlFor="conteudo" className="text-sm font-medium text-foreground">
                                                        URL
                                                    </Label>
                                                    <Input
                                                        id="conteudo"
                                                        value={novoMaterial.conteudo}
                                                        onChange={(e) => setNovoMaterial({ ...novoMaterial, conteudo: e.target.value })}
                                                        placeholder="https://..."
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <Label htmlFor="descricao" className="text-sm font-medium text-foreground">
                                                        Descrição (opcional)
                                                    </Label>
                                                    <Input
                                                        id="descricao"
                                                        value={novoMaterial.descricao}
                                                        onChange={(e) => setNovoMaterial({ ...novoMaterial, descricao: e.target.value })}
                                                        placeholder="Breve descrição do material..."
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <Button
                                                    onClick={() => adicionarMaterial(palestra.id)}
                                                    className="w-full"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Adicionar Link
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}