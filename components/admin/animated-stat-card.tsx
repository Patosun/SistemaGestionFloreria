"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Package, AlertTriangle, ShoppingCart, Truck, TrendingUp, Users, Tag, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

const ICON_MAP = {
  Package, AlertTriangle, ShoppingCart, Truck, TrendingUp, Users, Tag, Layers,
} as const

export type StatIconName = keyof typeof ICON_MAP

const COLOR_MAP = {
  blue:   { bg: "bg-blue-500/10",   icon: "text-blue-500",   border: "hover:border-blue-200 dark:hover:border-blue-800" },
  purple: { bg: "bg-primary/10",    icon: "text-primary",    border: "hover:border-primary/30" },
  green:  { bg: "bg-emerald-500/10",icon: "text-emerald-500",border: "hover:border-emerald-200 dark:hover:border-emerald-800" },
  yellow: { bg: "bg-yellow-500/10", icon: "text-yellow-500", border: "hover:border-yellow-200 dark:hover:border-yellow-800" },
  red:    { bg: "bg-destructive/10", icon: "text-destructive",border: "hover:border-destructive/30" },
}

interface AnimatedStatCardProps {
  index: number
  title: string
  value: number
  icon: StatIconName
  href: string
  linkLabel: string
  color: keyof typeof COLOR_MAP
  highlight?: boolean
}

export function AnimatedStatCard({
  index,
  title,
  value,
  icon,
  href,
  linkLabel,
  color,
  highlight,
}: AnimatedStatCardProps) {
  const c = COLOR_MAP[color]
  const Icon = ICON_MAP[icon]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
    >
      <Link href={href} className="block group">
        <div
          className={cn(
            "rounded-2xl border border-border/50 bg-card p-5 transition-all duration-200 hover:shadow-md",
            c.border,
            highlight && "border-destructive/30 bg-destructive/[0.03]",
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", c.bg)}>
              <Icon className={cn("h-5 w-5", c.icon)} />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all duration-200" />
          </div>

          <p className="text-3xl font-bold tracking-tight mb-1">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.07 + 0.2 }}
            >
              {value}
            </motion.span>
          </p>
          <p className="text-xs text-muted-foreground font-medium mb-2">{title}</p>
          <span className={cn("text-xs font-medium", c.icon)}>{linkLabel} →</span>
        </div>
      </Link>
    </motion.div>
  )
}
