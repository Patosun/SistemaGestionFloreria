"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
// IMPORTACIÓN CORREGIDA: Sin duplicados y sin "Facebook"
import { ChevronLeft, Minus, Plus, ShoppingBag, MessageCircle, Heart, Share2, X, Copy, Link2, Check, Flower } from "lucide-react";

// --- BASE DE DATOS (Simulada para el ejemplo) ---
const fullInventory = [
  { id: 1, name: "Modelo A-25: Corazón de Girasoles", price: 160, image: "https://images.unsplash.com/photo-1591880911020-d344b0b9213a?q=80&w=800&auto=format&fit=crop", category: "Romance", description: "En el mes de la primavera, es un buen momento para regalar flores amarillas. Regala este detalle a esa persona especial. Será un regalo que nunca olvidará.", features: ["20 Girasoles de vivero", "Tarjeta de flores amarillas", "Estructura de corazón rojo de madera", "Decoración 100% personalizada", "Tarjeta dedicatoria incluida"] },
  { id: 2, name: "Modelo A-28: Pasión Premium", price: 180, image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=800&auto=format&fit=crop", category: "Romance", description: "La perfección está en los detalles. Cada ramo es producido exclusivamente en nuestro taller.", features: ["Rosas rojas premium", "Follaje fino de estación", "Peluche temático incluido", "Envoltura de alta costura floral"] },
  { id: 3, name: "Eterno Amor", price: 280, image: "https://images.unsplash.com/photo-1550341334-75019053359d?q=80&w=800&auto=format&fit=crop", category: "Romance", description: "Caja de rosas rojas velvet de tallo largo para impresionar.", features: ["24 Rosas rojas", "Caja cilíndrica premium", "Lazo decorativo"] },
  { id: 4, name: "Alegría Radiante", price: 150, image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=800&auto=format&fit=crop", category: "Cumpleaños", description: "Combinación vibrante de estación para celebrar la vida.", features: ["Mix de flores primaverales", "Base de cerámica", "Topper de Feliz Cumpleaños"] },
];

export default function ProductDetailPage() {
  const params = useParams();
  const productId = Number(params.id);
  const [quantity, setQuantity] = useState(1);
  
  // --- ESTADO PARA COMPARTIR ---
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  // Obtener la URL actual en el cliente
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  // Buscar el producto
  const product = fullInventory.find((p) => p.id === productId);
  
  // Productos relacionados
  const relatedProducts = fullInventory.filter((p) => p.id !== productId).slice(0, 3);

  // --- LÓGICA DE COMPARTIR (ENFOQUE HÍBRIDO) ---
  const handleShare = async () => {
    const shareData = {
      title: `Aleslí Florería - ${product?.name}`,
      text: `¡Mira este hermoso arreglo floral de Aleslí en La Paz: ${product?.name}!`,
      url: currentUrl,
    };

    // 1. Intentar usar la Web Share API Nativa (Celulares modernos)
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        console.log("Compartido exitosamente vía nativa");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error al compartir nativamente:", err);
          setIsShareModalOpen(true); // Respaldo si falla
        }
      }
    } else {
      // 2. Si no soporta nativo (Escritorio), abrir Modal Aleslí
      setIsShareModalOpen(true);
    }
  };

  // Función para copiar el link
  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); 
  };

  // Links de compartir personalizados
  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(product?.name + " - " + currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
  };

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF3F6] text-[#93276F]">
        <h1 className="text-4xl font-serif mb-4">Arreglo no encontrado</h1>
        <Link href="/catalogo" className="underline hover:text-[#E6A1B8]">Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF3F6] font-sans text-[#93276F] selection:bg-[#E6A1B8] selection:text-[#93276F]">
      
      {/* Navegación Superior */}
      <nav className="w-full p-6 bg-white/70 backdrop-blur-md shadow-sm border-b border-[#E6A1B8]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/catalogo" className="inline-flex items-center gap-2 text-[#93276F] hover:text-[#E6A1B8] transition-colors font-medium text-xs tracking-widest uppercase">
            <ChevronLeft size={18} /> Volver al Catálogo
          </Link>
          <span className="font-serif text-2xl font-bold tracking-[0.2em] uppercase">Aleslí</span>
          <div className="w-24"></div> 
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* --- SECCIÓN PRINCIPAL DEL PRODUCTO --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-24">
          
          {/* Lado Izquierdo: Imagen Grande */}
          <div className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden bg-[#DFD2E5] shadow-lg border border-[#E6A1B8]/20">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button className="bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-md text-[#93276F] hover:text-[#E6A1B8] transition-colors"><Heart size={20} /></button>
              
              {/* BOTÓN DE COMPARTIR */}
              <button 
                onClick={handleShare}
                className="bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-md text-[#93276F] hover:text-[#E6A1B8] transition-colors"
                title="Compartir este arreglo"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Lado Derecho: Detalles */}
          <div className="flex flex-col justify-center">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#E6A1B8] mb-4 block">
              Colección {product.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-serif text-[#93276F] mb-6 leading-tight uppercase">
              {product.name}
            </h1>
            
            <div className="mb-8 bg-white/50 p-6 rounded-xl border border-[#E6A1B8]/20 shadow-inner">
              <h3 className="text-sm font-bold tracking-widest uppercase mb-4 text-[#93276F]">Contiene:</h3>
              <ul className="space-y-2">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-[#93276F]/80 flex items-start gap-2">
                    <span className="text-[#E6A1B8] mt-1">•</span> {feature}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-sm text-[#93276F]/70 leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="text-4xl font-light text-[#93276F] mb-8 border-b border-[#E6A1B8]/30 pb-8">
              {product.price} <span className="text-xl">BOB</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center justify-between border border-[#E6A1B8] rounded-full px-4 py-3 bg-white w-full sm:w-32 shadow-inner">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-[#93276F] hover:text-[#E6A1B8]"><Minus size={18} /></button>
                <span className="font-bold text-[#93276F]">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-[#93276F] hover:text-[#E6A1B8]"><Plus size={18} /></button>
              </div>

              <button className="flex-1 bg-[#93276F] text-white rounded-full flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs hover:bg-[#7a1f5c] transition-colors shadow-lg shadow-[#93276F]/30 py-3">
                <ShoppingBag size={18} /> Añadir al carrito
              </button>
            </div>

            <a 
              href={`https://wa.me/59177793200?text=Hola,%20me%20interesa%20el%20${product.name}%20(Cantidad:%20${quantity})`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full border-2 border-[#25D366] text-[#25D366] rounded-full flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs hover:bg-[#25D366] hover:text-white transition-all py-3 bg-white shadow-sm"
            >
              <MessageCircle size={18} /> Pedir más información
            </a>

            <div className="mt-8 text-xs text-[#93276F]/50">
              Categorías: <span className="text-[#E6A1B8] hover:underline cursor-pointer">{product.category}</span>
            </div>
          </div>
        </div>

        {/* --- SECCIÓN: PRODUCTOS RELACIONADOS --- */}
        <div className="pt-16 border-t border-[#E6A1B8]/20">
          <h2 className="text-3xl font-serif text-[#93276F] mb-10">Productos relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {relatedProducts.map((relProduct) => (
              <Link href={`/catalogo/${relProduct.id}`} key={relProduct.id} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-[#E6A1B8]/10 hover:shadow-xl transition-all duration-300">
                <div className="aspect-square bg-[#DFD2E5] overflow-hidden">
                  <img src={relProduct.image} alt={relProduct.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-serif text-[#93276F] text-lg mb-2 truncate group-hover:text-[#E6A1B8] transition-colors">{relProduct.name}</h3>
                  <p className="font-bold text-[#E6A1B8]">{relProduct.price} BOB</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>
      
      {/* Footer minimalista */}
      <footer className="bg-[#93276F] text-[#FDF3F6] py-10 text-center text-xs tracking-widest uppercase mt-20">
        © 2026 ALESLÍ DISEÑO FLORAL. TODOS LOS DERECHOS RESERVADOS.
      </footer>

      {/* --- EL MODAL QUE FALTABA --- */}
      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div 
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsShareModalOpen(false)}
          >
            <motion.div 
              className="bg-[#FDF3F6] w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl p-8 border border-[#E6A1B8]/20 overflow-hidden relative"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-4 right-4 text-[#93276F]/50 hover:text-[#93276F] transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <Share2 size={30} className="text-[#93276F] mx-auto mb-3" />
                <h2 className="text-2xl font-serif text-[#93276F]">Compartir Arreglo</h2>
                <p className="text-sm text-[#93276F]/70 mt-1">Envía este detalle a quien tú quieras</p>
              </div>

              <div className="mb-8">
                <h3 className="text-xs uppercase tracking-widest font-bold text-[#E6A1B8] mb-3">Enlace del producto</h3>
                <div className="flex gap-2 items-center bg-white border border-[#E6A1B8]/30 p-2 rounded-full shadow-inner">
                  <Link2 size={16} className="text-[#93276F]/40 ml-2 shrink-0" />
                  <input 
                    type="text" 
                    value={currentUrl} 
                    readOnly 
                    className="flex-1 bg-transparent text-sm text-[#93276F] focus:outline-none truncate"
                  />
                  <button 
                    onClick={copyLink}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors shrink-0 ${
                      copied 
                        ? 'bg-[#25D366] text-white' 
                        : 'bg-[#93276F] text-white hover:bg-[#7a1f5c]'
                    }`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold text-[#E6A1B8] mb-4">Enviar vía</h3>
                <div className="grid grid-cols-2 gap-4">
                  <a 
                    href={shareLinks.whatsapp} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#25D366]/20 hover:border-[#25D366] hover:shadow-md transition-all group"
                  >
                    <div className="bg-[#25D366] p-3 rounded-full text-white">
                      <MessageCircle size={20} />
                    </div>
                    <span className="text-sm font-semibold text-[#93276F] group-hover:text-[#25D366]">WhatsApp</span>
                  </a>

                  {/* AQUÍ ESTÁ EL BOTÓN DE FACEBOOK CORREGIDO (Sin el ícono que daba error) */}
                  <a 
                    href={shareLinks.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#3b5998]/20 hover:border-[#3b5998] hover:shadow-md transition-all group"
                  >
                    <div className="bg-[#3b5998] w-[44px] h-[44px] rounded-full text-white flex items-center justify-center font-bold text-xl font-serif">
                      f
                    </div>
                    <span className="text-sm font-semibold text-[#93276F] group-hover:text-[#3b5998]">Facebook</span>
                  </a>
                </div>
              </div>

              <div className="absolute -bottom-10 -right-10 opacity-10 text-[#E6A1B8]">
                <Flower size={150} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}