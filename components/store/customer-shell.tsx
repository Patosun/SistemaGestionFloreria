"use client"

import { AuthModal } from "@/components/store/auth-modal"
import { CheckoutModal } from "@/components/store/checkout-modal"
import { CartDrawer } from "@/components/store/cart-drawer"

/**
 * Renders the auth modal, checkout modal and cart drawer as portals.
 * Included in the catalog layout and the landing page so customers
 * can log in and place orders from anywhere in the public storefront.
 */
export function CustomerShell() {
  return (
    <>
      <CartDrawer />
      <AuthModal />
      <CheckoutModal />
    </>
  )
}
