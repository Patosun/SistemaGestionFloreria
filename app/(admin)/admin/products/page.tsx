"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductDialog } from "@/components/products/product-dialog"
import { TablePagination, SortableHead } from "@/components/ui/data-table-controls"
import { PageShell, PageHeader, PageCard } from "@/components/admin/page-shell"

type Variant = { id: string; sku: string; name: string; price: string; costPrice: string }
type Category = { id: string; name: string }
type Product = {
  id: string; sku: string; name: string; slug: string
  description?: string | null; categoryId?: string | null
  isPublic: boolean; isSeasonal: boolean; freshnessDays: number | null
  images: string[]; tags: string[]
  category: Category | null; variants: Variant[]; _count: { variants: number }
}

const LIMIT = 20

function ProductsInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const qc = useQueryClient()

  const q = searchParams.get("q") ?? ""
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const sort = searchParams.get("sort") ?? "name"
  const dir = (searchParams.get("dir") ?? "asc") as "asc" | "desc"

  const [inputQ, setInputQ] = useState(q)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => { setInputQ(q) }, [q])

  function navigate(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(overrides).forEach(([k, v]) => (v ? params.set(k, v) : params.delete(k)))
    router.push(`${pathname}?${params}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate({ q: inputQ, page: "1" })
  }

  function clearSearch() {
    setInputQ("")
    navigate({ q: "", page: "1" })
  }

  const { data, isLoading } = useQuery({
    queryKey: ["products", q, page, sort, dir],
    queryFn: async () => {
      const params = new URLSearchParams({ q, page: String(page), limit: String(LIMIT), sort, dir })
      const res = await fetch(`/api/v1/products?${params}`)
      if (!res.ok) throw new Error("Error al cargar productos")
      return res.json() as Promise<{ data: Product[]; meta: { total: number } }>
    },
  })

  const products = data?.data ?? []
  const total = data?.meta?.total ?? 0

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/products/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error al eliminar")
    },
    onSuccess: () => {
      toast.success("Producto eliminado")
      setDeleteId(null)
      qc.invalidateQueries({ queryKey: ["products"] })
    },
    onError: (e: Error) => { toast.error(e.message); setDeleteId(null) },
  })

  return (
    <PageShell>
      <PageHeader
        title="Productos"
        description={`${total} productos en el catálogo`}
        action={
          <Button onClick={() => { setEditProduct(null); setDialogOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo producto
          </Button>
        }
      />

      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 pr-8 rounded-xl"
            placeholder="Buscar por nombre o SKU…"
            value={inputQ}
            onChange={(e) => setInputQ(e.target.value)}
          />
          {inputQ && (
            <button type="button" onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button type="submit" variant="outline" className="rounded-xl">Buscar</Button>
      </form>

      <PageCard noPadding>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <SortableHead column="sku" currentSort={sort} currentDir={dir}>SKU</SortableHead>
              <SortableHead column="name" currentSort={sort} currentDir={dir}>Nombre</SortableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Variantes</TableHead>
              <TableHead>Frescura</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right px-4">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: LIMIT }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : products.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-14">
                      {q ? `Sin resultados para "${q}"` : "No hay productos aún"}
                    </TableCell>
                  </TableRow>
                )
                : products.map((p) => (
                  <TableRow key={p.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-sm">{p.category?.name ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell><Badge variant="secondary" className="rounded-full">{p._count.variants}</Badge></TableCell>
                    <TableCell>
                      {p.freshnessDays
                        ? <span className="text-sm">{p.freshnessDays}d</span>
                        : <span className="text-muted-foreground text-sm">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {p.isPublic
                          ? <Badge className="rounded-full text-xs">Público</Badge>
                          : <Badge variant="outline" className="rounded-full text-xs">Interno</Badge>}
                        {p.isSeasonal && <Badge variant="secondary" className="rounded-full text-xs">Temporada</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => { setEditProduct(p); setDialogOpen(true) }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(p.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        <TablePagination page={page} total={total} limit={LIMIT} />
      </PageCard>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editProduct}
        onSuccess={() => qc.invalidateQueries({ queryKey: ["products"] })}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 rounded-xl"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  )
}

export default function ProductsPage() {
  return <Suspense><ProductsInner /></Suspense>
}
