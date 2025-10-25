// page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { db } from "../firebase/page";
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, increment, getDocs, writeBatch } from "firebase/firestore";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { toast } from "sonner";
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, UsersIcon, CheckCircleIcon, AwardIcon, UploadIcon, ShieldIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { usePathname } from "next/navigation";

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
};

type Inscricao = {
  id: string;
  palestraId: string;
  participante: string;
  email: string;
  presente: boolean;
};

type UserRole = "administrador" | "organizador" | "palestrante" | "participante";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type ProfileKey = UserRole;

const userProfiles: Record<ProfileKey, User> = {
  administrador: {
    id: "user1",
    name: "Henry",
    email: "admin@aaaaaaa.com",
    role: "administrador",
  },
  organizador: {
    id: "user2",
    name: "Organizador",
    email: "organizador@gmail.com",
    role: "organizador",
  },
  palestrante: {
    id: "user3",
    name: "Maria",
    email: "palestrante@gmail.com",
    role: "palestrante",
  },
  participante: {
    id: "user4",
    name: "João",
    email: "participante@gmail.com",
    role: "participante",
  }
};

//Componente - Painel do Administrador
const AdminPanel = ({ users, setUsers }: { users: User[]; setUsers: React.Dispatch<React.SetStateAction<User[]>>; }) => {
  const [newUser, setNewUser] = React.useState({ name: "", email: "", role: "organizador" as UserRole });

  const handleRoleChange = (userId: string, newRole: UserRole) => { setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))); toast.success(`Papel de ${users.find((u) => u.id === userId)?.name} atualizado!`) };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `user${users.length + 1}`;
    setUsers([...users, { ...newUser, id: newId }]);
    toast.success(`Usuário ${newUser.name} adicionado como ${newUser.role}.`);
    setNewUser({ name: "", email: "", role: "organizador" });
  };

  return (
    <div className="bg-card rounded-xl shadow-md p-6 mb-8 border border-border">
      <h2 className="text-2xl font-bold mb-6 text-card-foreground flex items-center">
        <ShieldIcon className="h-5 w-5 mr-2" /> Painel do Administrador
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-lg mb-3">Gerenciar Usuários</h3>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Definir papel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrador">Administrador</SelectItem>
                    <SelectItem value="organizador">Organizador</SelectItem>
                    <SelectItem value="palestrante">Palestrante</SelectItem>
                    <SelectItem value="participante">Participante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-3"> Adicionar Organizador/Palestrante </h3>
          <form onSubmit={handleAddUser} className="space-y-3">
            <Input placeholder="Nome Completo" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required />
            <Input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
            <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}>
              <SelectTrigger>
                <SelectValue placeholder="Definir papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="organizador">Organizador</SelectItem>
                <SelectItem value="palestrante">Palestrante</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full"> Adicionar Usuário </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

//Componente - Dashboard do Palestrante
const PalestranteDashboard = ({ minhasPalestras }: { minhasPalestras: Palestra[]; }) => {
  return (
    <div className="bg-card rounded-xl shadow-md p-6 mb-8 border border-border">
      <h2 className="text-2xl font-bold mb-6 text-card-foreground"> Minhas Palestras </h2>
      {minhasPalestras.length === 0 && (
        <p className="text-muted-foreground"> Você ainda não tem palestras atribuídas. </p>
      )}
      <div className="space-y-6">
        {minhasPalestras.map((palestra) => (
          <div key={palestra.id} className="p-4 border rounded-lg">
            <h3 className="text-xl font-bold text-card-foreground"> {palestra.tema} </h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground mt-2">
              <p className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />{new Date(palestra.data + "T00:00").toLocaleDateString("pt-BR", { timeZone: "UTC", })}
              </p>
              <p className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-2" /> {palestra.horario}
              </p>
              <p className="flex items-center">
                <UsersIcon className="h-4 w-4 mr-2" /> {palestra.inscritos} /{palestra.vagas} vagas
              </p>
            </div>
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-semibold mb-2">Materiais de Apoio</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Faça o upload de slides ou outros materiais para os
                participantes.
              </p>
              <Button variant="secondary">
                <UploadIcon className="h-4 w-4 mr-2" />Fazer Upload
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

//Componente - Modal de Relatório de Presença
const RelatorioPresencaModal = ({ palestra, onClose }: { palestra: Palestra; onClose: () => void; }) => {
  const [inscritos, setInscritos] = React.useState<Inscricao[]>([]);

  React.useEffect(() => {
    const q = query(collection(db, "inscricoes"), where("palestraId", "==", palestra.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Inscricao)); setInscritos(data);
    });
    return () => unsubscribe();
  }, [palestra.id]);

  const handleMarcarPresenca = async (inscricaoId: string, presenca: boolean) => {
    try {
      const inscricaoRef = doc(db, "inscricoes", inscricaoId);
      await updateDoc(inscricaoRef, { presente: presenca });
      toast.info("Status de presença atualizado.");
    } catch (error) {
      toast.error("Erro ao marcar presença.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl p-6 w-full max-w-lg border border-border">
        <h2 className="text-xl font-bold mb-2">Lista de Presença</h2>
        <p className="text-muted-foreground mb-4 font-medium">{palestra.tema}</p>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {inscritos.length === 0 && (
            <p className="text-muted-foreground">Nenhum inscrito para esta palestra.</p>
          )}
          {inscritos.map((inscrito) => (
            <div key={inscrito.id} className="flex items-center justify-between p-2 bg-secondary rounded-md" >
              <div>
                <p className="font-medium">{inscrito.participante}</p>
                <p className="text-sm text-muted-foreground">
                  {inscrito.email}
                </p>
              </div>
              <label htmlFor={`check-${inscrito.id}`} className="flex items-center gap-2 cursor-pointer text-sm" >
                <Checkbox id={`check-${inscrito.id}`} checked={!!inscrito.presente} onCheckedChange={(checked) => handleMarcarPresenca(inscrito.id, !!checked)} />
                Presente
              </label>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="outline"> Fechar </Button>
        </div>
      </div>
    </div>
  );
};

// Modal de Detalhes da Palestra para inscrição
const InscricaoModal = ({ palestra, open, onClose, onConfirm, inscrevendo }: {
  palestra: Palestra | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  inscrevendo: boolean;
}) => {
  if (!open || !palestra) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl p-6 w-full max-w-md border border-border">
        <h2 className="text-2xl font-bold mb-4">{palestra.tema}</h2>
        <div className="space-y-2 mb-6 text-muted-foreground">
          <p className="flex items-center"><CalendarIcon className="h-4 w-4 mr-2" /> {new Date(palestra.data + "T00:00").toLocaleDateString("pt-BR", { timeZone: "UTC" })}</p>
          <p className="flex items-center"><ClockIcon className="h-4 w-4 mr-2" /> {palestra.horario}</p>
          <p className="flex items-center"><MapPinIcon className="h-4 w-4 mr-2" /> {palestra.local}</p>
          <p className="flex items-center"><UserIcon className="h-4 w-4 mr-2" /> {palestra.palestrante}</p>
          <p className="flex items-center"><UsersIcon className="h-4 w-4 mr-2" /> {palestra.inscritos} / {palestra.vagas} vagas</p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onConfirm} disabled={inscrevendo || palestra.inscritos >= palestra.vagas}>
            {palestra.inscritos >= palestra.vagas ? "Vagas Esgotadas" : inscrevendo ? "Inscrevendo..." : "Confirmar Inscrição"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Modal de confirmação de exclusão de palestra
const ConfirmDeleteModal = ({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void; }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl p-6 w-full max-w-sm border border-border">
        <h2 className="text-xl font-bold mb-4">Confirmar Exclusão</h2>
        <p className="mb-6 text-muted-foreground">Tem certeza que deseja excluir esta palestra? Esta ação não poderá ser desfeita.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm}>Excluir</Button>
        </div>
      </div>
    </div>
  );
};

export default function PalestrasApp() {
  const [allUsers, setAllUsers] = React.useState<User[]>(Object.values(userProfiles));
  const [currentUser, setCurrentUser] = React.useState<User>(userProfiles.participante);
  const { name: usuarioNome, email: usuarioEmail, role: papel } = currentUser;
  const [palestras, setPalestras] = React.useState<Palestra[]>([]);
  const [inscricoesUsuario, setInscricoesUsuario] = React.useState<Inscricao[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState("palestras");
  const [modalRelatorio, setModalRelatorio] = React.useState<Palestra | null>(null);
  const initialFormState = { tema: "", data: "", horario: "", local: "", palestrante: "", vagas: 30 };
  const [form, setForm] = React.useState(initialFormState);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [modalInscricao, setModalInscricao] = useState<Palestra | null>(null);
  const [inscrevendo, setInscrevendo] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [palestraParaExcluir, setPalestraParaExcluir] = useState<string | null>(null);
  const podeGerenciar = papel === "organizador" || papel === "administrador";
  const pathname = usePathname();

  //Função para preencher o campo palestrante automaticamente
  React.useEffect(() => {
    if (!editId && (papel === "palestrante" || podeGerenciar)) {
      setForm((prev) => ({ ...prev, palestrante: usuarioNome }));
    } else if (!editId) {
      setForm((prev) => ({ ...prev, palestrante: "" }));
    }
  }, [usuarioNome, papel, podeGerenciar, editId]);

  //Carregar palestras do Firestore
  React.useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "palestras"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const palestrasData: Palestra[] = querySnapshot.docs.map(
        (doc) =>
        ({
          ...doc.data(),
          id: doc.id,
          inscritos: doc.data().inscritos || 0,
          vagas: doc.data().vagas || 0,
        } as Palestra)
      );
      setPalestras(palestrasData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  //Carregar inscrições do usuário atual
  React.useEffect(() => {
    if (!usuarioEmail) {
      setInscricoesUsuario([]);
      return;
    }
    const q = query(
      collection(db, "inscricoes"),
      where("email", "==", usuarioEmail)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const inscricoesData: Inscricao[] = querySnapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id } as Inscricao)
      );
      setInscricoesUsuario(inscricoesData);
    });
    return () => unsubscribe();
  }, [usuarioEmail, papel]);

  //Nova função para abrir modal de inscrição
  const handleAbrirModalInscricao = (palestra: Palestra) => {
    setModalInscricao(palestra);
  };

  // Nova função para confirmar inscrição no modal
  const handleConfirmarInscricao = async () => {
    if (!modalInscricao || !usuarioNome || !usuarioEmail) return;
    setInscrevendo(true);
    try {
      await addDoc(collection(db, "inscricoes"), {
        palestraId: modalInscricao.id,
        participante: usuarioNome,
        email: usuarioEmail,
        presente: false,
      });
      const palestraRef = doc(db, "palestras", modalInscricao.id);
      await updateDoc(palestraRef, {
        inscritos: increment(1),
      });
      toast.success(`Inscrição realizada em "${modalInscricao.tema}"!`);
      setModalInscricao(null);
    } catch (error) {
      toast.error("Erro ao tentar realizar inscrição.");
    } finally {
      setInscrevendo(false);
    }
  };

  //Função para criar ou editar palestra
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!podeGerenciar && papel !== "palestrante") return;
    try {
      if (editId) {
        const palestraRef = doc(db, "palestras", editId);
        await updateDoc(palestraRef, {
          ...form,
          vagas: Number(form.vagas),
        });
        toast.success("Palestra atualizada!");
      } else {
        await addDoc(collection(db, "palestras"), {
          ...form,
          vagas: Number(form.vagas),
          inscritos: 0,
          palestranteEmail: usuarioEmail,
        });
        toast.success("Palestra criada!");
      }
      setForm(initialFormState);
      setEditId(null);
    } catch (error) {
      toast.error("Erro ao salvar palestra.");
    }
  };

  // Função para cancelar inscrição
  const handleCancelarInscricao = async (palestraId: string) => {
    const inscricao = inscricoesUsuario.find((i) => i.palestraId === palestraId);
    if (!inscricao) return;
    try {
      await deleteDoc(doc(db, "inscricoes", inscricao.id));
      const palestraRef = doc(db, "palestras", palestraId);
      await updateDoc(palestraRef, {
        inscritos: increment(-1),
      });
      toast.info("Inscrição cancelada");
    } catch (error) {
      toast.error("Erro ao tentar cancelar inscrição.");
    }
  };

  // Função para excluir palestra
  const handleDelete = async (id: string) => {
    try {
      const inscricoesQuery = query(
        collection(db, "inscricoes"),
        where("palestraId", "==", id)
      );
      const inscricoesSnapshot = await getDocs(inscricoesQuery);
      if (!inscricoesSnapshot.empty) {
        const batch = writeBatch(db);
        inscricoesSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        toast.info("Inscrições associadas removidas.");
      }
      await deleteDoc(doc(db, "palestras", id));
      toast.success("Palestra excluída com sucesso.");
      if (editId === id) {
        setForm(initialFormState);
        setEditId(null);
      }
    } catch (error) {
      toast.error("Erro ao excluir palestra.");
    }
  };

  // Abrir modal automaticamente se a URL for /palestra/[id]
  useEffect(() => {
    const match = pathname.match(/^\/palestra\/(.+)$/);
    if (match && palestras.length > 0) {
      const palestraId = match[1];
      const palestra = palestras.find((p) => p.id === palestraId);
      if (palestra) setModalInscricao(palestra);
    }
  }, [pathname, palestras]);

  // Nova função para abrir modal de confirmação
  const handleAbrirModalDelete = (id: string) => {
    setPalestraParaExcluir(id);
    setDeleteModalOpen(true);
  };

  // Nova função para confirmar exclusão
  const handleConfirmarDelete = async () => {
    if (palestraParaExcluir) {
      await handleDelete(palestraParaExcluir);
      setDeleteModalOpen(false);
      setPalestraParaExcluir(null);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {modalRelatorio && (
        <RelatorioPresencaModal palestra={modalRelatorio} onClose={() => setModalRelatorio(null)} />
      )}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setPalestraParaExcluir(null); }}
        onConfirm={handleConfirmarDelete}
      />
      <InscricaoModal
        palestra={modalInscricao}
        open={!!modalInscricao}
        onClose={() => setModalInscricao(null)}
        onConfirm={handleConfirmarInscricao}
        inscrevendo={inscrevendo}
      />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl text-center font-bold text-foreground"> Sistema de Gestão de Palestras </h1>
          <p className="text-center text-muted-foreground"> Bem-vindo(a), {usuarioNome}! ({papel}) </p>
        </header>

        <div className="bg-card rounded-xl shadow-md p-6 mb-8 border border-border">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">
            Trocar de Perfil (Simulação):
          </h2>
          <div className="flex flex-wrap gap-3">
            {allUsers.map((user) => (
              <Button key={user.id} onClick={() => {
                setCurrentUser(user);
                setView("palestras");
                setEditId(null);
                setForm(initialFormState);
                setModalInscricao(null);
                setModalRelatorio(null);
              }} variant={currentUser.id === user.id ? "default" : "secondary"} className={`transition-all duration-300 transform ${currentUser.id === user.id ? "scale-105 shadow-lg" : "" }`} >
                {user.name}
              </Button>
            ))}
          </div>
        </div>

        {/* PAINEL DO ADMINISTRADOR */}
        {papel === "administrador" && (
          <div className="mb-8">
            <Button onClick={() => setView(view === "admin" ? "palestras" : "admin")} >
              {view === "admin" ? "Ver Palestras" : "Painel do Administrador"}
            </Button>
          </div>
        )}
        {papel === "administrador" && view === "admin" && (
          <AdminPanel users={allUsers} setUsers={setAllUsers} />
        )}

        {view === "palestras" && (
          <>
            {/* DASHBOARD DO PALESTRANTE */}
            {papel === "palestrante" && (
              <PalestranteDashboard
                minhasPalestras={palestras.filter(
                  (p) => p.palestranteEmail === usuarioEmail
                )}
              />
            )}

            {/* FORMULÁRIO DE CRIAÇÃO/EDIÇÃO */}
            {(podeGerenciar || papel === "palestrante") && (
              <div className="bg-card rounded-xl shadow-md p-6 mb-8 border border-border">
                <h2 className="text-2xl font-bold mb-6 text-card-foreground">
                  {editId ? "Editar Palestra" : "Criar Nova Palestra"}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="md:col-span-2 lg:col-span-3">
                    <Label htmlFor="tema" className="mb-1"> Tema </Label>
                    <Input id="tema" value={form.tema} onChange={(e) => setForm({ ...form, tema: e.target.value })} placeholder="Título da palestra" required />
                  </div>
                  <div>
                    <Label htmlFor="data" className="mb-1"> Data </Label>
                    <Input id="data" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="horario" className="mb-1"> Horário </Label>
                    <Input id="horario" type="time" value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="local" className="mb-1"> Local </Label>
                    <Input id="local" value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} placeholder="Local do evento" required />
                  </div>
                  <div>
                    <Label htmlFor="palestrante" className="mb-1"> Palestrante </Label>
                    <Input id="palestrante" value={form.palestrante} onChange={(e) => setForm({ ...form, palestrante: e.target.value })} placeholder="Nome do palestrante" required />
                  </div>
                  {podeGerenciar && (
                    <div>
                      <Label htmlFor="vagas" className="mb-1"> Vagas </Label>
                      <Input id="vagas" type="number" value={form.vagas} onChange={(e) => setForm({ ...form, vagas: Number(e.target.value) })} required />
                    </div>
                  )}
                  <div className="md:col-span-2 lg:col-span-3 flex gap-3 mt-4">
                    <Button type="submit" className="flex-1">
                      {editId ? "Atualizar Palestra" : "Criar Palestra"}
                    </Button>
                    {editId && (
                      <Button type="button" variant="outline" onClick={() => { setEditId(null); setForm(initialFormState); }}> Cancelar </Button>
                    )}
                  </div>
                </form>
              </div>
            )}
            {/* LISTA DE PALESTRAS */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                Palestras Disponíveis
              </h2>
              {loading ? (<p>Carregando palestras...</p>) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {palestras.map((palestra) => {
                    const inscricao = inscricoesUsuario.find((i) => i.palestraId === palestra.id);
                    const jaInscrito = !!inscricao;
                    const podeModificar = palestra.palestranteEmail === usuarioEmail || podeGerenciar;
                    const vagasEsgotadas = palestra.inscritos >= palestra.vagas;

                    return (
                      <div key={palestra.id} className="bg-card rounded-xl shadow-lg p-6 border border-border hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col">
                        <div className="flex flex-row gap-4 flex-grow">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-card-foreground mb-3">
                              {palestra.tema}
                            </h3>
                            <div className="space-y-2 mb-4 text-muted-foreground">
                              <p className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-2" />{new Date(palestra.data + "T00:00").toLocaleDateString("pt-BR", { timeZone: "UTC", })}
                              </p>
                              <p className="flex items-center">
                                <ClockIcon className="h-4 w-4 mr-2" />{palestra.horario}
                              </p>
                              <p className="flex items-center">
                                <MapPinIcon className="h-4 w-4 mr-2" />{palestra.local}
                              </p>
                              <p className="flex items-center">
                                <UserIcon className="h-4 w-4 mr-2" />{palestra.palestrante}
                              </p>
                              <p className="flex items-center">
                                <UsersIcon className="h-4 w-4 mr-2" />{palestra.inscritos} / {palestra.vagas} vagas
                              </p>
                              {jaInscrito && (
                                <p className="flex items-center font-semibold text-green-600">
                                  <CheckCircleIcon className="h-5 w-5 mr-2" /> Você está inscrito!
                                </p>
                              )}
                            </div>
                          </div>
                          {/* QR Code para visualização da palestra à direita */}
                          <div className="flex flex-col items-center justify-center min-w-[120px]">
                            <a href={`${typeof window !== "undefined" ? window.location.origin : ""}/palestra/${palestra.id}`} target="_self" rel="noopener noreferrer">
                              <QRCodeSVG
                                value={`${typeof window !== "undefined" ? window.location.origin : ""}/palestra/${palestra.id}`}
                                size={96}
                                bgColor="#fff"
                                fgColor="#000"
                                level="Q"
                                includeMargin={true}
                              />
                            </a>
                            <span className="text-xs text-muted-foreground mt-2 text-center">Escaneie ou clique para visualizar</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap mt-auto pt-4 border-t border-border/50">
                          {papel === "participante" &&
                            (jaInscrito ? (
                              <>
                                <Button variant="outline" onClick={() => handleCancelarInscricao(palestra.id)} className="flex-1"> Cancelar Inscrição </Button>
                                <Button onClick={() => handleEmitirCertificado(palestra.tema)} className="flex-1" disabled={!inscricao.presente}>
                                  <AwardIcon className="h-4 w-4 mr-2" /> {inscricao.presente ? "Emitir Certificado" : "Aguardando Presença"}
                                </Button>
                              </>
                            ) : (
                              <Button onClick={() => handleAbrirModalInscricao(palestra)} className="flex-1" disabled={vagasEsgotadas}>
                                {vagasEsgotadas ? "Vagas Esgotadas" : "Inscrever-se"}
                              </Button>
                            ))}
                          {podeGerenciar && (
                            <>
                              <Button variant="secondary" onClick={() => setModalRelatorio(palestra)} className="flex-1"> Ver Presença </Button>
                              <Button variant="outline" onClick={() => { setForm({ ...palestra, vagas: palestra.vagas || 30 }); setEditId(palestra.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex-1">
                                Editar
                              </Button>
                              <Button variant="destructive" onClick={() => handleAbrirModalDelete(palestra.id)} className="flex-1"> Excluir </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div >
  );
}