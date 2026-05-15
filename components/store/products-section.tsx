"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ShoppingCart, Heart, Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useCartStore } from "@/lib/cart-store"

type Variant = {
  id: string
  name: string
  price: number | string
  isActive: boolean
}

type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  images: string[]
  tags: string[]
  isSeasonal: boolean
  variants: Variant[]
}

const PRODUCT_GRADIENTS = [
  "from-rose-50 via-rose-100 to-pink-100",
  "from-fuchsia-50 via-pink-100 to-rose-50",
  "from-violet-50 via-purple-50 to-fuchsia-100",
  "from-orange-50 via-amber-50 to-yellow-100",
  "from-emerald-50 via-teal-50 to-green-100",
  "from-sky-50 via-blue-50 to-indigo-100",
  "from-lime-50 via-green-50 to-emerald-100",
  "from-red-50 via-rose-50 to-pink-100",
]

const PLACEHOLDER_EMOJIS = ["🌹", "💐", "🌸", "🌺", "🪷", "🌷", "🌻", "🌼"]

const PLACEHOLDER_PRODUCTS: Product[] = [
  { id: "1", name: "Rosas Rojas Premium", slug: "rosas-rojas-premium", description: "Docena de rosas rojas frescas", images: [], tags: ["popular"], isSeasonal: false, variants: [{ id: "v1", name: "Docena", price: 120, isActive: true }] },
  { id: "2", name: "Bouquet Romántico", slug: "bouquet-romantico", description: "Mix de flores silvestres", images: [], tags: ["nuevo"], isSeasonal: false, variants: [{ id: "v2", name: "Estándar", price: 95, isActive: true }] },
  { id: "3", name: "Arreglo Primaveral", slug: "arreglo-primaveral", description: "Colores vibrantes de temporada", images: [], tags: ["temporada"], isSeasonal: true, variants: [{ id: "v3", name: "Mediano", price: 140, isActive: true }] },
  { id: "4", name: "Orquídeas Blancas", slug: "orquideas-blancas", description: "Elegancia y distinción", images: [], tags: ["premium"], isSeasonal: false, variants: [{ id: "v4", name: "Unidad", price: 180, isActive: true }] },
  { id: "5", name: "Girasoles Alegres", slug: "girasoles-alegres", description: "Trae el sol a tu hogar", images: [], tags: [], isSeasonal: false, variants: [{ id: "v5", name: "Media docena", price: 75, isActive: true }] },
  { id: "6", name: "Caja de Tulipanes", slug: "caja-tulipanes", description: "En elegante caja floral", images: [], tags: ["nuevo"], isSeasonal: true, variants: [{ id: "v6", name: "Caja", price: 155, isActive: true }] },
  { id: "7", name: "Ramo Silvestre", slug: "ramo-silvestre", description: "Naturaleza en tus manos", images: [], tags: [], isSeasonal: false, variants: [{ id: "v7", name: "Grande", price: 110, isActive: true }] },
  { id: "8", name: "Novia Perfecto", slug: "novia-perfecto", description: "Para tu día especial", images: [], tags: ["premium", "boda"], isSeasonal: false, variants: [{ id: "v8", name: "Personalizado", price: 320, isActive: true }] },
]

const TAG_LABELS: Record<string, { label: string; className: string }> = {
  popular: { label: "Popular", className: "bg-amber-100 text-amber-800 border-amber-200" },
  nuevo: { label: "Nuevo", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  premium: { label: "Premium", className: "bg-violet-100 text-violet-800 border-violet-200" },
  temporada: { label: "Temporada", className: "bg-rose-100 text-rose-800 border-rose-200" },
  boda: { label: "Bodas", className: "bg-pink-100 text-pink-800 border-pink-200" },
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const [liked, setLiked] = useState(false)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const minVariant = product.variants.reduce(
    (min, v) => (Number(v.price) < Number(min.price) ? v : min),
    product.variants[0] ?? { id: "", name: "Estándar", price: 0, isActive: true },
  )
  const minPrice = Number(minVariant.price)

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    addItem({
      id: `${product.id}-${minVariant.id}`,
      productId: product.id,
      variantId: minVariant.id,
      name: product.name,
      variantName: minVariant.name,
      price: minPrice,
      image: product.images[0] ?? null,
      emoji: PLACEHOLDER_EMOJIS[index % PLACEHOLDER_EMOJIS.length],
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const firstTag = product.tags[0]
  const tagInfo = firstTag ? TAG_LABELS[firstTag] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.08, ease: "easeOut" }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-border/50 shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      {/* Image area */}
      <div className={`relative aspect-[4/3] bg-gradient-to-br ${PRODUCT_GRADIENTS[index % PRODUCT_GRADIENTS.length]} overflow-hidden`}>
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-7xl drop-shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              {PLACEHOLDER_EMOJIS[index % PLACEHOLDER_EMOJIS.length]}
            </span>
          </div>
        )}

        {/* Tags overlay */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {tagInfo && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tagInfo.className}`}>
              {tagInfo.label}
            </span>
          )}
          {product.isSeasonal && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-orange-100 text-orange-800 border-orange-200">
              Temporada
            </span>
          )}
        </div>

        {/* Like button */}
        <button
          onClick={(e) => { e.preventDefault(); setLiked(v => !v) }}
          className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          aria-label="Me gusta"
        >
          <Heart className={`h-3.5 w-3.5 transition-colors ${liked ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
        </button>

        {/* Add to cart overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button
            size="sm"
            className={`w-full rounded-none rounded-b-none h-10 gap-2 shadow-none transition-colors ${added ? "bg-emerald-600 hover:bg-emerald-600" : ""}`}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            {added ? "¡Agregado! ✓" : "Agregar al carrito"}
          </Button>
        </div>
      </div>

      {/* Info */}
      <Link href={`/store/productos/${product.slug}`} className="flex flex-col gap-1 p-3 pt-3.5 flex-1">
        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">(24)</span>
        </div>

        <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground">Desde </span>
            <span className="font-bold text-primary">
              Bs. {isFinite(minPrice) ? minPrice.toFixed(0) : "—"}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function ProductsSection({ products }: { products?: Product[] }) {
  const items = products && products.length > 0 ? products : PLACEHOLDER_PRODUCTS

  return (
    <section className="py-20 bg-gradient-to-b from-white to-rose-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <span className="text-sm font-medium text-primary uppercase tracking-widest">Destacados</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mt-1">
              Arreglos más amados
            </h2>
          </div>
          <Link
            href="/store/productos"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
          >
            Ver catálogo completo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {items.slice(0, 8).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 text-center"
        >
          <Button asChild variant="outline" size="lg" className="rounded-full px-10 gap-2">
            <Link href="/store/productos">
              Ver todos los arreglos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
