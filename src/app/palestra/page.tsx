"use client";
import React, { useState, useEffect } from "react";
import { db } from "../firebase/page";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { toast } from "sonner";

type Palestra = {
  id: string;
  tema: string;
  data: string;
  horario: string;
  local: string;
  palestrante: string;
  palestranteEmail: string;
};

type Inscricao = {
  id: string;
  palestraId: string;
  participante: string;
  email: string;
  presente?: boolean;
};

const userProfiles = {
  administrador: {
    name: "Henry",
    email: "admin@aaaaaaa.com",
    role: "administrador",
  },
  organizador: {
    name: "Organizador",
    email: "organizador@gmail.com",
    role: "organizador",
  },
  palestrante: {
    name: "Maria",
    email: "palestrante@gmail.com",
    role: "palestrante",
  },
  participante: {
    name: "João",
    email: "participante@gmail.com",
    role: "participante",
  },
};
type UserRole = keyof typeof userProfiles;

export default function Palestras() {
  const [currentUserRole, setCurrentUserRole] =
    useState<UserRole>("participante");
  const {
    name: usuarioNome,
    email: usuarioEmail,
    role: papel,
  } = userProfiles[currentUserRole];

  const [palestras, setPalestras] = useState<Palestra[]>([]);
  const [inscricoesUsuario, setInscricoesUsuario] = useState<Inscricao[]>([]);

  const [form, setForm] = useState({
    tema: "",
    data: "",
    horario: "",
    local: "",
    palestrante: "",
  });
  const [editId, setEditId] = useState<string | null>(null);

  const podeEditar =
    papel === "organizador" ||
    papel === "palestrante" ||
    papel === "administrador";

  useEffect(() => {
    if (podeEditar) {
      setForm((prevForm) => ({ ...prevForm, palestrante: usuarioNome }));
    } else {
      setForm((prevForm) => ({ ...prevForm, palestrante: "" }));
    }
  }, [usuarioNome, podeEditar]);

  useEffect(() => {
    const q = query(collection(db, "palestras"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const palestrasData: Palestra[] = querySnapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id } as Palestra)
      );
      setPalestras(palestrasData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (papel !== "participante" || !usuarioEmail) {
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

  const handleInscrever = async (palestra: Palestra) => {
    if (!usuarioNome || !usuarioEmail) return;

    const jaInscrito = inscricoesUsuario.some(
      (i) => i.palestraId === palestra.id
    );
    if (jaInscrito) {
      toast.error("Você já está inscrito nesta palestra");
      return;
    }

    try {
      await addDoc(collection(db, "inscricoes"), {
        palestraId: palestra.id,
        participante: usuarioNome,
        email: usuarioEmail,
        presente: false,
      });
      toast.success(`Inscrição realizada em "${palestra.tema}"!`);
    } catch (error) {
      console.error("Erro ao inscrever: ", error);
      toast.error("Erro ao tentar realizar inscrição.");
    }
  };

  const handleCancelarInscricao = async (palestraId: string) => {
    const inscricao = inscricoesUsuario.find(
      (i) => i.palestraId === palestraId
    );
    if (!inscricao) {
      toast.error("Inscrição não encontrada.");
      return;
    }
    try {
      await deleteDoc(doc(db, "inscricoes", inscricao.id));
      toast.info("Inscrição cancelada");
    } catch (error) {
      console.error("Erro ao cancelar inscrição: ", error);
      toast.error("Erro ao tentar cancelar inscrição.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioNome || !usuarioEmail || !podeEditar) return;

    try {
      if (editId) {
        const palestraRef = doc(db, "palestras", editId);
        await updateDoc(palestraRef, {
          ...form,
          palestranteEmail: usuarioEmail,
        });
        toast.success("Palestra atualizada com sucesso!");
      } else {
        await addDoc(collection(db, "palestras"), {
          ...form,
          palestranteEmail: usuarioEmail,
        });
        toast.success("Palestra criada com sucesso!");
      }
      setForm({
        tema: "",
        data: "",
        horario: "",
        local: "",
        palestrante: usuarioNome,
      });
      setEditId(null);
    } catch (error) {
      console.error("Erro ao salvar palestra: ", error);
      toast.error("Erro ao salvar palestra.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "palestras", id));
      toast.success("Palestra excluída com sucesso.");
      if (editId === id) {
        setForm({
          tema: "",
          data: "",
          horario: "",
          local: "",
          palestrante: usuarioNome,
        });
        setEditId(null);
      }
    } catch (error) {
      console.error("Erro ao excluir palestra: ", error);
      toast.error("Erro ao excluir palestra.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary/30 to-background">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-card rounded-xl shadow-lg p-6 mb-8 border border-border">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">
            Visualizar como:
          </h2>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(userProfiles) as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => setCurrentUserRole(role)}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${currentUserRole === role
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
              >
                {userProfiles[role].name} ({userProfiles[role].role})
              </button>
            ))}
          </div>
        </div>

        {podeEditar && (
          <div className="bg-card rounded-xl shadow-lg p-6 mb-8 border border-border">
            <h2 className="text-2xl font-bold mb-6 text-card-foreground">
              {editId ? "Editar Palestra" : "Nova Palestra"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-card-foreground">
                  Tema
                </label>
                <Input
                  value={form.tema}
                  onChange={(e) => setForm({ ...form, tema: e.target.value })}
                  placeholder="Título da palestra"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-card-foreground">
                  Data
                </label>
                <Input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-card-foreground">
                  Horário
                </label>
                <Input
                  type="time"
                  value={form.horario}
                  onChange={(e) =>
                    setForm({ ...form, horario: e.target.value })
                  }
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-card-foreground">
                  Local
                </label>
                <Input
                  value={form.local}
                  onChange={(e) => setForm({ ...form, local: e.target.value })}
                  placeholder="Local do evento"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-card-foreground">
                  Palestrante
                </label>
                <Input
                  value={form.palestrante}
                  onChange={(e) =>
                    setForm({ ...form, palestrante: e.target.value })
                  }
                  placeholder="Nome do palestrante"
                  required
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <Button type="submit" className="flex-1">
                  {editId ? "Atualizar" : "Criar"} Palestra
                </Button>
                {editId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditId(null);
                      setForm({
                        tema: "",
                        data: "",
                        horario: "",
                        local: "",
                        palestrante: usuarioNome,
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </div>
        )}

        <div>
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Palestras Disponíveis
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {palestras.length === 0 && (
              <p className="text-muted-foreground lg:col-span-2 text-center">
                Nenhuma palestra cadastrada no momento.
              </p>
            )}
            {palestras.map((palestra) => {
              const jaInscrito = inscricoesUsuario.some(
                (i) => i.palestraId === palestra.id
              );
              const podeModificar =
                palestra.palestranteEmail === usuarioEmail ||
                papel === "organizador" ||
                papel === "administrador";

              return (
                <div
                  key={palestra.id}
                  className="bg-card rounded-xl shadow-lg p-6 border border-border hover:shadow-xl transition-shadow duration-300"
                >
                  <h3 className="text-xl font-bold text-card-foreground mb-3">
                    {palestra.tema}
                  </h3>
                  <div className="space-y-2 mb-4 text-muted-foreground">
                    <p className="flex items-center">
                      <span className="font-medium mr-2">📅</span>
                      {new Date(
                        palestra.data + "T00:00"
                      ).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium mr-2">🕐</span>
                      {palestra.horario}
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium mr-2">📍</span>
                      {palestra.local}
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium mr-2">👤</span>
                      {palestra.palestrante} ({palestra.palestranteEmail})
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {papel === "participante" &&
                      (jaInscrito ? (
                        <Button
                          variant="outline"
                          onClick={() => handleCancelarInscricao(palestra.id)}
                          className="flex-1"
                        >
                          Cancelar Inscrição
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleInscrever(palestra)}
                          className="flex-1"
                        >
                          Inscrever-se
                        </Button>
                      ))}

                    {podeEditar && podeModificar && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setForm({
                              tema: palestra.tema,
                              data: palestra.data,
                              horario: palestra.horario,
                              local: palestra.local,
                              palestrante: palestra.palestrante,
                            });
                            setEditId(palestra.id);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="flex-1"
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(palestra.id)}
                          className="flex-1"
                        >
                          Excluir
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}