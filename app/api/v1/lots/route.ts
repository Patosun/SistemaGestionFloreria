import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, parseBody } from "@/lib/api"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { receiveLot } from "@/lib/inventory"

const lotSchema = z.object({
  variantId: z.string().cuid(),
  supplierId: z.string().cuid().optional().nullable(),
  locationId: z.string().cuid().optional().nullable(),
  lotNumber: z.string().max(100).optional().nullable(),
  quantityInitial: z.number().positive(),
  costPerUnit: z.number().positive(),
  receivedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const variantId = searchParams.get("variantId")
  const status = searchParams.get("status")
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")))
  const skip = (page - 1) * limit

  const where = {
    ...(variantId && { variantId }),
    ...(status && { status: status as "ACTIVE" | "DEPLETED" | "EXPIRED" | "DISCARDED" }),
  }

  const [lots, total] = await Promise.all([
    db.lot.findMany({
      where,
      include: {
        variant: {
          include: { product: { select: { id: true, sku: true, name: true } } },
        },
        supplier: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } },
      },
      orderBy: { receivedAt: "desc" },
      skip,
      take: limit,
    }),
    db.lot.count({ where }),
  ])

  return ok(lots, { page, limit, total })
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const parsed = await parseBody(req, lotSchema)
  if ("validationError" in parsed) return parsed.validationError

  const data = parsed.data
  const lot = await receiveLot({
    variantId: data.variantId,
    supplierId: data.supplierId ?? undefined,
    locationId: data.locationId ?? undefined,
    lotNumber: data.lotNumber ?? undefined,
    quantityInitial: data.quantityInitial,
    costPerUnit: data.costPerUnit,
    receivedAt: data.receivedAt ? new Date(data.receivedAt) : undefined,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    notes: data.notes ?? undefined,
    performedBy: session.user.id,
  })

  return ok(lot)
}
