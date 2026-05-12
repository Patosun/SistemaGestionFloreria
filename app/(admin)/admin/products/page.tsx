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

type Variant = { id: string; sku: string; name: string; price: string; costPrice: string }
type Category = { id: string; name: string }
type Product = {
  id: string; sku: string; name: string; slug: string
  description?: string | null; categoryId?: string | null
  isPublic: boolean; isSeasonal: boolean; freshnessDays: number | null
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-heading">Productos</h1>
          <p className="text-sm text-muted-foreground">{total} productos en el catálogo</p>
        </div>
        <Button onClick={() => { setEditProduct(null); setDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo producto
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 pr-8"
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
        <Button type="submit" variant="outline">Buscar</Button>
      </form>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
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
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                      {q ? `Sin resultados para "${q}"` : "No hay productos"}
                    </TableCell>
                  </TableRow>
                )
                : products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">{p.sku}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.category?.name ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell><Badge variant="secondary">{p._count.variants}</Badge></TableCell>
                    <TableCell>
                      {p.freshnessDays
                        ? <span className="text-sm">{p.freshnessDays} días</span>
                        : <span className="text-muted-foreground text-sm">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {p.isPublic ? <Badge>Público</Badge> : <Badge variant="outline">Interno</Badge>}
                        {p.isSeasonal && <Badge variant="secondary">Temporada</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditProduct(p); setDialogOpen(true) }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(p.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        <TablePagination page={page} total={total} limit={LIMIT} />
      </div>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editProduct}
        onSuccess={() => qc.invalidateQueries({ queryKey: ["products"] })}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function ProductsPage() {
  return <Suspense><ProductsInner /></Suspense>
}
