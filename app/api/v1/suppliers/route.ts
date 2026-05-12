import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, parseBody } from "@/lib/api"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const supplierSchema = z.object({
  name: z.string().min(1).max(200),
  contactName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? ""
  const includeInactive = searchParams.get("includeInactive") === "true"
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")))
  const skip = (page - 1) * limit
  const sort = searchParams.get("sort") ?? "name"
  const dir = (searchParams.get("dir") ?? "asc") as "asc" | "desc"
  const allowedSorts = ["name", "contactName", "email", "isActive", "createdAt"]
  const safeSort = allowedSorts.includes(sort) ? sort : "name"

  const where = {
    ...(includeInactive ? {} : { isActive: true }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { contactName: { contains: q, mode: "insensitive" as const } },
        { email: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  }

  const [suppliers, total] = await Promise.all([
    db.supplier.findMany({
      where,
      include: { _count: { select: { lots: true, purchaseOrders: true } } },
      orderBy: { [safeSort]: dir },
      skip,
      take: limit,
    }),
    db.supplier.count({ where }),
  ])
  return ok(suppliers, { page, limit, total })
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const parsed = await parseBody(req, supplierSchema)
  if ("validationError" in parsed) return parsed.validationError

  const data = parsed.data
  const supplier = await db.supplier.create({
    data: {
      name: data.name,
      contactName: data.contactName ?? null,
      email: data.email || null,
      phone: data.phone ?? null,
      address: data.address ?? null,
      notes: data.notes ?? null,
      isActive: data.isActive,
    },
  })
  return ok(supplier)
}
