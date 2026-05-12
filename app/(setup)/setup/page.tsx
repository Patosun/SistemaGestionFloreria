"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Building2, User, ChevronRight, ChevronLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type FormData = {
  companyName: string
  companyPhone: string
  companyEmail: string
  companyAddress: string
  companyCity: string
  adminName: string
  adminEmail: string
  adminPassword: string
  adminPasswordConfirm: string
}

const EMPTY: FormData = {
  companyName: "",
  companyPhone: "",
  companyEmail: "",
  companyAddress: "",
  companyCity: "",
  adminName: "",
  adminEmail: "",
  adminPassword: "",
  adminPasswordConfirm: "",
}

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | "global", string>>>({})
  const [loading, setLoading] = useState(false)

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => { const next = { ...prev }; delete next[field]; delete next.global; return next })
  }

  // ── Step 1 validation ────────────────────────────────────────────────────
  function validateStep1(): boolean {
    const errs: typeof errors = {}
    if (!form.companyName.trim()) errs.companyName = "El nombre de la empresa es requerido"
    if (form.companyEmail && !/^\S+@\S+\.\S+$/.test(form.companyEmail))
      errs.companyEmail = "Email inválido"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Step 2 validation ────────────────────────────────────────────────────
  function validateStep2(): boolean {
    const errs: typeof errors = {}
    if (!form.adminName.trim()) errs.adminName = "El nombre es requerido"
    if (!form.adminEmail || !/^\S+@\S+\.\S+$/.test(form.adminEmail))
      errs.adminEmail = "Email inválido"
    if (form.adminPassword.length < 8) errs.adminPassword = "Mínimo 8 caracteres"
    if (form.adminPassword !== form.adminPasswordConfirm)
      errs.adminPasswordConfirm = "Las contraseñas no coinciden"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function goNext() {
    if (step === 1 && validateStep1()) setStep(2)
  }

  function goBack() {
    if (step === 2) setStep(1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateStep2()) return

    setLoading(true)
    try {
      const res = await fetch("/api/v1/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          companyPhone: form.companyPhone.trim() || null,
          companyEmail: form.companyEmail.trim() || null,
          companyAddress: form.companyAddress.trim() || null,
          companyCity: form.companyCity.trim() || null,
          adminName: form.adminName.trim(),
          adminEmail: form.adminEmail.trim(),
          adminPassword: form.adminPassword,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setErrors({ global: json.error ?? "Error al configurar el sistema" })
        return
      }

      setStep(3)
    } catch {
      setErrors({ global: "Error de conexión. Intenta de nuevo." })
    } finally {
      setLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-lg">
      {/* Card */}
      <div className="rounded-2xl border bg-card shadow-lg overflow-hidden">

        {/* Header */}
        <div className="bg-primary/5 border-b px-8 py-6 flex flex-col items-center gap-3">
          <Image
            src="/assets/Logo.png"
            alt="Alesli"
            width={140}
            height={56}
            className="object-contain"
            priority
          />
          <div className="text-center">
            <h1 className="text-xl font-semibold font-heading">Configuración inicial</h1>
            <p className="text-sm text-muted-foreground">
              Configura tu sistema antes de comenzar
            </p>
          </div>
        </div>

        {/* Step indicator */}
        {step !== 3 && (
          <div className="flex items-center px-8 pt-6 gap-3">
            {[
              { n: 1, label: "Empresa", icon: Building2 },
              { n: 2, label: "Administrador", icon: User },
            ].map(({ n, label, icon: Icon }, i) => (
              <div key={n} className="flex items-center gap-2 flex-1">
                <div className={cn(
                  "flex items-center gap-2 text-sm font-medium",
                  step === n ? "text-primary" : step > n ? "text-green-600" : "text-muted-foreground",
                )}>
                  <span className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold border-2 shrink-0",
                    step === n ? "border-primary bg-primary text-primary-foreground" :
                    step > n ? "border-green-600 bg-green-600 text-white" :
                    "border-muted-foreground/30 bg-transparent text-muted-foreground",
                  )}>
                    {step > n ? <CheckCircle className="h-4 w-4" /> : n}
                  </span>
                  <span className="hidden sm:block">{label}</span>
                </div>
                {i < 1 && (
                  <div className={cn(
                    "flex-1 h-px",
                    step > 1 ? "bg-green-600" : "bg-muted-foreground/20",
                  )} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Step 1: Company ── */}
        {step === 1 && (
          <div className="px-8 py-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="companyName">
                Nombre de la empresa <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                placeholder="Ej. Florería Alesli"
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                autoFocus
              />
              {errors.companyName && <p className="text-xs text-destructive">{errors.companyName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="companyPhone">Teléfono</Label>
                <Input
                  id="companyPhone"
                  placeholder="(55) 1234-5678"
                  value={form.companyPhone}
                  onChange={(e) => set("companyPhone", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="companyCity">Ciudad</Label>
                <Input
                  id="companyCity"
                  placeholder="La Paz"
                  value={form.companyCity}
                  onChange={(e) => set("companyCity", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="companyEmail">Email de contacto</Label>
              <Input
                id="companyEmail"
                type="email"
                placeholder="contacto@floreria.com"
                value={form.companyEmail}
                onChange={(e) => set("companyEmail", e.target.value)}
              />
              {errors.companyEmail && <p className="text-xs text-destructive">{errors.companyEmail}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="companyAddress">Dirección</Label>
              <Input
                id="companyAddress"
                placeholder="Calle 123, Col. Centro"
                value={form.companyAddress}
                onChange={(e) => set("companyAddress", e.target.value)}
              />
            </div>

            <div className="pt-2">
              <Button className="w-full" onClick={goNext}>
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Admin account ── */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="adminName">
                Nombre completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="adminName"
                placeholder="Juan García"
                value={form.adminName}
                onChange={(e) => set("adminName", e.target.value)}
                autoFocus
              />
              {errors.adminName && <p className="text-xs text-destructive">{errors.adminName}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adminEmail">
                Email del administrador <span className="text-destructive">*</span>
              </Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@floreria.com"
                value={form.adminEmail}
                onChange={(e) => set("adminEmail", e.target.value)}
              />
              {errors.adminEmail && <p className="text-xs text-destructive">{errors.adminEmail}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adminPassword">
                Contraseña <span className="text-destructive">*</span>
              </Label>
              <Input
                id="adminPassword"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={form.adminPassword}
                onChange={(e) => set("adminPassword", e.target.value)}
              />
              {errors.adminPassword && <p className="text-xs text-destructive">{errors.adminPassword}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adminPasswordConfirm">
                Confirmar contraseña <span className="text-destructive">*</span>
              </Label>
              <Input
                id="adminPasswordConfirm"
                type="password"
                placeholder="Repite la contraseña"
                value={form.adminPasswordConfirm}
                onChange={(e) => set("adminPasswordConfirm", e.target.value)}
              />
              {errors.adminPasswordConfirm && (
                <p className="text-xs text-destructive">{errors.adminPasswordConfirm}</p>
              )}
            </div>

            {errors.global && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
                <p className="text-sm text-destructive">{errors.global}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={goBack} disabled={loading}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Atrás
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Configurando…
                  </>
                ) : (
                  "Finalizar configuración"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* ── Step 3: Success ── */}
        {step === 3 && (
          <div className="px-8 py-10 flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-green-100 dark:bg-green-950 p-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">¡Sistema configurado!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Tu empresa <strong>{form.companyName}</strong> y el usuario administrador han sido creados exitosamente.
              </p>
            </div>
            <Button className="mt-2 w-full max-w-xs" onClick={() => router.push("/login")}>
              Ir al inicio de sesión
            </Button>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Este asistente solo aparece la primera vez que inicias el sistema.
      </p>
    </div>
  )
}
