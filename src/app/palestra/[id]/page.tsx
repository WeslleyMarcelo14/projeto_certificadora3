"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { db } from "../../../lib/firebase";
import { doc, getDoc, addDoc, collection, increment, updateDoc, query, where, getDocs } from "firebase/firestore";
import { Button } from "../../../components/ui/button";
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, UsersIcon, FileText, Link2, Upload, Award } from "lucide-react";
import { toast } from "sonner";
import { QRCodeCanvas } from 'qrcode.react';

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
    if (status === "unauthenticated") {
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

  // Verificar se usuário está inscrito para mostrar certificado
  useEffect(() => {
    if (!id || !usuarioEmail) return;
    
    const verificarInscricao = async () => {
      try {
        const inscricoesRef = collection(db, "inscricoes");
        const q = query(
          inscricoesRef, 
          where("palestraId", "==", id),
          where("email", "==", usuarioEmail)
        );
        const querySnapshot = await getDocs(q);
        setInscrito(!querySnapshot.empty);
      } catch (error) {
        console.error("Erro ao verificar inscrição:", error);
      }
    };
    
    verificarInscricao();
  }, [id, usuarioEmail]);



  // Verifica se já está inscrito

  const handleInscrever = async () => {
    if (!palestra || !usuarioNome || !usuarioEmail) return;
    
    // Verificar se o usuário é o criador da palestra
    if (palestra.criadoPor === session?.user?.id || 
        palestra.criadoPorEmail === session?.user?.email ||
        palestra.palestranteEmail === session?.user?.email) {
      toast.error('Você não pode se inscrever na sua própria palestra!');
      return;
    }
    
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

  if (!palestra) {
    return <div className="p-8">Palestra não encontrada.</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 break-words">{palestra.tema}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-6 text-sm sm:text-base text-muted-foreground">
        <p className="flex items-center break-all"><CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" /> <span className="truncate">{new Date(palestra.data + "T00:00").toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span></p>
        <p className="flex items-center"><ClockIcon className="h-4 w-4 mr-2 flex-shrink-0" /> <span className="truncate">{palestra.horario}</span></p>
        <p className="flex items-center break-all"><MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" /> <span className="truncate">{palestra.local}</span></p>
        <p className="flex items-center break-all"><UserIcon className="h-4 w-4 mr-2 flex-shrink-0" /> <span className="truncate">{palestra.palestrante}</span></p>
        <p className="flex items-center col-span-1 sm:col-span-2"><UsersIcon className="h-4 w-4 mr-2 flex-shrink-0" /> {palestra.inscritos} / {palestra.vagas} vagas</p>
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

      {/* QR Code para Divulgação da Palestra */}
      <div className="mb-6 bg-gradient-to-br from-primary/5 via-accent/5 to-success/5 rounded-lg border-2 border-dashed border-primary/30 p-4 sm:p-6">
        <h3 className="font-semibold text-base sm:text-lg text-foreground mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
          <span className="break-words">Compartilhar Palestra</span>
        </h3>
        
        <div className="flex flex-col xl:flex-row items-center gap-4 sm:gap-6">
          <div className="flex-1 text-center xl:text-left">
            <p className="text-sm sm:text-base text-muted-foreground mb-4 px-2 sm:px-0">
              Compartilhe este QR Code nas redes sociais ou envie para outras pessoas se inscreverem na palestra:
            </p>
            <div className="bg-white p-3 sm:p-4 rounded-lg inline-block shadow-sm border">
              <QRCodeCanvas 
                value={typeof window !== 'undefined' ? 
                  `${window.location.origin}/palestra/${id}` :
                  `https://localhost:3000/palestra/${id}`
                }
                size={128}
                level="M"
                includeMargin={true}
                className="w-20 h-20 sm:w-32 sm:h-32"
              />
            </div>
          </div>
          
          <div className="flex-1 bg-white/50 rounded-lg p-3 sm:p-4 border w-full">
            <h4 className="font-semibold text-sm sm:text-base text-foreground mb-2">Informações da Palestra:</h4>
            <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
              <p className="break-words"><strong>Tema:</strong> <span className="break-all">{palestra.tema}</span></p>
              <p><strong>Data:</strong> {new Date(palestra.data + "T00:00").toLocaleDateString("pt-BR", { timeZone: "UTC" })}</p>
              <p><strong>Horário:</strong> {palestra.horario}</p>
              <p className="break-words"><strong>Local:</strong> <span className="break-all">{palestra.local}</span></p>
              <p className="break-words"><strong>Palestrante:</strong> <span className="break-all">{palestra.palestrante}</span></p>
              <p><strong>Vagas:</strong> {palestra.inscritos} / {palestra.vagas}</p>
            </div>
            
            <Button 
              className="w-full mt-3 sm:mt-4 text-xs sm:text-sm" 
              size="sm"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const palestraUrl = `${window.location.origin}/palestra/${id}`;
                  navigator.clipboard.writeText(palestraUrl);
                  toast.success("Link da palestra copiado!");
                }
              }}
            >
              <Link2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Copiar Link
            </Button>
          </div>
        </div>
      </div>

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

          {/* Certificado de Participação - apenas para inscritos */}
          <div className="bg-gradient-to-br from-success/5 via-primary/5 to-accent/5 rounded-lg border border-success/30 p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-success" />
              Seu Certificado de Participação
            </h3>
            
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Parabéns! Você está inscrito nesta palestra e receberá um certificado digital de participação.
              </p>
              
              <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full border border-success/20 mb-4">
                <Award className="h-4 w-4" />
                <span className="font-semibold text-sm">Certificado Garantido</span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Após a realização da palestra, você poderá acessar e compartilhar seu certificado digital.
              </p>
            </div>
          </div>
        </div>
      ) : (
        (() => {
          // Verificar se é o criador da palestra
          const isCriador = palestra.criadoPor === session?.user?.id || 
                           palestra.criadoPorEmail === session?.user?.email ||
                           palestra.palestranteEmail === session?.user?.email;
          
          if (isCriador) {
            return (
              <Button disabled variant="secondary" className="w-full text-lg">
                Esta é sua palestra
              </Button>
            );
          }
          
          return (
            <Button 
              onClick={handleInscrever} 
              disabled={inscrevendo || palestra.inscritos >= palestra.vagas} 
              className="w-full text-lg"
            >
              {palestra.inscritos >= palestra.vagas ? "Vagas Esgotadas" : inscrevendo ? "Inscrevendo..." : "Confirmar Inscrição"}
            </Button>
          );
        })()
      )}
      <Button variant="outline" className="w-full mt-4" onClick={() => router.push("/palestra")}>Voltar</Button>
    </div>
  );
}
