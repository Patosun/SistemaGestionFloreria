import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, parseBody } from "@/lib/api"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  notes: z.string().optional().nullable(),
  isB2B: z.boolean().optional(),
  companyName: z.string().max(200).optional().nullable(),
  taxId: z.string().max(50).optional().nullable(),
  creditLimit: z.number().positive().optional().nullable(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { id } = await params
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      addresses: true,
      importantDates: { orderBy: { date: "asc" } },
      _count: { select: { orders: true } },
    },
  })

  if (!customer) return err("Cliente no encontrado", 404)
  return ok(customer)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { id } = await params
  const body = await parseBody(req, updateSchema)
  if ("validationError" in body) return body.validationError

  const v = body.data

  if (v.email) {
    const conflict = await db.customer.findFirst({
      where: { email: v.email, id: { not: id } },
    })
    if (conflict) return err("Email ya está en uso por otro cliente", 409)
  }

  const customer = await db.customer.update({
    where: { id },
    data: {
      ...(v.name !== undefined && { name: v.name }),
      ...(v.email !== undefined && { email: v.email ?? undefined }),
      ...(v.phone !== undefined && { phone: v.phone ?? undefined }),
      ...(v.address !== undefined && { address: v.address ?? undefined }),
      ...(v.notes !== undefined && { notes: v.notes ?? undefined }),
      ...(v.isB2B !== undefined && { isB2B: v.isB2B }),
      ...(v.companyName !== undefined && { companyName: v.companyName ?? undefined }),
      ...(v.taxId !== undefined && { taxId: v.taxId ?? undefined }),
      ...(v.creditLimit !== undefined && { creditLimit: v.creditLimit ?? undefined }),
    },
  })

  return ok(customer)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { id } = await params
  const orders = await db.order.count({ where: { customerId: id } })
  if (orders > 0) return err("No se puede eliminar: el cliente tiene pedidos", 409)

  await db.customer.delete({ where: { id } })
  return ok({ deleted: true })
}
