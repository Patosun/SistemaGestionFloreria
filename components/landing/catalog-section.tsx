"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type LandingProduct = {
  id: string; // slug
  name: string;
  price: string;
  image: string | null;
  category: string;
  tag: string;
};

export function LandingCatalogSection() {
  const [products, setProducts] = useState<LandingProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(["Todos"]);
  const [activeCategory, setActiveCategory] = useState("Todos");

  useEffect(() => {
    fetch("/api/v1/products?isPublic=true&limit=6&sort=name&dir=asc")
      .then((r) => r.json())
      .then((json) => {
        if (!json.data) return;
        const mapped: LandingProduct[] = json.data.map(
          (p: {
            slug: string;
            name: string;
            variants: { price: string }[];
            images: string[];
            category: { name: string } | null;
            tags: string[];
          }) => ({
            id: p.slug,
            name: p.name,
            price: p.variants[0]
              ? `${Number(p.variants[0].price).toFixed(0)} BOB`
              : "Consultar",
            image: p.images[0] ?? null,
            category: p.category?.name ?? "General",
            tag: p.tags[0] ?? "",
          })
        );
        setProducts(mapped);
        const cats = Array.from(new Set(mapped.map((p) => p.category))).sort();
        setCategories(["Todos", ...cats]);
      })
      .catch(() => {});
  }, []);

  const filteredProducts =
    activeCategory === "Todos"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <section id="catalogo" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-muted-foreground tracking-widest uppercase text-xs">Descubre Aleslí</p>
        <h2 className="text-3xl md:text-5xl font-serif mb-4 text-[#93276F]">Catálogo Floral</h2>
        <div className="w-24 h-px bg-[#E6A1B8] mx-auto mb-6"></div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap justify-center gap-3 mb-16">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded-full text-xs uppercase tracking-widest font-semibold transition-all duration-300 border ${
              activeCategory === cat
                ? "bg-[#93276F] text-white border-[#93276F] shadow-md"
                : "bg-transparent text-[#93276F] border-[#E6A1B8]/50 hover:border-[#93276F]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grilla */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 min-h-[500px]">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              key={item.id}
              className="group cursor-pointer"
            >
              <Link href={`/catalogo/${item.id}`} className="block">
                <div className="relative aspect-[4/5] overflow-hidden mb-6 bg-[#DFD2E5] rounded-xl shadow-sm border border-[#E6A1B8]/10">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[#93276F]/20 text-6xl font-serif">✿</span>
                    </div>
                  )}
                  {item.tag && (
                    <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-tighter font-semibold text-[#93276F] rounded-full shadow-sm z-10">
                      {item.tag}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-[#93276F]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-0">
                    <span className="bg-white text-[#93276F] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">
                      Ver Detalles
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <p className="text-[10px] tracking-widest uppercase text-[#E6A1B8] font-bold">{item.category}</p>
                  <h3 className="text-xl font-serif text-[#93276F] group-hover:text-[#E6A1B8] transition-colors duration-300">
                    {item.name}
                  </h3>
                  <p className="text-[#E6A1B8] font-medium tracking-wider">{item.price}</p>
                  <div className="w-0 h-px bg-[#E6A1B8] mx-auto group-hover:w-16 transition-all duration-500"></div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Botón ver más */}
      <div className="mt-20 text-center">
        <Link
          href="/catalogo"
          className="inline-block border border-[#93276F] text-[#93276F] px-10 py-3 text-xs uppercase tracking-[0.3em] font-medium hover:bg-[#93276F] hover:text-white transition-all duration-300 rounded-md shadow-sm shadow-[#93276F]/10"
        >
          Cargar Más Arreglos
        </Link>
      </div>
    </section>
  );
}
