"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

const schema = z.object({
  newQuantity: z.number().min(0, "No puede ser negativo"),
  reason: z.string().min(3, "Describe el motivo del ajuste"),
})

type FormValues = z.infer<typeof schema>

interface AdjustDialogProps {
  lotId: string | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AdjustDialog({ lotId, onOpenChange, onSuccess }: AdjustDialogProps) {
  const open = !!lotId

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { newQuantity: 0, reason: "" },
  })

  useEffect(() => {
    if (open) form.reset({ newQuantity: 0, reason: "" })
  }, [open, form])

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await fetch(`/api/v1/lots/${lotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error al ajustar")
      return json
    },
    onSuccess: () => {
      toast.success("Lote ajustado correctamente")
      onOpenChange(false)
      onSuccess()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Ajuste de inventario</DialogTitle>
          <DialogDescription>
            Introduce la cantidad correcta actual del lote.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <FormField
              control={form.control}
              name="newQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva cantidad</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" min={0} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo del ajuste</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Conteo físico, merma, daño..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Ajustando..." : "Guardar ajuste"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
