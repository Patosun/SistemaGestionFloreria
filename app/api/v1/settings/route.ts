import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { ok, err, parseBody } from "@/lib/api"
import { headers } from "next/headers"
import { z } from "zod"

// ── GET /api/v1/settings ──────────────────────────────────────────────────────

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const settings = await db.companySetting.findUnique({ where: { id: "singleton" } })

  return ok(
    settings ?? { id: "singleton", name: "", phone: null, email: null, address: null, city: null }
  )
}

// ── PUT /api/v1/settings ──────────────────────────────────────────────────────

const settingsSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  phone: z.string().max(30).optional().nullable(),
  email: z.string().max(200).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
})

export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const body = await parseBody(req, settingsSchema)
  if ("validationError" in body) return body.validationError

  const data = body.data

  const settings = await db.companySetting.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: { ...data },
  })

  return ok(settings)
}

// ── PATCH /api/v1/settings — change password ─────────────────────────────────

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
  newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
})

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const body = await parseBody(req, passwordSchema)
  if ("validationError" in body) return body.validationError

  const { currentPassword, newPassword } = body.data

  try {
    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: false },
      headers: await headers(),
    })
    return ok({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error al cambiar contraseña"
    return err(msg, 400)
  }
}