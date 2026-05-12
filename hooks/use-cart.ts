import { create } from "zustand"

export interface CartItem {
  variantId: string
  productId: string
  name: string       // "Rosa roja - Docena"
  sku: string
  price: number
  quantity: number
  notes?: string
}

interface CartState {
  items: CartItem[]
  customerId: string | null
  orderNotes: string

  // Acciones
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  updateNotes: (variantId: string, notes: string) => void
  setCustomer: (customerId: string | null) => void
  setOrderNotes: (notes: string) => void
  clearCart: () => void

  // Computed
  subtotal: () => number
  itemCount: () => number
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  customerId: null,
  orderNotes: "",

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find((i) => i.variantId === item.variantId)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.variantId === item.variantId
              ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
              : i
          ),
        }
      }
      return {
        items: [...state.items, { ...item, quantity: item.quantity ?? 1 }],
      }
    })
  },

  removeItem: (variantId) => {
    set((state) => ({
      items: state.items.filter((i) => i.variantId !== variantId),
    }))
  },

  updateQuantity: (variantId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(variantId)
      return
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.variantId === variantId ? { ...i, quantity } : i
      ),
    }))
  },

  updateNotes: (variantId, notes) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.variantId === variantId ? { ...i, notes } : i
      ),
    }))
  },

  setCustomer: (customerId) => set({ customerId }),
  setOrderNotes: (notes) => set({ orderNotes: notes }),

  clearCart: () => set({ items: [], customerId: null, orderNotes: "" }),

  subtotal: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  itemCount: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),
}))