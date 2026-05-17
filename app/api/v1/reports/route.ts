import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { searchParams } = new URL(req.url)
  const rangeParam = searchParams.get("range") ?? "month" // month | week | year | custom
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")

  // ── Date range ─────────────────────────────────────────────────────────────
  const now = new Date()
  let from: Date
  let to: Date = new Date(now)
  to.setHours(23, 59, 59, 999)

  if (dateFrom && dateTo) {
    from = new Date(dateFrom)
    to = new Date(dateTo)
    to.setHours(23, 59, 59, 999)
  } else if (rangeParam === "week") {
    from = new Date(now)
    from.setDate(now.getDate() - 6)
    from.setHours(0, 0, 0, 0)
  } else if (rangeParam === "year") {
    from = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
  } else {
    // month (default)
    from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  }

  // Previous period (same length) for % change
  const periodMs = to.getTime() - from.getTime()
  const prevFrom = new Date(from.getTime() - periodMs - 1)
  const prevTo = new Date(from.getTime() - 1)

  // ── Parallel queries ───────────────────────────────────────────────────────
  const [
    ventasMes,
    ventasPrev,
    pedidosTotales,
    pedidosPrev,
    clientesNuevos,
    clientesPrev,
    productosActivos,
    ordersByStatus,
    topVariants,
    ventasPorDia,
    ventasPorCategoria,
  ] = await Promise.all([
    // Ventas (sum of completed payments) current period
    db.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "COMPLETED",
        paidAt: { gte: from, lte: to },
      },
    }),

    // Ventas previous period
    db.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "COMPLETED",
        paidAt: { gte: prevFrom, lte: prevTo },
      },
    }),

    // Pedidos current period
    db.order.count({
      where: { createdAt: { gte: from, lte: to } },
    }),

    // Pedidos previous period
    db.order.count({
      where: { createdAt: { gte: prevFrom, lte: prevTo } },
    }),

    // Clientes nuevos current period
    db.customer.count({
      where: { createdAt: { gte: from, lte: to } },
    }),

    // Clientes prev period
    db.customer.count({
      where: { createdAt: { gte: prevFrom, lte: prevTo } },
    }),

    // Productos activos (total, not date-filtered)
    db.product.count({ where: { isPublic: true } }),

    // Orders by status
    db.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: { createdAt: { gte: from, lte: to } },
    }),

    // Top 10 variants by revenue
    db.orderItem.groupBy({
      by: ["variantId"],
      _sum: { total: true, quantity: true },
      where: { order: { createdAt: { gte: from, lte: to } } },
      orderBy: { _sum: { total: "desc" } },
      take: 10,
    }),

    // Sales per day (for chart)
    db.order.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: "asc" },
    }),

    // Sales by category
    db.orderItem.findMany({
      where: { order: { createdAt: { gte: from, lte: to } } },
      select: {
        total: true,
        variant: {
          select: {
            product: {
              select: {
                category: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    }),
  ])

  // ── Enrich top variants with names ─────────────────────────────────────────
  const variantIds = topVariants.map((t) => t.variantId).filter(Boolean) as string[]
  const variantDetails = variantIds.length
    ? await db.productVariant.findMany({
        where: { id: { in: variantIds } },
        select: { id: true, sku: true, name: true, product: { select: { name: true } } },
      })
    : []
  const variantMap = new Map(variantDetails.map((v) => [v.id, v]))

  const top_products = topVariants.map((t) => {
    const detail = t.variantId ? variantMap.get(t.variantId) : null
    return {
      nombre: detail ? `${detail.product.name}${detail.name !== "Estándar" ? ` — ${detail.name}` : ""}` : "Desconocido",
      sku: detail?.sku ?? "-",
      vendidos: t._sum.quantity ?? 0,
      ingresos: Number(t._sum.total ?? 0),
    }
  })

  // ── % Change helper ────────────────────────────────────────────────────────
  function pctChange(current: number, prev: number) {
    if (prev === 0) return current > 0 ? 100 : 0
    return Math.round(((current - prev) / prev) * 1000) / 10
  }

  const ventasMesNum = Number(ventasMes._sum.amount ?? 0)
  const ventasPrevNum = Number(ventasPrev._sum.amount ?? 0)

  // ── Daily sales aggregation ────────────────────────────────────────────────
  const dailyMap = new Map<string, number>()
  for (const o of ventasPorDia) {
    const key = o.createdAt.toISOString().slice(0, 10)
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + Number(o.total))
  }
  const ventas_diarias = Array.from(dailyMap.entries()).map(([fecha, total]) => ({ fecha, total }))

  // ── Category aggregation ───────────────────────────────────────────────────
  const catMap = new Map<string, { nombre: string; total: number }>()
  for (const item of ventasPorCategoria) {
    const cat = item.variant?.product?.category
    const key = cat?.id ?? "sin-categoria"
    const nombre = cat?.name ?? "Sin categoría"
    const prev = catMap.get(key) ?? { nombre, total: 0 }
    catMap.set(key, { nombre, total: prev.total + Number(item.total) })
  }
  const ventas_categoria = Array.from(catMap.values()).sort((a, b) => b.total - a.total)

  // ── Status breakdown ───────────────────────────────────────────────────────
  const status_breakdown = ordersByStatus.reduce(
    (acc, s) => ({ ...acc, [s.status]: s._count._all }),
    {} as Record<string, number>,
  )

  return ok({
    periodo: { from: from.toISOString(), to: to.toISOString() },
    ventas_mes: ventasMesNum,
    ventas_mes_change: pctChange(ventasMesNum, ventasPrevNum),
    pedidos_totales: pedidosTotales,
    pedidos_change: pctChange(pedidosTotales, pedidosPrev),
    clientes_nuevos: clientesNuevos,
    clientes_change: pctChange(clientesNuevos, clientesPrev),
    productos_activos: productosActivos,
    top_products,
    ventas_diarias,
    ventas_categoria,
    status_breakdown,
  })
}