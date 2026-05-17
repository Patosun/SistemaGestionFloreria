"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, Clock, MapPin, Phone, MessageSquare, CheckCircle, ChevronDown } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { useStoreModals } from "@/lib/store-modals"
import { useSession } from "@/lib/auth-client"

const SLOTS = [
  { value: "SLOT_09_12", label: "Mañana", time: "09:00 – 12:00" },
  { value: "SLOT_12_15", label: "Mediodía", time: "12:00 – 15:00" },
  { value: "SLOT_15_18", label: "Tarde", time: "15:00 – 18:00" },
  { value: "SLOT_18_21", label: "Noche", time: "18:00 – 21:00" },
] as const

type Slot = (typeof SLOTS)[number]["value"]

function minDeliveryDate() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split("T")[0]
}

function formatDateLabel(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("es-BO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

type FormState = "idle" | "loading" | "success" | "error"

export function CheckoutModal() {
  const { checkoutOpen, closeCheckout } = useStoreModals()
  const { items, subtotal, clearCart } = useCartStore()
  const { data: session } = useSession()

  const total = subtotal()

  const [deliveryDate, setDeliveryDate] = useState(minDeliveryDate())
  const [slot, setSlot] = useState<Slot>("SLOT_09_12")
  const [address, setAddress] = useState("")
  const [zone, setZone] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")

  const [formState, setFormState] = useState<FormState>("idle")
  const [orderNumber, setOrderNumber] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!session) return
    setFormState("loading")
    setErrorMsg("")

    const shippingAddress = zone
      ? `${address}, ${zone}, La Paz`
      : `${address}, La Paz`

    try {
      const res = await fetch("/api/v1/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledDate: deliveryDate,
          deliverySlot: slot,
          shippingAddress,
          shippingCity: "La Paz",
          phone,
          notes: notes || undefined,
          items: items.map((i) => ({
            variantId: i.variantId,
            productId: i.productId,
            name: `${i.name} — ${i.variantName}`,
            quantity: i.quantity,
            unitPrice: i.price,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Error al procesar el pedido")
      }
      setOrderNumber(data.data.orderNumber)
      setFormState("success")
      clearCart()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado")
      setFormState("error")
    }
  }

  function handleClose() {
    if (formState === "loading") return
    closeCheckout()
    if (formState === "success") {
      setFormState("idle")
      setOrderNumber("")
    }
  }

  return (
    <AnimatePresence>
      {checkoutOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="fixed inset-0 z-[61] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none"
          >
            <div
              className="w-full sm:max-w-lg bg-[#FDF3F6] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[#E6A1B8]/40 overflow-hidden pointer-events-auto max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative px-6 py-4 bg-white border-b border-[#E6A1B8]/30 shrink-0">
                <h2 className="text-center font-serif text-lg font-bold text-[#93276F] uppercase tracking-widest">
                  Finalizar pedido
                </h2>
                <button
                  onClick={handleClose}
                  disabled={formState === "loading"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-[#FDF3F6] flex items-center justify-center transition-colors disabled:opacity-40"
                >
                  <X size={16} className="text-[#93276F]" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1">
                {formState === "success" ? (
                  /* ── Success state ── */
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-[#93276F]/10 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle size={40} className="text-[#93276F]" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-[#93276F] mb-2">
                      ¡Pedido confirmado!
                    </h3>
                    <p className="text-sm text-[#93276F]/70 mb-1">
                      Número de pedido
                    </p>
                    <p className="text-xl font-bold text-[#93276F] tracking-widest mb-4">
                      #{orderNumber.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-[#93276F]/60 leading-relaxed mb-2">
                      Entrega el{" "}
                      <strong className="text-[#93276F]">{formatDateLabel(deliveryDate)}</strong>
                      <br />
                      Horario:{" "}
                      <strong className="text-[#93276F]">
                        {SLOTS.find((s) => s.value === slot)?.time}
                      </strong>
                    </p>
                    <p className="text-xs text-[#93276F]/50 mb-6">
                      Recibirás la confirmación por correo electrónico.
                    </p>
                    <button
                      onClick={handleClose}
                      className="bg-[#93276F] text-white rounded-full px-8 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#7a1f5c] transition-colors"
                    >
                      Cerrar
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
                    {/* ── Order summary ── */}
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#93276F]/60 mb-2">
                        Resumen del pedido
                      </h3>
                      <div className="bg-white rounded-xl border border-[#E6A1B8]/30 divide-y divide-[#E6A1B8]/20 overflow-hidden">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                            <div className="w-10 h-10 rounded-lg bg-[#DFD2E5] flex items-center justify-center shrink-0 overflow-hidden">
                              {item.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-lg">{item.emoji}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#93276F] truncate">{item.name}</p>
                              <p className="text-xs text-[#93276F]/50">{item.variantName} · x{item.quantity}</p>
                            </div>
                            <p className="text-sm font-bold text-[#93276F] shrink-0">
                              Bs. {(item.price * item.quantity).toFixed(0)}
                            </p>
                          </div>
                        ))}
                        <div className="flex items-center justify-between px-4 py-3 bg-[#FDF3F6]">
                          <span className="text-sm font-bold text-[#93276F]">Total</span>
                          <span className="text-lg font-bold text-[#93276F]">Bs. {total.toFixed(0)}</span>
                        </div>
                      </div>
                    </section>

                    {/* ── Delivery date ── */}
                    <section>
                      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#93276F]/60 mb-2">
                        <Calendar size={13} /> Fecha de entrega
                      </label>
                      <input
                        type="date"
                        required
                        min={minDeliveryDate()}
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full rounded-full border border-[#E6A1B8] bg-white px-4 py-2.5 text-sm text-[#93276F] focus:outline-none focus:border-[#93276F] transition-colors"
                      />
                    </section>

                    {/* ── Time slot ── */}
                    <section>
                      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#93276F]/60 mb-2">
                        <Clock size={13} /> Horario de entrega
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {SLOTS.map((s) => (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => setSlot(s.value)}
                            className={`rounded-full py-2.5 px-3 text-xs font-bold transition-all border-2 ${
                              slot === s.value
                                ? "bg-[#93276F] text-white border-[#93276F] shadow-lg shadow-[#93276F]/25"
                                : "bg-white text-[#93276F] border-[#E6A1B8] hover:border-[#93276F]/50"
                            }`}
                          >
                            <span className="block">{s.label}</span>
                            <span className="font-normal opacity-75">{s.time}</span>
                          </button>
                        ))}
                      </div>
                    </section>

                    {/* ── Delivery address ── */}
                    <section>
                      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#93276F]/60 mb-2">
                        <MapPin size={13} /> Dirección de entrega
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Calle, número, edificio…"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full rounded-full border border-[#E6A1B8] bg-white px-4 py-2.5 text-sm text-[#93276F] placeholder:text-[#93276F]/40 focus:outline-none focus:border-[#93276F] transition-colors mb-2"
                      />
                      <input
                        type="text"
                        placeholder="Zona / barrio (opcional)"
                        value={zone}
                        onChange={(e) => setZone(e.target.value)}
                        className="w-full rounded-full border border-[#E6A1B8] bg-white px-4 py-2.5 text-sm text-[#93276F] placeholder:text-[#93276F]/40 focus:outline-none focus:border-[#93276F] transition-colors"
                      />
                      <p className="text-[10px] text-[#93276F]/40 mt-1.5 pl-2">
                        Realizamos entregas en La Paz y alrededores.
                      </p>
                    </section>

                    {/* ── Phone ── */}
                    <section>
                      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#93276F]/60 mb-2">
                        <Phone size={13} /> Teléfono de contacto
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+591 7X XXX XXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-full border border-[#E6A1B8] bg-white px-4 py-2.5 text-sm text-[#93276F] placeholder:text-[#93276F]/40 focus:outline-none focus:border-[#93276F] transition-colors"
                      />
                    </section>

                    {/* ── Notes / dedicatoria ── */}
                    <section>
                      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#93276F]/60 mb-2">
                        <MessageSquare size={13} /> Dedicatoria / instrucciones
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Escribe una dedicatoria o instrucciones especiales…"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full rounded-2xl border border-[#E6A1B8] bg-white px-4 py-3 text-sm text-[#93276F] placeholder:text-[#93276F]/40 focus:outline-none focus:border-[#93276F] transition-colors resize-none"
                      />
                    </section>

                    {formState === "error" && (
                      <p className="text-red-500 text-sm text-center rounded-xl bg-red-50 py-2 px-4">
                        {errorMsg}
                      </p>
                    )}

                    {/* ── Submit ── */}
                    <button
                      type="submit"
                      disabled={formState === "loading" || items.length === 0}
                      className="w-full bg-[#93276F] text-white rounded-full py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-[#7a1f5c] transition-colors shadow-lg shadow-[#93276F]/30 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {formState === "loading"
                        ? "Procesando…"
                        : `Confirmar pedido · Bs. ${total.toFixed(0)}`}
                    </button>

                    <p className="text-[10px] text-center text-[#93276F]/40 -mt-2">
                      Al confirmar aceptas nuestros{" "}
                      <a href="/terminos" className="underline">términos</a>.
                      El pago se realiza al momento de la entrega.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
