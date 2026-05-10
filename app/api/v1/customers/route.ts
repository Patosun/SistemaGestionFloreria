import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, parseBody } from "@/lib/api"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const customerSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(200),
  email: z.string().email("Email inválido").optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  notes: z.string().optional().nullable(),
  isB2B: z.boolean().default(false),
  companyName: z.string().max(200).optional().nullable(),
  taxId: z.string().max(50).optional().nullable(),
  creditLimit: z.number().positive().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? ""
  const isB2B = searchParams.get("isB2B")
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")))
  const skip = (page - 1) * limit
  const sort = searchParams.get("sort") ?? "name"
  const dir = (searchParams.get("dir") ?? "asc") as "asc" | "desc"
  const allowedSorts = ["name", "email", "orderCount", "totalSpent", "createdAt"]
  const safeSort = allowedSorts.includes(sort) ? sort : "name"

  const where = {
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { email: { contains: q, mode: "insensitive" as const } },
        { phone: { contains: q, mode: "insensitive" as const } },
        { companyName: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(isB2B !== null && { isB2B: isB2B === "true" }),
  }

  const [customers, total] = await Promise.all([
    db.customer.findMany({
      where,
      orderBy: { [safeSort]: dir },
      skip,
      take: limit,
    }),
    db.customer.count({ where }),
  ])

  return ok(customers, { page, limit, total })
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const body = await parseBody(req, customerSchema)
  if ("validationError" in body) return body.validationError

  const v = body.data

  if (v.email) {
    const existing = await db.customer.findUnique({ where: { email: v.email } })
    if (existing) return err("Ya existe un cliente con ese email", 409)
  }

  const customer = await db.customer.create({
    data: {
      name: v.name,
      email: v.email ?? undefined,
      phone: v.phone ?? undefined,
      address: v.address ?? undefined,
      notes: v.notes ?? undefined,
      isB2B: v.isB2B,
      companyName: v.companyName ?? undefined,
      taxId: v.taxId ?? undefined,
      creditLimit: v.creditLimit ?? undefined,
    },
  })

  return ok(customer)
}
