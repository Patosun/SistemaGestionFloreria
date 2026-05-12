import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  Truck,
  FlowerIcon,
  Clock,
} from "lucide-react"

const stats = [
  {
    label: "Ventas hoy",
    value: "Bs. 1,240.00",
    change: "+12% vs ayer",
    positive: true,
    icon: TrendingUp,
    color: "bg-pink-50 text-pink-600",
  },
  {
    label: "Pedidos pendientes",
    value: "8",
    change: "3 urgentes",
    positive: false,
    icon: ShoppingCart,
    color: "bg-purple-50 text-purple-600",
  },
  {
    label: "Alertas de inventario",
    value: "3",
    change: "Rosas rojas al 20%",
    positive: false,
    icon: AlertTriangle,
    color: "bg-rose-50 text-rose-600",
  },
  {
    label: "Entregas hoy",
    value: "5",
    change: "2 en camino",
    positive: true,
    icon: Truck,
    color: "bg-violet-50 text-violet-600",
  },
]

const recentOrders = [
  { id: "001", customer: "María López", product: "Ramo de rosas rojas", total: "Bs. 150.00", status: "CONFIRMED", channel: "POS" },
  { id: "002", customer: "Carlos Ríos", product: "Arreglo de girasoles", total: "Bs. 220.00", status: "IN_PRODUCTION", channel: "WHATSAPP" },
  { id: "003", customer: "Ana Flores", product: "Bouquet primaveral", total: "Bs. 180.00", status: "READY", channel: "POS" },
  { id: "004", customer: "Juan Mamani", product: "Corona fúnebre", total: "Bs. 350.00", status: "OUT_FOR_DELIVERY", channel: "PHONE" },
  { id: "005", customer: "Lucía Vargas", product: "Caja de rosas", total: "Bs. 280.00", status: "DELIVERED", channel: "POS" },
]

const inventoryAlerts = [
  { product: "Rosas rojas", stock: "12 tallos", level: "critical" },
  { product: "Girasoles", stock: "8 tallos", level: "critical" },
  { product: "Lilies blancos", stock: "25 tallos", level: "warning" },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING:           { label: "Pendiente",       className: "bg-yellow-100 text-yellow-700" },
  CONFIRMED:         { label: "Confirmado",       className: "bg-blue-100 text-blue-700" },
  IN_PRODUCTION:     { label: "En producción",    className: "bg-purple-100 text-purple-700" },
  READY:             { label: "Listo",            className: "bg-green-100 text-green-700" },
  OUT_FOR_DELIVERY:  { label: "En camino",        className: "bg-orange-100 text-orange-700" },
  DELIVERED:         { label: "Entregado",        className: "bg-gray-100 text-gray-700" },
}

export default function DashboardPage() {
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {greeting} — {now.toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
          <FlowerIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Aleslí · Naturalmente para ti</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </p>
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className={`text-xs mt-1 ${stat.positive ? "text-green-600" : "text-rose-500"}`}>
                {stat.change}
              </p>
            </div>
          )
        })}
      </div>

      {/* Contenido principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pedidos recientes */}
        <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="font-semibold text-sm">Pedidos recientes</h2>
            <span className="text-xs text-muted-foreground">Últimas 24 horas</span>
          </div>
          <div className="divide-y">
            {recentOrders.map((order) => {
              const status = statusConfig[order.status] ?? { label: order.status, className: "bg-gray-100 text-gray-700" }
              return (
                <div key={order.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    #{order.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{order.customer}</p>
                    <p className="text-xs text-muted-foreground truncate">{order.product}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{order.total}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Panel derecho */}
        <div className="space-y-6">
          {/* Alertas de inventario */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex items-center gap-2 px-5 py-4 border-b">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <h2 className="font-semibold text-sm">Alertas de inventario</h2>
            </div>
            <div className="divide-y">
              {inventoryAlerts.map((alert) => (
                <div key={alert.product} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${alert.level === "critical" ? "bg-rose-500" : "bg-yellow-400"}`} />
                    <p className="text-sm">{alert.product}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.stock}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actividad rápida */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex items-center gap-2 px-5 py-4 border-b">
              <Clock className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm">Acciones rápidas</h2>
            </div>
            <div className="p-4 space-y-2">
              {[
                { label: "Nueva venta en POS", href: "/pos", icon: ShoppingCart },
                { label: "Agregar producto", href: "/admin/products", icon: Package },
                { label: "Ver clientes", href: "/admin/customers", icon: Users },
                { label: "Ver entregas", href: "/admin/delivery", icon: Truck },
              ].map((action) => {
                const Icon = action.icon
                return (
                  
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    {action.label}
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}