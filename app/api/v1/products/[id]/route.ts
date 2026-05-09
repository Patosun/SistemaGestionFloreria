import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, notFound, parseBody } from "@/lib/api"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().optional().nullable(),
  categoryId: z.string().cuid().optional().nullable(),
  freshnessDays: z.number().int().positive().optional().nullable(),
  isSeasonal: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  isComposite: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await db.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: { orderBy: { name: "asc" } },
      bomItems: { include: { componentProduct: { select: { id: true, sku: true, name: true } } } },
      _count: { select: { orderItems: true } },
    },
  })
  if (!product) return notFound("Producto")
  return ok(product)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { id } = await params
  const parsed = await parseBody(req, updateSchema)
  if ("validationError" in parsed) return parsed.validationError

  const updated = await db.product.update({
    where: { id },
    data: { ...parsed.data },
    include: { category: { select: { id: true, name: true } }, variants: true },
  })
  return ok(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { id } = await params
  const count = await db.orderItem.count({ where: { productId: id } })
  if (count > 0) return err("No se puede eliminar: el producto tiene pedidos asociados", 409)

  await db.product.delete({ where: { id } })
  return ok({ deleted: true })
}
