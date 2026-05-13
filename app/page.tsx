"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  ShoppingBag, 
  Menu, 
  Search, 
  ChevronRight, 
  Star, 
  ArrowRight,
  Heart,
  Users,
  Award
} from "lucide-react";
import { useEffect, useState } from "react";

const testimonials = [
  {
    name: "María González",
    text: "Las flores de Aleslí transformaron mi boda en un sueño. ¡Servicio impecable!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Carlos López",
    text: "El mejor regalo de aniversario. Mi esposa quedó emocionada con el diseño.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Ana Martínez",
    text: "Entrega puntual y flores frescas. ¡Volveré a comprar!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  }
];

const collections = [
  {
    name: "Bodas",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop",
    color: "#93276F"
  },
  {
    name: "Aniversarios",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800&auto=format&fit=crop",
    color: "#B59CC9"
  },
  {
    name: "Cumpleaños",
    image: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=800&auto=format&fit=crop",
    color: "#E6A1B8"
  },
  {
    name: "Amor",
    image: "https://images.unsplash.com/photo-1549489318-6f46bd2c65ab?q=80&w=800&auto=format&fit=crop",
    color: "#F2C9D8"
  }
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDF3F6] overflow-x-hidden">
      
     {/* NAVBAR LIMPIA Y FIJA - SOLO ESTA SECCIÓN */}
<header
  className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
    scrolled
      ? "bg-[#FDF3F6]/95 backdrop-blur-2xl border-b border-[#93276F]/10 shadow-[0_8px_30px_rgba(147,39,111,0.08)]"
      : "bg-transparent"
  }`}
>
  {/* Glow decorativo */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-20 left-1/4 w-72 h-72 bg-[#B59CC9]/20 blur-3xl animate-pulse"></div>
    <div className="absolute -top-10 right-1/4 w-60 h-60 bg-[#E6A1B8]/20 blur-3xl animate-pulse delay-300"></div>
  </div>

  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="h-20 flex items-center justify-between">
      
      {/* LEFT */}
      <div className="flex items-center gap-4 lg:gap-8">
        {/* Mobile Menu */}
        <button className="lg:hidden p-2 text-[#93276F] hover:bg-[#F2C9D8]/50 hover:scale-110 rounded-xl transition-all duration-300">
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {[
            "Inicio",
            "Catálogo", 
            "Ocasiones",
            "Nosotros",
            "Contacto"
          ].map((item, index) => (
            <Link
              key={index}
              href={`#${item.toLowerCase()}`}
              className="group relative text-sm uppercase tracking-[0.15em] text-[#93276F] font-medium transition-all duration-300 hover:text-[#E6A1B8] py-2 px-3"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#93276F] to-[#E6A1B8] transition-all duration-500 group-hover:w-full rounded-full"></span>
            </Link>
          ))}
        </nav>
      </div>

      {/* LOGO CENTRAL */}
      <div className="flex-shrink-0 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0 animate-in fade-in zoom-in duration-700">
        <Link href="/" className="block">
          <Image 
            src="/assets/Logo.png" 
            alt="Aleslí Floral Studio" 
            width={140} 
            height={50} 
            className="object-contain w-[120px] lg:w-[140px] h-auto hover:scale-105 transition-transform duration-300"
            priority
          />
        </Link>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
        {/* Search Desktop */}
        <button className="hidden lg:flex items-center justify-center w-11 h-11 rounded-2xl border border-[#93276F]/20 bg-white/60 backdrop-blur-sm hover:bg-[#F2C9D8]/60 hover:scale-110 transition-all duration-300 shadow-sm">
          <Search className="w-5 h-5 text-[#93276F]" />
        </button>

        {/* Login */}
        <Link
          href="/login"
          className="hidden md:flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#93276F] via-[#B59CC9] to-[#E6A1B8] text-white text-xs uppercase tracking-[0.2em] font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-400"
        >
          Ingresar
        </Link>

        {/* Cart */}
        <button className="relative flex items-center justify-center w-12 h-12 rounded-2xl border border-[#93276F]/20 bg-white/60 backdrop-blur-sm hover:bg-[#F2C9D8]/60 hover:scale-110 transition-all duration-300 shadow-sm">
          <ShoppingBag className="w-5 h-5 text-[#93276F]" />
          <span className="absolute -top-1 -right-1 min-w-[20px] h-6 px-1.5 rounded-full bg-gradient-to-r from-[#93276F] to-[#E6A1B8] text-white text-xs flex items-center justify-center font-bold shadow-lg">
            3
          </span>
        </button>
      </div>
    </div>
  </div>
</header>

      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?q=80&w=2000&auto=format&fit=crop"
          alt="Flores"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-[#93276F]/20"></div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="text-white/90 tracking-[0.35em] uppercase text-sm mb-6 animate-fade-in">
            Diseño Floral Premium
          </p>
          <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-serif leading-tight mb-8 drop-shadow-2xl">
            Flores que
            <br />
            <span className="bg-gradient-to-r from-[#E6A1B8] to-[#B59CC9] bg-clip-text text-transparent">
              inspiran emociones
            </span>
          </h1>
          <p className="text-white/90 text-xl md:text-2xl leading-relaxed mb-12 max-w-2xl mx-auto">
            Diseños florales exclusivos para bodas, aniversarios, celebraciones y momentos inolvidables.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="#catalogo"
              className="px-10 py-5 rounded-full bg-gradient-to-r from-[#93276F] via-[#B59CC9] to-[#E6A1B8] text-white uppercase tracking-[0.25em] text-sm font-semibold shadow-2xl hover:scale-105 hover:shadow-[0_20px_40px_rgba(147,39,111,0.4)] transition-all duration-500 group"
            >
              Explorar Catálogo
              <ChevronRight className="w-5 h-5 inline ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#reseñas"
              className="px-10 py-5 rounded-full border-2 border-white/30 backdrop-blur-md bg-white/10 text-white uppercase tracking-[0.25em] text-sm font-semibold hover:bg-white hover:text-[#93276F] hover:border-white transition-all duration-500"
            >
              Ver Reseñas
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-24 bg-gradient-to-b from-[#FDF3F6] to-[#DFD2E5] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,#E6A1B8_0%,transparent_50%)]"></div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-4 gap-8 text-center">
          <div className="group">
            <div className="text-4xl md:text-5xl font-serif text-[#93276F] mb-4">
              +500
            </div>
            <div className="text-lg text-[#93276F]/80 font-semibold uppercase tracking-wide">
              Eventos Decorados
            </div>
          </div>
          <div className="group">
            <div className="text-4xl md:text-5xl font-serif text-[#B59CC9] mb-4">
              24h
            </div>
            <div className="text-lg text-[#B59CC9]/80 font-semibold uppercase tracking-wide">
              Entrega Express
            </div>
          </div>
          <div className="group">
            <div className="text-4xl md:text-5xl font-serif text-[#E6A1B8] mb-4">
              100%
            </div>
            <div className="text-lg text-[#E6A1B8]/80 font-semibold uppercase tracking-wide">
              Satisfacción
            </div>
          </div>
          <div className="group">
            <div className="text-4xl md:text-5xl font-serif text-[#F2C9D8] mb-4">
              5★
            </div>
            <div className="text-lg text-[#F2C9D8]/80 font-semibold uppercase tracking-wide">
              Valoración
            </div>
          </div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section id="catalogo" className="py-32 bg-[#FDF3F6] relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#93276F] mb-6 bg-gradient-to-r from-[#93276F] to-[#B59CC9] bg-clip-text">
              Nuestro Catálogo
            </h2>
            <p className="text-xl text-[#93276F]/70 max-w-2xl mx-auto">
              Descubre nuestras colecciones exclusivas diseñadas para cada ocasión especial
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {collections.map((collection, index) => (
              <Link
                key={index}
                href={`/coleccion/${collection.name.toLowerCase()}`}
                className="group relative h-96 rounded-3xl overflow-hidden shadow-2xl hover:shadow-[0_30px_60px_rgba(147,39,111,0.3)] transition-all duration-700 hover:-translate-y-4"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${collection.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-serif text-white mb-2 group-hover:text-[#E6A1B8] transition-colors">
                    {collection.name}
                  </h3>
                  <div className="h-1 w-20 bg-gradient-to-r from-[#E6A1B8] to-[#B59CC9] rounded-full group-hover:w-32 transition-all" />
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-24">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-4 px-12 py-6 rounded-full bg-gradient-to-r from-[#93276F] via-[#B59CC9] to-[#E6A1B8] text-white uppercase tracking-[0.25em] text-lg font-semibold shadow-2xl hover:scale-105 transition-all duration-500 group"
            >
              Ver Todo el Catálogo
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* RESEÑAS */}
      <section id="reseñas" className="py-32 bg-gradient-to-b from-[#DFD2E5] to-[#FDF3F6]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-3 bg-[#F2C9D8]/30 px-6 py-3 rounded-full mb-8">
              <Award className="w-6 h-6 text-[#93276F]" />
              <span className="uppercase tracking-[0.3em] text-[#93276F] font-semibold text-sm">+500 reseñas 5★</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-serif text-[#93276F] mb-6">
              Lo que dicen
              <br />
              <span className="text-[#B59CC9]">nuestros clientes</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group relative bg-white/60 backdrop-blur-xl rounded-3xl p-10 border border-white/30 hover:bg-white hover:shadow-2xl hover:shadow-[#E6A1B8]/25 transition-all duration-500 hover:-translate-y-4"
              >
                <div className="flex gap-2 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-[#E6A1B8] fill-[#E6A1B8]' : 'text-[#F2C9D8]'}`} />
                  ))}
                </div>
                <p className="text-lg text-[#93276F]/80 leading-relaxed mb-8 group-hover:text-[#93276F] transition-colors">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover ring-4 ring-white/50"
                  />
                  <div>
                    <h4 className="font-semibold text-[#93276F]">{testimonial.name}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-32 bg-gradient-to-br from-[#93276F] via-[#B59CC9] to-[#E6A1B8] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#FDF3F6_0%,transparent_50%)]"></div>
        <div className="relative max-w-4xl mx-auto px-6 lg:px-10 text-center text-white">
          <Users className="w-24 h-24 mx-auto mb-8 opacity-80" />
          <h2 className="text-5xl md:text-6xl font-serif mb-6 drop-shadow-2xl">
            Únete a la experiencia
            <br />
            <span className="block text-[#FDF3F6]">Aleslí</span>
          </h2>
          <p className="text-2xl mb-12 opacity-90 leading-relaxed max-w-2xl mx-auto">
            Regístrate hoy y recibe un 15% de descuento en tu primera compra
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/registro"
              className="px-12 py-6 rounded-full bg-white text-[#93276F] uppercase tracking-[0.25em] text-lg font-semibold shadow-2xl hover:scale-105 hover:shadow-white/50 transition-all duration-500 group"
            >
              Crear Cuenta Gratis
              <ChevronRight className="w-6 h-6 inline ml-3 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#catalogo"
              className="px-12 py-6 rounded-full border-2 border-white/40 backdrop-blur-md bg-white/20 text-white uppercase tracking-[0.25em] text-lg font-semibold hover:bg-white hover:text-[#93276F] transition-all duration-500"
            >
              Ver Catálogo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}