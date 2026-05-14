"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, type Variants } from "framer-motion"
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
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ADMIN_ROLES } from "@/lib/constants"

const NAV_GROUPS = [
  {
    label: "General",
    items: [
      { href: "/admin/dashboard",  label: "Dashboard",     icon: LayoutDashboard },
      { href: "/admin/orders",     label: "Pedidos",       icon: ShoppingCart },
      { href: "/admin/customers",  label: "Clientes",      icon: Users },
      { href: "/admin/calendar",   label: "Calendario",    icon: CalendarDays },
      { href: "/admin/delivery",   label: "Entregas",      icon: Truck },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/admin/products",   label: "Productos",     icon: Package },
      { href: "/admin/categories", label: "Categorías",    icon: ClipboardList },
      { href: "/admin/inventory",  label: "Inventario",    icon: FlowerIcon },
      { href: "/admin/suppliers",  label: "Proveedores",   icon: Truck },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin/reports",    label: "Reportes",      icon: BarChart3 },
      { href: "/admin/settings",   label: "Configuración", icon: Settings, adminOnly: true },
    ],
  },
]

const itemVariants: Variants = {
  initial: { x: -4, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -4, opacity: 0 },
}

interface AdminSidebarProps {
  role: string
}

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname()
  const isAdmin = ADMIN_ROLES.includes(role as never)

  return (
    <aside className="flex w-64 flex-col border-r border-border/50 bg-sidebar relative overflow-hidden">
      {/* Fondo decorativo sutil */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-primary/4 blur-2xl" />
      </div>

      {/* Logo */}
      <div className="relative flex h-16 items-center px-5 border-b border-border/50">
        <Image
          src="/assets/Logo.png"
          alt="Alesli"
          width={110}
          height={36}
          className="object-contain"
          priority
        />
        <div className="ml-auto">
          <span className="text-[10px] font-medium text-muted-foreground/60 bg-muted/60 px-1.5 py-0.5 rounded-full">
            Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => !(item as { adminOnly?: boolean }).adminOnly || isAdmin)
          if (visibleItems.length === 0) return null
          return (
            <div key={group.label}>
              <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map((item, i) => {
                  const Icon = item.icon
                  const active = pathname.startsWith(item.href)
                  return (
                    <motion.div
                      key={item.href}
                      variants={itemVariants}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                          active
                            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        {active && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute inset-0 rounded-xl bg-primary"
                            transition={{ type: "spring", stiffness: 400, damping: 35 }}
                            style={{ zIndex: -1 }}
                          />
                        )}
                        <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200", !active && "group-hover:scale-110")} />
                        <span className="flex-1">{item.label}</span>
                        {active && <ChevronRight className="h-3 w-3 opacity-60" />}
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* POS Link */}
      <div className="relative border-t border-border/50 p-3">
        <Link
          href="/pos"
          className="group flex items-center justify-center gap-2 rounded-xl bg-primary/10 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
        >
          <Store className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
          Abrir POS
        </Link>
      </div>
    </aside>
  )
}
