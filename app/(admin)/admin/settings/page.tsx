"use client"

import React, {
  useEffect,
  useState,
  Suspense,
} from "react"

import { toast } from "sonner"

import {
  Save,
  Store,
  Bell,
  Shield,
  Palette,
  Clock,
} from "lucide-react"

import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"

import { Textarea } from "@/components/ui/textarea"

import {
  PageShell,
  PageHeader,
  PageCard,
} from "@/components/admin/page-shell"

import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface SettingsTab {
  id: string
  label: string
  icon: React.ReactNode
}

interface BusinessForm {
  name: string
  phone: string
  email: string
  address: string
  city: string
  currency: string
}

// ─────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────

const TABS: SettingsTab[] = [
  {
    id: "business",
    label: "Negocio",
    icon: <Store className="h-4 w-4" />,
  },
  {
    id: "notifications",
    label: "Notificaciones",
    icon: <Bell className="h-4 w-4" />,
  },
  {
    id: "schedule",
    label: "Horarios",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: "appearance",
    label: "Apariencia",
    icon: <Palette className="h-4 w-4" />,
  },
  {
    id: "security",
    label: "Seguridad",
    icon: <Shield className="h-4 w-4" />,
  },
]

// ─────────────────────────────────────────────
// BUSINESS SETTINGS
// ─────────────────────────────────────────────

function BusinessSettings() {
  const [loading, setLoading] =
    useState(true)

  const form = useForm<BusinessForm>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      currency: "BOB",
    },
  })

  // CARGAR DATOS DESDE DB
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(
          "/api/settings"
        )

        const data = await res.json()

        form.reset({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          city: data.city || "",
          currency:
            data.currency || "BOB",
        })
      } catch {
        toast.error(
          "Error cargando configuración"
        )
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [form])

  // GUARDAR
  async function onSubmit(
    values: BusinessForm
  ) {
    try {
      const res = await fetch(
        "/api/settings",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(values),
        }
      )

      if (!res.ok) {
        throw new Error()
      }

      toast.success(
        "Configuración guardada"
      )
    } catch {
      toast.error(
        "Error al guardar"
      )
    }
  }

  if (loading) {
    return (
      <PageCard>
        <p>Cargando...</p>
      </PageCard>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          onSubmit
        )}
        className="space-y-6"
      >
        <PageCard>
          <h3 className="mb-5 text-sm font-medium">
            Información del negocio
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nombre
                  </FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Florería"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Moneda
                  </FormLabel>

                  <FormControl>
                    <select
                      {...field}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="BOB">
                        BOB
                      </option>

                      <option value="USD">
                        USD
                      </option>
                    </select>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Teléfono
                  </FormLabel>

                  <FormControl>
                    <Input
                      placeholder="+591"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email
                  </FormLabel>

                  <FormControl>
                    <Input
                      placeholder="correo@gmail.com"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>
                    Dirección
                  </FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Dirección"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>
                    Ciudad
                  </FormLabel>

                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="La Paz"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </PageCard>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="gap-2 rounded-xl"
          >
            <Save className="h-4 w-4" />
            Guardar cambios
          </Button>
        </div>
      </form>
    </Form>
  )
}

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────

function NotificationsSettings() {
  const [enabled, setEnabled] =
    useState(true)

  return (
    <PageCard>
      <h3 className="mb-5 text-sm font-medium">
        Notificaciones
      </h3>

      <div className="flex items-center justify-between">
        <span>
          Activar notificaciones
        </span>

        <button
          onClick={() =>
            setEnabled(!enabled)
          }
          className={cn(
            "h-5 w-10 rounded-full transition",
            enabled
              ? "bg-primary"
              : "bg-muted"
          )}
        />
      </div>
    </PageCard>
  )
}

// ─────────────────────────────────────────────
// SCHEDULE
// ─────────────────────────────────────────────

function ScheduleSettings() {
  return (
    <PageCard>
      <h3 className="text-sm font-medium">
        Horarios
      </h3>
    </PageCard>
  )
}

// ─────────────────────────────────────────────
// APPEARANCE
// ─────────────────────────────────────────────

function AppearanceSettings() {
  return (
    <PageCard>
      <h3 className="text-sm font-medium">
        Apariencia
      </h3>
    </PageCard>
  )
}

// ─────────────────────────────────────────────
// SECURITY
// ─────────────────────────────────────────────

function SecuritySettings() {
  return (
    <PageCard>
      <h3 className="mb-4 text-sm font-medium">
        Seguridad
      </h3>

      <Input
        type="password"
        placeholder="Nueva contraseña"
      />

      <Button className="mt-4 w-full gap-2 rounded-xl">
        <Save className="h-4 w-4" />
        Guardar contraseña
      </Button>
    </PageCard>
  )
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────

function SettingsInner() {
  const [activeTab, setActiveTab] =
    useState("business")

  const CONTENT: Record<
    string,
    React.ReactNode
  > = {
    business: <BusinessSettings />,
    notifications:
      <NotificationsSettings />,
    schedule: <ScheduleSettings />,
    appearance: <AppearanceSettings />,
    security: <SecuritySettings />,
  }

  return (
    <PageShell>
      <PageHeader
        title="Configuración"
        description="Configuración del sistema"
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* SIDEBAR */}
        <div className="shrink-0 lg:w-52">
          <nav className="flex gap-1 lg:flex-col">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id)
                }
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* CONTENT */}
        <div className="flex-1">
          {CONTENT[activeTab]}
        </div>
      </div>
    </PageShell>
  )
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <Suspense
      fallback={<div>Cargando...</div>}
    >
      <SettingsInner />
    </Suspense>
  )
}