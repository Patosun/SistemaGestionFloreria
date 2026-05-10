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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? ""
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")))
  const skip = (page - 1) * limit
  const sort = searchParams.get("sort") ?? "sortOrder"
  const dir = (searchParams.get("dir") ?? "asc") as "asc" | "desc"
  const allowedSorts = ["name", "slug", "sortOrder", "createdAt"]
  const safeSort = allowedSorts.includes(sort) ? sort : "sortOrder"

  const where = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { slug: { contains: q, mode: "insensitive" as const } }] }
    : {}

  const [categories, total] = await Promise.all([
    db.category.findMany({
      where,
      include: { parent: { select: { id: true, name: true } }, _count: { select: { products: true } } },
      orderBy: [{ [safeSort]: dir }, { name: "asc" }],
      skip,
      take: limit,
    }),
    db.category.count({ where }),
  ])
  return ok(categories, { page, limit, total })
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
