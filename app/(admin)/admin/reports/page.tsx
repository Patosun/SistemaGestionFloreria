"use client"

import { Suspense } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import {
  PageShell,
  PageHeader,
  PageCard,
} from "@/components/admin/page-shell"

interface StatCard {
  label: string
  value: string
  change: number
  icon: React.ReactNode
}

interface TopProduct {
  nombre: string
  sku: string
  vendidos: number
  ingresos: number
}

interface ReportsResponse {
  ventas_mes: number
  pedidos_totales: number
  clientes_nuevos: number
  productos_activos: number
  top_products: TopProduct[]
}

function StatCardItem({ label, value, change, icon }: StatCard) {
  const isPositive = change >= 0

  return (
    <PageCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        <div className="rounded-xl bg-primary/10 p-2 text-primary">{icon}</div>
      </div>

      <div className="mt-3 flex items-center gap-1">
        {isPositive ? (
          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
        )}
        <span className={`text-xs font-medium ${isPositive ? "text-emerald-500" : "text-destructive"}`}>
          {isPositive ? "+" : ""}{change}%
        </span>
        <span className="text-xs text-muted-foreground">vs mes anterior</span>
      </div>
    </PageCard>
  )
}

function ReportsInner() {
  const { data, isLoading, error } = useQuery<ReportsResponse>({
    queryKey: ["reports-summary"],
    queryFn: async () => {
      const response = await fetch("http://localhost/hotel-app/api/reports/summary.php", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Error ${response.status}: ${text}`)
      }

      return response.json()
    },
  })

  const STAT_CARDS: StatCard[] = data
    ? [
        {
          label: "Ventas del mes",
          value: `Bs. ${Number(data.ventas_mes).toLocaleString()}`,
          change: 20.5,
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          label: "Pedidos totales",
          value: data.pedidos_totales.toString(),
          change: 21.6,
          icon: <ShoppingBag className="h-4 w-4" />,
        },
        {
          label: "Clientes nuevos",
          value: data.clientes_nuevos.toString(),
          change: 8.3,
          icon: <Users className="h-4 w-4" />,
        },
        {
          label: "Productos activos",
          value: data.productos_activos.toString(),
          change: -2.1,
          icon: <Package className="h-4 w-4" />,
        },
      ]
    : []

  if (error) {
    return (
      <PageShell>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {error instanceof Error ? error.message : "Error al cargar reportes"}
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title="Reportes"
        description="Resumen general del sistema"
        action={
          <Button variant="outline" className="gap-2 rounded-xl">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_CARDS.map((card) => (
            <StatCardItem key={card.label} {...card} />
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PageCard>
          <h3 className="mb-2 text-sm font-medium">Ventas mensuales</h3>
          <p className="text-3xl font-bold text-primary">
            Bs. {Number(data?.ventas_mes || 0).toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Incremento del 20.5% respecto al mes pasado.
          </p>
        </PageCard>

        <PageCard>
          <h3 className="mb-2 text-sm font-medium">Categoría más vendida</h3>
          <p className="text-2xl font-bold">Rosas</p>
          <Badge className="mt-3 rounded-full">38% del total</Badge>
        </PageCard>

        <PageCard>
          <h3 className="mb-2 text-sm font-medium">Pedidos completados</h3>
          <p className="text-3xl font-bold">{data?.pedidos_totales || 0}</p>
          <p className="mt-2 text-sm text-muted-foreground">98% entregados correctamente.</p>
        </PageCard>
      </div>

      <PageCard className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium">Productos más vendidos</h3>
          <Badge variant="secondary" className="rounded-full text-xs">
            Diciembre 2025
          </Badge>
        </div>

        <div className="divide-y divide-border/50">
          {data?.top_products?.map((product, index) => (
            <div key={product.sku} className="flex items-center gap-4 py-3">
              <span className="w-5 text-sm font-semibold text-muted-foreground">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{product.nombre}</p>
                <p className="font-mono text-xs text-muted-foreground">{product.sku}</p>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium">
                  Bs. {Number(product.ingresos).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{product.vendidos} vendidos</p>
              </div>
            </div>
          ))}
        </div>
      </PageCard>
    </PageShell>
  )
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ReportsInner />
    </Suspense>
  )
}