import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { ProductDetailClient, type DetailProduct, type RelatedProduct } from "./product-detail-client"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: slug } = await params

  const dbProduct = await db.product.findFirst({
    where: { slug, isPublic: true },
    include: {
      category: { select: { id: true, name: true } },
      variants: {
        where: { isActive: true },
        orderBy: { price: "asc" },
        select: { price: true },
      },
    },
  })

  if (!dbProduct) notFound()

  const dbRelated = await db.product.findMany({
    where: {
      isPublic: true,
      NOT: { slug },
      ...(dbProduct.categoryId ? { categoryId: dbProduct.categoryId } : {}),
    },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { price: "asc" },
        take: 1,
        select: { price: true },
      },
    },
    take: 3,
    orderBy: { name: "asc" },
  })

  const product: DetailProduct = {
    id: dbProduct.slug,
    name: dbProduct.name,
    price: dbProduct.variants[0] ? Number(dbProduct.variants[0].price) : 0,
    image: dbProduct.images[0] ?? null,
    images: dbProduct.images,
    category: dbProduct.category?.name ?? "General",
    description: dbProduct.description ?? "",
    features: dbProduct.tags,
  }

  const relatedProducts: RelatedProduct[] = dbRelated.map((p) => ({
    id: p.slug,
    name: p.name,
    price: p.variants[0] ? Number(p.variants[0].price) : 0,
    image: p.images[0] ?? null,
  }))

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />
}
