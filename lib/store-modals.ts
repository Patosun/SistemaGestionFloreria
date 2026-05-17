import { create } from "zustand"

type StoreModalsState = {
  authOpen: boolean
  authRedirectTo: "checkout" | null
  checkoutOpen: boolean
  openAuth: (redirectTo?: "checkout") => void
  closeAuth: () => void
  openCheckout: () => void
  closeCheckout: () => void
}

export const useStoreModals = create<StoreModalsState>((set) => ({
  authOpen: false,
  authRedirectTo: null,
  checkoutOpen: false,
  openAuth: (redirectTo) =>
    set({ authOpen: true, authRedirectTo: redirectTo ?? null }),
  closeAuth: () => set({ authOpen: false, authRedirectTo: null }),
  openCheckout: () => set({ checkoutOpen: true }),
  closeCheckout: () => set({ checkoutOpen: false }),
}))
