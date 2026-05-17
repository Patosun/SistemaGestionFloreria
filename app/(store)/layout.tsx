import type { Metadata } from "next"
import { StoreNavbar } from "@/components/store/store-navbar"
import { StoreFooter } from "@/components/store/store-footer"
import { CartDrawer } from "@/components/store/cart-drawer"
import { APP_NAME } from "@/lib/constants"

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} – Naturalmente para ti`,
    template: `%s | ${APP_NAME}`,
  },
  description: "Arreglos florales artesanales para cada momento especial. Flores frescas con entrega el mismo día.",
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <StoreNavbar />
      <main className="flex-1">{children}</main>
      <StoreFooter />
      <CartDrawer />
    </div>
  )
}
