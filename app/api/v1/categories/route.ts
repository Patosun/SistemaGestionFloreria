import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, parseBody } from "@/lib/api"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  parentId: z.string().cuid().optional().nullable(),
  sortOrder: z.number().int().default(0),
})

export async function GET() {
  const categories = await db.category.findMany({
    include: { parent: { select: { id: true, name: true } }, _count: { select: { products: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  })
  return ok(categories)
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const parsed = await parseBody(req, categorySchema)
  if ("validationError" in parsed) return parsed.validationError

  const { name, slug, description, imageUrl, parentId, sortOrder } = parsed.data

  const exists = await db.category.findFirst({ where: { OR: [{ name }, { slug }] } })
  if (exists) return err("Ya existe una categoría con ese nombre o slug", 409)

  const category = await db.category.create({
    data: { name, slug, description, imageUrl: imageUrl || null, parentId: parentId ?? null, sortOrder },
  })
  return ok(category)
}
