"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, CheckCircle, XCircle, Search, X } from "lucide-react"
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { TablePagination, SortableHead } from "@/components/ui/data-table-controls"

type Supplier = {
  id: string; name: string; contactName: string | null; email: string | null
  phone: string | null; isActive: boolean; _count: { lots: number; purchaseOrders: number }
}

const schema = z.object({
  name: z.string().min(1, "Requerido"),
  contactName: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.enum(["true", "false"]),
})
type FormValues = z.infer<typeof schema>

const LIMIT = 20

function SuppliersInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const q = searchParams.get("q") ?? ""
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const sort = searchParams.get("sort") ?? "name"
  const dir = (searchParams.get("dir") ?? "asc") as "asc" | "desc"

  const [inputQ, setInputQ] = useState(q)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)
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
    queryKey: ["suppliers", q, page, sort, dir],
    queryFn: async () => {
      const params = new URLSearchParams({ q, page: String(page), limit: String(LIMIT), sort, dir, includeInactive: "true" })
      const res = await fetch(`/api/v1/suppliers?${params}`)
      if (!res.ok) throw new Error("Error al cargar proveedores")
      return res.json() as Promise<{ data: Supplier[]; meta: { total: number } }>
    },
  })

  const suppliers = data?.data ?? []
  const total = data?.meta?.total ?? 0

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { name: "", contactName: "", email: "", phone: "", address: "", notes: "", isActive: "true" },
  })

  function openCreate() {
    setEditSupplier(null)
    form.reset({ name: "", contactName: "", email: "", phone: "", address: "", notes: "", isActive: "true" })
    setDialogOpen(true)
  }

  function openEdit(s: Supplier) {
    setEditSupplier(s)
    form.reset({ name: s.name, contactName: s.contactName ?? "", email: s.email ?? "", phone: s.phone ?? "", isActive: s.isActive ? "true" : "false" })
    setDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = { ...values, isActive: values.isActive === "true" }
      const url = editSupplier ? `/api/v1/suppliers/${editSupplier.id}` : "/api/v1/suppliers"
      const method = editSupplier ? "PATCH" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error")
      return json
    },
    onSuccess: () => {
      toast.success(editSupplier ? "Proveedor actualizado" : "Proveedor creado")
      queryClient.invalidateQueries({ queryKey: ["suppliers"] })
      setDialogOpen(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/suppliers/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error")
    },
    onSuccess: () => {
      toast.success("Proveedor eliminado")
      queryClient.invalidateQueries({ queryKey: ["suppliers"] })
      setDeleteId(null)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-heading">Proveedores</h1>
          <p className="text-sm text-muted-foreground">{total} proveedores registrados</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo proveedor
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 pr-8" placeholder="Buscar proveedores…" value={inputQ} onChange={(e) => setInputQ(e.target.value)} />
          {inputQ && (
            <button type="button" onClick={() => { setInputQ(""); navigate({ q: "", page: "1" }) }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
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
              <SortableHead column="name" currentSort={sort} currentDir={dir}>Nombre</SortableHead>
              <SortableHead column="contactName" currentSort={sort} currentDir={dir}>Contacto</SortableHead>
              <SortableHead column="email" currentSort={sort} currentDir={dir}>Email</SortableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Lotes</TableHead>
              <SortableHead column="isActive" currentSort={sort} currentDir={dir}>Estado</SortableHead>
              <TableHead className="text-right px-4">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
                ))
              : suppliers.length === 0
                ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">{q ? `Sin resultados para "${q}"` : "Sin proveedores. Agrega el primero."}</TableCell></TableRow>
                : suppliers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.contactName ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-sm">{s.email ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-sm">{s.phone ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell><Badge variant="secondary">{s._count.lots}</Badge></TableCell>
                    <TableCell>
                      {s.isActive
                        ? <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="h-4 w-4" />Activo</span>
                        : <span className="flex items-center gap-1 text-muted-foreground text-sm"><XCircle className="h-4 w-4" />Inactivo</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(s.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        <TablePagination page={page} total={total} limit={LIMIT} />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editSupplier ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nombre *</FormLabel><FormControl><Input placeholder="Flores del Valle S.A." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="contactName" render={({ field }) => (
                  <FormItem><FormLabel>Contacto</FormLabel><FormControl><Input placeholder="Juan Pérez" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="+52 55 1234 5678" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="contacto@proveedor.com" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>Notas</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Guardando..." : editSupplier ? "Guardar" : "Crear"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
            <AlertDialogDescription>Solo se puede eliminar si no tiene lotes registrados.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function SuppliersPage() {
  return <Suspense><SuppliersInner /></Suspense>
}
