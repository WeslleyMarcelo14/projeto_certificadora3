import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { db } from '../../../../lib/firebase'
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore'

console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

// Configuração explícita da URL base
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
          const userRef = doc(db, "users", user.id);
          const userDoc = await getDoc(userRef);
          
          // Se o usuário não existe, verifica se é o primeiro usuário
          if (!userDoc.exists()) {
            // Verifica se já existe algum usuário no sistema
            const usersCollection = collection(db, "users");
            const usersSnapshot = await getDocs(usersCollection);
            const isFirstUser = usersSnapshot.empty;
            
            const userData = {
              name: user.name || '',
              email: user.email,
              image: user.image || '',
              role: isFirstUser ? 'administrador' : 'participante', // Primeiro usuário = admin
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await setDoc(userRef, userData);
            
            if (isFirstUser) {
              console.log('🎉 Primeiro usuário criado como administrador:', user.email);
            }
          } else {
            // Usuário existente - atualiza apenas dados básicos (preserva role)
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
          // Continua com o login mesmo se houver erro no Firebase
        }
      }
      return true;
    },
    session: async ({ session, token }) => {
      if (session?.user && token.sub) {
        session.user.id = token.sub;
        
        // Busca o role do usuário no Firebase
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