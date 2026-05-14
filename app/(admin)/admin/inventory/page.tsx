"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, AlertTriangle, Package, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { LotDialog } from "@/components/inventory/lot-dialog"
import { AdjustDialog } from "@/components/inventory/adjust-dialog"
import { PageShell, PageHeader } from "@/components/admin/page-shell"

type StockSummary = {
  variantId: string
  variantSku: string
  variantName: string
  productId: string
  productName: string
  productSku: string
  totalStock: number
  activeLots: number
  nearExpiryLots: number
  expiredLots: number
}

type LotAlert = {
  lotId: string
  lotNumber: string | null
  variantId: string
  variantSku: string
  productName: string
  quantityCurrent: number
  expiresAt: string | null
  daysLeft: number | null
  alertLevel: "critical" | "warning" | "info"
}

type Lot = {
  id: string
  lotNumber: string | null
  quantityCurrent: string
  quantityInitial: string
  costPerUnit: string
  receivedAt: string
  expiresAt: string | null
  status: string
  variant: {
    sku: string
    name: string
    product: { sku: string; name: string }
  }
  supplier: { id: string; name: string } | null
  location: { id: string; name: string } | null
}

async function fetchSummary(): Promise<{ data: StockSummary[] }> {
  const res = await fetch("/api/v1/inventory?view=summary")
  if (!res.ok) throw new Error("Error al cargar inventario")
  return res.json()
}

async function fetchAlerts(): Promise<{ data: LotAlert[] }> {
  const res = await fetch("/api/v1/inventory?view=alerts&days=5")
  if (!res.ok) throw new Error("Error al cargar alertas")
  return res.json()
}

async function fetchLots(): Promise<{ data: Lot[]; meta: { total: number } }> {
  const res = await fetch("/api/v1/lots?limit=100&status=ACTIVE")
  if (!res.ok) throw new Error("Error al cargar lotes")
  return res.json()
}

export default function InventoryPage() {
  const [lotDialogOpen, setLotDialogOpen] = useState(false)
  const [adjustLotId, setAdjustLotId] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const summaryQuery = useQuery({ queryKey: ["inventory-summary"], queryFn: fetchSummary })
  const alertsQuery = useQuery({ queryKey: ["inventory-alerts"], queryFn: fetchAlerts })
  const lotsQuery = useQuery({ queryKey: ["lots"], queryFn: fetchLots })

  const summaries = summaryQuery.data?.data ?? []
  const alerts = alertsQuery.data?.data ?? []
  const lots = lotsQuery.data?.data ?? []
  const total = lotsQuery.data?.meta?.total ?? 0

  const criticalCount = alerts.filter((a) => a.alertLevel === "critical").length
  const warningCount = alerts.filter((a) => a.alertLevel === "warning").length

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["inventory-summary"] })
    queryClient.invalidateQueries({ queryKey: ["inventory-alerts"] })
    queryClient.invalidateQueries({ queryKey: ["lots"] })
  }

  return (
    <PageShell>
      <PageHeader
        title="Inventario"
        description={`${total} lotes activos`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-xl" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setLotDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ingresar lote
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/50 bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground mb-2">Variantes con stock</p>
          <p className="text-3xl font-bold">{summaries.length}</p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground mb-2">Lotes activos</p>
          <p className="text-3xl font-bold">{total}</p>
        </div>
        <div className={`rounded-2xl border p-5 ${criticalCount > 0 ? "border-destructive/40 bg-destructive/[0.03]" : "border-border/50 bg-card"}`}>
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />Críticos
          </p>
          <p className="text-3xl font-bold text-destructive">{criticalCount}</p>
        </div>
        <div className={`rounded-2xl border p-5 ${warningCount > 0 ? "border-yellow-400/40 bg-yellow-50/50 dark:bg-yellow-900/10" : "border-border/50 bg-card"}`}>
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />Advertencias
          </p>
          <p className="text-3xl font-bold text-yellow-500">{warningCount}</p>
        </div>
      </div>

      <Tabs defaultValue="lots">
        <TabsList className="rounded-xl">
          <TabsTrigger value="lots" className="rounded-lg">
            <Package className="mr-1 h-4 w-4" />
            Lotes
          </TabsTrigger>
          <TabsTrigger value="summary" className="rounded-lg">Resumen por variante</TabsTrigger>
          <TabsTrigger value="alerts" className="rounded-lg">
            Alertas
            {(criticalCount + warningCount) > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs rounded-full">
                {criticalCount + warningCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Lots tab */}
        <TabsContent value="lots">
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead>Producto</TableHead>
                  <TableHead>Variante SKU</TableHead>
                  <TableHead>Lote #</TableHead>
                  <TableHead>Stock actual</TableHead>
                  <TableHead>Costo/u</TableHead>
                  <TableHead>Recibido</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead className="text-right">Ajustar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lotsQuery.isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 9 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  : lots.length === 0
                    ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-14">
                          No hay lotes activos. Ingresa mercancía para comenzar.
                        </TableCell>
                      </TableRow>
                    )
                    : lots.map((lot) => {
                      const daysLeft = lot.expiresAt
                        ? Math.floor((new Date(lot.expiresAt).getTime() - Date.now()) / 86_400_000)
                        : null
                      return (
                        <TableRow key={lot.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium text-sm">{lot.variant.product.name}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{lot.variant.sku}</TableCell>
                          <TableCell className="text-sm">{lot.lotNumber ?? <span className="text-muted-foreground">—</span>}</TableCell>
                          <TableCell>
                            <span className="font-semibold text-sm">{Number(lot.quantityCurrent).toFixed(0)}</span>
                            <span className="text-muted-foreground text-xs"> / {Number(lot.quantityInitial).toFixed(0)}</span>
                          </TableCell>
                          <TableCell className="text-sm">Bs. {Number(lot.costPerUnit).toFixed(0)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(lot.receivedAt).toLocaleDateString("es-BO")}
                          </TableCell>
                          <TableCell>
                            {daysLeft === null ? (
                              <span className="text-muted-foreground text-xs">—</span>
                            ) : daysLeft < 0 ? (
                              <Badge variant="destructive" className="rounded-full text-xs">Vencido</Badge>
                            ) : daysLeft <= 1 ? (
                              <Badge variant="destructive" className="rounded-full text-xs">{daysLeft}d</Badge>
                            ) : daysLeft <= 3 ? (
                              <Badge className="bg-yellow-500 rounded-full text-xs">{daysLeft}d</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">{daysLeft}d</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{lot.supplier?.name ?? "—"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg text-xs"
                              onClick={() => setAdjustLotId(lot.id)}
                            >
                              Ajustar
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Summary tab */}
        <TabsContent value="summary">
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU Variante</TableHead>
                  <TableHead>Stock total</TableHead>
                  <TableHead>Lotes activos</TableHead>
                  <TableHead>Por vencer (≤2d)</TableHead>
                  <TableHead>Vencidos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaryQuery.isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  : summaries.length === 0
                    ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-14">
                          Sin stock registrado
                        </TableCell>
                      </TableRow>
                    )
                    : summaries.map((s) => (
                      <TableRow key={s.variantId} className="border-border/40 hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium text-sm">{s.productName}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{s.variantSku}</TableCell>
                        <TableCell className="font-bold text-sm">{s.totalStock.toFixed(0)}</TableCell>
                        <TableCell className="text-sm">{s.activeLots}</TableCell>
                        <TableCell>
                          {s.nearExpiryLots > 0 ? (
                            <Badge className="bg-yellow-500 rounded-full text-xs">{s.nearExpiryLots}</Badge>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </TableCell>
                        <TableCell>
                          {s.expiredLots > 0 ? (
                            <Badge variant="destructive" className="rounded-full text-xs">{s.expiredLots}</Badge>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Alerts tab */}
        <TabsContent value="alerts">
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead>Nivel</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead>Días restantes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertsQuery.isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  : alerts.length === 0
                    ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-14">
                          Sin alertas de frescura. ¡Todo en orden!
                        </TableCell>
                      </TableRow>
                    )
                    : alerts.map((a) => (
                      <TableRow key={a.lotId} className="border-border/40 hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <Badge
                            variant={a.alertLevel === "critical" ? "destructive" : "secondary"}
                            className={`rounded-full text-xs ${a.alertLevel === "warning" ? "bg-yellow-500 text-white" : ""}`}
                          >
                            {a.alertLevel === "critical" ? "Crítico" : "Advertencia"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{a.productName}</TableCell>
                        <TableCell className="text-sm">{a.lotNumber ?? "—"}</TableCell>
                        <TableCell className="text-sm">{a.quantityCurrent.toFixed(0)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {a.expiresAt ? new Date(a.expiresAt).toLocaleDateString("es-BO") : "—"}
                        </TableCell>
                        <TableCell>
                          {a.daysLeft === null ? <span className="text-muted-foreground text-xs">—</span> : a.daysLeft < 0
                            ? <span className="text-destructive font-semibold text-xs">Vencido ({Math.abs(a.daysLeft)}d)</span>
                            : <span className={`font-semibold text-xs ${a.daysLeft <= 1 ? "text-destructive" : "text-yellow-500"}`}>
                              {a.daysLeft}d
                            </span>}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <LotDialog
        open={lotDialogOpen}
        onOpenChange={setLotDialogOpen}
        onSuccess={refresh}
      />
      <AdjustDialog
        lotId={adjustLotId}
        onOpenChange={(open) => !open && setAdjustLotId(null)}
        onSuccess={refresh}
      />
    </PageShell>
  )
}
