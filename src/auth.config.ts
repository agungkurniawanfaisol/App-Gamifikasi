import type { NextAuthConfig } from "next-auth";
import { Role } from "@prisma/client";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const path = request.nextUrl.pathname;
      const role = auth?.user?.role;

      if (path.startsWith("/admin")) {
        return isLoggedIn && role === Role.ADMIN;
      }

      if (path.startsWith("/dashboard")) {
        return isLoggedIn;
      }

      if (path === "/login") {
        if (isLoggedIn) {
          return Response.redirect(
            new URL(
              role === Role.ADMIN ? "/admin/dashboard" : "/dashboard",
              request.nextUrl
            )
          );
        }
        return true;
      }

      return true;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
