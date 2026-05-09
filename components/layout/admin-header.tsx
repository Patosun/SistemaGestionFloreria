"use client"

import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

interface AdminHeaderProps {
  user: { name: string; email: string; image?: string | null }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  async function handleSignOut() {
    await signOut()
    router.push("/login")
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Cambiar tema"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Cerrar sesión">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
