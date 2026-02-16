import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeCredentials } from "@/lib/auth-credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        return authorizeCredentials(credentials, {
          findUserByEmail: (email) =>
            prisma.user.findUnique({
              where: { email },
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                passwordHash: true,
              },
            }),
          comparePassword: bcrypt.compare,
        });
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const target = new URL(url);
        const base = new URL(baseUrl);
        if (target.origin === base.origin) return url;
      } catch {
        return baseUrl;
      }
      return baseUrl;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.name) session.user.name = token.name;
      if (token.email) session.user.email = token.email;
      session.user.role = (token.role as UserRole | undefined) ?? "USER";
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      // Always re-fetch role from DB so admin role changes take effect immediately
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { name: true, email: true, role: true },
        });
        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.role = dbUser.role;
        }
      }
      return token;
    },
  },
});
