import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { db } from '../../../../lib/firebase'
import { doc, setDoc, getDoc, collection, getDocs, runTransaction } from 'firebase/firestore'
import { firestoreManager } from '../../../../lib/firebase-singleton'
import { getUserRoleAdmin, createUserAdmin, isAdminAvailable } from '../../../../lib/firebase-admin'

console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

// Configuração da URL base
const NEXTAUTH_URL = "http://localhost:3000";

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
          await runTransaction(db, async (transaction) => {
            const userRef = doc(db, "users", user.id);
            const userDoc = await transaction.get(userRef);
            
            if (!userDoc.exists()) {
              // Verifica se existem usuários para determinar se este é o primeiro
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

              transaction.set(userRef, userData);
              
              if (isFirstUser) {
                console.log('🎉 Primeiro usuário criado como administrador:', user.email);
              }
            } else {
              // Atualiza dados de usuário existente (preserva o cargo)
              const userData = {
                name: user.name || '',
                email: user.email,
                image: user.image || '',
                updatedAt: new Date().toISOString(),
              };
              transaction.set(userRef, userData, { merge: true });
            }
          });
        } catch (error) {
          console.error('Erro ao salvar usuário no Firebase:', error);
          // Continua com o login mesmo se a operação no Firebase falhar
        }
      }
      return true;
    },
    session: async ({ session, token }) => {
      if (session?.user && token.sub) {
        session.user.id = token.sub;
        
        // Busca o role do usuário no Firebase com melhor tratamento de erros
        try {
          throw new Error('Using Client SDK for development');
        } catch (error: any) {
          try {
            // Garante que a conexão com o Firestore esteja ativa
            firestoreManager.updateActivity();
            
            const userRef = doc(db, "users", token.sub);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              session.user.role = userData.role || "participante";
              console.log(`✅ Role loaded via Client SDK for ${session.user.email}: ${session.user.role}`);
            } else {
              // Documento do usuário não encontrado, cria com função padrão
              console.warn(`⚠️ User document not found for ${session.user.email}, creating default`);
              session.user.role = "participante";
              
              // Tenta criar o documento do usuário
              try {
                const userData = {
                  name: session.user.name || '',
                  email: session.user.email,
                  image: session.user.image || '',
                  role: "participante",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                
                if (isAdminAvailable) {
                  await createUserAdmin(token.sub, userData);
                } else {
                  await setDoc(userRef, userData);
                }
              } catch (createError) {
                console.error('Error creating user document:', createError);
              }
            }
          } catch (clientError: any) {
            console.error('Client SDK also failed:', clientError);
            
            // Trata erros específicos de permissão
            if (clientError.code === 'permission-denied') {
              console.warn('⚠️ Firestore permission denied. Check security rules. Using default role.');
            } else if (clientError.code === 'unavailable') {
              console.warn('⚠️ Firestore unavailable. Using default role.');
            }
            
            // Sempre define como participante em caso de qualquer erro
            session.user.role = "participante";
          }
        }
      }
      return session;
    },
    redirect: async ({ url, baseUrl }) => {
      console.log("Redirect callback - URL:", url, "BaseURL:", baseUrl);
      // Força sempre usar localhost:3000
      const correctBase = NEXTAUTH_URL;
      if (url.startsWith("/")) return correctBase + url;
      if (url.startsWith(correctBase)) return url;
      return correctBase + "/dashboard";
    },
  },
  debug: true,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }