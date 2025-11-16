"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { db } from "../../../lib/firebase";
import { doc, getDoc, addDoc, collection, increment, updateDoc } from "firebase/firestore";
import { Button } from "../../../components/ui/button";
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, UsersIcon, FileText, Link2, Upload } from "lucide-react";
import { toast } from "sonner";

export default function PalestraDetalhe() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [palestra, setPalestra] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const usuarioNome = session?.user?.name || '';
  const usuarioEmail = session?.user?.email || '';
  const [inscrevendo, setInscrevendo] = useState(false);
  const [inscrito, setInscrito] = useState(false);

  // Redireciona se não estiver logado
  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push('/');
    }
  }, [session, status, router]);

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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-lg text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return null;  
  }

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
      {/* Descrição da Palestra */}
      {palestra.descricao && (
        <div className="mb-6 p-4 bg-muted/20 rounded-lg border">
          <h3 className="font-semibold text-foreground mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Sobre a Palestra
          </h3>
          <p className="text-muted-foreground leading-relaxed">{palestra.descricao}</p>
        </div>
      )}

      {inscrito ? (
        <div className="space-y-4">
          <div className="text-green-600 font-semibold mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
            ✅ Inscrição confirmada! Você tem acesso aos materiais da palestra.
          </div>
          
          {/* Materiais da Palestra - só para inscritos */}
          {palestra.materiais && palestra.materiais.length > 0 && (
            <div className="bg-card/50 rounded-lg border p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <Link2 className="h-5 w-5 mr-2" />
                Links Importantes
              </h3>
              <div className="space-y-3">
                {palestra.materiais.map((material: any, index: number) => (
                  <div key={material.id || index} className="p-4 bg-muted/20 rounded-lg border">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3 mt-1">
                        <Link2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="font-medium text-foreground">{material.nome}</span>
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            link
                          </span>
                        </div>
                        {material.descricao && (
                          <p className="text-sm text-muted-foreground mb-2">{material.descricao}</p>
                        )}
                        <div className="text-sm">
                          <a 
                            href={material.conteudo} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-mono bg-background/80 p-2 rounded border block"
                          >
                            {material.conteudo}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Button onClick={handleInscrever} disabled={inscrevendo || palestra.inscritos >= palestra.vagas} className="w-full text-lg">
          {palestra.inscritos >= palestra.vagas ? "Vagas Esgotadas" : inscrevendo ? "Inscrevendo..." : "Confirmar Inscrição"}
        </Button>
      )}
      <Button variant="outline" className="w-full mt-4" onClick={() => router.push("/palestra")}>Voltar</Button>
    </div>
  );
}
