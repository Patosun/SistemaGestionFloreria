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
  name: string
  sku: string
  sold: number
  revenue: number
}

const TOP_PRODUCTS: TopProduct[] = [
  {
    name: "Ramo de Rosas Premium",
    sku: "ROS-001",
    sold: 142,
    revenue: 14200,
  },
  {
    name: "Arreglo Primaveral",
    sku: "ARR-003",
    sold: 98,
    revenue: 11760,
  },
  {
    name: "Bouquet Nupcial",
    sku: "BOU-007",
    sold: 76,
    revenue: 15200,
  },
]

function StatCardItem({
  label,
  value,
  change,
  icon,
}: StatCard) {
  const isPositive = change >= 0

  return (
    <PageCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-primary/10 p-2 text-primary">
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1">
        {isPositive ? (
          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
        )}

        <span
          className={`text-xs font-medium ${
            isPositive
              ? "text-emerald-500"
              : "text-destructive"
          }`}
        >
          {isPositive ? "+" : ""}
          {change}%
        </span>

        <span className="text-xs text-muted-foreground">
          vs mes anterior
        </span>
      </div>
    </PageCard>
  )
}

function ReportsInner() {
  const { isLoading } = useQuery({
    queryKey: ["reports-summary"],
    queryFn: async () => {
      return { ok: true }
    },
  })

  const STAT_CARDS: StatCard[] = [
    {
      label: "Ventas del mes",
      value: "Bs. 13,500",
      change: 20.5,
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      label: "Pedidos totales",
      value: "124",
      change: 21.6,
      icon: <ShoppingBag className="h-4 w-4" />,
    },
    {
      label: "Clientes nuevos",
      value: "38",
      change: 8.3,
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Productos activos",
      value: "86",
      change: -2.1,
      icon: <Package className="h-4 w-4" />,
    },
  ]

  return (
    <PageShell>
      <PageHeader
        title="Reportes"
        description="Resumen general del sistema"
        action={
          <Button
            variant="outline"
            className="gap-2 rounded-xl"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-32 rounded-2xl"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_CARDS.map((card) => (
            <StatCardItem
              key={card.label}
              {...card}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <PageCard>
          <h3 className="mb-2 text-sm font-medium">
            Ventas mensuales
          </h3>

          <p className="text-3xl font-bold text-primary">
            Bs. 13,500
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Incremento del 20.5% respecto al mes pasado.
          </p>
        </PageCard>

        <PageCard>
          <h3 className="mb-2 text-sm font-medium">
            Categoría más vendida
          </h3>

          <p className="text-2xl font-bold">
            Rosas
          </p>

          <Badge className="mt-3 rounded-full">
            38% del total
          </Badge>
        </PageCard>

        <PageCard>
          <h3 className="mb-2 text-sm font-medium">
            Pedidos completados
          </h3>

          <p className="text-3xl font-bold">
            124
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            98% entregados correctamente.
          </p>
        </PageCard>
      </div>

      <PageCard className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium">
            Productos más vendidos
          </h3>

          <Badge
            variant="secondary"
            className="rounded-full text-xs"
          >
            Diciembre 2025
          </Badge>
        </div>

        <div className="divide-y divide-border/50">
          {TOP_PRODUCTS.map((product, index) => (
            <div
              key={product.sku}
              className="flex items-center gap-4 py-3"
            >
              <span className="w-5 text-sm font-semibold text-muted-foreground">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {product.name}
                </p>

                <p className="font-mono text-xs text-muted-foreground">
                  {product.sku}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium">
                  Bs. {product.revenue.toLocaleString()}
                </p>

                <p className="text-xs text-muted-foreground">
                  {product.sold} vendidos
                </p>
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