import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, notFound, parseBody } from "@/lib/api"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  contactName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supplier = await db.supplier.findUnique({
    where: { id },
    include: {
      _count: { select: { lots: true, purchaseOrders: true } },
    },
  })
  if (!supplier) return notFound("Proveedor")
  return ok(supplier)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { id } = await params
  const parsed = await parseBody(req, updateSchema)
  if ("validationError" in parsed) return parsed.validationError

  const data = parsed.data
  const updated = await db.supplier.update({
    where: { id },
    data: {
      ...data,
      email: data.email === "" ? null : data.email,
    },
  })
  return ok(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { id } = await params
  const count = await db.lot.count({ where: { supplierId: id } })
  if (count > 0) return err("No se puede eliminar: el proveedor tiene lotes registrados", 409)

  await db.supplier.delete({ where: { id } })
  return ok({ deleted: true })
}
