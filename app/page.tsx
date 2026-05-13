import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Menu, Search } from "lucide-react";

export default function LandingPage() {
  return (
    // Fondo claro y elegante para resaltar los colores de las flores
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A3626] font-sans overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <header className="w-full px-6 py-4 flex items-center justify-between bg-[#FDFBF7]/80 backdrop-blur-md fixed top-0 z-50 border-b border-[#E8E1D7]">
        <div className="flex items-center gap-4">
          <button className="md:hidden">
            <Menu className="w-6 h-6 text-[#1A3626]" />
          </button>
          {/* Oculto en móviles, visible en escritorio */}
          <nav className="hidden md:flex gap-8 text-sm tracking-widest uppercase font-medium">
            <Link href="#colecciones" className="hover:text-[#C5A880] transition-colors">Colecciones</Link>
            <Link href="#ocasiones" className="hover:text-[#C5A880] transition-colors">Ocasiones</Link>
            <Link href="#suscripciones" className="hover:text-[#C5A880] transition-colors">Suscripciones</Link>
          </nav>
        </div>

        {/* LOGO CENTRAL */}
        <div className="flex-shrink-0 animate-in fade-in zoom-in duration-700">
          <Link href="/">
            <Image 
              src="/assets/Logo.png" 
              alt="Aleslí Floral" 
              width={140} 
              height={50} 
              className="object-contain"
              priority
            />
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <button className="hidden md:block hover:text-[#C5A880] transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <Link href="/login" className="hidden md:block text-sm tracking-widest uppercase font-medium hover:text-[#C5A880] transition-colors">
            Ingresar
          </Link>
          <button className="relative hover:text-[#C5A880] transition-colors">
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-[#1A3626] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              0
            </span>
          </button>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <main className="relative w-full h-screen flex items-center justify-center pt-20">
        {/* Imagen de fondo (puedes reemplazar el src por una foto real de Aleslí luego) */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-black/20 z-10"></div> {/* Overlay oscuro sutil */}
          <img 
            src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=2000&auto=format&fit=crop" 
            alt="Arreglo floral elegante" 
            className="w-full h-full object-cover object-center"
          />
          {/* --- SECCIÓN DE COLECCIONES DESTACADAS --- */}
      <section id="catalogo" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h2 className="text-3xl md:text-5xl font-serif mb-4 text-[#1A3626]">Colecciones de Temporada</h2>
          <div className="w-24 h-px bg-[#C5A880] mx-auto mb-6"></div>
          <p className="text-muted-foreground tracking-widest uppercase text-xs">Arreglos exclusivos diseñados a mano</p>
        {/* --- SECCIÓN DE TESTIMONIOS (Social Proof) --- */}
      <section className="py-24 bg-[#F8F5F0]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-serif mb-16 text-[#1A3626]">Experiencias Aleslí</h2>
          
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
                    <span key={i} className="text-[#C5A880] text-xs">★</span>
                  ))}
                </div>
                <p className="text-[#1A3626]/80 italic mb-6 leading-relaxed">"{review.text}"</p>
                <p className="text-xs tracking-[0.2em] uppercase font-semibold text-[#1A3626]">{review.name}</p>
                <p className="text-[10px] tracking-widest uppercase text-[#C5A880]">{review.city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER (Pie de Página) --- */}
      <footer className="bg-[#1A3626] text-[#FDFBF7] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            
            {/* Columna 1: Logo y Eslogan */}
            <div className="space-y-6">
              <Image 
                src="/assets/Logo.png" 
                alt="Aleslí Logo" 
                width={120} 
                height={40} 
                className="brightness-0 invert" // Hace el logo blanco para el fondo oscuro
              />
              <p className="text-sm text-[#FDFBF7]/60 leading-relaxed">
                Elevando los momentos más importantes de la vida a través del diseño floral de autor en Bolivia.
              </p>
            </div>

            {/* Columna 2: Navegación */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-6 text-[#C5A880]">Explorar</h4>
              <ul className="space-y-4 text-sm text-[#FDFBF7]/80">
                <li><Link href="#" className="hover:text-white transition-colors">Todas las Flores</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Suscripciones</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Eventos & Bodas</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cuidado Floral</Link></li>
              </ul>
            </div>

            {/* Columna 3: Soporte */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-6 text-[#C5A880]">Atención</h4>
              <ul className="space-y-4 text-sm text-[#FDFBF7]/80">
                <li><Link href="#" className="hover:text-white transition-colors">Estado de Pedido</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Envíos en La Paz</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Preguntas Frecuentes</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contacto</Link></li>
              </ul>
            </div>

            {/* Columna 4: Newsletter */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-6 text-[#C5A880]">Newsletter</h4>
              <p className="text-sm text-[#FDFBF7]/60 mb-4">Recibe inspiración floral y ofertas exclusivas.</p>
              <div className="flex border-b border-[#FDFBF7]/30 pb-2">
                <input 
                  type="email" 
                  placeholder="Tu email" 
                  className="bg-transparent border-none text-sm w-full focus:outline-none placeholder:text-[#FDFBF7]/30"
                />
                <button className="text-xs uppercase tracking-widest hover:text-[#C5A880] transition-colors">Unirse</button>
              </div>
            </div>
          </div>

          {/* Línea final */}
          <div className="pt-10 border-t border-[#FDFBF7]/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] tracking-[0.2em] uppercase text-[#FDFBF7]/40">
            <p>© 2026 Aleslí Diseño Floral. Todos los derechos reservados.</p>
            <div className="flex gap-8">
              <Link href="#" className="hover:text-white transition-colors">Privacidad</Link>
              <Link href="#" className="hover:text-white transition-colors">Términos</Link>
              <Link href="#" className="hover:text-white transition-colors">Instagram</Link>
              <Link href="#" className="hover:text-white transition-colors">Facebook</Link>
            </div>
          </div>
        </div>
      </footer>
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
                {/* Etiqueta flotante */}
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-tighter font-semibold text-[#1A3626]">
                  {item.tag}
                </span>
                {/* Overlay que aparece al hacer hover */}
                <div className="absolute inset-0 bg-[#1A3626]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Información del Producto */}
              <div className="space-y-1 text-center">
                <h3 className="text-xl font-serif text-[#1A3626] group-hover:text-[#C5A880] transition-colors duration-300">
                  {item.name}
                </h3>
                <p className="text-[#C5A880] font-medium tracking-wider">{item.price}</p>
                
                {/* Línea decorativa que crece en hover */}
                <div className="w-0 h-px bg-[#C5A880] mx-auto group-hover:w-16 transition-all duration-500"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón Ver Todo */}
        <div className="mt-20 text-center">
          <button className="border border-[#1A3626] px-10 py-3 text-xs uppercase tracking-[0.3em] font-medium hover:bg-[#1A3626] hover:text-white transition-all duration-300">
            Explorar Catálogo Completo
          </button>
        </div>
      </section>
        </div>

        {/* Contenido del Hero */}
        <div className="relative z-20 text-center px-4 flex flex-col items-center animate-in slide-in-from-bottom-8 fade-in duration-1000">
          <p className="text-white text-sm md:text-base tracking-[0.3em] uppercase mb-4 font-light drop-shadow-md">
            Naturalmente para ti
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl text-white font-serif mb-8 drop-shadow-lg max-w-4xl leading-tight">
            Diseño Floral de Alta Costura
          </h1>
          <Link 
            href="#catalogo"
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-[#FDFBF7] text-[#1A3626] uppercase tracking-widest text-sm font-medium overflow-hidden transition-all duration-300 hover:bg-[#1A3626] hover:text-[#FDFBF7]"
          >
            <span className="relative z-10">Comprar Ahora</span>
            {/* Animación del botón al pasar el mouse */}
            <div className="absolute inset-0 bg-[#C5A880] transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out -z-0"></div>
          </Link>
        </div>
      </main>

    </div>
  );
}