import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function provisionGoogleUser(
  email: string,
  name: string | null | undefined,
  image: string | null | undefined
) {
  const normalizedEmail = email.toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    if (!existing.isActive) {
      return null;
    }

    const updates: { profileImageUrl?: string } = {};
    if (image && !existing.profileImageUrl) {
      updates.profileImageUrl = image;
    }

    if (Object.keys(updates).length > 0) {
      return prisma.user.update({
        where: { id: existing.id },
        data: updates,
      });
    }

    return existing;
  }

  return prisma.user.create({
    data: {
      name: name?.trim() || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      role: Role.STUDENT,
      profileImageUrl: image ?? null,
      isActive: true,
    } as Parameters<typeof prisma.user.create>[0]["data"],
  });
}

function isAppUserId(value: unknown): value is string {
  return typeof value === "string" && /^\d+$/.test(value);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user || !user.isActive || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      if (!user.email) {
        return false;
      }

      const dbUser = await provisionGoogleUser(
        user.email,
        user.name,
        user.image
      );
      return dbUser !== null;
    },
    async jwt({ token, user, account }) {
      // OAuth avatars bloat the JWT into chunked cookies that can corrupt after logout/re-login.
      if ("picture" in token) {
        delete (token as { picture?: unknown }).picture;
      }

      if (account?.provider === "google") {
        if (!user?.email) {
          delete token.id;
          delete (token as { role?: Role }).role;
          return token;
        }

        // Re-resolve from DB on every Google sign-in (do not trust Google `sub` as app id).
        const dbUser = await provisionGoogleUser(
          user.email,
          user.name,
          user.image
        );
        if (!dbUser) {
          delete token.id;
          delete (token as { role?: Role }).role;
          return token;
        }

        token.id = String(dbUser.id);
        token.role = dbUser.role;
        token.name = dbUser.name;
        token.email = dbUser.email;
        return token;
      }

      if (user) {
        // Credentials (or other providers): only accept numeric app user ids.
        if (isAppUserId(user.id) && user.role) {
          token.id = user.id;
          token.role = user.role;
        }
      }

      return token;
    },
  },
});
