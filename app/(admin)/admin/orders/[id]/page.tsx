"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ArrowLeft, CreditCard, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { use } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { PageShell } from "@/components/admin/page-shell"

type OrderDetail = {
  id: string
  orderNumber: string
  channel: string
  status: string
  subtotal: number
  discountAmount: number
  taxAmount: number
  total: number
  notes: string | null
  scheduledDate: string | null
  deliverySlot: string | null
  shippingAddress: string | null
  shippingCity: string | null
  paidAt: string | null
  createdAt: string
  customer: {
    id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
  } | null
  createdBy: { id: string; name: string } | null
  items: {
    id: string
    name: string
    quantity: number
    unitPrice: number
    discount: number
    total: number
    notes: string | null
    variant: {
      sku: string
      product: { id: string; name: string; images: string[] }
    }
  }[]
  payments: {
    id: string
    method: string
    amount: number
    status: string
    paidAt: string | null
  }[]
  delivery: {
    id: string
    status: string
    address: string
    scheduledDate: string | null
    assignedTo: { id: string; name: string } | null
  } | null
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente", CONFIRMED: "Confirmado", IN_PRODUCTION: "En producción",
  READY: "Listo", OUT_FOR_DELIVERY: "En camino", DELIVERED: "Entregado",
  CANCELED: "Cancelado", REFUNDED: "Reembolsado",
}

const METHOD_LABELS: Record<string, string> = {
  CASH: "Efectivo", CARD: "Tarjeta", QR: "QR", TRANSFER: "Transferencia",
  INTERNAL_CREDIT: "Crédito",
}

const SLOT_LABELS: Record<string, string> = {
  SLOT_09_12: "09:00 – 12:00", SLOT_12_15: "12:00 – 15:00",
  SLOT_15_18: "15:00 – 18:00", SLOT_18_21: "18:00 – 21:00",
}

const NEXT_STATUSES: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELED"],
  CONFIRMED: ["IN_PRODUCTION", "CANCELED"],
  IN_PRODUCTION: ["READY", "CANCELED"],
  READY: ["OUT_FOR_DELIVERY", "DELIVERED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [payAmount, setPayAmount] = useState("")
  const [payMethod, setPayMethod] = useState("CASH")
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<{ data: OrderDetail }>({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/orders/${id}`)
      if (!res.ok) throw new Error("Error al cargar pedido")
      return res.json()
    },
  })

  const order = data?.data

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/v1/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error")
    },
    onSuccess: () => {
      toast.success("Estado actualizado")
      qc.invalidateQueries({ queryKey: ["order", id] })
      qc.invalidateQueries({ queryKey: ["orders"] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const payMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: id,
          method: payMethod,
          amount: parseFloat(payAmount),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error al registrar pago")
      return json
    },
    onSuccess: () => {
      toast.success("Pago registrado")
      setPaymentOpen(false)
      setPayAmount("")
      qc.invalidateQueries({ queryKey: ["order", id] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!order) {
    return <p className="text-muted-foreground">Pedido no encontrado</p>
  }

  const totalPaid = order.payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((s, p) => s + Number(p.amount), 0)
  const remaining = Number(order.total) - totalPaid
  const nextStatuses = NEXT_STATUSES[order.status] ?? []

  return (
    <PageShell>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">
            Pedido #{order.orderNumber.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleString("es-BO")}
            {order.createdBy ? ` · Creado por ${order.createdBy.name}` : ""}
          </p>
        </div>
        <Badge className="text-sm px-3 py-1">
          {STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col: items + payments */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="px-4 py-2 font-medium text-muted-foreground">Producto</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground text-right">Cant.</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground text-right">Precio</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.variant.sku}</p>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground italic">{item.notes}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">{Number(item.quantity)}</td>
                      <td className="px-4 py-3 text-right">
                        Bs. {Number(item.unitPrice).toFixed(0)}
                        {Number(item.discount) > 0 && (
                          <span className="text-xs text-muted-foreground block">
                            -{Number(item.discount).toFixed(0)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        Bs. {Number(item.total).toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 space-y-1 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Bs. {Number(order.subtotal).toFixed(0)}</span>
                </div>
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento</span>
                    <span>-Bs. {Number(order.discountAmount).toFixed(0)}</span>
                  </div>
                )}
                {Number(order.taxAmount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Impuestos</span>
                    <span>Bs. {Number(order.taxAmount).toFixed(0)}</span>
                  </div>
                )}
                <Separator className="my-1" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>Bs. {Number(order.total).toFixed(0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pagos</CardTitle>
              {remaining > 0.01 && !["CANCELED", "REFUNDED"].includes(order.status) && (
                <Button size="sm" onClick={() => { setPayAmount(remaining.toFixed(2)); setPaymentOpen(true) }}>
                  <CreditCard className="mr-2 h-4 w-4" /> Registrar pago
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {order.payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin pagos registrados</p>
              ) : (
                <div className="space-y-2">
                  {order.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>{METHOD_LABELS[p.method] ?? p.method}</span>
                        {p.paidAt && (
                          <span className="text-muted-foreground">
                            {new Date(p.paidAt).toLocaleDateString("es-BO")}
                          </span>
                        )}
                      </div>
                      <span className="font-medium">Bs. {Number(p.amount).toFixed(0)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between text-sm font-medium">
                    <span>Pagado</span>
                    <span className="text-green-600">Bs. {totalPaid.toFixed(0)}</span>
                  </div>
                  {remaining > 0.01 && (
                    <div className="flex justify-between text-sm font-medium">
                      <span>Saldo pendiente</span>
                      <span className="text-destructive">Bs. {remaining.toFixed(0)}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right col: info + actions */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-border/50">
            <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              {order.customer ? (
                <>
                  <p className="font-medium">{order.customer.name}</p>
                  {order.customer.email && <p className="text-muted-foreground">{order.customer.email}</p>}
                  {order.customer.phone && <p className="text-muted-foreground">{order.customer.phone}</p>}
                </>
              ) : (
                <p className="text-muted-foreground">Sin cliente registrado</p>
              )}
            </CardContent>
          </Card>

          {/* Delivery */}
          {(order.shippingAddress || order.scheduledDate) && (
            <Card>
              <CardHeader><CardTitle>Entrega</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                {order.shippingAddress && <p>{order.shippingAddress}</p>}
                {order.shippingCity && <p className="text-muted-foreground">{order.shippingCity}</p>}
                {order.scheduledDate && (
                  <p className="text-muted-foreground">
                    {new Date(order.scheduledDate).toLocaleDateString("es-BO")}
                    {order.deliverySlot ? ` · ${SLOT_LABELS[order.deliverySlot]}` : ""}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader><CardTitle>Notas / Dedicatoria</CardTitle></CardHeader>
              <CardContent className="text-sm italic text-muted-foreground">{order.notes}</CardContent>
            </Card>
          )}

          {/* Status Actions */}
          {nextStatuses.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Avanzar estado</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {nextStatuses.map((s) => (
                  <Button
                    key={s}
                    variant="outline"
                    className="w-full"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate(s)}
                  >
                    → {STATUS_LABELS[s]}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Registrar pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Saldo pendiente: Bs. {remaining.toFixed(0)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancelar</Button>
            <Button
              disabled={payMutation.isPending || !payAmount || parseFloat(payAmount) <= 0}
              onClick={() => payMutation.mutate()}
            >
              {payMutation.isPending ? "Procesando…" : "Confirmar pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
