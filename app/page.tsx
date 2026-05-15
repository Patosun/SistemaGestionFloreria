"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RootPage() {
  return (
    <div className="min-h-screen bg-[#FDF3F6] font-sans selection:bg-[#E6A1B8] selection:text-[#93276F]">
      
      {/* --- NAVEGACIÓN --- */}
      <nav className="absolute top-0 w-full z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-white animate-in fade-in zoom-in duration-1000">
          <Image 
            src="/assets/Logo.png" 
            alt="Aleslí Logo" 
            width={120} 
            height={40} 
            className="brightness-0 invert" 
          />
        </div>

        <div className="hidden md:flex gap-8 text-white/90 text-sm tracking-widest uppercase font-medium">
          <Link href="#catalogo" className="hover:text-[#E6A1B8] transition-colors">
            Catálogo
          </Link>
          <Link href="#" className="hover:text-[#E6A1B8] transition-colors">
            Nosotros
          </Link>
          <Link href="#" className="hover:text-[#E6A1B8] transition-colors">
            Contacto
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=2000&auto=format&fit=crop" 
            alt="Fondo floral de Aleslí"
            className="w-full h-full object-cover brightness-75"
          />

          <div className="absolute inset-0 bg-[#93276F]/30 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 text-center text-white px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 flex flex-col items-center">
          <p className="text-[#E6A1B8] text-xs md:text-sm tracking-[0.4em] uppercase mb-12 font-semibold">
            Boutique Floral en La Paz
          </p>

          <div className="mb-14 transition-transform duration-1000 hover:scale-105">
            <Image 
              src="/assets/Logo.png"
              alt="Aleslí Logo" 
              width={500} 
              height={180} 
              className="brightness-0 invert drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" 
              priority
            />
          </div>

          <button className="relative group overflow-hidden border border-white/50 px-12 py-4 text-xs uppercase tracking-[0.3em] font-medium hover:border-[#E6A1B8] transition-colors duration-500 backdrop-blur-sm bg-black/10">
            <span className="relative z-10 group-hover:text-[#93276F] transition-colors duration-500 font-bold">
              Explorar Colección
            </span>

            <div className="absolute inset-0 h-full w-0 bg-[#E6A1B8] transition-all duration-500 ease-out group-hover:w-full z-0"></div>
          </button>
        </div>
      </main>

      {/* --- SECCIÓN DE COLECCIONES DESTACADAS --- */}
      <motion.section 
        id="catalogo" 
        className="py-24 px-6 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif mb-4 text-[#93276F]">
            Colecciones de Temporada
          </h2>

          <div className="w-24 h-px bg-[#E6A1B8] mx-auto mb-6"></div>

          <p className="text-muted-foreground tracking-widest uppercase text-xs">
            Arreglos exclusivos diseñados a mano
          </p>
        </div>
      </motion.section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#93276F] text-[#FDF3F6] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="pt-10 border-t border-[#FDF3F6]/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] tracking-[0.2em] uppercase text-[#FDF3F6]/40">
            <p>© 2026 ALESLÍ DISEÑO FLORAL. TODOS LOS DERECHOS RESERVADOS.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}