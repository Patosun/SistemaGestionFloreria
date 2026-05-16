"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { useStoreModals } from "@/lib/store-modals"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect } from "react"

const EMOJIS = ["🌹", "💐", "🌸", "🌺", "🪷", "🌷", "🌻", "🌼"]

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, totalItems } =
    useCartStore()
  const { openAuth, openCheckout } = useStoreModals()
  const { data: session } = useSession()

  function handleCheckout() {
    closeCart()
    if (!session) {
      openAuth("checkout")
    } else {
      openCheckout()
    }
  }

  const total = subtotal()
  const count = totalItems()

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-base">
                  Mi carrito
                  {count > 0 && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({count} {count === 1 ? "producto" : "productos"})
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                aria-label="Cerrar carrito"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-5">
              {items.length === 0 ? (
                /* Empty state */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full gap-4 text-center py-16"
                >
                  <div className="h-24 w-24 rounded-full bg-rose-50 flex items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-primary/40" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Tu carrito está vacío</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Explora nuestra colección y agrega tus flores favoritas.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full mt-2"
                    onClick={closeCart}
                    asChild
                  >
                    <Link href="/store/productos">Ver productos</Link>
                  </Button>
                </motion.div>
              ) : (
                <AnimatePresence initial={false}>
                  <ul className="flex flex-col gap-3">
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.22 }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-white hover:border-primary/20 transition-colors"
                      >
                        {/* Thumb */}
                        <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-3xl">{item.emoji}</span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.variantName}</p>
                          <p className="font-bold text-primary text-sm mt-0.5">
                            Bs. {(item.price * item.quantity).toFixed(0)}
                          </p>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-7 w-7 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                            aria-label="Quitar uno"
                          >
                            {item.quantity === 1 ? (
                              <Trash2 className="h-3 w-3 text-rose-500" />
                            ) : (
                              <Minus className="h-3 w-3" />
                            )}
                          </button>
                          <span className="w-6 text-center text-sm font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-7 w-7 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                            aria-label="Agregar uno"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </AnimatePresence>
              )}
            </div>

            {/* Footer / checkout */}
            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t px-5 py-5 flex flex-col gap-3 bg-white"
              >
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-bold text-lg text-foreground">
                    Bs. {total.toFixed(0)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground -mt-1">
                  Envío calculado según zona en La Paz.
                </p>

                {/* Checkout */}
                <Button
                  size="lg"
                  className="w-full rounded-full gap-2 shadow-lg shadow-primary/20 mt-1"
                  onClick={handleCheckout}
                >
                  {session ? "Confirmar pedido" : "Ingresar para pedir"}
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full"
                  onClick={closeCart}
                  asChild
                >
                  <Link href="/catalogo">Seguir comprando</Link>
                </Button>
              </motion.div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

