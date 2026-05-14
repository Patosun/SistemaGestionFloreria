import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#FDF3F6] font-sans text-[#93276F] selection:bg-[#E6A1B8] selection:text-[#93276F]">
      
      {/* Barra de navegación simple */}
      <nav className="w-full p-6 bg-white/50 backdrop-blur-md shadow-sm border-b border-[#E6A1B8]/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-[#93276F] hover:text-[#E6A1B8] transition-colors font-medium text-sm tracking-widest uppercase">
            <ChevronLeft size={18} /> Volver a la tienda
          </Link>
          <span className="font-serif text-xl font-bold tracking-widest">Aleslí</span>
        </div>
      </nav>

      {/* Contenido Legal */}
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif mb-6 text-[#93276F]">Términos y Condiciones</h1>
          <div className="w-24 h-px bg-[#E6A1B8] mx-auto"></div>
        </div>

        <div className="space-y-8 bg-white/60 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-sm border border-[#E6A1B8]/20 text-[#93276F]/80 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-serif text-[#93276F] mb-4">Información general</h2>
            <p className="mb-4">
              Este sitio web es operado por Aleslí Diseño Floral. En todo el sitio, los términos "nosotros", "nos" y "nuestro" se refieren a Aleslí Diseño Floral. Aleslí ofrece este sitio web, incluyendo toda la información, herramientas y servicios disponibles para ti en este sitio, el usuario, está condicionado a la aceptación de todos los términos, condiciones, políticas y notificaciones aquí establecidos.
            </p>
            <p className="mb-4">
              Al visitar nuestro sitio y/o comprar algo de nosotros, participas en nuestro "Servicio" y aceptas los siguientes términos y condiciones ("Términos de Servicio", "Términos"), incluidos todos los términos y condiciones adicionales y las políticas a las que se hace referencia en el presente documento y/o disponible a través de hipervínculos. Estas Condiciones de Servicio se aplican a todos los usuarios del sitio, incluyendo sin limitación a usuarios que sean navegadores, proveedores, clientes, comerciantes, y/o colaboradores de contenido.
            </p>
            <p>
              Por favor, lee estos Términos de Servicio cuidadosamente antes de acceder o utilizar nuestro sitio web. Al acceder o utilizar cualquier parte del sitio, estás aceptando los Términos de Servicio. Si no estás de acuerdo con todos los términos y condiciones de este acuerdo, entonces no deberías acceder a la página web o usar cualquiera de los servicios. Si las Términos de Servicio son considerados una oferta, la aceptación está expresamente limitada a estos Términos de Servicio.
            </p>
          </section>

          {/* Aquí puedes agregar más secciones (Precios, Devoluciones, etc.) copiando la estructura del <section> anterior */}

        </div>
      </main>

    </div>
  );
}