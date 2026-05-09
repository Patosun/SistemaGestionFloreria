import { addDays, isPast, isWithinInterval } from "date-fns"
import { FRESHNESS_ALERT_THRESHOLD, EXPIRY_ALERT_HOURS } from "./constants"

/**
 * Calcula la fecha de expiración de un lote dado su fecha de recepción
 * y los días de vida útil del producto.
 */
export function calcExpiryDate(receivedAt: Date, freshnessDays: number): Date {
  return addDays(receivedAt, freshnessDays)
}

/**
 * Retorna true si el lote ya está vencido.
 */
export function isExpired(expiresAt: Date): boolean {
  return isPast(expiresAt)
}

/**
 * Retorna true si el lote superó el umbral de alerta de frescura (50% de vida útil).
 */
export function isFreshnessAlert(receivedAt: Date, freshnessDays: number): boolean {
  const alertDate = addDays(receivedAt, Math.floor(freshnessDays * FRESHNESS_ALERT_THRESHOLD))
  return isPast(alertDate)
}

/**
 * Retorna true si el lote vence dentro de las próximas EXPIRY_ALERT_HOURS horas.
 */
export function isExpiringToday(expiresAt: Date): boolean {
  const now = new Date()
  const alertStart = addDays(now, 0)
  const alertEnd = new Date(now.getTime() + EXPIRY_ALERT_HOURS * 60 * 60 * 1000)
  return isWithinInterval(expiresAt, { start: alertStart, end: alertEnd })
}

/**
 * Formatea un Decimal de Prisma (puede ser string o number) a number seguro.
 */
export function toNumber(value: unknown): number {
  return typeof value === "string" ? parseFloat(value) : Number(value)
}

/**
 * Genera un número de orden legible: FP-20260508-XXXX
 */
export function generateOrderNumber(): string {
  const date = new Date()
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, "")
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `FP-${datePart}-${rand}`
}
