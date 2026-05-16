import { db } from "@/lib/db"
import { CatalogClient } from "./catalog-client"

export type CatalogProduct = {
  id: string
  name: string
  price: string
  image: string | null
  category: string
  description: string
}

export default async function CatalogoPage() {
  const dbProducts = await db.product.findMany({
    where: { isPublic: true },
    include: {
      category: { select: { id: true, name: true } },
      variants: {
        where: { isActive: true },
        orderBy: { price: "asc" },
        take: 1,
        select: { price: true },
      },
    },
    orderBy: { name: "asc" },
  })

  const products: CatalogProduct[] = dbProducts.map((p) => ({
    id: p.slug,
    name: p.name,
    price: p.variants[0] ? `${Number(p.variants[0].price).toFixed(0)} BOB` : "Consultar",
    image: p.images[0] ?? null,
    category: p.category?.name ?? "General",
    description: p.description ?? "",
  }))

  const categorySet = new Set(products.map((p) => p.category))
  const categories = ["Todos", ...Array.from(categorySet).sort()]

  return <CatalogClient products={products} categories={categories} />
}
