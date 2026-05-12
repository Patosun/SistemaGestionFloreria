"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ShoppingCart, Search, X, Plus, Minus, Trash2, CreditCard } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface VariantWithProduct {
  id: string
  productId: string
  sku: string
  name: string
  price: number
  product: {
    id: true
    name: string
    images: string[]
  }
}

export default function PosPage() {
  const [search, setSearch] = useState("")
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const cart = useCart()

  const { data: variants = [], isLoading } = useQuery<VariantWithProduct[]>({
    queryKey: ["pos-products", search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50" })
      if (search) params.set("search", search)
      const res = await fetch(`/api/v1/products?${params}`)
      if (!res.ok) throw new Error("Error al cargar productos")
      return res.json()
    },
  })

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b bg-background px-4 py-3">
          <h1 className="text-lg font-semibold">Punto de Venta</h1>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar producto..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-36 rounded-lg border bg-muted animate-pulse" />
              ))}
            </div>
          ) : variants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-3 opacity-30" />
              <p>No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {variants.map((variant) => (
                <ProductCard
                  key={variant.id}
                  variant={variant}
                  onAdd={() =>
                    cart.addItem({
                      variantId: variant.id,
                      productId: variant.product.id,
                      name: `${variant.product.name} — ${variant.name}`,
                      sku: variant.sku,
                      price: variant.price,
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex w-80 flex-col border-l bg-card">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="font-medium">Carrito</span>
            {cart.itemCount() > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {cart.itemCount()}
              </span>
            )}
          </div>
          {cart.items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={cart.clearCart}
            >
              Limpiar
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto divide-y">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
              <ShoppingCart className="h-10 w-10 mb-2 opacity-20" />
              <p>El carrito está vacío</p>
            </div>
          ) : (
            cart.items.map((item) => (
              <CartItemRow
                key={item.variantId}
                item={item}
                onIncrease={() => cart.updateQuantity(item.variantId, item.quantity + 1)}
                onDecrease={() => cart.updateQuantity(item.variantId, item.quantity - 1)}
                onRemove={() => cart.removeItem(item.variantId)}
              />
            ))
          )}
        </div>

        <div className="border-t p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">Bs. {cart.subtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>Bs. {cart.subtotal().toFixed(2)}</span>
          </div>
          <Button
            className="w-full"
            disabled={cart.items.length === 0}
            onClick={() => setCheckoutOpen(true)}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Cobrar
          </Button>
        </div>
      </div>

      {checkoutOpen && (
        <CheckoutModal
          total={cart.subtotal()}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => {
            cart.clearCart()
            setCheckoutOpen(false)
          }}
        />
      )}
    </div>
  )
}

function ProductCard({
  variant,
  onAdd,
}: {
  variant: VariantWithProduct
  onAdd: () => void
}) {
  return (
    <button
      onClick={onAdd}
      className="flex flex-col items-start rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent hover:border-primary active:scale-95"
    >
      <div className="w-full h-20 rounded-md bg-muted mb-2 overflow-hidden">
        {variant.product.images[0] ? (
          <img
            src={variant.product.images[0]}
            alt={variant.product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🌸</div>
        )}
      </div>
      <p className="text-xs font-medium leading-tight line-clamp-2">{variant.product.name}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{variant.name}</p>
      <p className="mt-1 text-sm font-semibold text-primary">Bs. {Number(variant.price).toFixed(2)}</p>
    </button>
  )
}

function CartItemRow({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: { name: string; price: number; quantity: number }
  onIncrease: () => void
  onDecrease: () => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium leading-tight line-clamp-2">{item.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Bs. {item.price.toFixed(2)} c/u
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-6 w-6" onClick={onDecrease}>
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
        <Button variant="outline" size="icon" className="h-6 w-6" onClick={onIncrease}>
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive ml-1"
          onClick={onRemove}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

function CheckoutModal({
  total,
  onClose,
  onSuccess,
}: {
  total: number
  onClose: () => void
  onSuccess: () => void
}) {
  const [method, setMethod] = useState<"CASH" | "QR" | "CARD">("CASH")
  const [cash, setCash] = useState("")
  const [loading, setLoading] = useState(false)
  const cart = useCart()

  const change = method === "CASH" ? Math.max(0, Number(cash) - total) : 0

  async function handleConfirm() {
    setLoading(true)
    try {
      const body = {
        channel: "POS",
        items: cart.items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        paymentMethod: method,
        customerId: cart.customerId ?? undefined,
        notes: cart.orderNotes || undefined,
      }
      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Error al procesar la venta")
      onSuccess()
    } catch {
      alert("Error al procesar la venta. Intente de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl border bg-card shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Cobrar venta</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-lg bg-muted p-4 text-center">
          <p className="text-sm text-muted-foreground">Total a cobrar</p>
          <p className="text-3xl font-bold mt-1">Bs. {total.toFixed(2)}</p>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Método de pago</p>
          <div className="grid grid-cols-3 gap-2">
            {(["CASH", "QR", "CARD"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={cn(
                  "rounded-lg border py-2 text-sm font-medium transition-colors",
                  method === m
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                )}
              >
                {m === "CASH" ? "Efectivo" : m === "QR" ? "QR" : "Tarjeta"}
              </button>
            ))}
          </div>
        </div>

        {method === "CASH" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Efectivo recibido</label>
            <Input
              type="number"
              placeholder="0.00"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
            />
            {Number(cash) >= total && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cambio</span>
                <span className="font-semibold text-green-600">Bs. {change.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleConfirm}
          disabled={loading || (method === "CASH" && Number(cash) < total)}
        >
          {loading ? "Procesando..." : "Confirmar venta"}
        </Button>
      </div>
    </div>
  )
}