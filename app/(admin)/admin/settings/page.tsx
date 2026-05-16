"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  Save, Store, Bell, Shield, Clock, Loader2,
  Eye, EyeOff, CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { PageShell, PageHeader, PageCard } from "@/components/admin/page-shell"
import { cn } from "@/lib/utils"

// Types 

interface CompanySettings {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
}

interface BusinessForm {
  name: string
  phone: string
  email: string
  address: string
  city: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// TABS

const TABS = [
  { id: "business", label: "Negocio", icon: <Store className="h-4 w-4" /> },
  { id: "notifications", label: "Notificaciones", icon: <Bell className="h-4 w-4" /> },
  { id: "schedule", label: "Horarios", icon: <Clock className="h-4 w-4" /> },
  { id: "security", label: "Seguridad", icon: <Shield className="h-4 w-4" /> },
] 

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  )
}

// configuracion de negocio

function BusinessSettings() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<CompanySettings>({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/v1/settings")
      if (!res.ok) throw new Error("Error al cargar configuración")
      const json = await res.json()
      return json.data
    },
  })

  const form = useForm<BusinessForm>({
    defaultValues: { name: "", phone: "", email: "", address: "", city: "" },
  })

  // Populate form once data loads
  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        address: data.address ?? "",
        city: data.city ?? "",
      })
    }
  }, [data, form])

  const mutation = useMutation({
    mutationFn: async (values: BusinessForm) => {
      const res = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error al guardar")
      return json.data
    },
    onSuccess: () => {
      toast.success("Configuración guardada")
      queryClient.invalidateQueries({ queryKey: ["settings"] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) {
    return (
      <PageCard>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
        </div>
      </PageCard>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
        <PageCard>
          <h3 className="mb-5 text-sm font-medium">Información del negocio</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "El nombre es requerido" }}
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nombre del negocio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Florería Aleslí" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="+591 70000000" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Calle, número, zona" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl>
                    <Input placeholder="La Paz" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </PageCard>

        <div className="flex justify-end">
          <Button type="submit" className="gap-2 rounded-xl" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {mutation.isPending ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

// Notificationes

function NotificationsSettings() {
  const [notifs, setNotifs] = useState({
    orders: true,
    lowStock: true,
    deliveries: true,
  })

  function row(label: string, sub: string, key: keyof typeof notifs) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        </div>
        <Toggle checked={notifs[key]} onChange={(v) => setNotifs((p) => ({ ...p, [key]: v }))} />
      </div>
    )
  }

  return (
    <PageCard>
      <h3 className="mb-4 text-sm font-medium">Preferencias de notificaciones</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Estas preferencias se guardan localmente en este dispositivo.
      </p>
      {row("Nuevos pedidos", "Recibir alerta al crear un pedido", "orders")}
      {row("Stock bajo", "Alertar cuando una variante tenga stock crítico", "lowStock")}
      {row("Entregas", "Notificar cambios de estado en entregas", "deliveries")}
      <div className="mt-5 flex justify-end">
        <Button
          className="gap-2 rounded-xl"
          onClick={() => toast.success("Preferencias guardadas")}
        >
          <Save className="h-4 w-4" />
          Guardar preferencias
        </Button>
      </div>
    </PageCard>
  )
}

// horario

function ScheduleSettings() {
  const [openTime, setOpenTime] = useState("09:00")
  const [closeTime, setCloseTime] = useState("21:00")
  const [timezone, setTimezone] = useState("America/La_Paz")

  const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
  const [activeDays, setActiveDays] = useState([true, true, true, true, true, true, false])

  function toggleDay(i: number) {
    setActiveDays((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
  }

  return (
    <div className="space-y-6">
      <PageCard>
        <h3 className="mb-4 text-sm font-medium">Horario de atención</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Apertura</label>
            <Input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Cierre</label>
            <Input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Zona horaria</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="America/La_Paz">América/La Paz (BOT -4)</option>
            <option value="America/Lima">América/Lima (PET -5)</option>
            <option value="America/Bogota">América/Bogotá (COT -5)</option>
            <option value="America/Santiago">América/Santiago (CLT -3/-4)</option>
            <option value="America/Argentina/Buenos_Aires">América/Buenos Aires (ART -3)</option>
            <option value="America/Mexico_City">América/Ciudad de México (CST -6)</option>
          </select>
        </div>
      </PageCard>

      <PageCard>
        <h3 className="mb-4 text-sm font-medium">Días de operación</h3>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day, i) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(i)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors",
                activeDays[i]
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {day}
            </button>
          ))}
        </div>
      </PageCard>

      <div className="flex justify-end">
        <Button className="gap-2 rounded-xl" onClick={() => toast.success("Horarios guardados")}>
          <Save className="h-4 w-4" />Guardar horarios
        </Button>
      </div>
    </div>
  )
}

// Seguridad

function SecuritySettings() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess] = useState(false)

  const form = useForm<PasswordForm>({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  const mutation = useMutation({
    mutationFn: async (values: PasswordForm) => {
      if (values.newPassword !== values.confirmPassword) {
        throw new Error("Las contraseñas nuevas no coinciden")
      }
      const res = await fetch("/api/v1/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error al cambiar contraseña")
      return json
    },
    onSuccess: () => {
      toast.success("Contraseña actualizada")
      form.reset()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
        <PageCard>
          <h3 className="mb-5 text-sm font-medium">Cambiar contraseña</h3>

          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Contraseña actualizada correctamente.
            </div>
          )}

          <div className="space-y-4">
            {/* Contraseña actual */}
            <FormField
              control={form.control}
              name="currentPassword"
              rules={{ required: "La contraseña actual es requerida" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña actual</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showCurrent ? "text" : "password"}
                        placeholder="••••••••"
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nueva contraseña */}
            <FormField
              control={form.control}
              name="newPassword"
              rules={{ required: "La nueva contraseña es requerida", minLength: { value: 8, message: "Mínimo 8 caracteres" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNew ? "text" : "password"}
                        placeholder="Mín. 8 caracteres"
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirmar contraseña */}
            <FormField
              control={form.control}
              name="confirmPassword"
              rules={{ required: "Confirma tu nueva contraseña" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar nueva contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repite la contraseña"
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            La contraseña debe tener al menos 8 caracteres.
          </p>
        </PageCard>

        <div className="flex justify-end">
          <Button type="submit" className="gap-2 rounded-xl" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {mutation.isPending ? "Guardando…" : "Actualizar contraseña"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

// Main 

function SettingsInner() {
  const [activeTab, setActiveTab] = useState("business")

  const CONTENT: Record<string, React.ReactNode> = {
    business: <BusinessSettings />,
    notifications: <NotificationsSettings />,
    schedule: <ScheduleSettings />,
    security: <SecuritySettings />,
  }

  return (
    <PageShell>
      <PageHeader title="Configuración" description="Ajusta los parámetros del sistema" />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <div className="shrink-0 lg:w-52">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">{CONTENT[activeTab]}</div>
      </div>
    </PageShell>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SettingsInner />
    </Suspense>
  )
}