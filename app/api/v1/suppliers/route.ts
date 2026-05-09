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
  const includeInactive = searchParams.get("includeInactive") === "true"

  const suppliers = await db.supplier.findMany({
    where: includeInactive ? {} : { isActive: true },
    include: { _count: { select: { lots: true, purchaseOrders: true } } },
    orderBy: { name: "asc" },
  })
  return ok(suppliers)
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
