"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, Award, CheckCircle2, XCircle } from "lucide-react";

interface Palestra {
  id: string;
  tema: string;
  descricao: string;
  data: string;
  horario: string;
  local: string;
  palestrante: string;
  emailPalestrante: string;
  vagas: number;
  participantes: string[];
  organizadorEmail: string;
  materiais?: string[];
  status: "ativa" | "cancelada" | "finalizada";
}

export default function CertificadoPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [palestra, setPalestra] = useState<Palestra | null>(null);
  const [loading, setLoading] = useState(true);
  const [valido, setValido] = useState(false);
  
  const participanteEmail = searchParams.get('participante');
  const participanteNome = searchParams.get('nome');

  useEffect(() => {
    const buscarPalestra = async () => {
      if (!id || !participanteEmail) {
        setLoading(false);
        return;
      }

      try {
        const palestraRef = doc(db, "palestras", id as string);
        const palestraSnap = await getDoc(palestraRef);

        if (palestraSnap.exists()) {
          const dadosPalestra = palestraSnap.data() as Palestra;
          setPalestra({ ...dadosPalestra, id: palestraSnap.id });
          
          // Verificar se o participante estava inscrito na palestra
          if (dadosPalestra.participantes && dadosPalestra.participantes.includes(participanteEmail)) {
            setValido(true);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar palestra:", error);
      } finally {
        setLoading(false);
      }
    };

    buscarPalestra();
  }, [id, participanteEmail]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Validando certificado...</p>
        </div>
      </div>
    );
  }

  if (!palestra || !participanteEmail || !participanteNome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-card p-8 rounded-lg border shadow-sm">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Certificado Inválido</h1>
          <p className="text-muted-foreground">
            Este link de certificado não é válido ou expirou.
          </p>
        </div>
      </div>
    );
  }

  if (!valido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warning/5 via-background to-warning/10 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-card p-8 rounded-lg border shadow-sm">
          <XCircle className="h-16 w-16 text-warning mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Participação Não Confirmada</h1>
          <p className="text-muted-foreground mb-4">
            Este participante não estava inscrito nesta palestra ou não compareceu ao evento.
          </p>
          <div className="bg-muted/50 rounded p-4 text-sm">
            <p><strong>Participante:</strong> {participanteNome}</p>
            <p><strong>Email:</strong> {participanteEmail}</p>
            <p><strong>Palestra:</strong> {palestra.tema}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-success/5 via-background to-primary/5 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Cabeçalho de Validação */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full border border-success/20 mb-4">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">Certificado Válido</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Certificado de Participação</h1>
          <p className="text-muted-foreground mt-2">Evento de Extensão Universitária</p>
        </div>

        {/* Certificado */}
        <div className="bg-card rounded-lg border-2 border-primary/20 p-8 md:p-12 shadow-lg">
          <div className="text-center border-b border-border pb-6 mb-8">
            <Award className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Certificado de Participação
            </h2>
            <p className="text-muted-foreground">
              Conferido pela participação no evento de extensão universitária
            </p>
          </div>

          <div className="space-y-6">
            {/* Nome do Participante */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Certificamos que</p>
              <h3 className="text-3xl font-bold text-primary mb-2">{participanteNome}</h3>
              <p className="text-sm text-muted-foreground">participou da palestra</p>
            </div>

            {/* Detalhes da Palestra */}
            <div className="bg-muted/30 rounded-lg p-6">
              <h4 className="text-xl font-bold text-foreground text-center mb-4">
                "{palestra.tema}"
              </h4>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center text-muted-foreground">
                  <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm">
                    {new Date(palestra.data + "T00:00").toLocaleDateString("pt-BR", { 
                      timeZone: "UTC",
                      day: "2-digit",
                      month: "long", 
                      year: "numeric"
                    })}
                  </span>
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <ClockIcon className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm">{palestra.horario}</span>
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <MapPinIcon className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm">{palestra.local}</span>
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <UserIcon className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm">{palestra.palestrante}</span>
                </div>
              </div>

              {palestra.descricao && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center italic">
                    "{palestra.descricao}"
                  </p>
                </div>
              )}
            </div>

            {/* Informações de Validação */}
            <div className="border-t border-border pt-6">
              <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <p><strong>Participante:</strong> {participanteEmail}</p>
                  <p><strong>ID do Evento:</strong> {id}</p>
                </div>
                <div>
                  <p><strong>Data de Emissão:</strong> {new Date().toLocaleDateString("pt-BR")}</p>
                  <p><strong>Organizador:</strong> {palestra.emailPalestrante}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé do Certificado */}
          <div className="text-center mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Este certificado é válido e pode ser verificado através do QR Code original.
              <br />
              Gerado automaticamente pelo Sistema de Gestão de Palestras.
            </p>
          </div>
        </div>

        {/* Botão de Impressão */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Imprimir Certificado
          </button>
        </div>
      </div>
    </div>
  );
}