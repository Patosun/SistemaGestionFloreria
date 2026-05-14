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
          <Link href="#catalogo" className="hover:text-[#E6A1B8] transition-colors">Catálogo</Link>
          <Link href="#" className="hover:text-[#E6A1B8] transition-colors">Nosotros</Link>
          <Link href="#" className="hover:text-[#E6A1B8] transition-colors">Contacto</Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Imagen de Fondo (Rose theme based on palette) */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=2000&auto=format&fit=crop" 
            alt="Fondo floral de Aleslí"
            className="w-full h-full object-cover brightness-75"
          />
          {/* Softer, Brand-colored overlay based on new palette */}
          <div className="absolute inset-0 bg-[#93276F]/30 mix-blend-multiply"></div>
        </div>

        {/* Contenido Principal con Logo Oficial y Títulos */}
        <div className="relative z-10 text-center text-white px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 flex flex-col items-center">
          <p className="text-[#E6A1B8] text-xs md:text-sm tracking-[0.4em] uppercase mb-12 font-semibold">
            Boutique Floral en La Paz
          </p>
          
          {/* Espacio para el Logo (white for contrast) */}
          <div className="mb-14 transition-transform duration-1000 hover:scale-105">
            <Image 
              src="/assets/Logo.png" // O /Logo.png si está directo en public
              alt="Aleslí Logo" 
              width={500} 
              height={180} 
              className="brightness-0 invert drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" 
              priority
            />
          </div>

          <button className="relative group overflow-hidden border border-white/50 px-12 py-4 text-xs uppercase tracking-[0.3em] font-medium hover:border-[#E6A1B8] transition-colors duration-500 backdrop-blur-sm bg-black/10">
            <span className="relative z-10 group-hover:text-[#93276F] transition-colors duration-500 font-bold">Explorar Colección</span>
            <div className="absolute inset-0 h-full w-0 bg-[#E6A1B8] transition-all duration-500 ease-out group-hover:w-full z-0"></div>
          </button>
        </div>
      </main>

      {/* --- SECCIÓN DE COLECCIONES DESTACADAS (ANIMADA) --- */}
      <motion.section 
        id="catalogo" 
        className="py-24 px-6 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif mb-4 text-[#93276F]">Colecciones de Temporada</h2>
          <div className="w-24 h-px bg-[#E6A1B8] mx-auto mb-6"></div>
          <p className="text-muted-foreground tracking-widest uppercase text-xs">Arreglos exclusivos diseñados a mano</p>
        </div>

        {/* Grilla de Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[
            {
              id: 1,
              name: "Susurros de Primavera",
              price: "245 BOB",
              image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=800&auto=format&fit=crop",
              tag: "Más Vendido"
            },
            {
              id: 2,
              name: "Elegancia Imperial",
              price: "380 BOB",
              image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=800&auto=format&fit=crop",
              tag: "Nuevo"
            },
            {
              id: 3,
              name: "Romance en la Paz",
              price: "190 BOB",
              image: "https://images.unsplash.com/photo-1591880911020-d344b0b9213a?q=80&w=800&auto=format&fit=crop",
              tag: "Exclusivo"
            }
          ].map((item) => (
            <div key={item.id} className="group cursor-pointer">
              {/* Contenedor de Imagen con Efecto */}
              <div className="relative aspect-[4/5] overflow-hidden mb-6 bg-[#E8E1D7]">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-tighter font-semibold text-[#93276F]">
                  {item.tag}
                </span>
                <div className="absolute inset-0 bg-[#93276F]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Información del Producto */}
              <div className="space-y-1 text-center">
                <h3 className="text-xl font-serif text-[#93276F] group-hover:text-[#E6A1B8] transition-colors duration-300">
                  {item.name}
                </h3>
                <p className="text-[#E6A1B8] font-medium tracking-wider">{item.price}</p>
                <div className="w-0 h-px bg-[#E6A1B8] mx-auto group-hover:w-16 transition-all duration-500"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <button className="border border-[#93276F] text-[#93276F] px-10 py-3 text-xs uppercase tracking-[0.3em] font-medium hover:bg-[#93276F] hover:text-white transition-all duration-300">
            Explorar Catálogo Completo
          </button>
        </div>
      </motion.section>

      {/* --- SECCIÓN DE TESTIMONIOS (ANIMADA) --- */}
      <motion.section 
        className="py-24 bg-[#DFD2E5]"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      >
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-serif mb-16 text-[#93276F]">Experiencias Aleslí</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                name: "Valeria Mendoza",
                city: "La Paz",
                text: "Los arreglos son verdaderas obras de arte. Compré uno para el aniversario de mis padres y superó todas las expectativas.",
              },
              {
                name: "Ricardo Arce",
                city: "Zona Sur",
                text: "La frescura de las flores es increíble. Se nota el cuidado en el método de selección. La mejor florería de la ciudad.",
              },
              {
                name: "Claudia Rojas",
                city: "Sopocachi",
                text: "El proceso de compra fue súper fluido. Me encanta la elegancia que transmiten en cada detalle del empaque.",
              }
            ].map((review, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#E6A1B8] text-xs">★</span>
                  ))}
                </div>
                <p className="text-[#93276F]/80 italic mb-6 leading-relaxed">"{review.text}"</p>
                <p className="text-xs tracking-[0.2em] uppercase font-semibold text-[#93276F]">{review.name}</p>
                <p className="text-[10px] tracking-widest uppercase text-[#E6A1B8]">{review.city}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#93276F] text-[#FDF3F6] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            
            {/* Columna 1: Logo */}
            <div className="space-y-6">
              <Image 
                src="/assets/Logo.png" 
                alt="Aleslí Logo" 
                width={120} 
                height={40} 
                className="brightness-0 invert"
              />
              <p className="text-sm text-[#FDF3F6]/60 leading-relaxed">
                Elevando los momentos más importantes de la vida a través del diseño floral de autor en Bolivia.
              </p>
            </div>

            {/* Columna 2: Navegación */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-6 text-[#FDF3F6]">Explorar</h4>
              <ul className="space-y-4 text-sm text-[#FDF3F6]/80">
                <li><Link href="#" className="hover:text-white transition-colors">Todas las Flores</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Suscripciones</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Eventos & Bodas</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cuidado Floral</Link></li>
              </ul>
            </div>

            {/* Columna 3: Soporte */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-6 text-[#FDF3F6]">Atención</h4>
              <ul className="space-y-4 text-sm text-[#FDF3F6]/80">
                <li><Link href="#" className="hover:text-white transition-colors">Estado de Pedido</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Envíos en La Paz</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Preguntas Frecuentes</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contacto</Link></li>
              </ul>
            </div>

            {/* Columna 4: Newsletter */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-6 text-[#FDF3F6]">Newsletter</h4>
              <p className="text-sm text-[#FDF3F6]/60 mb-4">Recibe inspiración floral y ofertas exclusivas.</p>
              <div className="flex border-b border-[#FDF3F6]/30 pb-2">
                <input 
                  type="email" 
                  placeholder="Tu email" 
                  className="bg-transparent border-none text-sm w-full focus:outline-none placeholder:text-[#FDF3F6]/30"
                />
                <button className="text-xs uppercase tracking-widest hover:text-[#E6A1B8] transition-colors">Unirse</button>
              </div>
            </div>
          </div>

          {/* Línea final de Copyright, Redes Sociales y Botón Oculto */}
          <div className="pt-10 border-t border-[#FDF3F6]/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] tracking-[0.2em] uppercase text-[#FDF3F6]/40">
            <p>© 2026 ALESLÍ DISEÑO FLORAL. TODOS LOS DERECHOS RESERVADOS.</p>
            
            <div className="flex flex-wrap justify-center gap-8 items-center">
              <Link href="#" className="hover:text-white transition-colors">Privacidad</Link>
              <Link href="#" className="hover:text-white transition-colors">Términos</Link>
              
              {/* Enlaces Reales a Redes Sociales (Abre en pestaña nueva) */}
              <a 
                href="https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.instagram.com%2Ffloreria_alesli%3Ffbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExNEtJOWw5ZTJCbElXaFNTSHNydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR4_QW9pyG5pN_5gd7Jm6tNDOyjRP30sBYnoME6dSkKD1LWm2aLiDimdMcI2Ig_aem_6RB9bey3i7zdWCOC8Mx7mw&h=AUDBzoeHz2XKhDI01fZy42a-Q_DDrGFiFV0O7Lz3SBcuBnvFWydDJmoRHPK6iLt5IjIxLnCayJ2rf6GrQRJxzoe3jXFItNN9ztGmGXlSAi5iIckD6CFjgoA6zotPIhcsvLva" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors"
              >
                Instagram
              </a>
              <a 
                href="https://www.facebook.com/AlesliNaturalmenteParaTi?locale=es_LA" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors"
              >
                Facebook
              </a>

              {/* Botón Oculto para Personal (Easter Egg) */}
              <Link 
                href="/admin" 
                className="opacity-0 hover:opacity-100 transition-opacity duration-500 text-[#E6A1B8] font-bold"
                title="Portal Administrativo"
              >
                ADMIN
              </Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}