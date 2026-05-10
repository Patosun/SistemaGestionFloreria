import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, parseBody } from "@/lib/api"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const variantSchema = z.object({
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  b2bPrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive(),
  attributes: z.record(z.string(), z.string()).optional().nullable(),
  isActive: z.boolean().default(true),
})

const productSchema = z.object({
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().optional().nullable(),
  categoryId: z.string().cuid().optional().nullable(),
  freshnessDays: z.number().int().positive().optional().nullable(),
  isSeasonal: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  isComposite: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  variants: z.array(variantSchema).min(1, "Al menos una variante es requerida"),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? ""
  const categoryId = searchParams.get("categoryId")
  const isPublic = searchParams.get("isPublic")
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")))
  const skip = (page - 1) * limit
  const sort = searchParams.get("sort") ?? "name"
  const dir = (searchParams.get("dir") ?? "asc") as "asc" | "desc"
  const allowedSorts = ["name", "sku", "createdAt", "updatedAt"]
  const safeSort = allowedSorts.includes(sort) ? sort : "name"

  const where = {
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { sku: { contains: q, mode: "insensitive" as const } },
        { tags: { has: q } },
      ],
    }),
    ...(categoryId && { categoryId }),
    ...(isPublic !== null && { isPublic: isPublic === "true" }),
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        variants: {
          where: { isActive: true },
          select: { id: true, sku: true, name: true, price: true, costPrice: true },
        },
        _count: { select: { variants: true } },
      },
      orderBy: { [safeSort]: dir },
      skip,
      take: limit,
    }),
    db.product.count({ where }),
  ])

  return ok(products, { page, limit, total })
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const parsed = await parseBody(req, productSchema)
  if ("validationError" in parsed) return parsed.validationError

  const { variants, ...productData } = parsed.data

  // Check uniqueness
  const existing = await db.product.findFirst({
    where: { OR: [{ sku: productData.sku }, { slug: productData.slug }] },
  })
  if (existing) return err("Ya existe un producto con ese SKU o slug", 409)

  // Check variant SKUs
  const variantSkus = variants.map((v) => v.sku)
  const duplicateVariant = await db.productVariant.findFirst({
    where: { sku: { in: variantSkus } },
  })
  if (duplicateVariant) return err(`SKU de variante ya en uso: ${duplicateVariant.sku}`, 409)

  const product = await db.product.create({
    data: {
      ...productData,
      categoryId: productData.categoryId ?? null,
      freshnessDays: productData.freshnessDays ?? null,
      variants: {
        create: variants.map((v) => ({
          sku: v.sku,
          name: v.name,
          price: v.price,
          b2bPrice: v.b2bPrice ?? null,
          costPrice: v.costPrice,
          attributes: v.attributes ?? undefined,
          isActive: v.isActive,
        })),
      },
    },
    include: { variants: true, category: { select: { id: true, name: true } } },
  })

  return ok(product)
}
