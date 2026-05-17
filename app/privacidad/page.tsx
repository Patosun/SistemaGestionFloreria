import Link from "next/link";
import { ChevronLeft, ShieldCheck, Lock, EyeOff } from "lucide-react";

export default function PrivacidadPage() {
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

      {/* Contenido de Privacidad */}
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif mb-6 text-[#93276F]">Políticas de Privacidad</h1>
          <div className="w-24 h-px bg-[#E6A1B8] mx-auto"></div>
          <p className="mt-6 text-sm italic opacity-70">Última actualización: Mayo 2026</p>
        </div>

        <div className="space-y-12 bg-white/60 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-sm border border-[#E6A1B8]/20 text-[#93276F]/80 leading-relaxed">
          
          <section className="flex flex-col md:flex-row gap-8 items-start">
            <div className="bg-[#DFD2E5] p-4 rounded-full text-[#93276F] shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-[#93276F] mb-4">Protección de tus Datos</h2>
              <p>
                En Aleslí Diseño Floral, valoramos la confianza que depositas en nosotros al elegir nuestros arreglos. Por ello, nos comprometemos a que la información personal que compartes (como nombres, números de contacto y direcciones de entrega) sea utilizada exclusivamente para procesar tus pedidos y brindarte una experiencia excepcional.
              </p>
            </div>
          </section>

          <section className="flex flex-col md:flex-row gap-8 items-start">
            <div className="bg-[#DFD2E5] p-4 rounded-full text-[#93276F] shrink-0">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-[#93276F] mb-4">Uso de la Información</h2>
              <p className="mb-4">
                La información recolectada se utiliza estrictamente para:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Gestionar la logística de entrega de tus flores en La Paz.</li>
                <li>Comunicar el estado de tu pedido mediante WhatsApp o correo electrónico.</li>
                <li>Procesar pagos de forma segura a través de nuestras pasarelas autorizadas.</li>
                <li>Enviarte promociones exclusivas, siempre y cuando hayas dado tu consentimiento.</li>
              </ul>
            </div>
          </section>

          <section className="flex flex-col md:flex-row gap-8 items-start">
            <div className="bg-[#DFD2E5] p-4 rounded-full text-[#93276F] shrink-0">
              <EyeOff size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-[#93276F] mb-4">Confidencialidad</h2>
              <p>
                Aleslí no vende, alquila ni comparte tu información personal con terceros para fines publicitarios. Solo compartimos los datos necesarios con nuestros aliados logísticos (delivery) para asegurar que tu regalo llegue a su destino final.
              </p>
            </div>
          </section>

          <div className="pt-10 border-t border-[#E6A1B8]/20 text-center">
            <p className="text-sm italic">
              Si tienes dudas sobre cómo manejamos tus datos, puedes contactarnos directamente a través de nuestra línea de atención al cliente.
            </p>
          </div>
        </div>
      </main>

    </div>
  );
}