"use client"

import { useRouter, usePathname } from "next/navigation"
import { signOut } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { LogOut, Moon, Sun, ChevronRight, Home } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { motion } from "framer-motion"

const BREADCRUMB_LABELS: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  products: "Productos",
  categories: "Categorías",
  suppliers: "Proveedores",
  inventory: "Inventario",
  orders: "Pedidos",
  customers: "Clientes",
  calendar: "Calendario",
  delivery: "Entregas",
  reports: "Reportes",
  settings: "Configuración",
}

interface AdminHeaderProps {
  user: { name: string; email: string; image?: string | null }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const segments = pathname.split("/").filter(Boolean)
  const crumbs = segments.map((seg, i) => ({
    label: BREADCRUMB_LABELS[seg] ?? seg,
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }))

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  async function handleSignOut() {
    await signOut()
    router.push("/login")
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-sm px-5 gap-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm overflow-hidden">
        <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <Home className="h-3.5 w-3.5" />
        </Link>
        {crumbs.slice(1).map((crumb) => (
          <div key={crumb.href} className="flex items-center gap-1 min-w-0">
            <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
            {crumb.isLast ? (
              <span className="font-medium text-foreground truncate">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors truncate">
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-8 w-8 rounded-lg"
            aria-label="Cambiar tema"
          >
            <motion.div
              key={theme}
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </motion.div>
          </Button>
        </motion.div>

        {/* User avatar chip */}
        <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-1.5 border border-border/50">
          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
            {initials}
          </div>
          <span className="text-xs font-medium text-foreground hidden sm:block max-w-[120px] truncate">
            {user.name}
          </span>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </header>
  )
}
