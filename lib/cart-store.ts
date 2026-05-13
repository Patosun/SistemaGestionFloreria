import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CartItem = {
  id: string          // productId-variantId
  productId: string
  variantId: string
  name: string        // product name
  variantName: string
  price: number
  quantity: number
  image: string | null
  emoji: string
}

type CartState = {
  items: CartItem[]
  isOpen: boolean
  // Actions
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  // Computed helpers
  totalItems: () => number
  subtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const { quantity = 1, ...rest } = item
        set((state) => {
          const existing = state.items.find((i) => i.id === rest.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === rest.id ? { ...i, quantity: i.quantity + quantity } : i,
              ),
              isOpen: true,
            }
          }
          return { items: [...state.items, { ...rest, quantity }], isOpen: true }
        })
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "alesli-cart",
      // Only persist items, not the open state
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
