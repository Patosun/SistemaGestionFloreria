// ─── App ───────────────────────────────────────────────────────────────────

export const APP_NAME = "Florería Pro"
export const APP_DESCRIPTION = "Sistema ERP integral para floristerías"

// ─── Auth / Roles ──────────────────────────────────────────────────────────
// Definidos como strings para que este módulo sea seguro en edge + client.

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  CASHIER: "CASHIER",
  FLORIST: "FLORIST",
  DELIVERY: "DELIVERY",
  CUSTOMER: "CUSTOMER",
} as const

export type UserRoleValue = (typeof USER_ROLES)[keyof typeof USER_ROLES]

/** Roles con acceso al panel de administración */
export const ADMIN_ROLES: UserRoleValue[] = ["SUPER_ADMIN", "ADMIN", "MANAGER"]

/** Roles con acceso al módulo POS */
export const POS_ROLES: UserRoleValue[] = ["SUPER_ADMIN", "ADMIN", "MANAGER", "CASHIER"]

/** Roles del personal operativo */
export const STAFF_ROLES: UserRoleValue[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "CASHIER",
  "FLORIST",
  "DELIVERY",
]

// ─── Inventory ─────────────────────────────────────────────────────────────

/** Porcentaje de vida útil a partir del cual se emite alerta de frescura */
export const FRESHNESS_ALERT_THRESHOLD = 0.5 // 50%

/** Horas de aviso antes de que un lote expire */
export const EXPIRY_ALERT_HOURS = 24

// ─── Orders ────────────────────────────────────────────────────────────────

/** Minutos que se retiene stock reservado durante proceso de pago */
export const STOCK_HOLD_MINUTES = 5

/** Slots de entrega disponibles */
export const DELIVERY_SLOTS = [
  { value: "SLOT_09_12", label: "09:00 – 12:00" },
  { value: "SLOT_12_15", label: "12:00 – 15:00" },
  { value: "SLOT_15_18", label: "15:00 – 18:00" },
  { value: "SLOT_18_21", label: "18:00 – 21:00" },
] as const

// ─── Pagination ────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20

// ─── API ───────────────────────────────────────────────────────────────────

export const API_VERSION = "v1"
export const CHATBOT_RATE_LIMIT = 100 // req/min por API key
