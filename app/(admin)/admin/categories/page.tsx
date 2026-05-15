"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search, X } from "lucide-react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { TablePagination, SortableHead } from "@/components/ui/data-table-controls"
import { PageShell, PageHeader, PageCard } from "@/components/admin/page-shell"

type Category = {
  id: string; name: string; slug: string; description: string | null
  sortOrder: number; parent: { id: string; name: string } | null
  _count: { products: number }
}

const schema = z.object({
  name: z.string().min(1, "Requerido"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  description: z.string().optional(),
  sortOrder: z.number().int(),
})
type FormValues = z.infer<typeof schema>

const LIMIT = 20

function CategoriesInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const q = searchParams.get("q") ?? ""
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const sort = searchParams.get("sort") ?? "sortOrder"
  const dir = (searchParams.get("dir") ?? "asc") as "asc" | "desc"

  const [inputQ, setInputQ] = useState(q)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
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

  const { data, isLoading } = useQuery({
    queryKey: ["categories", q, page, sort, dir],
    queryFn: async () => {
      const params = new URLSearchParams({ q, page: String(page), limit: String(LIMIT), sort, dir })
      const res = await fetch(`/api/v1/categories?${params}`)
      if (!res.ok) throw new Error("Error al cargar categorías")
      return res.json() as Promise<{ data: Category[]; meta: { total: number } }>
    },
  })

  const categories = data?.data ?? []
  const total = data?.meta?.total ?? 0

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { name: "", slug: "", description: "", sortOrder: 0 },
  })

  function openCreate() {
    setEditCategory(null)
    form.reset({ name: "", slug: "", description: "", sortOrder: 0 })
    setDialogOpen(true)
  }

  function openEdit(c: Category) {
    setEditCategory(c)
    form.reset({ name: c.name, slug: c.slug, description: c.description ?? "", sortOrder: c.sortOrder })
    setDialogOpen(true)
  }

  function handleNameChange(value: string) {
    if (!editCategory) {
      const slug = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim()
      form.setValue("slug", slug)
    }
  }

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = editCategory ? `/api/v1/categories/${editCategory.id}` : "/api/v1/categories"
      const method = editCategory ? "PATCH" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error")
      return json
    },
    onSuccess: () => {
      toast.success(editCategory ? "Categoría actualizada" : "Categoría creada")
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setDialogOpen(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/categories/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error")
    },
    onSuccess: () => {
      toast.success("Categoría eliminada")
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setDeleteId(null)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <PageShell>
      <PageHeader
        title="Categorías"
        description={`${total} categorías registradas`}
        action={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Nueva categoría</Button>}
      />

      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 pr-8 rounded-xl" placeholder="Buscar categorías…" value={inputQ} onChange={(e) => setInputQ(e.target.value)} />
          {inputQ && (
            <button type="button" onClick={() => { setInputQ(""); navigate({ q: "", page: "1" }) }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
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
              <SortableHead column="name" currentSort={sort} currentDir={dir}>Nombre</SortableHead>
              <SortableHead column="slug" currentSort={sort} currentDir={dir}>Slug</SortableHead>
              <TableHead>Productos</TableHead>
              <SortableHead column="sortOrder" currentSort={sort} currentDir={dir}>Orden</SortableHead>
              <TableHead className="text-right px-4">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
                ))
              : categories.length === 0
                ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-14">{q ? `Sin resultados para "${q}"` : "Sin categorías. Crea la primera."}</TableCell></TableRow>
                : categories.map((c) => (
                  <TableRow key={c.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-sm">{c.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{c.slug}</TableCell>
                    <TableCell><Badge variant="secondary" className="rounded-full text-xs">{c._count.products}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.sortOrder}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        <TablePagination page={page} total={total} limit={LIMIT} />
      </PageCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editCategory ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Rosas" {...field} onChange={(e) => { field.onChange(e); handleNameChange(e.target.value) }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl><Input placeholder="rosas" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="sortOrder" render={({ field }) => (
                <FormItem>
                  <FormLabel>Orden</FormLabel>
                  <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Guardando..." : editCategory ? "Guardar" : "Crear"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>Solo se puede eliminar si no tiene productos asignados.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90 rounded-xl" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  )
}

export default function CategoriesPage() {
  return <Suspense><CategoriesInner /></Suspense>
}
