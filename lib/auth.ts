import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // no bloquea login – verificación es recomendada
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url)
    },
    autoSignInAfterVerification: true,
  },

  ...(process.env["GOOGLE_CLIENT_ID"]
    ? {
        socialProviders: {
          google: {
            clientId: process.env["GOOGLE_CLIENT_ID"] as string,
            clientSecret: process.env["GOOGLE_CLIENT_SECRET"] as string,
          },
        },
      }
    : {}),

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
    updateAge: 60 * 60 * 24,      // renovar si quedan < 1 día
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // cache 5 min en cookie
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "CUSTOMER", // auto-registro = cliente
        input: false,
      },
      isActive: {
        type: "boolean",
        required: true,
        defaultValue: true,
        input: false,
      },
    },
  },
})

export type Session = typeof auth.$Infer.Session
export type ActiveSession = Session["session"]
export type AuthUser = Session["user"]
