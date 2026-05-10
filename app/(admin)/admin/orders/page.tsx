"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Search, Eye, XCircle, X } from "lucide-react"
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
import { TablePagination, SortableHead } from "@/components/ui/data-table-controls"

type Order = {
  id: string; orderNumber: string; channel: string; status: string
  customer: { id: string; name: string; phone: string | null } | null
  createdBy: { id: string; name: string } | null
  items: { id: string; name: string; quantity: number; total: number }[]
  payments: { id: string; method: string; amount: number; status: string }[]
  subtotal: number; total: number; scheduledDate: string | null; createdAt: string
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente", CONFIRMED: "Confirmado", IN_PRODUCTION: "En producción",
  READY: "Listo", OUT_FOR_DELIVERY: "En camino", DELIVERED: "Entregado",
  CANCELED: "Cancelado", REFUNDED: "Reembolsado",
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline", CONFIRMED: "secondary", IN_PRODUCTION: "secondary",
  READY: "default", OUT_FOR_DELIVERY: "default", DELIVERED: "default",
  CANCELED: "destructive", REFUNDED: "destructive",
}

const CHANNEL_LABELS: Record<string, string> = {
  POS: "POS", ECOMMERCE: "E-commerce", CHATBOT: "Chatbot", PHONE: "Teléfono",
}

const LIMIT = 20

function OrdersInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const qc = useQueryClient()

  const q = searchParams.get("q") ?? ""
  const status = searchParams.get("status") ?? "ALL"
  const channel = searchParams.get("channel") ?? "ALL"
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const sort = searchParams.get("sort") ?? "createdAt"
  const dir = (searchParams.get("dir") ?? "desc") as "asc" | "desc"

  const [inputQ, setInputQ] = useState(q)
  const [cancelId, setCancelId] = useState<string | null>(null)

  useEffect(() => { setInputQ(q) }, [q])

  function navigate(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(overrides).forEach(([k, v]) => (v && v !== "ALL" ? params.set(k, v) : params.delete(k)))
    if (!overrides.page) params.set("page", "1")
    router.push(`${pathname}?${params}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate({ q: inputQ, page: "1" })
  }

  const { data, isLoading } = useQuery({
    queryKey: ["orders", q, status, channel, page, sort, dir],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), sort, dir })
      if (q) params.set("q", q)
      if (status !== "ALL") params.set("status", status)
      if (channel !== "ALL") params.set("channel", channel)
      const res = await fetch(`/api/v1/orders?${params}`)
      if (!res.ok) throw new Error("Error al cargar pedidos")
      return res.json() as Promise<{ data: Order[]; meta: { total: number } }>
    },
  })

  const orders = data?.data ?? []
  const total = data?.meta?.total ?? 0

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
    onError: (e: Error) => { toast.error(e.message); setCancelId(null) },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pedidos</h1>
          <p className="text-sm text-muted-foreground">{total} pedidos totales</p>
        </div>
        <Link href="/pos"><Button>Nueva venta (POS)</Button></Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 pr-8 w-64" placeholder="Buscar N° pedido, cliente…" value={inputQ} onChange={(e) => setInputQ(e.target.value)} />
            {inputQ && (
              <button type="button" onClick={() => { setInputQ(""); navigate({ q: "", page: "1" }) }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button type="submit" variant="outline">Buscar</Button>
        </form>

        <Select value={status} onValueChange={(v) => navigate({ status: v, page: "1" })}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={channel} onValueChange={(v) => navigate({ channel: v, page: "1" })}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Canal" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los canales</SelectItem>
            {Object.entries(CHANNEL_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead column="orderNumber" currentSort={sort} currentDir={dir}>N° Pedido</SortableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Canal</TableHead>
              <SortableHead column="status" currentSort={sort} currentDir={dir}>Estado</SortableHead>
              <TableHead>Productos</TableHead>
              <SortableHead column="total" currentSort={sort} currentDir={dir} className="text-right">Total</SortableHead>
              <SortableHead column="createdAt" currentSort={sort} currentDir={dir}>Fecha</SortableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: LIMIT }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 8 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
                ))
              : orders.length === 0
                ? <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No hay pedidos{q || status !== "ALL" ? " con esos filtros" : ""}</TableCell></TableRow>
                : orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-sm">#{o.orderNumber.slice(-8).toUpperCase()}</TableCell>
                    <TableCell>
                      {o.customer
                        ? <div><p className="font-medium">{o.customer.name}</p>{o.customer.phone && <p className="text-xs text-muted-foreground">{o.customer.phone}</p>}</div>
                        : <span className="text-muted-foreground text-sm">Sin cliente</span>}
                    </TableCell>
                    <TableCell><Badge variant="outline">{CHANNEL_LABELS[o.channel] ?? o.channel}</Badge></TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[o.status] ?? "outline"}>{STATUS_LABELS[o.status] ?? o.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{o.items.length} {o.items.length === 1 ? "producto" : "productos"}</TableCell>
                    <TableCell className="text-right font-medium">${Number(o.total).toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("es-MX")}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/orders/${o.id}`}><Button size="icon" variant="ghost"><Eye className="h-4 w-4" /></Button></Link>
                        {!["CANCELED", "REFUNDED", "DELIVERED"].includes(o.status) && (
                          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setCancelId(o.id)}><XCircle className="h-4 w-4" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        <TablePagination page={page} total={total} limit={LIMIT} />
      </div>

      <AlertDialog open={!!cancelId} onOpenChange={(o) => !o && setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar pedido?</AlertDialogTitle>
            <AlertDialogDescription>El pedido será marcado como Cancelado. Esta acción no libera inventario automáticamente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, volver</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => cancelId && cancelMutation.mutate(cancelId)}>Cancelar pedido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function OrdersPage() {
  return <Suspense><OrdersInner /></Suspense>
}
