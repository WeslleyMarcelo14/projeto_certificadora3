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
    criadoPor?: string; 
    criadoPorEmail?: string; 
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

    const podeGerenciarPalestras = session?.user?.role === "administrador" || session?.user?.role === "organizador" || session?.user?.role === "palestrante";

    // Redirecionamento
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push('/');
        } else if (status === "authenticated" && !podeGerenciarPalestras) {
            router.push('/dashboard');
        }
    }, [status, router, podeGerenciarPalestras]);

    // Carregar palestras
    useEffect(() => {
        if (!podeGerenciarPalestras || !session?.user?.id) return;

        const unsubscribe = onSnapshot(
            query(collection(db, "palestras"), orderBy("data", "asc")),
            (snapshot) => {
                const todasPalestras: Palestra[] = snapshot.docs.map((doc) => ({
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
                    criadoPor: doc.data().criadoPor,
                    criadoPorEmail: doc.data().criadoPorEmail,
                }));

                // Filtrar palestras baseado no cargo do usuário
                let palestrasFiltradas = todasPalestras;
                
                // Se for palestrante, mostrar apenas suas próprias palestras
                if (session.user.role?.trim() === 'palestrante') {
                    palestrasFiltradas = todasPalestras.filter(palestra => 
                        palestra.criadoPor === session.user.id || 
                        palestra.criadoPorEmail === session.user.email
                    );
                }
                // Organizadores e administradores veem todas as palestras

                setPalestras(palestrasFiltradas);
                setLoading(false);
            },
            (error) => {
                console.error("Erro ao buscar palestras:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [podeGerenciarPalestras, session?.user?.id, session?.user?.email, session?.user?.role]);

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
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 sm:gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                    Gerenciar Palestras
                                </span>
                            </h1>
                            <p className="text-muted-foreground text-sm sm:text-base">
                                Adicione materiais, descrições e gerencie o conteúdo das palestras
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Button
                                onClick={() => router.push('/admin/palestras/nova')}
                                variant="default"
                                className="w-full sm:w-auto text-sm"
                                size="sm"
                            >
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Nova Palestra</span>
                                <span className="sm:hidden">Nova</span>
                            </Button>
                            <Button
                                onClick={() => router.push('/dashboard')}
                                variant="outline"
                                className="w-full sm:w-auto text-sm"
                                size="sm"
                            >
                                <span className="hidden sm:inline">Dashboard</span>
                                <span className="sm:hidden">Voltar</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
                {palestras.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                        <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                            Nenhuma palestra encontrada
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground px-4">
                            Vá para a seção de palestras para criar uma nova palestra.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                        {palestras.map((palestra) => (
                            <div
                                key={palestra.id}
                                className="bg-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-border p-3 sm:p-4 lg:p-6 xl:p-8"
                            >
                                {/* Cabeçalho da Palestra */}
                                <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-3 sm:mb-4 break-words">
                                            {palestra.tema}
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm lg:text-base text-muted-foreground">
                                            <div className="flex items-center">
                                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                                                <span className="truncate">{new Date(palestra.data + "T00:00").toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                                                <span className="truncate">{palestra.horario}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                                                <span className="truncate">{palestra.local}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                                                <span className="whitespace-nowrap">{palestra.inscritos}/{palestra.vagas} inscritos</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                                        <Button
                                            onClick={() => router.push(`/admin/palestras/${palestra.id}`)}
                                            variant="default"
                                            size="sm"
                                            className="w-full sm:w-auto text-xs sm:text-sm"
                                        >
                                            <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                            <span className="hidden sm:inline">Editar Palestra</span>
                                            <span className="sm:hidden">Editar</span>
                                        </Button>
                                        <Button
                                            onClick={() => router.push(`/admin/palestras/${palestra.id}/participantes`)}
                                            variant="secondary"
                                            size="sm"
                                            className="w-full sm:w-auto text-xs sm:text-sm"
                                        >
                                            <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                            <span className="hidden sm:inline">Participantes ({palestra.inscritos})</span>
                                            <span className="sm:hidden">Part. ({palestra.inscritos})</span>
                                        </Button>
                                        <Button
                                            onClick={() => setMostrandoMateriais(
                                                mostrandoMateriais === palestra.id ? null : palestra.id
                                            )}
                                            variant="outline"
                                            size="sm"
                                            className="w-full sm:w-auto text-xs sm:text-sm"
                                        >
                                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                            <span className="hidden sm:inline">{mostrandoMateriais === palestra.id ? "Ocultar" : "Gerenciar Links"}</span>
                                            <span className="sm:hidden">{mostrandoMateriais === palestra.id ? "Ocultar" : "Links"}</span>
                                        </Button>
                                        <Button
                                            onClick={() => deletarPalestra(palestra.id, palestra.tema)}
                                            variant="destructive"
                                            size="sm"
                                            className="text-white w-full sm:w-auto text-xs sm:text-sm"
                                        >
                                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                            <span className="hidden sm:inline">Deletar</span>
                                            <span className="sm:hidden">Del</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Painel contendo os materiais */}
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
                                                            className="bg-muted/20 p-3 sm:p-4 rounded-lg border border-border"
                                                        >
                                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center mb-2 flex-wrap">
                                                                        <Link2 className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                                                                        <span className="font-medium text-foreground text-sm sm:text-base truncate">{material.nome}</span>
                                                                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex-shrink-0">
                                                                            link
                                                                        </span>
                                                                    </div>
                                                                    {material.descricao && (
                                                                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">{material.descricao}</p>
                                                                    )}
                                                                    <div className="text-xs sm:text-sm text-muted-foreground font-mono bg-background/50 p-2 rounded border break-all">
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
                                                                    className="text-destructive hover:text-destructive self-start sm:self-center flex-shrink-0"
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
                                            <div className="bg-primary/5 p-4 sm:p-6 rounded-lg border border-primary/20">
                                                <h4 className="font-semibold text-foreground mb-4 flex items-center text-sm sm:text-base">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Adicionar Novo Link
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div>
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
                                                    <div>
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
                                                    className="w-full text-sm sm:text-base"
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