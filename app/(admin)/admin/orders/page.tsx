"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Search, Eye, XCircle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"

type Order = {
  id: string
  orderNumber: string
  channel: string
  status: string
  customer: { id: string; name: string; phone: string | null } | null
  createdBy: { id: string; name: string } | null
  items: { id: string; name: string; quantity: number; total: number }[]
  payments: { id: string; method: string; amount: number; status: string }[]
  subtotal: number
  total: number
  scheduledDate: string | null
  createdAt: string
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  IN_PRODUCTION: "En producción",
  READY: "Listo",
  OUT_FOR_DELIVERY: "En camino",
  DELIVERED: "Entregado",
  CANCELED: "Cancelado",
  REFUNDED: "Reembolsado",
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  CONFIRMED: "secondary",
  IN_PRODUCTION: "secondary",
  READY: "default",
  OUT_FOR_DELIVERY: "default",
  DELIVERED: "default",
  CANCELED: "destructive",
  REFUNDED: "destructive",
}

const CHANNEL_LABELS: Record<string, string> = {
  POS: "POS",
  ECOMMERCE: "E-commerce",
  CHATBOT: "Chatbot",
  PHONE: "Teléfono",
}

async function fetchOrders(params: URLSearchParams): Promise<{ data: Order[]; meta: { total: number } }> {
  const res = await fetch(`/api/v1/orders?${params}`)
  if (!res.ok) throw new Error("Error al cargar pedidos")
  return res.json()
}

export default function OrdersPage() {
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("ALL")
  const [channel, setChannel] = useState("ALL")
  const [cancelId, setCancelId] = useState<string | null>(null)
  const qc = useQueryClient()

  const params = new URLSearchParams({ limit: "50" })
  if (q) params.set("q", q)
  if (status !== "ALL") params.set("status", status)
  if (channel !== "ALL") params.set("channel", channel)

  const { data, isLoading } = useQuery({
    queryKey: ["orders", q, status, channel],
    queryFn: () => fetchOrders(params),
  })
  const orders = data?.data ?? []

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELED" }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error al cancelar")
    },
    onSuccess: () => {
      toast.success("Pedido cancelado")
      setCancelId(null)
      qc.invalidateQueries({ queryKey: ["orders"] })
    },
    onError: (e: Error) => {
      toast.error(e.message)
      setCancelId(null)
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            {data?.meta.total ?? 0} pedidos totales
          </p>
        </div>
        <Link href="/pos">
          <Button>Nueva venta (POS)</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 w-64"
            placeholder="Buscar N° pedido, cliente…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={channel} onValueChange={setChannel}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los canales</SelectItem>
            {Object.entries(CHANNEL_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                  <TableCell />
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No hay pedidos{q || status !== "ALL" ? " con esos filtros" : ""}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-sm">
                    #{o.orderNumber.slice(-8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {o.customer ? (
                      <div>
                        <p className="font-medium">{o.customer.name}</p>
                        {o.customer.phone && (
                          <p className="text-xs text-muted-foreground">{o.customer.phone}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin cliente</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{CHANNEL_LABELS[o.channel] ?? o.channel}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[o.status] ?? "outline"}>
                      {STATUS_LABELS[o.status] ?? o.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {o.items.length} {o.items.length === 1 ? "producto" : "productos"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${Number(o.total).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString("es-MX")}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/orders/${o.id}`}>
                        <Button size="icon" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {!["CANCELED", "REFUNDED", "DELIVERED"].includes(o.status) && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setCancelId(o.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cancel Confirm */}
      <AlertDialog open={!!cancelId} onOpenChange={(o) => !o && setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              El pedido será marcado como Cancelado. Esta acción no libera inventario automáticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, volver</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => cancelId && cancelMutation.mutate(cancelId)}
            >
              Cancelar pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
