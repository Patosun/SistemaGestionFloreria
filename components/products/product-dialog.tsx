"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useForm, useFieldArray } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUploader } from "@/components/products/image-uploader"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = { id: string; name: string }
type Variant = { id: string; sku: string; name: string; price: string; costPrice: string }
type Product = {
  id: string
  sku: string
  name: string
  slug: string
  description?: string | null
  categoryId?: string | null
  freshnessDays?: number | null
  isSeasonal: boolean
  isPublic: boolean
  images: string[]
  tags: string[]
  variants: Variant[]
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const variantSchema = z.object({
  sku: z.string().min(1, "Requerido"),
  name: z.string().min(1, "Requerido"),
  price: z.number().positive("Debe ser positivo"),
  costPrice: z.number().positive("Debe ser positivo"),
})

const formSchema = z.object({
  sku: z.string().min(1, "Requerido"),
  name: z.string().min(1, "Requerido"),
  slug: z
    .string()
    .min(1, "Requerido")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  freshnessDays: z.number().int().positive().optional().or(z.literal("")),
  isSeasonal: z.enum(["true", "false"]),
  isPublic: z.enum(["true", "false"]),
  images: z.array(z.string()),
  tags: z.array(z.string()),
  variants: z.array(variantSchema).min(1, "Al menos una variante"),
})

type FormValues = z.infer<typeof formSchema>

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onSuccess: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductDialog({ open, onOpenChange, product, onSuccess }: ProductDialogProps) {
  const isEdit = !!product
  const [tagInput, setTagInput] = useState("")

  const { data: categoriesData } = useQuery<{ data: Category[] }>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/v1/categories").then((r) => r.json()),
  })
  const categories = categoriesData?.data ?? []

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      sku: "",
      name: "",
      slug: "",
      description: "",
      categoryId: undefined,
      freshnessDays: "",
      isSeasonal: "false",
      isPublic: "true",
      images: [],
      tags: [],
      variants: [{ sku: "", name: "Estándar", price: 0, costPrice: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "variants" })

  // Fill form when editing
  useEffect(() => {
    if (open) {
      setTagInput("")
      if (product) {
        form.reset({
          sku: product.sku,
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          categoryId: product.categoryId ?? undefined,
          freshnessDays: product.freshnessDays ?? "",
          isSeasonal: product.isSeasonal ? "true" : "false",
          isPublic: product.isPublic ? "true" : "false",
          images: product.images ?? [],
          tags: product.tags ?? [],
          variants: product.variants.map((v) => ({
            sku: v.sku,
            name: v.name,
            price: Number(v.price),
            costPrice: Number(v.costPrice),
          })),
        })
      } else {
        form.reset({
          sku: "",
          name: "",
          slug: "",
          description: "",
          categoryId: undefined,
          freshnessDays: "",
          isSeasonal: "false",
          isPublic: "true",
          images: [],
          tags: [],
          variants: [{ sku: "", name: "Estándar", price: 0, costPrice: 0 }],
        })
      }
    }
  }, [open, product, form])

  // Auto-generate slug from name
  function handleNameChange(value: string) {
    if (!isEdit) {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
      form.setValue("slug", slug)
    }
  }

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        sku: values.sku,
        name: values.name,
        slug: values.slug,
        description: values.description || undefined,
        categoryId: values.categoryId || undefined,
        freshnessDays: values.freshnessDays ? Number(values.freshnessDays) : undefined,
        isSeasonal: values.isSeasonal === "true",
        isPublic: values.isPublic === "true",
        images: values.images,
        tags: values.tags,
        variants: values.variants.map((v) => ({
          ...v,
          isActive: true,
        })),
      }

      const url = isEdit ? `/api/v1/products/${product!.id}` : "/api/v1/products"
      const method = isEdit ? "PATCH" : "POST"
      const body = isEdit
        ? { ...payload, variants: undefined }
        : payload

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error al guardar")
      return json
    },
    onSuccess: () => {
      toast.success(isEdit ? "Producto actualizado" : "Producto creado")
      onOpenChange(false)
      onSuccess()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar producto" : "Nuevo producto"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="ROSA-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="freshnessDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días de frescura</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="7" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Rosa roja premium"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        handleNameChange(e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (URL)</FormLabel>
                  <FormControl>
                    <Input placeholder="rosa-roja-premium" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sin categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibilidad</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Público</SelectItem>
                          <SelectItem value="false">Interno</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isSeasonal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temporada</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="false">No</SelectItem>
                          <SelectItem value="true">Sí</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Descripción del producto..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Images */}
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imágenes del producto</FormLabel>
                  <FormControl>
                    <ImageUploader value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiquetas</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ej: romántico, rosa, primavera"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                              e.preventDefault()
                              const tag = tagInput.trim().toLowerCase()
                              if (tag && !field.value.includes(tag)) {
                                field.onChange([...field.value, tag])
                              }
                              setTagInput("")
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const tag = tagInput.trim().toLowerCase()
                            if (tag && !field.value.includes(tag)) {
                              field.onChange([...field.value, tag])
                            }
                            setTagInput("")
                          }}
                        >
                          Agregar
                        </Button>
                      </div>
                      {field.value.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {field.value.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => field.onChange(field.value.filter((t) => t !== tag))}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Variants (only shown on create) */}
            {!isEdit && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Variantes</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ sku: "", name: "", price: 0, costPrice: 0 })}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Agregar variante
                    </Button>
                  </div>

                  {fields.map((field, idx) => (
                    <div key={field.id} className="rounded-md border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Variante {idx + 1}
                        </span>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => remove(idx)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name={`variants.${idx}.sku`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">SKU variante</FormLabel>
                              <FormControl>
                                <Input placeholder="ROSA-001-STD" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${idx}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Nombre</FormLabel>
                              <FormControl>
                                <Input placeholder="Estándar" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${idx}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Precio venta</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${idx}.costPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Costo</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
