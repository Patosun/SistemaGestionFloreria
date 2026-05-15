"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flower, MapPin, Palette, MessageCircle, ChevronRight, Check, Lightbulb } from 'lucide-react';

export default function RootPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Estado para el filtro del catálogo
  const [activeCategory, setActiveCategory] = useState("Todos");

  // Lista de categorías
  const categories = ["Todos", "Romance", "Cumpleaños", "Eventos", "Bodas"];

  // Nuestra "Base de Datos" temporal de productos
  const products = [
    { id: 1, name: "Susurros de Primavera", price: "245 BOB", image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=800&auto=format&fit=crop", category: "Romance", tag: "Más Vendido" },
    { id: 2, name: "Elegancia Imperial", price: "380 BOB", image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=800&auto=format&fit=crop", category: "Eventos", tag: "Nuevo" },
    { id: 3, name: "Romance en La Paz", price: "190 BOB", image: "https://images.unsplash.com/photo-1591880911020-d344b0b9213a?q=80&w=800&auto=format&fit=crop", category: "Romance", tag: "Exclusivo" },
    { id: 4, name: "Alegría Radiante", price: "150 BOB", image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=800&auto=format&fit=crop", category: "Cumpleaños", tag: "Popular" },
    { id: 5, name: "Promesa Eterna", price: "450 BOB", image: "https://images.unsplash.com/photo-1508611440040-620e7df663dd?q=80&w=800&auto=format&fit=crop", category: "Bodas", tag: "Premium" },
    { id: 6, name: "Dulce Atardecer", price: "210 BOB", image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=800&auto=format&fit=crop", category: "Cumpleaños", tag: "" },
  ];

  // Lógica de filtrado: Si es "Todos", muestra todo, si no, filtra por categoría
  const filteredProducts = activeCategory === "Todos" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  // Hook para detectar el scroll (Requirement 2: Smart Navbar)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDF3F6] font-sans selection:bg-[#E6A1B8] selection:text-[#93276F]">
      
      {/* --- NAVEGACIÓN INTELIGENTE (STICKY) */}
      <nav className={`fixed top-0 w-full z-50 p-6 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#FDF3F6]/95 backdrop-blur-sm shadow-md' 
          : 'bg-gradient-to-b from-black/50 to-transparent'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className={`transition-all duration-300 ${isScrolled ? 'brightness-100 invert-0' : 'brightness-0 invert'}`}>
            <Image 
              src="/assets/Logo.png" // Ajusta la ruta si es necesario
              alt="Aleslí Logo" 
              width={100} 
              height={33} 
              priority
            />
          </div>
          <div className={`hidden md:flex gap-8 text-sm tracking-widest uppercase font-medium transition-colors duration-300 ${
            isScrolled ? 'text-[#93276F]' : 'text-white/90'
          }`}>
            <Link href="#catalogo" className="hover:text-[#E6A1B8] transition-colors">Catálogo</Link>
            <Link href="#filosofia" className="hover:text-[#E6A1B8] transition-colors">Nosotros</Link>
            <Link href="#faq" className="hover:text-[#E6A1B8] transition-colors">Ayuda</Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION (OPTIMIZADO) --- */}
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

        {/* Contenido Principal */}
        <div className="relative z-10 text-center text-white px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 flex flex-col items-center">
          <p className="text-[#E6A1B8] text-xs md:text-sm tracking-[0.4em] uppercase mb-12 font-semibold">
            Boutique Floral de Autor en La Paz
          </p>
          
          {/* Espacio para el Logo (white for contrast) */}
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

          {/* Botón Explorar Colección convertido en Enlace Ancla */}
          <Link href="#catalogo" className="inline-block relative group overflow-hidden border border-white/50 px-12 py-4 text-xs uppercase tracking-[0.3em] font-medium hover:border-[#E6A1B8] transition-colors duration-500 backdrop-blur-sm bg-black/10">
            <span className="relative z-10 group-hover:text-[#93276F] transition-colors duration-500 font-bold">Explorar Colección</span>
            <div className="absolute inset-0 h-full w-0 bg-[#E6A1B8] transition-all duration-500 ease-out group-hover:w-full z-0"></div>
          </Link>
        </div>
      </main>

      {/* --- SECCIÓN DE FILOSOFÍA: NUESTRO PROCESO (NUEVA) --- */}
      <section id="filosofia" className="py-24 px-6 max-w-7xl mx-auto bg-white/50 rounded-xl mt-12 shadow-sm">
        <div className="text-center mb-16">
          <p className="text-muted-foreground tracking-widest uppercase text-xs">Aleslí • Experiencia</p>
          <h2 className="text-3xl md:text-5xl font-serif mb-4 text-[#93276F]">Nuestra Esencia Floral</h2>
          <div className="w-24 h-px bg-[#E6A1B8] mx-auto mb-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            {
              icon: <Flower size={32} className="text-white" />,
              title: "Selección Premium",
              text: "Flores frescas de máxima calidad, elegidas cada día de proveedores locales y los mejores mercados internacionales."
            },
            {
              icon: <Palette size={32} className="text-white" />,
              title: "Diseño de Autor",
              text: "Cada arreglo es único, creado con pasión y visión artística por nuestros floristas especializados en alta costura floral."
            },
            {
              icon: <MapPin size={32} className="text-white" />,
              title: "Entrega Cuidadosa",
              text: "Logística especializada en La Paz para que tus flores lleguen perfectas, frescas y en el momento indicado."
            }
          ].map((item, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-sm border border-[#E6A1B8]/10 hover:border-[#E6A1B8]/30 transition-all duration-300">
              <div className="bg-[#93276F] p-4 rounded-full inline-flex items-center justify-center mb-6 shadow-md shadow-[#93276F]/20">
                {item.icon}
              </div>
              <h3 className="text-xl font-serif text-[#93276F] mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECCIÓN DE CATÁLOGO DINÁMICO --- */}
      <section id="catalogo" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-muted-foreground tracking-widest uppercase text-xs">Descubre Aleslí</p>
          <h2 className="text-3xl md:text-5xl font-serif mb-4 text-[#93276F]">Catálogo Floral</h2>
          <div className="w-24 h-px bg-[#E6A1B8] mx-auto mb-6"></div>
        </div>

        {/* Botones de Subcatálogos (Filtros) */}
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

        {/* Grilla de Productos Filtrados con Animación */}
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
                {/* Contenedor de Imagen con Efecto */}
                <div className="relative aspect-[4/5] overflow-hidden mb-6 bg-[#DFD2E5] rounded-xl shadow-sm border border-[#E6A1B8]/10">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  {item.tag && (
                    <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-tighter font-semibold text-[#93276F] rounded-full shadow-sm">
                      {item.tag}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-[#93276F]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Información del Producto */}
                <div className="space-y-2 text-center">
                  <p className="text-[10px] tracking-widest uppercase text-[#E6A1B8] font-bold">{item.category}</p>
                  <h3 className="text-xl font-serif text-[#93276F] group-hover:text-[#E6A1B8] transition-colors duration-300">
                    {item.name}
                  </h3>
                  <p className="text-[#E6A1B8] font-medium tracking-wider">{item.price}</p>
                  <div className="w-0 h-px bg-[#E6A1B8] mx-auto group-hover:w-16 transition-all duration-500"></div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Botón de cargar más (Opcional visualmente) */}
        {activeCategory === "Todos" && (
          <div className="mt-20 text-center">
            <button className="border border-[#93276F] text-[#93276F] px-10 py-3 text-xs uppercase tracking-[0.3em] font-medium hover:bg-[#93276F] hover:text-white transition-all duration-300 rounded-md shadow-sm shadow-[#93276F]/10">
              Cargar Más Arreglos
            </button>
          </div>
        )}
      </section>

      {/* --- SECCIÓN DE TESTIMONIOS (ANIMADA) --- */}
      <motion.section 
        className="py-24 bg-[#DFD2E5] rounded-t-3xl mt-24"
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
              <div key={index} className="flex flex-col items-center bg-white/40 backdrop-blur-sm p-8 rounded-lg shadow-sm border border-white/50">
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
        {/* --- SECCIÓN DE UBICACIÓN (NUEVA) --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#DFD2E5]/40 to-[#FDF3F6] rounded-3xl p-12 md:p-16 shadow-sm border border-[#E6A1B8]/20 flex flex-col items-center text-center relative overflow-hidden">
          
          {/* Elementos decorativos de fondo */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#E6A1B8]/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#93276F]/10 rounded-full blur-3xl"></div>

          {/* Contenido principal */}
          <div className="relative z-10">
            <div className="bg-white p-4 rounded-full shadow-md inline-flex items-center justify-center mb-6 text-[#93276F]">
              <MapPin size={36} strokeWidth={1.5} />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-serif mb-4 text-[#93276F]">Visita Nuestra Boutique</h2>
            
            <p className="text-[#93276F]/80 mb-10 max-w-xl mx-auto leading-relaxed">
              Ven a conocer nuestra colección en persona, déjate envolver por el aroma de las flores más frescas de La Paz y recibe asesoramiento de nuestros expertos floristas.
            </p>
            
            <a 
              href="https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.bing.com%2Fmaps%2Fdefault.aspx%3Fv%3D2%26pc%3DFACEBK%26mid%3D8100%26where1%3DCalle%2520Campos%2520No.%2520248%252C%2520entre%2520Av.%25206%2520de%2520Agosto%2520y%2520Av.%2520Arce%252C%2520La%2520Paz%252C%2520Bolivia%26FORM%3DFBKPL1%26mkt%3Des-MX%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExTGRvVHg0MUJsclBHdjJDTnNydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR4ZIcPKFZ2SOoSotvOSo7AUv-BadyXma31nmZ8EX04h6gK5Jm7O-Wdq_thxcA_aem_s0YH5h2_p5tCLR9BW-1Wjg&h=AUDz4ljVcrMgEKbxYKh0KgmfpeHNo9H8DgZf7SouK2k1yt0-bRCARlPvWdLbDMPFs3x5i8GA_Wst-WTlHK6j0A2kWHxpR3z2PqkZVYzf3A7hmIph7uv-zLsxcRkvMgwuD-_W" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#93276F] text-white px-10 py-4 rounded-full text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#7a1f5c] hover:scale-105 transition-all duration-300 shadow-lg shadow-[#93276F]/30 mb-6"
            >
              <MapPin size={18} />
                Ver en Google Maps
                
              {/* Correo agregado aquí */}
            <p className="text-sm text-[#93276F]/70 font-medium">
              Consultas corporativas o especiales: <a href="mailto:floreriaalesli@gmail.com" className="font-bold hover:text-[#E6A1B8] transition-colors border-b border-[#93276F]/20 hover:border-[#E6A1B8]">floreriaalesli@gmail.com</a>
                </p>    
            </a>
          </div>
        </div>
      </section>
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
                <li><Link href="#catalogo" className="hover:text-white transition-colors">Todas las Flores</Link></li>
                <li><Link href="#catalogo" className="hover:text-white transition-colors">Bodas</Link></li>
                <li><Link href="#catalogo" className="hover:text-white transition-colors">Eventos</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cuidado Floral</Link></li>
              </ul>
            </div>

            {/* Columna 3: Soporte */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-6 text-white">Atención</h4>
              <ul className="space-y-4 text-sm text-[#FDF3F6]">
                <li><Link href="#" className="hover:text-white transition-colors">Envíos en La Paz</Link></li>
                <li><Link href="#faq" className="hover:text-white transition-colors">Preguntas Frecuentes</Link></li>
                <li>
                  <a href="mailto:floreriaalesli@gmail.com" className="hover:text-white transition-colors">
                    floreriaalesli@gmail.com
                  </a>
                </li>
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
              <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
              <Link href="/terminos" className="hover:text-white transition-colors">Términos</Link>
              
              {/* Enlaces Reales a Redes Sociales */}
              <a 
                href="https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.instagram.com%2Ffloreria_alesli%3Ffbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExRWVKaWFSM0JUQU1IWlY4U3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR4zodzip1GrszeFRSuRq-Bs2EMEHhjdpffonQJBGufxa1eMsF2B7MB_96j6qg_aem_LQIE1JMMs4IrnKH4dPsbWA&h=AUAA3JLsnvPmJzq7EBmdWnhbXljoTR9W2sS4fv9qOzVQXtKX8aeNXjlJP4MEbl9GuZQcrnowC2HcozuNPFZ2CQSHx-SLcne-QjSKB5GmcLV3UVYpi4gXv5OXyB4ft4e5BdeVDMUcZAfUmahmuwhT" 
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

              {/* Botón Oculto para Personal */}
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

      {/* --- BOTÓN FLOTANTE DE WHATSAPP (Centrado Perfecto y Link Corregido) --- */}
      <a 
        href="https://wa.me/59177793200" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#93276F] h-[60px] rounded-full shadow-lg hover:scale-105 transition-all duration-300 group flex items-center shadow-[#93276F]/30"
        title="Contáctanos por WhatsApp"
      >
        {/* Contenedor del ícono (Siempre 60x60 exactos para centrado perfecto) */}
        <div className="w-[60px] h-[60px] flex items-center justify-center shrink-0">
          <MessageCircle size={28} className="text-white group-hover:rotate-12 transition-transform duration-300" />
        </div>
        
        {/* Contenedor del texto oculto */}
        <span className="max-w-0 overflow-hidden text-white group-hover:max-w-[150px] group-hover:pr-6 transition-all duration-500 text-sm font-medium tracking-wide whitespace-nowrap">
          Aleslí Contigo
        </span>
      </a>

      {/* Pulse effect style (Requirement 1) */}
      <style jsx global>{`
        @keyframes pulse-ALESLI {
          0%, 100% {
            opacity: 0.1;
            transform: scale(1.05);
          }
          50% {
            opacity: 0;
            transform: scale(1.2);
          }
        }
        .pulse-ALESLI::before {
          content: '';
          position: absolute;
          inset: 0;
          background-color: #93276F;
          border-radius: 9999px;
          animation: pulse-ALESLI 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          opacity: 0.1;
          z-index: -1;
        }
      `}</style>
      <div className="fixed bottom-6 right-6 z-40 p-4 rounded-full w-[60px] h-[60px] pulse-ALESLI pointer-events-none"></div>

    </div>
  );
}