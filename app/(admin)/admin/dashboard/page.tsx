import Link from "next/link"
import { db } from "@/lib/db"
import { getFreshnessAlerts, getStockSummaries } from "@/lib/inventory"
import { AlertTriangle, Package, ShoppingCart, TrendingUp, ArrowRight, Clock } from "lucide-react"
import { AnimatedStatCard } from "@/components/admin/animated-stat-card"
import { DashboardShell } from "@/components/admin/dashboard-shell"

async function getDashboardData() {
  const [alerts, summaries, pendingOrders, scheduledDeliveries] = await Promise.all([
    getFreshnessAlerts(3).catch(() => []),
    getStockSummaries().catch(() => []),
    db.order.count({ where: { status: "PENDING" } }).catch(() => 0),
    db.delivery.count({
      where: {
        scheduledDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        status: { in: ["PENDING", "ASSIGNED", "IN_TRANSIT"] },
      },
    }).catch(() => 0),
  ])
  return { alerts, summaries, pendingOrders, scheduledDeliveries }
}

export default async function DashboardPage() {
  const { alerts, summaries, pendingOrders, scheduledDeliveries } = await getDashboardData()
  const criticalAlerts = alerts.filter((a) => a.alertLevel === "critical").length
  const totalAlerts = alerts.length

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Bienvenido al panel de administración de Aleslí
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 rounded-full px-3 py-1.5 border border-border/50">
          <Clock className="h-3 w-3" />
          <span>Actualizado ahora</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatedStatCard
          index={0}
          title="Variantes con stock"
          value={summaries.length}
          icon="Package"
          href="/admin/inventory"
          linkLabel="Ver inventario"
          color="blue"
        />
        <AnimatedStatCard
          index={1}
          title="Alertas de frescura"
          value={totalAlerts}
          icon="AlertTriangle"
          href="/admin/inventory"
          linkLabel={criticalAlerts > 0 ? `${criticalAlerts} críticas` : "Ver alertas"}
          color={criticalAlerts > 0 ? "red" : "yellow"}
          highlight={criticalAlerts > 0}
        />
        <AnimatedStatCard
          index={2}
          title="Pedidos pendientes"
          value={pendingOrders}
          icon="ShoppingCart"
          href="/admin/orders"
          linkLabel="Ver pedidos"
          color="purple"
        />
        <AnimatedStatCard
          index={3}
          title="Entregas hoy"
          value={scheduledDeliveries}
          icon="Truck"
          href="/admin/delivery"
          linkLabel="Ver entregas"
          color="green"
        />
      </div>

      {/* Quick links grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/products"
          className="group rounded-2xl border border-border/50 bg-card p-5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
          </div>
          <p className="font-semibold text-sm">Productos</p>
          <p className="text-xs text-muted-foreground mt-0.5">Gestionar catálogo</p>
        </Link>

        <Link
          href="/admin/orders"
          className="group rounded-2xl border border-border/50 bg-card p-5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
          </div>
          <p className="font-semibold text-sm">Pedidos</p>
          <p className="text-xs text-muted-foreground mt-0.5">Ver y gestionar órdenes</p>
        </Link>

        <Link
          href="/admin/delivery"
          className="group rounded-2xl border border-border/50 bg-card p-5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
          </div>
          <p className="font-semibold text-sm">Entregas</p>
          <p className="text-xs text-muted-foreground mt-0.5">Seguimiento en tiempo real</p>
        </Link>
      </div>

      {/* Freshness alerts */}
      {alerts.length > 0 && (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Alertas de frescura</h2>
                <p className="text-xs text-muted-foreground">{alerts.length} activas</p>
              </div>
            </div>
            <Link
              href="/admin/inventory"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/40">
            {alerts.slice(0, 5).map((a) => (
              <div key={a.lotId} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <span className="font-medium text-sm truncate block">{a.productName}</span>
                  {a.lotNumber && (
                    <span className="text-xs text-muted-foreground">Lote {a.lotNumber}</span>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <span className="text-xs text-muted-foreground">{a.quantityCurrent.toFixed(0)} uds</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      a.alertLevel === "critical"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                    }`}
                  >
                    {a.daysLeft !== null && a.daysLeft < 0
                      ? "Vencido"
                      : `${a.daysLeft}d restantes`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  )
}

