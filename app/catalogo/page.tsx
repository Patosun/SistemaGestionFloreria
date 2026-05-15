import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function CatalogoCompletoPage() {
  return (
    <div className="min-h-screen bg-[#FDF3F6] font-sans text-[#93276F] selection:bg-[#E6A1B8] selection:text-[#93276F]">
      
      {/* Navegación para volver */}
      <nav className="w-full p-6 bg-white/50 backdrop-blur-md shadow-sm border-b border-[#E6A1B8]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-[#93276F] hover:text-[#E6A1B8] transition-colors font-medium text-sm tracking-widest uppercase">
            <ChevronLeft size={18} /> Volver a Inicio
          </Link>
          <span className="font-serif text-xl font-bold tracking-widest">Aleslí</span>
        </div>
      </nav>

      {/* Título de la página */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif mb-6 text-[#93276F]">Colección Completa</h1>
          <div className="w-24 h-px bg-[#E6A1B8] mx-auto"></div>
          <p className="mt-6 text-sm opacity-70 tracking-widest uppercase">Todos nuestros diseños de autor</p>
        </div>

        {/* Aquí luego meteremos la grilla inmensa con TODOS los productos */}
        <div className="text-center p-20 bg-white/40 border border-[#E6A1B8]/20 rounded-2xl">
          <p className="text-lg italic">Esta página está lista para cargar la base de datos completa de flores...</p>
        </div>
      </main>

    </div>
  );
}