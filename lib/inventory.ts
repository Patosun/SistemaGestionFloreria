/**
 * Inventory service — FIFO consumption, freshness alerts, stock queries.
 * All DB calls happen server-side only.
 */
import { db } from "@/lib/db"

export type StockSummary = {
  variantId: string
  variantSku: string
  variantName: string
  productId: string
  productName: string
  productSku: string
  totalStock: number
  activeLots: number
  nearExpiryLots: number   // expiring within 2 days
  expiredLots: number
}

export type LotAlert = {
  lotId: string
  lotNumber: string | null
  variantId: string
  variantSku: string
  productName: string
  quantityCurrent: number
  expiresAt: Date | null
  daysLeft: number | null
  alertLevel: "critical" | "warning" | "info"
}

/**
 * Get stock totals per variant (for dashboard / product listings).
 */
export async function getStockSummaries(): Promise<StockSummary[]> {
  const lots = await db.lot.findMany({
    where: { status: "ACTIVE", quantityCurrent: { gt: 0 } },
    include: {
      variant: {
        include: { product: true },
      },
    },
    orderBy: { receivedAt: "asc" },
  })

  const map = new Map<string, StockSummary>()
  const now = new Date()

  for (const lot of lots) {
    const existing = map.get(lot.variantId)
    const qty = Number(lot.quantityCurrent)
    const daysLeft =
      lot.expiresAt
        ? Math.floor((lot.expiresAt.getTime() - now.getTime()) / 86_400_000)
        : null

    const nearExpiry = daysLeft !== null && daysLeft <= 2 && daysLeft >= 0
    const expired = daysLeft !== null && daysLeft < 0

    if (!existing) {
      map.set(lot.variantId, {
        variantId: lot.variantId,
        variantSku: lot.variant.sku,
        variantName: lot.variant.name,
        productId: lot.variant.productId,
        productName: lot.variant.product.name,
        productSku: lot.variant.product.sku,
        totalStock: qty,
        activeLots: 1,
        nearExpiryLots: nearExpiry ? 1 : 0,
        expiredLots: expired ? 1 : 0,
      })
    } else {
      existing.totalStock += qty
      existing.activeLots += 1
      if (nearExpiry) existing.nearExpiryLots += 1
      if (expired) existing.expiredLots += 1
    }
  }

  return Array.from(map.values())
}

/**
 * Get freshness alerts (lots near expiry or expired).
 */
export async function getFreshnessAlerts(maxDaysAhead = 3): Promise<LotAlert[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + maxDaysAhead)

  const lots = await db.lot.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { not: null, lte: cutoff },
      quantityCurrent: { gt: 0 },
    },
    include: {
      variant: { include: { product: true } },
    },
    orderBy: { expiresAt: "asc" },
  })

  const now = new Date()
  return lots.map((lot) => {
    const daysLeft = lot.expiresAt
      ? Math.floor((lot.expiresAt.getTime() - now.getTime()) / 86_400_000)
      : null
    const alertLevel: LotAlert["alertLevel"] =
      daysLeft === null ? "info" : daysLeft < 0 ? "critical" : daysLeft <= 1 ? "critical" : "warning"

    return {
      lotId: lot.id,
      lotNumber: lot.lotNumber,
      variantId: lot.variantId,
      variantSku: lot.variant.sku,
      productName: lot.variant.product.name,
      quantityCurrent: Number(lot.quantityCurrent),
      expiresAt: lot.expiresAt,
      daysLeft,
      alertLevel,
    }
  })
}

/**
 * Consume stock using FIFO (oldest lot first).
 * Returns the list of movements created, or throws if insufficient stock.
 */
export async function consumeStockFIFO(
  variantId: string,
  quantityNeeded: number,
  reference: string,
  reason: string,
  performedBy?: string,
  type: "SALE" | "PRODUCTION" | "ADJUSTMENT" = "SALE",
) {
  const lots = await db.lot.findMany({
    where: { variantId, status: "ACTIVE", quantityCurrent: { gt: 0 } },
    orderBy: { receivedAt: "asc" }, // FIFO: oldest first
  })

  const totalAvailable = lots.reduce((sum, l) => sum + Number(l.quantityCurrent), 0)
  if (totalAvailable < quantityNeeded) {
    throw new Error(
      `Stock insuficiente para variante ${variantId}. Disponible: ${totalAvailable}, Requerido: ${quantityNeeded}`,
    )
  }

  let remaining = quantityNeeded
  const movements: { lotId: string; quantity: number }[] = []

  for (const lot of lots) {
    if (remaining <= 0) break
    const consume = Math.min(Number(lot.quantityCurrent), remaining)
    movements.push({ lotId: lot.id, quantity: consume })
    remaining -= consume
  }

  // Execute in transaction
  await db.$transaction(async (tx) => {
    for (const mv of movements) {
      const lot = await tx.lot.findUniqueOrThrow({ where: { id: mv.lotId } })
      const newQty = Number(lot.quantityCurrent) - mv.quantity
      await tx.lot.update({
        where: { id: mv.lotId },
        data: {
          quantityCurrent: (newQty),
          status: newQty <= 0 ? "DEPLETED" : "ACTIVE",
        },
      })
      await tx.inventoryMovement.create({
        data: {
          lotId: mv.lotId,
          type,
          quantity: (-mv.quantity),
          reference,
          reason,
          performedBy,
        },
      })
    }
  })

  return movements
}

/**
 * Add stock when a new lot is received.
 */
export async function receiveLot(data: {
  variantId: string
  supplierId?: string
  locationId?: string
  lotNumber?: string
  quantityInitial: number
  costPerUnit: number
  receivedAt?: Date
  expiresAt?: Date
  notes?: string
  performedBy?: string
}) {
  const received = data.receivedAt ?? new Date()

  return db.$transaction(async (tx) => {
    const lot = await tx.lot.create({
      data: {
        variantId: data.variantId,
        supplierId: data.supplierId ?? null,
        locationId: data.locationId ?? null,
        lotNumber: data.lotNumber ?? null,
        quantityInitial: (data.quantityInitial),
        quantityCurrent: (data.quantityInitial),
        costPerUnit: (data.costPerUnit),
        receivedAt: received,
        expiresAt: data.expiresAt ?? null,
        notes: data.notes ?? null,
        status: "ACTIVE",
      },
    })

    await tx.inventoryMovement.create({
      data: {
        lotId: lot.id,
        type: "PURCHASE",
        quantity: (data.quantityInitial),
        reason: "Ingreso de mercancía",
        performedBy: data.performedBy ?? null,
      },
    })

    return lot
  })
}

/**
 * Adjust stock manually (count correction, damage, etc.)
 */
export async function adjustLot(
  lotId: string,
  newQuantity: number,
  reason: string,
  performedBy?: string,
) {
  return db.$transaction(async (tx) => {
    const lot = await tx.lot.findUniqueOrThrow({ where: { id: lotId } })
    const delta = newQuantity - Number(lot.quantityCurrent)

    const updated = await tx.lot.update({
      where: { id: lotId },
      data: {
        quantityCurrent: (newQuantity),
        status: newQuantity <= 0 ? "DEPLETED" : "ACTIVE",
      },
    })

    await tx.inventoryMovement.create({
      data: {
        lotId,
        type: "ADJUSTMENT",
        quantity: (delta),
        reason,
        performedBy: performedBy ?? null,
      },
    })

    return updated
  })
}
