import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { nextCookies } from "better-auth/next-js";
import {
  sendChangeEmailConfirmationEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "./email";

function trustedOriginFromEnvironment() {
  const candidates = [
    process.env.BETTER_AUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    ...(process.env.NODE_ENV === "production"
      ? []
      : ["http://localhost:3000", "http://127.0.0.1:3000"]),
  ];

  return [...new Set(candidates.flatMap((candidate) => {
    if (!candidate) return [];
    try {
      return [new URL(candidate).origin];
    } catch {
      console.error("Ignoring an invalid trusted auth origin.");
      return [];
    }
  }))];
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: trustedOriginFromEnvironment(),
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Verification emails are sent, but verification is not a sign-in gate in
    // the current release. Enable this only with a customer migration plan.
    requireEmailVerification: false,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      void sendPasswordResetEmail(user.email, url).catch((error) => {
        console.error("Unable to send password reset email", error);
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendVerificationEmail(user.email, url).catch((error) => {
        console.error("Unable to send verification email", error);
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: process.env.E2E_TEST_MODE !== "true",
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60 * 60, max: 5 },
      "/request-password-reset": { window: 60 * 60, max: 3 },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  plugins: [nextCookies()],
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        void sendChangeEmailConfirmationEmail(user.email, newEmail, url).catch(
          (error) => {
            console.error("Unable to send email-change confirmation", error);
          },
        );
      },
    },
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
      },
    },
  },
});
