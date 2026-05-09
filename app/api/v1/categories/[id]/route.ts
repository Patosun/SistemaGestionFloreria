import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, notFound, parseBody } from "@/lib/api"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  parentId: z.string().cuid().optional().nullable(),
  sortOrder: z.number().int().optional(),
})

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = await db.category.findUnique({
    where: { id },
    include: { parent: true, children: true, _count: { select: { products: true } } },
  })
  if (!category) return notFound("Categoría")
  return ok(category)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { id } = await params
  const parsed = await parseBody(req, updateSchema)
  if ("validationError" in parsed) return parsed.validationError

  const data = parsed.data
  const updated = await db.category.update({ where: { id }, data })
  return ok(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { id } = await params
  const count = await db.product.count({ where: { categoryId: id } })
  if (count > 0) return err("No se puede eliminar: la categoría tiene productos asignados", 409)

  await db.category.delete({ where: { id } })
  return ok({ deleted: true })
}
