import { APP_NAME } from "@/lib/constants"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Bienvenido a {APP_NAME}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Ventas hoy", value: "$0.00" },
          { label: "Pedidos pendientes", value: "0" },
          { label: "Alertas de inventario", value: "0" },
          { label: "Entregas programadas", value: "0" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
