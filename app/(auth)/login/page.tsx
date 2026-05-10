"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "@/lib/auth-client"
import { loginSchema } from "@/lib/validators"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Datos inválidos")
      return
    }

    setLoading(true)
    const { error: authError } = await signIn.email({
      email: parsed.data.email,
      password: parsed.data.password,
      callbackURL: "/admin/dashboard",
    })

    if (authError) {
      setError("Credenciales incorrectas")
      setLoading(false)
      return
    }

    router.push("/admin/dashboard")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3">
        <Image src="/assets/Logo.png" alt="Alesli" width={160} height={80} className="object-contain" priority />
        <p className="text-muted-foreground text-sm">Inicia sesión en tu cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="text-destructive text-sm">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Iniciando sesión…" : "Iniciar sesión"}
        </Button>
      </form>
    </div>
  )
}
