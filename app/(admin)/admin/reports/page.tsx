"use client"

import { Suspense, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  TrendingUp, ShoppingBag, Users, Package,
  ArrowUpRight, ArrowDownRight, RefreshCw,
  FileSpreadsheet, FileText, Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageShell, PageHeader, PageCard } from "@/components/admin/page-shell"

interface TopProduct { nombre: string; sku: string; vendidos: number; ingresos: number }
interface ReportsResponse {
  periodo: { from: string; to: string }
  ventas_mes: number; ventas_mes_change: number
  pedidos_totales: number; pedidos_change: number
  clientes_nuevos: number; clientes_change: number
  productos_activos: number
  top_products: TopProduct[]
  ventas_diarias: { fecha: string; total: number }[]
  ventas_categoria: { nombre: string; total: number }[]
  status_breakdown: Record<string, number>
}

function fmt(n: number) {
  return `Bs. ${Number(n).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function PctBadge({ change }: { change: number }) {
  const pos = change >= 0
  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${pos ? "text-emerald-500" : "text-destructive"}`}>
      {pos ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {pos ? "+" : ""}{change}%
      <span className="text-muted-foreground font-normal">vs anterior</span>
    </div>
  )
}

function exportExcel(data: ReportsResponse) {
  const lines: string[] = []
  lines.push("REPORTE DE VENTAS")
  lines.push(`Período,${data.periodo.from.slice(0,10)} al ${data.periodo.to.slice(0,10)}`)
  lines.push("")
  lines.push("RESUMEN GENERAL")
  lines.push("Métrica,Valor,Cambio %")
  lines.push(`Ventas del período,${data.ventas_mes.toFixed(2)},${data.ventas_mes_change}%`)
  lines.push(`Pedidos totales,${data.pedidos_totales},${data.pedidos_change}%`)
  lines.push(`Clientes nuevos,${data.clientes_nuevos},${data.clientes_change}%`)
  lines.push(`Productos activos,${data.productos_activos},`)
  lines.push("")
  lines.push("TOP PRODUCTOS")
  lines.push("Producto,SKU,Unidades vendidas,Ingresos (Bs.)")
  for (const p of data.top_products) lines.push(`"${p.nombre}",${p.sku},${p.vendidos},${p.ingresos.toFixed(2)}`)
  lines.push("")
  lines.push("VENTAS POR CATEGORÍA")
  lines.push("Categoría,Total (Bs.)")
  for (const c of data.ventas_categoria) lines.push(`"${c.nombre}",${c.total.toFixed(2)}`)
  lines.push("")
  lines.push("VENTAS DIARIAS")
  lines.push("Fecha,Total (Bs.)")
  for (const d of data.ventas_diarias) lines.push(`${d.fecha},${d.total.toFixed(2)}`)
  lines.push("")
  lines.push("PEDIDOS POR ESTADO")
  lines.push("Estado,Cantidad")
  for (const [s, n] of Object.entries(data.status_breakdown)) lines.push(`${s},${n}`)

  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = `reporte-${data.periodo.from.slice(0,10)}.csv`
  a.click()
}

function exportPDF(data: ReportsResponse) {
  const period = `${data.periodo.from.slice(0,10)} al ${data.periodo.to.slice(0,10)}`
  const topRows = data.top_products.length
    ? data.top_products.map((p,i)=>`<tr><td>${i+1}</td><td>${p.nombre}</td><td>${p.sku}</td><td style="text-align:right">${p.vendidos}</td><td style="text-align:right">Bs. ${p.ingresos.toLocaleString("es-BO",{minimumFractionDigits:2})}</td></tr>`).join("")
    : `<tr><td colspan="5" style="text-align:center;color:#888">Sin ventas en este período</td></tr>`
  const catRows = data.ventas_categoria.length
    ? data.ventas_categoria.map(c=>`<tr><td>${c.nombre}</td><td style="text-align:right">Bs. ${c.total.toLocaleString("es-BO",{minimumFractionDigits:2})}</td></tr>`).join("")
    : `<tr><td colspan="2" style="text-align:center;color:#888">Sin datos</td></tr>`
  const stRows = Object.entries(data.status_breakdown).length
    ? Object.entries(data.status_breakdown).map(([s,n])=>`<tr><td>${s}</td><td style="text-align:right">${n}</td></tr>`).join("")
    : `<tr><td colspan="2" style="text-align:center;color:#888">Sin pedidos</td></tr>`

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reporte</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;padding:32px;font-size:13px}
h1{font-size:22px;font-weight:700;margin-bottom:4px}.sub{color:#666;font-size:12px;margin-bottom:28px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px}
.card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px}
.cl{font-size:11px;color:#6b7280;margin-bottom:4px}.cv{font-size:20px;font-weight:700}
.cc{font-size:11px;margin-top:4px}.pos{color:#10b981}.neg{color:#ef4444}
h2{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#555;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin:20px 0 10px}
table{width:100%;border-collapse:collapse;font-size:12px}th{background:#f3f4f6;text-align:left;padding:8px 10px;font-weight:600}
td{padding:7px 10px;border-bottom:1px solid #f3f4f6}tr:last-child td{border-bottom:none}
.ft{margin-top:40px;font-size:10px;color:#9ca3af;text-align:center;border-top:1px solid #e5e7eb;padding-top:12px}
@media print{body{padding:0}}</style></head><body>
<h1>Reporte de Ventas</h1><p class="sub">Período: ${period} · Generado: ${new Date().toLocaleDateString("es-BO")}</p>
<div class="grid">
  <div class="card"><div class="cl">Ventas del período</div><div class="cv">Bs. ${data.ventas_mes.toLocaleString("es-BO",{minimumFractionDigits:2})}</div><div class="cc ${data.ventas_mes_change>=0?"pos":"neg"}">${data.ventas_mes_change>=0?"+":""}${data.ventas_mes_change}%</div></div>
  <div class="card"><div class="cl">Pedidos totales</div><div class="cv">${data.pedidos_totales}</div><div class="cc ${data.pedidos_change>=0?"pos":"neg"}">${data.pedidos_change>=0?"+":""}${data.pedidos_change}%</div></div>
  <div class="card"><div class="cl">Clientes nuevos</div><div class="cv">${data.clientes_nuevos}</div><div class="cc ${data.clientes_change>=0?"pos":"neg"}">${data.clientes_change>=0?"+":""}${data.clientes_change}%</div></div>
  <div class="card"><div class="cl">Productos activos</div><div class="cv">${data.productos_activos}</div></div>
</div>
<h2>Top productos por ingresos</h2>
<table><thead><tr><th>#</th><th>Producto</th><th>SKU</th><th style="text-align:right">Unidades</th><th style="text-align:right">Ingresos</th></tr></thead><tbody>${topRows}</tbody></table>
<h2>Ventas por categoría</h2>
<table><thead><tr><th>Categoría</th><th style="text-align:right">Total</th></tr></thead><tbody>${catRows}</tbody></table>
<h2>Pedidos por estado</h2>
<table><thead><tr><th>Estado</th><th style="text-align:right">Cantidad</th></tr></thead><tbody>${stRows}</tbody></table>
<div class="ft">Generado automáticamente · Sistema de gestión</div>
</body></html>`

  const win = window.open("","_blank")
  if(!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(()=>win.print(),400)
}

function ReportsInner() {
  const [range, setRange] = useState("month")

  const { data, isLoading, error, refetch, isFetching } = useQuery<ReportsResponse>({
    queryKey: ["reports-summary", range],
    queryFn: async () => {
      const res = await fetch(`/api/v1/reports?range=${range}`)
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? `Error ${res.status}`)
      }
      const json = await res.json()
      return json.data
    },
  })

  const rangeLabel: Record<string, string> = { week: "esta semana", month: "este mes", year: "este año" }
  const totalCat = data?.ventas_categoria.reduce((s, c) => s + c.total, 0) ?? 0

  if (error) return (
    <PageShell>
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
        <strong>Error:</strong> {error instanceof Error ? error.message : "Error desconocido"}
      </div>
    </PageShell>
  )

  return (
    <PageShell>
      <PageHeader
        title="Reportes"
        description="Resumen general del sistema"
        action={
          <div className="flex items-center gap-2">
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="h-9 w-36 rounded-xl gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="year">Este año</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" className="gap-2 rounded-xl" disabled={!data} onClick={() => data && exportExcel(data)}>
              <FileSpreadsheet className="h-4 w-4" />Excel
            </Button>
            <Button className="gap-2 rounded-xl" disabled={!data} onClick={() => data && exportPDF(data)}>
              <FileText className="h-4 w-4" />PDF
            </Button>
          </div>
        }
      />

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-32 rounded-2xl"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PageCard>
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-muted-foreground">Ventas del período</p><p className="mt-1 text-2xl font-semibold">{fmt(data?.ventas_mes??0)}</p></div>
              <div className="rounded-xl bg-primary/10 p-2 text-primary"><TrendingUp className="h-4 w-4"/></div>
            </div>
            <div className="mt-3"><PctBadge change={data?.ventas_mes_change??0}/></div>
          </PageCard>
          <PageCard>
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-muted-foreground">Pedidos totales</p><p className="mt-1 text-2xl font-semibold">{data?.pedidos_totales??0}</p></div>
              <div className="rounded-xl bg-primary/10 p-2 text-primary"><ShoppingBag className="h-4 w-4"/></div>
            </div>
            <div className="mt-3"><PctBadge change={data?.pedidos_change??0}/></div>
          </PageCard>
          <PageCard>
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-muted-foreground">Clientes nuevos</p><p className="mt-1 text-2xl font-semibold">{data?.clientes_nuevos??0}</p></div>
              <div className="rounded-xl bg-primary/10 p-2 text-primary"><Users className="h-4 w-4"/></div>
            </div>
            <div className="mt-3"><PctBadge change={data?.clientes_change??0}/></div>
          </PageCard>
          <PageCard>
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-muted-foreground">Productos activos</p><p className="mt-1 text-2xl font-semibold">{data?.productos_activos??0}</p></div>
              <div className="rounded-xl bg-primary/10 p-2 text-primary"><Package className="h-4 w-4"/></div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">Total publicados en catálogo</div>
          </PageCard>
        </div>
      )}

      {/* Middle row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PageCard>
          <h3 className="mb-2 text-sm font-medium">Ingresos {rangeLabel[range]??range}</h3>
          {isLoading ? <Skeleton className="h-10 w-40"/> : (
            <>
              <p className="text-3xl font-bold text-primary">{fmt(data?.ventas_mes??0)}</p>
              {(data?.ventas_mes??0)===0 && <p className="mt-2 text-sm text-muted-foreground">Sin ventas registradas aún.</p>}
            </>
          )}
        </PageCard>

        <PageCard>
          <h3 className="mb-3 text-sm font-medium">Por categoría</h3>
          {isLoading ? <Skeleton className="h-24"/> : data?.ventas_categoria.length ? (
            <div className="space-y-2">
              {data.ventas_categoria.slice(0,4).map(c=>{
                const pct = totalCat>0 ? Math.round((c.total/totalCat)*100) : 0
                return (
                  <div key={c.nombre}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium truncate">{c.nombre}</span>
                      <span className="text-muted-foreground ml-2">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{width:`${pct}%`}}/>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : <p className="text-sm text-muted-foreground">Sin ventas en este período.</p>}
        </PageCard>

        <PageCard>
          <h3 className="mb-3 text-sm font-medium">Pedidos por estado</h3>
          {isLoading ? <Skeleton className="h-24"/> : Object.keys(data?.status_breakdown??{}).length ? (
            <div className="space-y-1.5">
              {Object.entries(data!.status_breakdown).map(([s,n])=>(
                <div key={s} className="flex items-center justify-between text-sm">
                  <Badge variant="secondary" className="rounded-full text-xs font-normal">{s}</Badge>
                  <span className="font-medium tabular-nums">{n}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">Sin pedidos en este período.</p>}
        </PageCard>
      </div>

      {/* Top products */}
      <PageCard className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium">Productos más vendidos</h3>
          <Badge variant="secondary" className="rounded-full text-xs">{rangeLabel[range]??range}</Badge>
        </div>
        {isLoading ? (
          <div className="space-y-3">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-10"/>)}</div>
        ) : data?.top_products.length ? (
          <div className="divide-y divide-border/50">
            {data.top_products.map((p,i)=>(
              <div key={p.sku} className="flex items-center gap-4 py-3">
                <span className="w-5 text-sm font-semibold text-muted-foreground">{i+1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.nombre}</p>
                  <p className="font-mono text-xs text-muted-foreground">{p.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{fmt(p.ingresos)}</p>
                  <p className="text-xs text-muted-foreground">{p.vendidos} vendidos</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
            Sin ventas registradas en este período.
          </div>
        )}
      </PageCard>

      {/* Daily table */}
      {!isLoading && (data?.ventas_diarias.length??0)>0 && (
        <PageCard className="mt-6">
          <h3 className="mb-4 text-sm font-medium">Ventas diarias</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b">
                <th className="text-left pb-2 font-medium text-muted-foreground">Fecha</th>
                <th className="text-right pb-2 font-medium text-muted-foreground">Total</th>
              </tr></thead>
              <tbody>
                {data!.ventas_diarias.map(d=>(
                  <tr key={d.fecha} className="border-b border-border/50 last:border-0">
                    <td className="py-2">{d.fecha}</td>
                    <td className="py-2 text-right font-medium tabular-nums">{fmt(d.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageCard>
      )}
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