"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search, X, Building2, User } from "lucide-react"
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

type Customer = {
  id: string; name: string; email: string | null; phone: string | null
  address: string | null; notes: string | null; isB2B: boolean
  companyName: string | null; taxId: string | null; creditLimit: number | null
  totalSpent: number; orderCount: number; createdAt: string
}

const schema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  isB2B: z.enum(["true", "false"]),
  companyName: z.string().optional().or(z.literal("")),
  taxId: z.string().optional().or(z.literal("")),
  creditLimit: z.number().positive().optional().nullable(),
})
type FormValues = z.infer<typeof schema>

const LIMIT = 20

function CustomersInner() {
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
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
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
    queryKey: ["customers", q, page, sort, dir],
    queryFn: async () => {
      const params = new URLSearchParams({ q, page: String(page), limit: String(LIMIT), sort, dir })
      const res = await fetch(`/api/v1/customers?${params}`)
      if (!res.ok) throw new Error("Error al cargar clientes")
      return res.json() as Promise<{ data: Customer[]; meta: { total: number } }>
    },
  })

  const customers = data?.data ?? []
  const total = data?.meta?.total ?? 0

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { name: "", email: "", phone: "", address: "", notes: "", isB2B: "false", companyName: "", taxId: "", creditLimit: undefined },
  })

  function openCreate() {
    setEditCustomer(null)
    form.reset({ name: "", email: "", phone: "", address: "", notes: "", isB2B: "false", companyName: "", taxId: "", creditLimit: undefined })
    setDialogOpen(true)
  }

  function openEdit(c: Customer) {
    setEditCustomer(c)
    form.reset({
      name: c.name, email: c.email ?? "", phone: c.phone ?? "", address: c.address ?? "",
      notes: c.notes ?? "", isB2B: c.isB2B ? "true" : "false",
      companyName: c.companyName ?? "", taxId: c.taxId ?? "", creditLimit: c.creditLimit ?? undefined,
    })
    setDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        name: values.name, email: values.email || undefined, phone: values.phone || undefined,
        address: values.address || undefined, notes: values.notes || undefined,
        isB2B: values.isB2B === "true", companyName: values.companyName || undefined,
        taxId: values.taxId || undefined, creditLimit: values.creditLimit ?? undefined,
      }
      const url = editCustomer ? `/api/v1/customers/${editCustomer.id}` : "/api/v1/customers"
      const method = editCustomer ? "PUT" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error al guardar")
      return json
    },
    onSuccess: () => {
      toast.success(editCustomer ? "Cliente actualizado" : "Cliente creado")
      setDialogOpen(false)
      qc.invalidateQueries({ queryKey: ["customers"] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/customers/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error al eliminar")
    },
    onSuccess: () => { toast.success("Cliente eliminado"); setDeleteId(null); qc.invalidateQueries({ queryKey: ["customers"] }) },
    onError: (e: Error) => { toast.error(e.message); setDeleteId(null) },
  })

  return (
    <PageShell>
      <PageHeader
        title="Clientes"
        description={`${total} clientes registrados`}
        action={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Nuevo cliente</Button>}
      />

      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 pr-8 rounded-xl" placeholder="Buscar nombre, email, teléfono…" value={inputQ} onChange={(e) => setInputQ(e.target.value)} />
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
            <TableRow>
              <SortableHead column="name" currentSort={sort} currentDir={dir}>Cliente</SortableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Tipo</TableHead>
              <SortableHead column="orderCount" currentSort={sort} currentDir={dir} className="text-right">Pedidos</SortableHead>
              <SortableHead column="totalSpent" currentSort={sort} currentDir={dir} className="text-right">Total gastado</SortableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: LIMIT }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
                ))
              : customers.length === 0
                ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No hay clientes{q ? ` para "${q}"` : ""}</TableCell></TableRow>
                : customers.map((c) => (
                  <TableRow key={c.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          {c.isB2B ? <Building2 className="h-3.5 w-3.5 text-primary" /> : <User className="h-3.5 w-3.5 text-primary" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{c.name}</p>
                          {c.companyName && <p className="text-xs text-muted-foreground">{c.companyName}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        {c.email && <p className="text-foreground/80">{c.email}</p>}
                        {c.phone && <p className="text-muted-foreground">{c.phone}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {c.isB2B ? <Badge variant="secondary" className="rounded-full text-xs">B2B</Badge> : <Badge variant="outline" className="rounded-full text-xs">Minorista</Badge>}
                    </TableCell>
                    <TableCell className="text-right text-sm">{c.orderCount}</TableCell>
                    <TableCell className="text-right text-sm font-medium">Bs. {Number(c.totalSpent).toFixed(0)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        <TablePagination page={page} total={total} limit={LIMIT} />
      </PageCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editCustomer ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem className="col-span-2"><FormLabel>Nombre *</FormLabel><FormControl><Input placeholder="María García" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="mail@ejemplo.com" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="+52 55 0000 0000" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="isB2B" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...field}>
                        <option value="false">Minorista</option>
                        <option value="true">B2B / Empresa</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem><FormLabel>Empresa</FormLabel><FormControl><Input placeholder="Empresa S.A." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="taxId" render={({ field }) => (
                  <FormItem><FormLabel>RFC / RUC</FormLabel><FormControl><Input placeholder="XAXX010101000" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="creditLimit" render={({ field }) => (
                  <FormItem><FormLabel>Límite de crédito</FormLabel><FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)} />
                  </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem className="col-span-2"><FormLabel>Dirección</FormLabel><FormControl><Input placeholder="Calle, número, colonia…" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem className="col-span-2"><FormLabel>Notas</FormLabel><FormControl><Textarea rows={2} placeholder="Preferencias, observaciones…" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Guardando…" : "Guardar"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. Los clientes con pedidos no pueden eliminarse.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  )
}

export default function CustomersPage() {
  return <Suspense><CustomersInner /></Suspense>
}
