"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../../firebase/page";
import { doc, getDoc, addDoc, collection, increment, updateDoc } from "firebase/firestore";
import { Button } from "../../../components/ui/button";
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";

export default function PalestraDetalhe() {
  const { id } = useParams();
  const router = useRouter();
  const [palestra, setPalestra] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Simulação de usuário logado (ajuste conforme seu contexto de autenticação)
  const usuarioNome = "João";
  const usuarioEmail = "participante@gmail.com";
  const [inscrevendo, setInscrevendo] = useState(false);
  const [inscrito, setInscrito] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchPalestra = async () => {
      setLoading(true);
      const ref = doc(db, "palestras", id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) setPalestra({ id: snap.id, ...snap.data() });
      setLoading(false);
    };
    fetchPalestra();
  }, [id]);

  // Verifica se já está inscrito (opcional: pode ser melhorado para buscar do Firestore)
  // ...

  const handleInscrever = async () => {
    if (!palestra || !usuarioNome || !usuarioEmail) return;
    setInscrevendo(true);
    try {
      await addDoc(collection(db, "inscricoes"), {
        palestraId: palestra.id,
        participante: usuarioNome,
        email: usuarioEmail,
        presente: false,
      });
      const palestraRef = doc(db, "palestras", palestra.id);
      await updateDoc(palestraRef, {
        inscritos: increment(1),
      });
      setInscrito(true);
      toast.success("Inscrição realizada!");
    } catch (error) {
      toast.error("Erro ao inscrever.");
    } finally {
      setInscrevendo(false);
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;
  if (!palestra) return <div className="p-8">Palestra não encontrada.</div>;

  return (
    <div className="container mx-auto max-w-xl p-8">
      <h1 className="text-3xl font-bold mb-4">{palestra.tema}</h1>
      <div className="space-y-2 mb-6 text-muted-foreground">
        <p className="flex items-center"><CalendarIcon className="h-4 w-4 mr-2" /> {new Date(palestra.data + "T00:00").toLocaleDateString("pt-BR", { timeZone: "UTC" })}</p>
        <p className="flex items-center"><ClockIcon className="h-4 w-4 mr-2" /> {palestra.horario}</p>
        <p className="flex items-center"><MapPinIcon className="h-4 w-4 mr-2" /> {palestra.local}</p>
        <p className="flex items-center"><UserIcon className="h-4 w-4 mr-2" /> {palestra.palestrante}</p>
        <p className="flex items-center"><UsersIcon className="h-4 w-4 mr-2" /> {palestra.inscritos} / {palestra.vagas} vagas</p>
      </div>
      {inscrito ? (
        <div className="text-green-600 font-semibold mb-4">Inscrição confirmada!</div>
      ) : (
        <Button onClick={handleInscrever} disabled={inscrevendo || palestra.inscritos >= palestra.vagas} className="w-full text-lg">
          {palestra.inscritos >= palestra.vagas ? "Vagas Esgotadas" : inscrevendo ? "Inscrevendo..." : "Confirmar Inscrição"}
        </Button>
      )}
      <Button variant="outline" className="w-full mt-4" onClick={() => router.push("/palestra")}>Voltar</Button>
    </div>
  );
}
