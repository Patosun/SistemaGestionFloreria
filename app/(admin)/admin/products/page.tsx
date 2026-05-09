"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductDialog } from "@/components/products/product-dialog"

type Variant = { id: string; sku: string; name: string; price: string; costPrice: string }
type Category = { id: string; name: string }
type Product = {
  id: string
  sku: string
  name: string
  slug: string
  description?: string | null
  categoryId?: string | null
  isPublic: boolean
  isSeasonal: boolean
  freshnessDays: number | null
  category: Category | null
  variants: Variant[]
  _count: { variants: number }
}

async function fetchProducts(q: string): Promise<{ data: Product[]; meta: { total: number } }> {
  const res = await fetch(`/api/v1/products?q=${encodeURIComponent(q)}&limit=100`)
  if (!res.ok) throw new Error("Error al cargar productos")
  return res.json()
}

async function deleteProduct(id: string) {
  const res = await fetch(`/api/v1/products/${id}`, { method: "DELETE" })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? "Error al eliminar")
  return json
}

export default function ProductsPage() {
  const [query, setQuery] = useState("")
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () => fetchProducts(search),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Producto eliminado")
      queryClient.invalidateQueries({ queryKey: ["products"] })
      setDeleteId(null)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const products = data?.data ?? []
  const total = data?.meta?.total ?? 0

  function openCreate() {
    setEditProduct(null)
    setDialogOpen(true)
  }

  function openEdit(p: Product) {
    setEditProduct(p)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-heading">Productos</h1>
          <p className="text-sm text-muted-foreground">{total} productos en el catálogo</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre o SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearch(query)}
          />
        </div>
        <Button variant="outline" onClick={() => setSearch(query)}>
          Buscar
        </Button>
        {search && (
          <Button variant="ghost" onClick={() => { setSearch(""); setQuery("") }}>
            Limpiar
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Variantes</TableHead>
              <TableHead>Frescura</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : products.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                )
                : products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">{p.sku}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.category?.name ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p._count.variants}</Badge>
                    </TableCell>
                    <TableCell>
                      {p.freshnessDays ? (
                        <span className="text-sm">{p.freshnessDays} días</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {p.isPublic ? (
                          <Badge variant="default">Público</Badge>
                        ) : (
                          <Badge variant="outline">Interno</Badge>
                        )}
                        {p.isSeasonal && <Badge variant="secondary">Temporada</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(p.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit dialog */}
      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editProduct}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["products"] })}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto se eliminará permanentemente.
            </AlertDialogDescription>
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
