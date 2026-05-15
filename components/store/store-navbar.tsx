"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Menu, X, Phone, Flower2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"

const NAV_LINKS = [
  { href: "/store", label: "Inicio" },
  { href: "/store/productos", label: "Productos" },
  { href: "/store/categorias", label: "Categorías" },
  { href: "/store/nosotros", label: "Nosotros" },
  { href: "/store/contacto", label: "Contacto" },
]

export function StoreNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { totalItems, openCart } = useCartStore()
  const cartCount = totalItems()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      {/* Top bar */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-primary text-primary-foreground text-xs py-1.5 px-4 hidden sm:flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" />
            +591 2 123-4567
          </span>
          <span>·</span>
          <span>Entregas a domicilio en La Paz todos los días</span>
          <span>·</span>
          <span>Pedidos antes de las 2pm para entrega el mismo día</span>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground transition-colors text-[11px]"
        >
          <Lock className="h-2.5 w-2.5" />
          Acceso personal
        </Link>
      </motion.div>

      {/* Main navbar */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : "bg-white/90 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/store" className="flex items-center gap-2 shrink-0">
              <Image
                src="/assets/Logo.png"
                alt="Alesli"
                width={110}
                height={44}
                className="object-contain"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={openCart}
                className="relative h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                aria-label="Abrir carrito"
              >
                <ShoppingCart className="h-5 w-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <Button
                asChild
                size="sm"
                className="hidden md:flex rounded-full px-5 shadow-sm"
              >
                <Link href="/store/pedido">Pedir ahora</Link>
              </Button>
              {/* Mobile hamburger */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="sticky top-16 z-40 bg-white border-b shadow-lg md:hidden overflow-hidden"
          >
            <nav className="flex flex-col px-4 py-3 gap-1">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    <Flower2 className="h-3.5 w-3.5 text-primary/50" />
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-2 pb-1">
                <Button asChild className="w-full rounded-full">
                  <Link href="/store/pedido" onClick={() => setMenuOpen(false)}>
                    Pedir ahora
                  </Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
