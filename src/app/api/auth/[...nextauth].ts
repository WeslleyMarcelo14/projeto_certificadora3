import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@exemplo.com" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (credentials?.email && credentials?.password) {
          return {
            id: credentials.email,
            email: credentials.email,
            role: "participante",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (token?.role) session.user.role = token.role;
      return session;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user?.role) token.role = user.role;
      return token;
    },
  },
  pages: {
    signIn: "/user/login",
    error: "/user/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };