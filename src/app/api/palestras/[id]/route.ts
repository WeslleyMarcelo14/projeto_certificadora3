import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from '../../../../lib/firebase';
import { doc, deleteDoc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

// Replicamos as authOptions aqui para evitar problemas de importação
const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.id && user.email) {
        try {
          const userRef = doc(db, "users", user.id);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            const usersCollection = collection(db, "users");
            const usersSnapshot = await getDocs(usersCollection);
            const isFirstUser = usersSnapshot.empty;
            
            const userData = {
              name: user.name || '',
              email: user.email,
              image: user.image || '',
              role: isFirstUser ? 'administrador' : 'participante',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userRef, userData);
          } else {
            const userData = {
              name: user.name || '',
              email: user.email,
              image: user.image || '',
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userRef, userData, { merge: true });
          }
        } catch (error) {
          console.error('Erro ao salvar usuário no Firebase:', error);
        }
      }
      return true;
    },
    session: async ({ session, token }) => {
      if (session?.user && token.sub) {
        session.user.id = token.sub;
        try {
          const userRef = doc(db, "users", token.sub);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            session.user.role = userDoc.data().role || "participante";
          } else {
            session.user.role = "participante";
          }
        } catch (error) {
          console.error('Erro ao buscar role do usuário:', error);
          session.user.role = "participante";
        }
      }
      return session;
    },
  },
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário tem permissão para deletar palestras
    const userRole = session.user.role;
    if (userRole !== 'administrador' && userRole !== 'organizador') {
      return NextResponse.json(
        { error: 'Permissão insuficiente. Apenas administradores e organizadores podem deletar palestras.' },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID da palestra é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a palestra existe
    const palestraRef = doc(db, 'palestras', id);
    const palestraSnap = await getDoc(palestraRef);

    if (!palestraSnap.exists()) {
      return NextResponse.json(
        { error: 'Palestra não encontrada' },
        { status: 404 }
      );
    }

    // Deletar a palestra
    await deleteDoc(palestraRef);

    return NextResponse.json(
      { message: 'Palestra deletada com sucesso' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao deletar palestra:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}