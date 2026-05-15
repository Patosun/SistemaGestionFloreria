import { HeroSection } from "@/components/store/hero-section"
import { CategoriesSection } from "@/components/store/categories-section"
import { ProductsSection } from "@/components/store/products-section"
import { FeaturesStrip } from "@/components/store/features-strip"
import { TestimonialsSection } from "@/components/store/testimonials-section"
import { CtaSection } from "@/components/store/cta-section"
import { db } from "@/lib/db"

async function getCategories() {
  try {
    return await db.category.findMany({
      orderBy: { sortOrder: "asc" },
      take: 6,
      include: { _count: { select: { products: true } } },
    })
  } catch {
    return []
  }
}

async function getProducts() {
  try {
    return await db.product.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        variants: {
          where: { isActive: true },
          select: { id: true, name: true, price: true, isActive: true },
          orderBy: { price: "asc" },
        },
      },
    })
  } catch {
    return []
  }
}

export default async function StorePage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()])

  // Cast to the shape expected by client components
  const categoryData = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    imageUrl: null as string | null,
    _count: c._count,
  }))

  const productData = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    images: p.images,
    tags: p.tags,
    isSeasonal: p.isSeasonal,
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
      isActive: v.isActive,
    })),
  }))

  return (
    <>
      <HeroSection />
      <CategoriesSection categories={categoryData} />
      <ProductsSection products={productData} />
      <FeaturesStrip />
      <TestimonialsSection />
      <CtaSection />
    </>
  )
}
