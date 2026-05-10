"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  CalendarDays,
  Truck,
  BarChart3,
  Settings,
  FlowerIcon,
  Store,
  ClipboardList,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ADMIN_ROLES } from "@/lib/constants"

const NAV_ITEMS = [
  { href: "/admin/dashboard",   label: "Dashboard",      icon: LayoutDashboard },
  { href: "/admin/products",    label: "Productos",      icon: Package },
  { href: "/admin/categories",  label: "Categorías",     icon: ClipboardList },
  { href: "/admin/suppliers",   label: "Proveedores",    icon: Truck },
  { href: "/admin/inventory",   label: "Inventario",     icon: FlowerIcon },
  { href: "/admin/orders",      label: "Pedidos",        icon: ShoppingCart },
  { href: "/admin/customers",   label: "Clientes",       icon: Users },
  { href: "/admin/calendar",    label: "Calendario",     icon: CalendarDays },
  { href: "/admin/delivery",    label: "Entregas",       icon: Truck },
  { href: "/admin/store",       label: "Tienda",         icon: Store },
  { href: "/admin/reports",     label: "Reportes",       icon: BarChart3 },
  { href: "/admin/settings",    label: "Configuración",  icon: Settings, adminOnly: true },
]

interface AdminSidebarProps {
  role: string
}

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname()
  const isAdmin = ADMIN_ROLES.includes(role as never)

  return (
    <aside className="flex w-60 flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center justify-center border-b px-4">
        <Image src="/assets/Logo.png" alt="Alesli" width={120} height={40} className="object-contain" priority />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* POS Link */}
      <div className="border-t p-3">
        <Link
          href="/pos"
          className="flex items-center justify-center gap-2 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Store className="h-4 w-4" />
          Abrir POS
        </Link>
      </div>
    </aside>
  )
}
