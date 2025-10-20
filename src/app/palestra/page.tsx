"use client";
import React, { useState, useEffect } from "react";
import { db } from "../firebase/page"; // Ajuste o caminho se necessário
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

// --- Tipos ---
type Palestra = {
  id: string;
  tema: string;
  data: string;
  horario: string;
  local: string;
  palestrante: string;
  palestranteEmail: string;
};

// ATUALIZADO: Tipo Inscricao agora inclui 'presente'
type Inscricao = {
  id: string;
  palestraId: string;
  participante: string;
  email: string;
  presente?: boolean; // Novo campo para RF 6.3
};

// ... (userProfiles continua o mesmo) ...
const userProfiles = {
  administrador: {
    name: "Admin Henry",
    email: "admin@aaaaaaa.com",
    role: "administrador",
  },
  organizador: {
    name: "Organizador ???",
    email: "organizador@gmail.com",
    role: "organizador",
  },
  palestrante: {
    name: "Palestrante Maria",
    email: "palestrante@gmail.com",
    role: "palestrante",
  },
  participante: {
    name: "Participante Joao",
    email: "participante@gmail.com",
    role: "participante",
  },
};
type UserRole = keyof typeof userProfiles;

export default function Page() {
  const [currentUserRole, setCurrentUserRole] =
    useState<UserRole>("administrador");
  const {
    name: usuarioNome,
    email: usuarioEmail,
    role: papel,
  } = userProfiles[currentUserRole];

  const [palestras, setPalestras] = useState<Palestra[]>([]);
  const [inscricoesUsuario, setInscricoesUsuario] = useState<Inscricao[]>([]); // Apenas do usuário logado

  // --- NOVOS ESTADOS PARA GESTÃO DE PRESENÇA ---
  const [todasInscricoes, setTodasInscricoes] = useState<Inscricao[]>([]); // Para Admins
  const [modalPalestraId, setModalPalestraId] = useState<string | null>(null); // Controla o modal

  const [mensagem, setMensagem] = useState("");
  const [form, setForm] = useState<Omit<Palestra, "id" | "palestranteEmail">>({
    tema: "",
    data: "",
    horario: "",
    local: "",
    palestrante: usuarioNome || "",
  });
  const [editId, setEditId] = useState<string | null>(null);

  // Permissões
  const podeEditar =
    papel === "organizador" ||
    papel === "palestrante" ||
    papel === "administrador";

  // Permissão para ver relatórios E listas de presença
  const podeVerRelatorio = papel === "organizador" || papel === "administrador";

  // ... (useEffect para 'form.palestrante' continua o mesmo) ...
  useEffect(() => {
    if (papel === 'palestrante' || papel === 'administrador' || papel === 'organizador') {
      setForm(prevForm => ({ ...prevForm, palestrante: usuarioNome }));
    }
  }, [usuarioNome, papel]);

  // Efeito para BUSCAR (READ) palestras (sem mudança)
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

  // Efeito para BUSCAR (READ) inscrições do usuário atual (sem mudança)
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

  // --- NOVO EFEITO: Buscar TODAS as inscrições (para Admins/Organizadores) ---
  useEffect(() => {
    if (!podeVerRelatorio) {
      setTodasInscricoes([]);
      return;
    }
    // Busca todas as inscrições
    const q = query(collection(db, "inscricoes"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const inscricoesData: Inscricao[] = querySnapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id } as Inscricao)
      );
      setTodasInscricoes(inscricoesData);
    });
    return () => unsubscribe();
  }, [podeVerRelatorio]); // Depende da permissão

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuarioNome || !usuarioEmail) return;
    try {
      if (editId !== null) {
        const palestraRef = doc(db, "palestras", editId);
        await updateDoc(palestraRef, { ...form, palestranteEmail: usuarioEmail });
        setEditId(null);
      } else {
        await addDoc(collection(db, "palestras"), { ...form, palestranteEmail: usuarioEmail });
      }
      setForm({ tema: "", data: "", horario: "", local: "", palestrante: usuarioNome });
    } catch (error) {
      console.error("Erro ao salvar palestra: ", error);
    }
  }
  function handleEdit(id: string) {
    const palestra = palestras.find((p) => p.id === id);
    if (palestra) {
      setForm({ tema: palestra.tema, data: palestra.data, horario: palestra.horario, local: palestra.local, palestrante: palestra.palestrante });
      setEditId(id);
    }
  }
  async function handleDelete(id: string) {
    try {
      await deleteDoc(doc(db, "palestras", id));
      if (editId === id) {
        setEditId(null);
        setForm({ tema: "", data: "", horario: "", local: "", palestrante: usuarioNome });
      }
    } catch (error) {
      console.error("Erro ao excluir palestra: ", error);
    }
  }
  async function handleInscricao(palestra: Palestra) {
    if (!usuarioNome || !usuarioEmail) return;
    try {
      await addDoc(collection(db, "inscricoes"), {
        palestraId: palestra.id,
        participante: usuarioNome,
        email: usuarioEmail,
        presente: false, // Define 'presente' como falso na inscrição
      });
      setMensagem(`Inscrição realizada para "${palestra.tema}"!`);
    } catch (error) {
      console.error("Erro ao inscrever: ", error);
    }
  }
  // --- Fim das Funções CRUD ---


  // --- NOVA FUNÇÃO: Marcar Presença (RF 6.3) ---
  async function handleMarcarPresenca(inscricaoId: string) {
    try {
      const inscricaoRef = doc(db, "inscricoes", inscricaoId);
      await updateDoc(inscricaoRef, {
        presente: true,
      });
      // O onSnapshot atualizará a lista 'todasInscricoes' automaticamente
    } catch (error) {
      console.error("Erro ao marcar presença: ", error);
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      {/* ... (Seletor de usuário e Formulário - sem alteração) ... */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
        <label htmlFor="role-select" className="block text-sm font-medium text-gray-800 mb-2">
          Simular login como:
        </label>
        <select
          id="role-select"
          value={currentUserRole}
          onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="administrador">Administrador</option>
          <option value="organizador">Organizador</option>
          <option value="palestrante">Palestrante</option>
          <option value="participante">Participante</option>
        </select>
        <p className="text-xs text-gray-600 mt-2">
          Logado como: <span className="font-semibold text-gray-900">{usuarioNome} ({usuarioEmail})</span>
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Gerenciar Palestras</h2>
      {podeEditar ? (
        <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 gap-4">
          <input name="tema" value={form.tema} onChange={handleChange} required placeholder="Tema" className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="data" value={form.data} onChange={handleChange} required placeholder="Data" type="date" className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="horario" value={form.horario} onChange={handleChange} required placeholder="Horário" type="time" className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="local" value={form.local} onChange={handleChange} required placeholder="Local" className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="palestrante" value={form.palestrante} onChange={handleChange} required placeholder="Palestrante responsável" className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button type="submit" className="py-2 px-4 bg-green-600 text-white font-bold rounded hover:bg-green-700 transition-colors duration-300">{editId ? "Salvar edição" : "Adicionar palestra"}</button>
        </form>
      ) : (
        <p className="mb-8 text-center text-gray-500">Apenas organizadores, palestrantes ou administradores podem criar ou editar palestras.</p>
      )}


      <h3 className="text-xl font-bold mb-4 text-blue-700 text-center">
        Palestras Agendadas
      </h3>
      <ul className="divide-y divide-gray-200">
        {palestras.length === 0 && (
          <li className="py-4 text-center text-gray-500">
            Nenhuma palestra cadastrada.
          </li>
        )}
        {palestras.map((p) => {
          const inscrito = inscricoesUsuario.some((i) => i.palestraId === p.id);

          return (
            <li
              key={p.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              {/* ... (Info da palestra - sem alteração) ... */}
              <div>
                <span className="font-semibold text-blue-700">{p.tema}</span> <br />
                <span className="text-sm text-gray-600">{p.data} às {p.horario} | {p.local}</span> <br />
                <span className="text-sm text-gray-600">Palestrante: {p.palestrante} ({p.palestranteEmail})</span>
              </div>

              {/* --- BOTÕES ATUALIZADOS --- */}
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                {/* Botões de Editar/Excluir */}
                {podeEditar &&
                  (p.palestranteEmail === usuarioEmail ||
                    papel === "organizador" ||
                    papel === "administrador") && (
                    <>
                      <button
                        onClick={() => handleEdit(p.id)}
                        className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Excluir
                      </button>
                    </>
                  )}

                {/* NOVO: Botão de Ver Inscritos (RF 6.3) */}
                {podeVerRelatorio && (
                  <button
                    onClick={() => setModalPalestraId(p.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Ver Inscritos
                  </button>
                )}

                {/* Botões de Inscrição (Participante) */}
                {papel === "participante" && !inscrito && (
                  <button
                    onClick={() => handleInscricao(p)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Inscrever-se
                  </button>
                )}
                {papel === "participante" && inscrito && (
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                    Inscrito
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {mensagem && (
        <p className="text-green-600 mt-6 text-center font-semibold">
          {mensagem}
        </p>
      )}

      {/* --- NOVO: MODAL DE LISTA DE PRESENÇA (RF 6.3) --- */}
      {modalPalestraId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              Lista de Presença
            </h3>
            <ul className="divide-y max-h-64 overflow-y-auto">
              {todasInscricoes
                .filter((i) => i.palestraId === modalPalestraId)
                .map((inscricao) => (
                  <li
                    key={inscricao.id}
                    className="py-2 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium">{inscricao.participante}</span>
                      <br />
                      <span className="text-sm text-gray-500">{inscricao.email}</span>
                    </div>
                    {inscricao.presente ? (
                      <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
                        Presente
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarcarPresenca(inscricao.id)}
                        className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                      >
                        Marcar Presença
                      </button>
                    )}
                  </li>
                ))}
            </ul>
            <button
              onClick={() => setModalPalestraId(null)}
              className="mt-6 w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}