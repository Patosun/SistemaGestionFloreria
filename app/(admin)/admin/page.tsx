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