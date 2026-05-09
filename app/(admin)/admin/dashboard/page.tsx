import Link from "next/link"
import { db } from "@/lib/db"
import { getFreshnessAlerts, getStockSummaries } from "@/lib/inventory"
import { APP_NAME } from "@/lib/constants"
import { AlertTriangle, Package, ShoppingCart, Truck } from "lucide-react"

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Bienvenido a {APP_NAME}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Variantes con stock
            </p>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold">{summaries.length}</p>
          <Link href="/admin/inventory" className="text-xs text-primary hover:underline">
            Ver inventario →
          </Link>
        </div>

        <div className={`rounded-lg border p-4 shadow-sm ${totalAlerts > 0 ? "bg-destructive/5 border-destructive/40" : "bg-card"}`}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Alertas de frescura
            </p>
            <AlertTriangle className={`h-4 w-4 ${criticalAlerts > 0 ? "text-destructive" : "text-yellow-500"}`} />
          </div>
          <p className={`text-2xl font-semibold ${criticalAlerts > 0 ? "text-destructive" : ""}`}>{totalAlerts}</p>
          <Link href="/admin/inventory" className="text-xs text-primary hover:underline">
            {criticalAlerts > 0 ? `${criticalAlerts} críticas →` : "Ver alertas →"}
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Pedidos pendientes
            </p>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold">{pendingOrders}</p>
          <Link href="/admin/orders" className="text-xs text-primary hover:underline">
            Ver pedidos →
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Entregas hoy
            </p>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold">{scheduledDeliveries}</p>
          <Link href="/admin/delivery" className="text-xs text-primary hover:underline">
            Ver entregas →
          </Link>
        </div>
      </div>

      {/* Freshness alerts table */}
      {alerts.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="flex items-center gap-2 px-4 py-3 border-b">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h2 className="font-medium text-sm">Alertas de frescura activas</h2>
          </div>
          <div className="divide-y">
            {alerts.slice(0, 5).map((a) => (
              <div key={a.lotId} className="flex items-center justify-between px-4 py-2 text-sm">
                <div>
                  <span className="font-medium">{a.productName}</span>
                  {a.lotNumber && (
                    <span className="text-muted-foreground ml-2">Lote {a.lotNumber}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{a.quantityCurrent.toFixed(0)} uds</span>
                  <span
                    className={`font-medium ${a.alertLevel === "critical" ? "text-destructive" : "text-yellow-600"}`}
                  >
                    {a.daysLeft !== null && a.daysLeft < 0
                      ? "Vencido"
                      : `${a.daysLeft}d restantes`}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {alerts.length > 5 && (
            <div className="px-4 py-2 border-t">
              <Link href="/admin/inventory" className="text-xs text-primary hover:underline">
                Ver todas las {alerts.length} alertas →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

