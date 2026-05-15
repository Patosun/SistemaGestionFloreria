"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CtaSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    // Placeholder: just show success state
    setSubmitted(true)
  }

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-primary via-rose-600 to-pink-700">
      {/* Decorative blobs */}
      <motion.div
        className="absolute top-[-5rem] right-[-5rem] w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.15, 1], rotate: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-4rem] left-[-4rem] w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 0.95, 1], rotate: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating emojis */}
      {["🌸", "🌹", "💐", "🌷"].map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-4xl opacity-20 pointer-events-none select-none"
          style={{
            top: `${20 + i * 18}%`,
            left: i % 2 === 0 ? `${5 + i * 3}%` : undefined,
            right: i % 2 !== 0 ? `${5 + i * 2}%` : undefined,
          }}
          animate={{ y: [0, -12, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          {emoji}
        </motion.span>
      ))}

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="text-6xl">💌</div>
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white leading-tight">
              Recibe inspiración floral
            </h2>
            <p className="mt-3 text-white/80 text-lg">
              Suscríbete y recibe descuentos exclusivos, ideas de arreglos y novedades de temporada.
            </p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white rounded-2xl px-6 py-4"
            >
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="font-medium">¡Gracias! Pronto recibirás noticias de nosotros. 🌸</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus-visible:ring-white/50 focus-visible:border-white/60 rounded-full h-11"
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="rounded-full px-6 gap-2 shrink-0 h-11 font-semibold"
              >
                Suscribirme
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          <p className="text-white/50 text-xs">
            Sin spam. Solo flores y buenas noticias. Puedes darte de baja cuando quieras.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
