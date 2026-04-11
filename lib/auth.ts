import { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { supabase } from "./supabase";

declare module "next-auth" {
  interface Session {
    user: { id: string; email: string; name: string };
  }
  interface User {
    id: string; email: string; name: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT { id: string }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        const { data: user } = await supabase
          .from("User")
          .select("*")
          .eq("email", credentials.email)
          .single();

        if (!user) throw new Error("Email não encontrado");

        const valid = await compare(credentials.password, user.password);
        if (!valid) throw new Error("Senha incorreta");

        return { id: user.id, email: user.email, name: user.nome };
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
