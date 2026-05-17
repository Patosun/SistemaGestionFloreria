"use client"

import { useState, useCallback } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Search, Plus, Minus, Trash2, ShoppingCart, X, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

// ─── Types ────────────────────────────────────────────────────────────────────

type Variant = {
  id: string
  sku: string
  name: string
  price: number
  costPrice: number
  isActive: boolean
  product: { id: string; name: string; images: string[] }
}

type CartItem = {
  variantId: string
  sku: string
  productName: string
  variantName: string
  quantity: number
  unitPrice: number
  costPrice: number
  discount: number
}

type Customer = { id: string; name: string; phone: string | null; email: string | null }

const METHOD_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  QR: "QR / CoDi",
  TRANSFER: "Transferencia",
  INTERNAL_CREDIT: "Crédito",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useProducts(q: string) {
  return useQuery<{ data: Variant[] }>({
    queryKey: ["pos-products", q],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "40" })
      if (q) params.set("q", q)
      params.set("isPublic", "true")
      const res = await fetch(`/api/v1/products?${params}`)
      if (!res.ok) throw new Error("Error")
      const json = await res.json()
      // flatten to variants
      const variants: Variant[] = []
      for (const product of json.data) {
        for (const v of product.variants ?? []) {
          if (v.isActive) {
            variants.push({
              id: v.id,
              sku: v.sku,
              name: v.name,
              price: Number(v.price),
              costPrice: Number(v.costPrice),
              isActive: v.isActive,
              product: { id: product.id, name: product.name, images: product.images },
            })
          }
        }
      }
      return { data: variants }
    },
    staleTime: 30_000,
  })
}

function useCustomers(q: string) {
  return useQuery<{ data: Customer[] }>({
    queryKey: ["pos-customers", q],
    queryFn: async () => {
      if (!q) return { data: [] }
      const res = await fetch(`/api/v1/customers?q=${encodeURIComponent(q)}&limit=10`)
      if (!res.ok) throw new Error("Error")
      return res.json()
    },
    enabled: q.length >= 2,
  })
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PosPage() {
  const router = useRouter()
  const [productQ, setProductQ] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  // Checkout state
  const [customerQ, setCustomerQ] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [payMethod, setPayMethod] = useState("CASH")
  const [notes, setNotes] = useState("")
  const [discountPct, setDiscountPct] = useState(0)

  const { data: productsData, isLoading: productsLoading } = useProducts(productQ)
  const { data: customersData } = useCustomers(customerQ)

  const variants = productsData?.data ?? []
  const customers = customersData?.data ?? []

  // ── Cart helpers ──────────────────────────────────────────────────────────

  const addToCart = useCallback((v: Variant) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.variantId === v.id)
      if (existing) {
        return prev.map((i) =>
          i.variantId === v.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [
        ...prev,
        {
          variantId: v.id,
          sku: v.sku,
          productName: v.product.name,
          variantName: v.name,
          quantity: 1,
          unitPrice: v.price,
          costPrice: v.costPrice,
          discount: 0,
        },
      ]
    })
  }, [])

  function updateQty(variantId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.variantId === variantId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0),
    )
  }

  function removeItem(variantId: string) {
    setCart((prev) => prev.filter((i) => i.variantId !== variantId))
  }

  function clearCart() {
    setCart([])
    setCheckoutOpen(false)
    setSelectedCustomer(null)
    setCustomerQ("")
    setNotes("")
    setDiscountPct(0)
  }

  // ── Totals ────────────────────────────────────────────────────────────────

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity - i.discount, 0)
  const discountAmount = subtotal * (discountPct / 100)
  const total = subtotal - discountAmount

  // ── Checkout Mutation ─────────────────────────────────────────────────────

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const orderRes = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "POS",
          customerId: selectedCustomer?.id ?? null,
          notes: notes || null,
          discountAmount,
          taxAmount: 0,
          consumeInventory: true,
          items: cart.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            costPrice: i.costPrice,
            discount: i.discount,
          })),
        }),
      })
      const orderJson = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderJson.error ?? "Error al crear pedido")

      const orderId = orderJson.data.id

      // Register payment
      await fetch("/api/v1/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          method: payMethod,
          amount: total,
        }),
      })

      return orderJson.data
    },
    onSuccess: (order) => {
      toast.success(`Venta registrada · #${order.orderNumber.slice(-8).toUpperCase()}`)
      clearCart()
      router.push(`/admin/orders/${order.id}`)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Left: Product Grid ── */}
      <div className="flex flex-col flex-1 min-w-0 border-r">
        {/* Top bar */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Link href="/admin/orders">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar productos…"
              value={productQ}
              onChange={(e) => setProductQ(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto p-4">
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : variants.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              {"Sin resultados"}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => addToCart(v)}
                  className="flex flex-col items-start gap-1 rounded-lg border p-3 text-left hover:bg-accent hover:border-primary transition-colors"
                >
                  <p className="font-medium text-sm leading-tight line-clamp-2">{v.product.name}</p>
                  {v.name !== "Estándar" && (
                    <p className="text-xs text-muted-foreground">{v.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground font-mono">{v.sku}</p>
                  <p className="mt-auto text-base font-semibold text-primary">
                    ${v.price.toFixed(2)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Cart ── */}
      <div className="flex flex-col w-80 shrink-0">
        {/* Cart header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-semibold">
              Carrito · {cart.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>
          {cart.length > 0 && (
            <Button variant="ghost" size="icon" onClick={clearCart}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              El carrito está vacío
            </div>
          ) : (
            <div className="divide-y">
              {cart.map((item) => (
                <div key={item.variantId} className="p-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-tight truncate">{item.productName}</p>
                      {item.variantName !== "Estándar" && (
                        <p className="text-xs text-muted-foreground">{item.variantName}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-muted-foreground"
                      onClick={() => removeItem(item.variantId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQty(item.variantId, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQty(item.variantId, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="text-sm font-medium">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart footer */}
        <div className="border-t p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground flex-1">Descuento %</span>
            <Input
              type="number"
              min="0"
              max="100"
              className="h-7 w-16 text-right text-sm"
              value={discountPct || ""}
              onChange={(e) => setDiscountPct(Math.min(100, Math.max(0, Number(e.target.value))))}
            />
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Descuento</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={cart.length === 0}
            onClick={() => setCheckoutOpen(true)}
          >
            Cobrar
          </Button>
        </div>
      </div>

      {/* ── Checkout Dialog ── */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar venta · ${total.toFixed(2)}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Customer search */}
            <div className="space-y-2">
              <Label>Cliente (opcional)</Label>
              {selectedCustomer ? (
                <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span className="font-medium">{selectedCustomer.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => { setSelectedCustomer(null); setCustomerQ("") }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    placeholder="Buscar cliente…"
                    value={customerQ}
                    onChange={(e) => setCustomerQ(e.target.value)}
                  />
                  {customers.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                      {customers.map((c) => (
                        <button
                          key={c.id}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                          onClick={() => { setSelectedCustomer(c); setCustomerQ(c.name) }}
                        >
                          <p className="font-medium">{c.name}</p>
                          {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="space-y-2">
              <Label>Método de pago</Label>
              <Select value={payMethod} onValueChange={setPayMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(METHOD_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Dedicatoria / Notas</Label>
              <Input
                placeholder="Para: Juan, Con amor…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Summary */}
            <div className="rounded-md bg-muted p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {cart.reduce((s, i) => s + i.quantity, 0)} productos
                </span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento {discountPct}%</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-1 border-t border-border">
                <span>Total a cobrar</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)}>
              Volver
            </Button>
            <Button
              disabled={checkoutMutation.isPending}
              onClick={() => checkoutMutation.mutate()}
            >
              {checkoutMutation.isPending ? "Procesando…" : `Confirmar · $${total.toFixed(2)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}