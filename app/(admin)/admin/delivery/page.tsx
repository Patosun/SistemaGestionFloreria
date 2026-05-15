"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Search, X, Truck, MapPin, User } from "lucide-react"

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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { TablePagination, SortableHead } from "@/components/ui/data-table-controls"
import { PageShell, PageHeader, PageCard } from "@/components/admin/page-shell"
import { DELIVERY_SLOTS } from "@/lib/constants"

type StaffUser = { id: string; name: string; role: string }
type OrderInfo = {
  orderNumber: string; total: number; status: string
  customer: { id: string; name: string; phone: string | null } | null
}
type Delivery = {
  id: string; orderId: string; status: string; scheduledDate: string | null
  slot: string | null; zone: string | null; address: string
  notes: string | null; failureReason: string | null
  order: OrderInfo; assignedTo: { id: string; name: string } | null
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  ASSIGNED: "Asignada",
  PICKED_UP: "Recogida",
  IN_TRANSIT: "En camino",
  DELIVERED: "Entregada",
  FAILED: "Fallida",
  RETURNED: "Devuelta",
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  ASSIGNED: "secondary",
  PICKED_UP: "secondary",
  IN_TRANSIT: "default",
  DELIVERED: "default",
  FAILED: "destructive",
  RETURNED: "destructive",
}

const SLOT_MAP: Record<string, string> = Object.fromEntries(
  DELIVERY_SLOTS.map((s) => [s.value, s.label]),
)

const LIMIT = 20

function DeliveryInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const qc = useQueryClient()

  const q = searchParams.get("q") ?? ""
  const status = searchParams.get("status") ?? "ALL"
  const date = searchParams.get("date") ?? ""
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const sort = searchParams.get("sort") ?? "scheduledDate"
  const dir = (searchParams.get("dir") ?? "asc") as "asc" | "desc"

  const [inputQ, setInputQ] = useState(q)
  const [editDelivery, setEditDelivery] = useState<Delivery | null>(null)

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
    queryKey: ["deliveries", q, status, date, page, sort, dir],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), sort, dir })
      if (q) params.set("q", q)
      if (status !== "ALL") params.set("status", status)
      if (date) params.set("date", date)
      const res = await fetch(`/api/v1/deliveries?${params}`)
      if (!res.ok) throw new Error("Error al cargar entregas")
      return res.json() as Promise<{ data: Delivery[]; meta: { total: number } }>
    },
  })

  const { data: staffData } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const res = await fetch("/api/v1/staff")
      if (!res.ok) throw new Error("Error")
      return res.json() as Promise<{ data: StaffUser[] }>
    },
  })
  const staff = staffData?.data ?? []

  const deliveries = data?.data ?? []
  const total = data?.meta?.total ?? 0

  type UpdatePayload = { id: string; status?: string; assignedToId?: string | null; notes?: string | null; failureReason?: string | null; scheduledDate?: string | null; slot?: string | null }

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }: UpdatePayload) => {
      const res = await fetch(`/api/v1/deliveries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error al actualizar")
      return json
    },
    onSuccess: () => {
      toast.success("Entrega actualizada")
      setEditDelivery(null)
      qc.invalidateQueries({ queryKey: ["deliveries"] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  // Local state for edit dialog
  const [editStatus, setEditStatus] = useState("")
  const [editDriver, setEditDriver] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [editFailReason, setEditFailReason] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editSlot, setEditSlot] = useState("")

  function openEdit(d: Delivery) {
    setEditDelivery(d)
    setEditStatus(d.status)
    setEditDriver(d.assignedTo?.id ?? "")
    setEditNotes(d.notes ?? "")
    setEditFailReason(d.failureReason ?? "")
    setEditDate(d.scheduledDate ? d.scheduledDate.slice(0, 10) : "")
    setEditSlot(d.slot ?? "")
  }

  function handleSave() {
    if (!editDelivery) return
    updateMutation.mutate({
      id: editDelivery.id,
      status: editStatus,
      assignedToId: editDriver || null,
      notes: editNotes || null,
      failureReason: editFailReason || null,
      scheduledDate: editDate ? new Date(editDate).toISOString() : null,
      slot: editSlot || null,
    })
  }

  return (
    <PageShell>
      <PageHeader
        title="Entregas"
        description={`${total} entregas registradas`}
      />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 pr-8 w-64"
              placeholder="Buscar N° pedido, dirección…"
              value={inputQ}
              onChange={(e) => setInputQ(e.target.value)}
            />
            {inputQ && (
              <button type="button" onClick={() => { setInputQ(""); navigate({ q: "", page: "1" }) }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button type="submit" variant="outline" className="rounded-xl">Buscar</Button>
        </form>

        <Select value={status} onValueChange={(v) => navigate({ status: v, page: "1" })}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="w-44"
            value={date}
            onChange={(e) => navigate({ date: e.target.value, page: "1" })}
          />
          {date && (
            <button onClick={() => navigate({ date: "", page: "1" })} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <PageCard noPadding>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead>N° Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Dirección</TableHead>
              <SortableHead column="scheduledDate" currentSort={sort} currentDir={dir}>Fecha</SortableHead>
              <TableHead>Horario</TableHead>
              <SortableHead column="status" currentSort={sort} currentDir={dir}>Estado</SortableHead>
              <TableHead>Repartidor</TableHead>
              <TableHead className="text-right px-4">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: LIMIT }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 8 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
                ))
              : deliveries.length === 0
                ? <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">No hay entregas{q || status !== "ALL" ? " con esos filtros" : ""}</TableCell></TableRow>
                : deliveries.map((d) => (
                  <TableRow key={d.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-sm">
                      #{d.order.orderNumber.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      {d.order.customer
                        ? <div><p className="font-medium text-sm">{d.order.customer.name}</p>{d.order.customer.phone && <p className="text-xs text-muted-foreground">{d.order.customer.phone}</p>}</div>
                        : <span className="text-muted-foreground text-sm">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1 max-w-[180px]">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                        <span className="text-sm line-clamp-2">{d.address}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {d.scheduledDate
                        ? new Date(d.scheduledDate).toLocaleDateString("es-BO", { day: "2-digit", month: "short" })
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {d.slot ? SLOT_MAP[d.slot] ?? d.slot : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[d.status] ?? "outline"} className="rounded-full text-xs">
                        {STATUS_LABELS[d.status] ?? d.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {d.assignedTo
                        ? <div className="flex items-center gap-1 text-sm"><User className="h-3.5 w-3.5 text-muted-foreground" />{d.assignedTo.name}</div>
                        : <span className="text-muted-foreground text-sm">Sin asignar</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="rounded-lg text-xs" onClick={() => openEdit(d)}>
                        <Truck className="h-4 w-4 mr-1" />
                        Gestionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        <TablePagination page={page} total={total} limit={LIMIT} />
      </PageCard>

      {/* Edit / Assign Dialog */}
      <Dialog open={!!editDelivery} onOpenChange={(o) => !o && setEditDelivery(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              Gestionar entrega{editDelivery ? ` — #${editDelivery.order.orderNumber.slice(-8).toUpperCase()}` : ""}
            </DialogTitle>
          </DialogHeader>

          {editDelivery && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{editDelivery.address}</p>
                  {editDelivery.order.customer && (
                    <p>{editDelivery.order.customer.name}{editDelivery.order.customer.phone ? ` · ${editDelivery.order.customer.phone}` : ""}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Estado</label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Repartidor</label>
                  <Select value={editDriver} onValueChange={setEditDriver}>
                    <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin asignar</SelectItem>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Fecha programada</label>
                  <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Horario</label>
                  <Select value={editSlot} onValueChange={setEditSlot}>
                    <SelectTrigger><SelectValue placeholder="Sin horario" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin horario</SelectItem>
                      {DELIVERY_SLOTS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {editStatus === "FAILED" && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">Motivo de fallo</label>
                  <Input
                    placeholder="Describe el motivo…"
                    value={editFailReason}
                    onChange={(e) => setEditFailReason(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium">Notas internas</label>
                <Input
                  placeholder="Instrucciones adicionales…"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDelivery(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Guardando…" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

export default function DeliveryPage() {
  return <Suspense><DeliveryInner /></Suspense>
}
