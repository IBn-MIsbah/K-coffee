import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { UserRole } from "./rbac";
import { Session, User } from "@/types";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  callbacks: {
    session: async (session: Session, user: User) => {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      });

      return {
        ...session,
        user: {
          ...session.user,
          role: dbUser?.role || UserRole.USER,
          id: user.id,
        },
      };
    },
    user: async (user: User) => {
      if (!user.role) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: UserRole.USER },
        });
      }
      return user;
    },
  },
});
