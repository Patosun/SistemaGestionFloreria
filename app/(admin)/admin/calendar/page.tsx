"use client"

import { useState, Suspense } from "react"
import { useQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, MapPin, Package, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { DELIVERY_SLOTS } from "@/lib/constants"
import Link from "next/link"

const SLOT_MAP: Record<string, string> = Object.fromEntries(
  DELIVERY_SLOTS.map((s) => [s.value, s.label]),
)

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  CONFIRMED: "secondary",
  IN_PRODUCTION: "secondary",
  READY: "default",
  OUT_FOR_DELIVERY: "default",
  DELIVERED: "default",
  CANCELED: "destructive",
  REFUNDED: "destructive",
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  IN_PRODUCTION: "En producción",
  READY: "Listo",
  OUT_FOR_DELIVERY: "En camino",
  DELIVERED: "Entregado",
  CANCELED: "Cancelado",
  REFUNDED: "Reembolsado",
}

const DELIVERY_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  ASSIGNED: "Asignada",
  PICKED_UP: "Recogida",
  IN_TRANSIT: "En camino",
  DELIVERED: "Entregada",
  FAILED: "Fallida",
  RETURNED: "Devuelta",
}

type CalendarOrder = {
  id: string; orderNumber: string; scheduledDate: string; deliverySlot: string | null
  status: string; total: number
  customer: { name: string; phone: string | null } | null
  delivery: {
    id: string; status: string; address: string
    assignedTo: { name: string } | null
  } | null
}

type CalendarDelivery = {
  id: string; orderId: string; scheduledDate: string; slot: string | null
  status: string; address: string; zone: string | null
  assignedTo: { id: string; name: string } | null
  order: {
    orderNumber: string; total: number
    customer: { name: string; phone: string | null } | null
  }
}

function getMonthRange(year: number, month: number) {
  const from = new Date(year, month, 1)
  const to = new Date(year, month + 1, 0, 23, 59, 59)
  return { from: from.toISOString(), to: to.toISOString() }
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  // 0=Sun,1=Mon...6=Sat — shift to Mon=0
  const day = new Date(year, month, 1).getDay()
  return (day + 6) % 7 // Mon=0,Tue=1,...,Sun=6
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]
const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

function CalendarInner() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate())

  const { from, to } = getMonthRange(year, month)

  const { data, isLoading } = useQuery({
    queryKey: ["calendar", year, month],
    queryFn: async () => {
      const params = new URLSearchParams({ from, to })
      const res = await fetch(`/api/v1/calendar?${params}`)
      if (!res.ok) throw new Error("Error al cargar calendario")
      return res.json() as Promise<{ data: { orders: CalendarOrder[]; deliveries: CalendarDelivery[] } }>
    },
  })

  const orders: CalendarOrder[] = data?.data?.orders ?? []
  const deliveries: CalendarDelivery[] = data?.data?.deliveries ?? []

  // Build a map: day → events
  type DayEvent = { type: "order"; item: CalendarOrder } | { type: "delivery"; item: CalendarDelivery }
  const dayMap = new Map<number, DayEvent[]>()

  for (const o of orders) {
    const d = new Date(o.scheduledDate).getDate()
    if (!dayMap.has(d)) dayMap.set(d, [])
    dayMap.get(d)!.push({ type: "order", item: o })
  }
  // Deliveries with scheduledDate that differ from order's scheduledDate
  for (const d of deliveries) {
    if (!d.scheduledDate) continue
    const day = new Date(d.scheduledDate).getDate()
    // Avoid duplicates if the delivery's date matches the order's scheduledDate (already in orders)
    const alreadyShown = orders.find((o) => o.delivery?.id === d.id)
    if (!alreadyShown) {
      if (!dayMap.has(day)) dayMap.set(day, [])
      dayMap.get(day)!.push({ type: "delivery", item: d })
    }
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOffset = getFirstDayOfWeek(year, month)

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  const selectedEvents = selectedDay ? (dayMap.get(selectedDay) ?? []) : []
  const today = now.getFullYear() === year && now.getMonth() === month ? now.getDate() : null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold font-heading">Calendario</h1>
        <p className="text-sm text-muted-foreground">Pedidos y entregas programadas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar grid */}
        <div className="rounded-lg border bg-card">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-semibold text-base">
              {MONTH_NAMES[month]} {year}
            </h2>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 border-b">
            {DAY_NAMES.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {/* Empty offset cells */}
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`e-${i}`} className="border-b border-r min-h-[80px] bg-muted/20" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const events = dayMap.get(day) ?? []
              const isToday = today === day
              const isSelected = selectedDay === day
              const colIndex = (firstDayOffset + i) % 7
              const isLastCol = colIndex === 6

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={cn(
                    "border-b min-h-[80px] p-1.5 cursor-pointer transition-colors",
                    !isLastCol && "border-r",
                    isSelected && "bg-primary/5",
                    !isSelected && "hover:bg-muted/30",
                  )}
                >
                  <span className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium",
                    isToday && "bg-primary text-primary-foreground",
                    !isToday && "text-foreground",
                  )}>
                    {day}
                  </span>

                  {isLoading
                    ? day === 1 && <Skeleton className="h-3 w-full mt-1" />
                    : events.slice(0, 3).map((ev, ei) => (
                      <div
                        key={ei}
                        className={cn(
                          "mt-0.5 rounded px-1 py-0.5 text-[10px] leading-tight truncate",
                          ev.type === "order"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                            : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
                        )}
                      >
                        {ev.type === "order"
                          ? ev.item.customer?.name ?? `#${ev.item.orderNumber.slice(-6)}`
                          : `🚚 ${ev.item.order.customer?.name ?? ev.item.order.orderNumber.slice(-6)}`}
                      </div>
                    ))}
                  {events.length > 3 && (
                    <div className="mt-0.5 text-[10px] text-muted-foreground text-center">
                      +{events.length - 3} más
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 px-4 py-2 border-t text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded bg-blue-200" />Pedido</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded bg-green-200" />Entrega</span>
          </div>
        </div>

        {/* Side panel: selected day events */}
        <div className="rounded-lg border bg-card overflow-y-auto max-h-[600px]">
          <div className="sticky top-0 border-b bg-card px-4 py-3">
            <h3 className="font-medium text-sm">
              {selectedDay
                ? `${selectedDay} de ${MONTH_NAMES[month]}`
                : "Selecciona un día"}
            </h3>
            {selectedDay && (
              <p className="text-xs text-muted-foreground">{selectedEvents.length} evento{selectedEvents.length !== 1 ? "s" : ""}</p>
            )}
          </div>

          {!selectedDay ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Haz clic en un día del calendario para ver sus eventos
            </div>
          ) : selectedEvents.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Sin pedidos ni entregas este día
            </div>
          ) : (
            <div className="divide-y">
              {selectedEvents.map((ev, i) => (
                <div key={i} className="p-3 space-y-1.5">
                  {ev.type === "order" ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Package className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <Link href={`/admin/orders/${ev.item.id}`} className="text-sm font-medium hover:underline text-blue-700 dark:text-blue-300">
                          #{ev.item.orderNumber.slice(-8).toUpperCase()}
                        </Link>
                        <Badge variant={STATUS_VARIANT[ev.item.status] ?? "outline"} className="text-[10px] py-0 h-4 ml-auto">
                          {ORDER_STATUS_LABELS[ev.item.status] ?? ev.item.status}
                        </Badge>
                      </div>
                      {ev.item.customer && (
                        <p className="text-xs text-muted-foreground pl-5">{ev.item.customer.name}{ev.item.customer.phone ? ` · ${ev.item.customer.phone}` : ""}</p>
                      )}
                      <div className="flex items-center justify-between pl-5">
                        <span className="text-xs text-muted-foreground">
                          {ev.item.deliverySlot ? SLOT_MAP[ev.item.deliverySlot] ?? ev.item.deliverySlot : "Sin horario"}
                        </span>
                        <span className="text-xs font-medium">${Number(ev.item.total).toFixed(2)}</span>
                      </div>
                      {ev.item.delivery && (
                        <div className="pl-5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{ev.item.delivery.address}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        <span className="text-sm font-medium">
                          #{ev.item.order.orderNumber.slice(-8).toUpperCase()}
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0 h-4 ml-auto">
                          {DELIVERY_STATUS_LABELS[ev.item.status] ?? ev.item.status}
                        </Badge>
                      </div>
                      {ev.item.order.customer && (
                        <p className="text-xs text-muted-foreground pl-5">{ev.item.order.customer.name}{ev.item.order.customer.phone ? ` · ${ev.item.order.customer.phone}` : ""}</p>
                      )}
                      <div className="pl-5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{ev.item.address}</span>
                      </div>
                      {ev.item.assignedTo && (
                        <p className="text-xs text-muted-foreground pl-5">Repartidor: {ev.item.assignedTo.name}</p>
                      )}
                      <div className="pl-5 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {ev.item.slot ? SLOT_MAP[ev.item.slot] ?? ev.item.slot : "Sin horario"}
                        </span>
                        <span className="text-xs font-medium">${Number(ev.item.order.total).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  return <Suspense><CalendarInner /></Suspense>
}
