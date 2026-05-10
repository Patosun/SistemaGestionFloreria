"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number
  total: number
  limit: number
}

export function TablePagination({ page, total, limit }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  function navigate(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    router.push(`${pathname}?${params}`)
  }

  return (
    <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
      <span>
        {total === 0
          ? "Sin resultados"
          : `Mostrando ${from}–${to} de ${total}`}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => navigate(page - 1)}
        >
          Anterior
        </Button>
        <span className="px-3 py-1 text-sm">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => navigate(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}

// ─── Sortable column header ───────────────────────────────────────────────────

interface SortableHeadProps {
  children: React.ReactNode
  column: string
  currentSort: string
  currentDir: "asc" | "desc"
  className?: string
}

export function SortableHead({
  children,
  column,
  currentSort,
  currentDir,
  className,
}: SortableHeadProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isActive = currentSort === column
  const nextDir = isActive && currentDir === "asc" ? "desc" : "asc"

  function handleSort() {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", column)
    params.set("dir", nextDir)
    params.set("page", "1")
    router.push(`${pathname}?${params}`)
  }

  return (
    <th
      className={cn(
        "h-10 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap",
        className,
      )}
      onClick={handleSort}
    >
      <div className="flex items-center gap-1">
        {children}
        {isActive ? (
          currentDir === "asc" ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
        )}
      </div>
    </th>
  )
}
