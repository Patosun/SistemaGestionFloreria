"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Search, ShoppingBag, Filter, MessageCircle } from "lucide-react";

// --- BASE DE DATOS EXTENDIDA DE ALESLÍ ---
const fullInventory = [
  // ROMANCE
  { id: 1, name: "Modelo A-25: Corazón de Girasoles", price: "160 BOB", image: "https://images.unsplash.com/photo-1591880911020-d344b0b9213a?q=80&w=800&auto=format&fit=crop", category: "Romance", description: "Girasoles y rosas amarillas en marco de corazón rojo." },
  { id: 2, name: "Modelo A-28: Pasión Premium", price: "180 BOB", image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=800&auto=format&fit=crop", category: "Romance", description: "Rosas rojas premium con follaje de estación y peluche." },
  { id: 3, name: "Eterno Amor", price: "280 BOB", image: "https://images.unsplash.com/photo-1550341334-75019053359d?q=80&w=800&auto=format&fit=crop", category: "Romance", description: "Caja de rosas rojas velvet de tallo largo." },
  
  // CUMPLEAÑOS
  { id: 4, name: "Alegría Radiante", price: "150 BOB", image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=800&auto=format&fit=crop", category: "Cumpleaños", description: "Combinación vibrante de estación para celebrar la vida." },
  { id: 5, name: "Deseos de Sol", price: "120 BOB", image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=800&auto=format&fit=crop", category: "Cumpleaños", description: "Girasoles y rosas para iluminar un día especial." },
  { id: 6, name: "Fiesta Floral", price: "200 BOB", image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=800&auto=format&fit=crop", category: "Cumpleaños", description: "Mix de flores exóticas y globos personalizados." },

  // BODAS
  { id: 7, name: "Ramo de Novia: Alba", price: "500 BOB", image: "https://images.unsplash.com/photo-1508611440040-620e7df663dd?q=80&w=800&auto=format&fit=crop", category: "Bodas", description: "Ramo de novia en tonos blancos y pasteles con cintas de seda." },
  { id: 8, name: "Centro de Mesa: Gala", price: "350 BOB", image: "https://images.unsplash.com/photo-1464306311696-072e8171626a?q=80&w=800&auto=format&fit=crop", category: "Bodas", description: "Arreglo bajo para mesas imperiales con flores de temporada." },

  // EVENTOS / CORPORATIVO
  { id: 9, name: "Elegancia Corporativa", price: "250 BOB", image: "https://images.unsplash.com/photo-1494959324944-3e9a232b10ac?q=80&w=800&auto=format&fit=crop", category: "Eventos", description: "Arreglos sobrios para recepciones y eventos de empresa." }
];

export default function FullCatalogo() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  const categories = ["Todos", "Romance", "Cumpleaños", "Bodas", "Eventos"];

  // Lógica de filtrado doble (Categoría + Búsqueda)
  const filteredProducts = fullInventory.filter((product) => {
    const matchesCategory = activeCategory === "Todos" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDF3F6] font-sans text-[#93276F] selection:bg-[#E6A1B8] selection:text-[#93276F]">
      
      {/* --- NAVEGACIÓN SUPERIOR --- */}
      <nav className="w-full p-6 bg-white/70 backdrop-blur-md shadow-sm border-b border-[#E6A1B8]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-[#93276F] hover:text-[#E6A1B8] transition-colors font-medium text-xs tracking-widest uppercase">
            <ChevronLeft size={18} /> Volver a Inicio
          </Link>
          <span className="font-serif text-2xl font-bold tracking-[0.2em] uppercase">Aleslí</span>
          <div className="flex gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#93276F]/40" size={16} />
              <input 
                type="text" 
                placeholder="Buscar arreglo..."
                className="bg-white/50 border border-[#E6A1B8]/30 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#93276F] transition-all w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* --- CABECERA DE SECCIÓN --- */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-serif mb-4">Colección Completa</h1>
          <div className="w-32 h-px bg-[#E6A1B8] mx-auto mb-8"></div>
          
          {/* Filtros de Subcategorías */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all duration-300 border ${
                  activeCategory === cat
                    ? "bg-[#93276F] text-white border-[#93276F] shadow-lg"
                    : "bg-white text-[#93276F] border-[#E6A1B8]/50 hover:border-[#93276F]"
                }`}
              >
                {cat}
              </button>
            ))} 
          </div>
        </div>

        {/* --- GRILLA DE PRODUCTOS --- */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-[#E6A1B8]/10"
              >
                {/* Imagen del Producto ahora es un LINK a la página dinámica */}
                <Link href={`/catalogo/${product.id}`} className="block relative aspect-square overflow-hidden bg-[#DFD2E5] cursor-pointer">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Etiqueta flotante de "Ver detalles" */}
                  <div className="absolute inset-0 bg-[#93276F]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-white text-[#93276F] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform">
                      Ver Detalles
                    </span>
                  </div>
                </Link>

                {/* Detalles */}
                <div className="p-8 text-center">
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#E6A1B8] mb-2 block">
                    {product.category}
                  </span>
                  <h3 className="text-xl font-serif mb-3 group-hover:text-[#E6A1B8] transition-colors">{product.name}</h3>
                  <p className="text-xs text-[#93276F]/60 mb-6 leading-relaxed px-4">
                    {product.description}
                  </p>
                  <div className="flex flex-col items-center gap-4">
                    <span className="text-2xl font-bold text-[#93276F]">{product.price}</span>
                    <div className="w-12 h-px bg-[#E6A1B8] group-hover:w-24 transition-all duration-500"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* --- MENSAJE SI NO HAY RESULTADOS --- */}
        {filteredProducts.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg italic opacity-50">No encontramos arreglos que coincidan con tu búsqueda...</p>
            <button 
              onClick={() => {setSearchTerm(""); setActiveCategory("Todos")}}
              className="mt-6 text-[#93276F] font-bold underline underline-offset-4"
            >
              Ver todo el catálogo
            </button>
          </div>
        )}
      </main>

      {/* --- BOTÓN FLOTANTE DE REGRESO --- */}
      <footer className="py-10 text-center text-[10px] tracking-[0.2em] uppercase opacity-40">
        © 2026 ALESLÍ DISEÑO FLORAL • LA PAZ, BOLIVIA
      </footer>
    </div>
  );
}