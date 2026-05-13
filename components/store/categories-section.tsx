"use client"

import { motion, type Variants } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  _count?: { products: number }
}

// Gradient palettes per category index
const GRADIENTS = [
  "from-rose-100 to-rose-200",
  "from-pink-100 to-fuchsia-200",
  "from-violet-100 to-purple-200",
  "from-orange-100 to-amber-200",
  "from-emerald-100 to-teal-200",
  "from-sky-100 to-blue-200",
  "from-lime-100 to-green-200",
  "from-red-100 to-rose-300",
]

const EMOJIS = ["💐", "🌹", "🌷", "🌸", "🌺", "🌻", "🌼", "🪷"]

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: "easeOut" },
  },
}

const PLACEHOLDER_CATEGORIES: Category[] = [
  { id: "1", name: "Rosas", slug: "rosas", description: "Clásicas y eternas", imageUrl: null },
  { id: "2", name: "Arreglos", slug: "arreglos", description: "Creatividad floral", imageUrl: null },
  { id: "3", name: "Bouquets", slug: "bouquets", description: "Para bodas y eventos", imageUrl: null },
  { id: "4", name: "Orquídeas", slug: "orquideas", description: "Elegancia pura", imageUrl: null },
  { id: "5", name: "Flores de temporada", slug: "temporada", description: "Lo mejor de cada época", imageUrl: null },
  { id: "6", name: "Plantas", slug: "plantas", description: "Belleza duradera", imageUrl: null },
]

export function CategoriesSection({ categories }: { categories?: Category[] }) {
  const items = (categories && categories.length > 0) ? categories : PLACEHOLDER_CATEGORIES

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <span className="text-sm font-medium text-primary uppercase tracking-widest">Colección</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mt-1">
              Explora por categoría
            </h2>
          </div>
          <Link
            href="/store/productos"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
          >
            Ver todo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {items.slice(0, 6).map((cat, i) => (
            <motion.div key={cat.id} variants={cardVariants}>
              <Link href={`/store/categorias/${cat.slug}`} className="group block">
                <div
                  className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} aspect-square flex flex-col items-center justify-center gap-2 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1`}
                >
                  <span className="text-4xl sm:text-5xl drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
                    {EMOJIS[i % EMOJIS.length]}
                  </span>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-2xl" />
                </div>
                <div className="mt-2.5 px-0.5">
                  <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                    {cat.name}
                  </p>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{cat.description}</p>
                  )}
                  {cat._count && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      {cat._count.products} productos
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
