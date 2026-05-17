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
import { PageShell, PageHeader, PageCard } from "@/components/admin/page-shell"

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
    <PageShell>
      <PageHeader
        title="Proveedores"
        description={`${total} proveedores registrados`}
        action={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Nuevo proveedor</Button>}
      />

      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 pr-8 rounded-xl" placeholder="Buscar proveedores…" value={inputQ} onChange={(e) => setInputQ(e.target.value)} />
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
                ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-14">{q ? `Sin resultados para "${q}"` : "Sin proveedores. Agrega el primero."}</TableCell></TableRow>
                : suppliers.map((s) => (
                  <TableRow key={s.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-sm">{s.name}</TableCell>
                    <TableCell className="text-sm">{s.contactName ?? <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.email ?? <span>—</span>}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.phone ?? <span>—</span>}</TableCell>
                    <TableCell><Badge variant="secondary" className="rounded-full text-xs">{s._count.lots}</Badge></TableCell>
                    <TableCell>
                      {s.isActive
                        ? <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium"><CheckCircle className="h-3.5 w-3.5" />Activo</span>
                        : <span className="flex items-center gap-1.5 text-muted-foreground text-xs"><XCircle className="h-3.5 w-3.5" />Inactivo</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        <TablePagination page={page} total={total} limit={LIMIT} />
      </PageCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
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
                  <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="+591 70000000" {...field} /></FormControl><FormMessage /></FormItem>
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
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
            <AlertDialogDescription>Solo se puede eliminar si no tiene lotes registrados.</AlertDialogDescription>
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

export default function SuppliersPage() {
  return <Suspense><SuppliersInner /></Suspense>
}
