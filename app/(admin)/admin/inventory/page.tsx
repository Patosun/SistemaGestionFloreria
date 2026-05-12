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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LotDialog } from "@/components/inventory/lot-dialog"
import { AdjustDialog } from "@/components/inventory/adjust-dialog"

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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-heading">Inventario</h1>
          <p className="text-sm text-muted-foreground">{total} lotes activos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setLotDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ingresar lote
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Variantes con stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summaries.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lotes activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card className={criticalCount > 0 ? "border-destructive" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{criticalCount}</p>
          </CardContent>
        </Card>
        <Card className={warningCount > 0 ? "border-yellow-500" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Advertencias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">{warningCount}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lots">
        <TabsList>
          <TabsTrigger value="lots">
            <Package className="mr-1 h-4 w-4" />
            Lotes
          </TabsTrigger>
          <TabsTrigger value="summary">Resumen por variante</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas
            {(criticalCount + warningCount) > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {criticalCount + warningCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Lots tab */}
        <TabsContent value="lots">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
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
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                          No hay lotes activos. Ingresa mercancía para comenzar.
                        </TableCell>
                      </TableRow>
                    )
                    : lots.map((lot) => {
                      const daysLeft = lot.expiresAt
                        ? Math.floor((new Date(lot.expiresAt).getTime() - Date.now()) / 86_400_000)
                        : null
                      return (
                        <TableRow key={lot.id}>
                          <TableCell className="font-medium">{lot.variant.product.name}</TableCell>
                          <TableCell className="font-mono text-sm">{lot.variant.sku}</TableCell>
                          <TableCell>{lot.lotNumber ?? <span className="text-muted-foreground">—</span>}</TableCell>
                          <TableCell>
                            <span className="font-medium">{Number(lot.quantityCurrent).toFixed(0)}</span>
                            <span className="text-muted-foreground text-xs"> / {Number(lot.quantityInitial).toFixed(0)}</span>
                          </TableCell>
                          <TableCell>${Number(lot.costPerUnit).toFixed(2)}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(lot.receivedAt).toLocaleDateString("es-MX")}
                          </TableCell>
                          <TableCell>
                            {daysLeft === null ? (
                              <span className="text-muted-foreground text-sm">—</span>
                            ) : daysLeft < 0 ? (
                              <Badge variant="destructive">Vencido</Badge>
                            ) : daysLeft <= 1 ? (
                              <Badge variant="destructive">{daysLeft}d</Badge>
                            ) : daysLeft <= 3 ? (
                              <Badge className="bg-yellow-500">{daysLeft}d</Badge>
                            ) : (
                              <span className="text-sm">{daysLeft}d</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{lot.supplier?.name ?? <span className="text-muted-foreground">—</span>}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
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
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
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
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                          Sin stock registrado
                        </TableCell>
                      </TableRow>
                    )
                    : summaries.map((s) => (
                      <TableRow key={s.variantId}>
                        <TableCell className="font-medium">{s.productName}</TableCell>
                        <TableCell className="font-mono text-sm">{s.variantSku}</TableCell>
                        <TableCell className="font-bold">{s.totalStock.toFixed(0)}</TableCell>
                        <TableCell>{s.activeLots}</TableCell>
                        <TableCell>
                          {s.nearExpiryLots > 0 ? (
                            <Badge className="bg-yellow-500">{s.nearExpiryLots}</Badge>
                          ) : "—"}
                        </TableCell>
                        <TableCell>
                          {s.expiredLots > 0 ? (
                            <Badge variant="destructive">{s.expiredLots}</Badge>
                          ) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Alerts tab */}
        <TabsContent value="alerts">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
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
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                          Sin alertas de frescura. ¡Todo en orden!
                        </TableCell>
                      </TableRow>
                    )
                    : alerts.map((a) => (
                      <TableRow key={a.lotId}>
                        <TableCell>
                          <Badge variant={a.alertLevel === "critical" ? "destructive" : "secondary"}
                            className={a.alertLevel === "warning" ? "bg-yellow-500 text-white" : ""}>
                            {a.alertLevel === "critical" ? "Crítico" : "Advertencia"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{a.productName}</TableCell>
                        <TableCell className="text-sm">{a.lotNumber ?? "—"}</TableCell>
                        <TableCell>{a.quantityCurrent.toFixed(0)}</TableCell>
                        <TableCell className="text-sm">
                          {a.expiresAt ? new Date(a.expiresAt).toLocaleDateString("es-MX") : "—"}
                        </TableCell>
                        <TableCell>
                          {a.daysLeft === null ? "—" : a.daysLeft < 0
                            ? <span className="text-destructive font-medium">Vencido ({Math.abs(a.daysLeft)}d)</span>
                            : <span className={a.daysLeft <= 1 ? "text-destructive font-medium" : "text-yellow-500 font-medium"}>
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
    </div>
  )
}
