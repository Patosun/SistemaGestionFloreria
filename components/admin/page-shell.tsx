"use client"

import { motion, type Variants } from "framer-motion"

const pageVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

interface PageShellProps {
  children: React.ReactNode
  className?: string
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <motion.div
      className={`flex flex-col gap-6 ${className ?? ""}`}
      variants={pageVariants}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-heading font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

interface PageCardProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function PageCard({ children, className, noPadding }: PageCardProps) {
  return (
    <div
      className={`rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden ${noPadding ? "" : "p-5"} ${className ?? ""}`}
    >
      {children}
    </div>
  )
}
