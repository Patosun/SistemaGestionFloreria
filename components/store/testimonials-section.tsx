"use client"

import { motion } from "framer-motion"
import { Quote } from "lucide-react"

const TESTIMONIALS = [
  {
    name: "Valentina R.",
    initials: "VR",
    role: "Cliente frecuente",
    text: "Los arreglos de Alesli son simplemente increíbles. Pedí flores para el cumpleaños de mi mamá y lloró de emoción. La calidad y la presentación son impecables.",
    stars: 5,
    gradient: "from-rose-400 to-pink-500",
  },
  {
    name: "Carlos M.",
    initials: "CM",
    role: "Cliente satisfecho",
    text: "Pedí bouquet para el aniversario de boda a las 11am y llegaron a las 3pm perfecto. Mis hijos quedaron sorprendidos. ¡Definitivamente volvería a pedir!",
    stars: 5,
    gradient: "from-violet-400 to-purple-500",
  },
  {
    name: "Sofía L.",
    initials: "SL",
    role: "Organizadora de eventos",
    text: "Trabajo con Alesli para todos mis eventos. Su equipo es profesional, puntual y los arreglos siempre superan las expectativas. Mis clientes siempre preguntan quién hizo las flores.",
    stars: 5,
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    name: "Miguel A.",
    initials: "MA",
    role: "Cliente nuevo",
    text: "Primera vez comprando flores online y quedé impresionado. El proceso fue muy fácil, llegaron antes de lo prometido y se veían exactamente como en la foto.",
    stars: 5,
    gradient: "from-amber-400 to-orange-500",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-rose-50/60 via-white to-fuchsia-50/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-widest">Testimonios</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mt-1">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Miles de momentos especiales han pasado por nuestras manos. Aquí algunas historias.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.09, ease: "easeOut" }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
            >
              {/* Quote icon */}
              <Quote className="h-6 w-6 text-primary/30 shrink-0" />

              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, s) => (
                  <span key={s} className="text-amber-400 text-sm">★</span>
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                "{t.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
