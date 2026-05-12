import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { ok, err, parseBody } from "@/lib/api"
import { z } from "zod"

// ── helpers ─────────────────────────────────────────────────────────────────

async function hasAdminUser(): Promise<boolean> {
  const count = await db.user.count({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
  })
  return count > 0
}

// ── GET /api/v1/setup ────────────────────────────────────────────────────────
// Returns { needsSetup: true } when no admin user exists yet (public, no auth).

export async function GET() {
  const alreadySetup = await hasAdminUser()
  return ok({ needsSetup: !alreadySetup })
}

// ── POST /api/v1/setup ───────────────────────────────────────────────────────
// Creates the first SUPER_ADMIN user + company settings.
// Blocked if an admin already exists.

const setupSchema = z.object({
  // Company
  companyName: z.string().min(1, "Nombre de empresa requerido").max(200),
  companyPhone: z.string().max(30).optional().nullable(),
  companyEmail: z.string().email("Email inválido").optional().nullable(),
  companyAddress: z.string().max(300).optional().nullable(),
  companyCity: z.string().max(100).optional().nullable(),
  // Admin account
  adminName: z.string().min(2, "Nombre requerido").max(100),
  adminEmail: z.string().email("Email inválido"),
  adminPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100),
})

export async function POST(req: NextRequest) {
  // Double-check that setup is still needed
  if (await hasAdminUser()) {
    return err("El sistema ya ha sido configurado", 409)
  }

  const body = await parseBody(req, setupSchema)
  if ("validationError" in body) return body.validationError

  const {
    companyName,
    companyPhone,
    companyEmail,
    companyAddress,
    companyCity,
    adminName,
    adminEmail,
    adminPassword,
  } = body.data

  // 1. Register user via better-auth (handles password hashing)
  let signUpResult: { user?: { id: string } } | null = null
  try {
    signUpResult = await auth.api.signUpEmail({
      body: {
        name: adminName,
        email: adminEmail,
        password: adminPassword,
      },
      headers: new Headers(),
    })
  } catch {
    // better-auth throws when email already taken
    return err("El email ya está registrado", 409)
  }

  if (!signUpResult?.user?.id) {
    return err("No se pudo crear el usuario administrador", 500)
  }

  const userId = signUpResult.user.id

  // 2. Elevate role to SUPER_ADMIN via Prisma (role is not settable from client)
  await db.user.update({
    where: { id: userId },
    data: { role: "SUPER_ADMIN", isActive: true },
  })

  // 3. Persist company settings (upsert in case of retry)
  await db.companySetting.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      name: companyName,
      phone: companyPhone ?? null,
      email: companyEmail ?? null,
      address: companyAddress ?? null,
      city: companyCity ?? null,
    },
    update: {
      name: companyName,
      phone: companyPhone ?? null,
      email: companyEmail ?? null,
      address: companyAddress ?? null,
      city: companyCity ?? null,
    },
  })

  return ok({ success: true })
}
