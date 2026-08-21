import type { NextAuthConfig } from "next-auth";
import { Role } from "@prisma/client";
import { isAppUserId } from "@/lib/auth-identity";

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
      const hasAppIdentity =
        isAppUserId(auth?.user?.id) &&
        (role === Role.ADMIN || role === Role.STUDENT);

      if (path.startsWith("/admin")) {
        return isLoggedIn && role === Role.ADMIN && hasAppIdentity;
      }

      if (path.startsWith("/dashboard")) {
        if (!isLoggedIn || !hasAppIdentity) return false;
        if (role === Role.ADMIN) {
          return Response.redirect(
            new URL("/admin/dashboard", request.nextUrl)
          );
        }
        return role === Role.STUDENT;
      }

      if (path === "/login") {
        if (isLoggedIn && hasAppIdentity) {
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
        if (isAppUserId(token.id)) {
          session.user.id = token.id;
        }
        if (token.role === Role.ADMIN || token.role === Role.STUDENT) {
          session.user.role = token.role;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
