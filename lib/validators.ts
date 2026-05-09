import { z } from "zod"

// ─── Auth ──────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
})

// ─── Products ──────────────────────────────────────────────────────────────

export const productSchema = z.object({
  sku: z.string().min(1, "SKU requerido"),
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  freshnessDays: z.number().int().positive().optional().nullable(),
  isSeasonal: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  isComposite: z.boolean().default(false),
  images: z.array(z.url()).default([]),
  tags: z.array(z.string()).default([]),
})

export const productVariantSchema = z.object({
  productId: z.string().cuid(),
  sku: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  b2bPrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive(),
  attributes: z.record(z.string(), z.unknown()).optional(),
})

// ─── Inventory ─────────────────────────────────────────────────────────────

export const lotSchema = z.object({
  variantId: z.string().cuid(),
  supplierId: z.string().cuid().optional(),
  locationId: z.string().cuid().optional(),
  lotNumber: z.string().optional(),
  quantity: z.number().positive(),
  costPerUnit: z.number().positive(),
  receivedAt: z.coerce.date().default(() => new Date()),
  expiresAt: z.coerce.date().optional().nullable(),
  notes: z.string().optional(),
})

export const inventoryAdjustmentSchema = z.object({
  lotId: z.string().cuid(),
  type: z.enum(["ADJUSTMENT", "DISCARD", "TRANSFER", "RETURN"]),
  quantity: z.number(),
  reason: z.string().min(1, "Motivo requerido"),
})

// ─── Orders ────────────────────────────────────────────────────────────────

export const orderItemSchema = z.object({
  variantId: z.string().cuid(),
  quantity: z.number().positive(),
  notes: z.string().optional(),
})

export const orderSchema = z.object({
  channel: z.enum(["POS", "ECOMMERCE", "CHATBOT", "PHONE"]),
  customerId: z.string().cuid().optional(),
  shippingAddress: z.string().optional(),
  shippingCity: z.string().optional(),
  deliverySlot: z.enum(["SLOT_09_12", "SLOT_12_15", "SLOT_15_18", "SLOT_18_21"]).optional(),
  scheduledDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Al menos 1 producto requerido"),
  promotionCode: z.string().optional(),
})

// ─── Customers ─────────────────────────────────────────────────────────────

export const customerSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  email: z.email().optional().nullable(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  isB2B: z.boolean().default(false),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  creditLimit: z.number().positive().optional().nullable(),
})

// ─── Pagination ────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProductInput = z.infer<typeof productSchema>
export type ProductVariantInput = z.infer<typeof productVariantSchema>
export type LotInput = z.infer<typeof lotSchema>
export type InventoryAdjustmentInput = z.infer<typeof inventoryAdjustmentSchema>
export type OrderInput = z.infer<typeof orderSchema>
export type CustomerInput = z.infer<typeof customerSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
