"use client"

import { motion } from "framer-motion"
import { Truck, Leaf, Star, RefreshCcw } from "lucide-react"

const FEATURES = [
  {
    icon: Truck,
    title: "Entrega el mismo día",
    description: "Pedidos antes de las 2 pm garantizan entrega en el día. Llegamos a toda la ciudad.",
    color: "bg-rose-50 text-rose-600",
    border: "border-rose-100",
  },
  {
    icon: Leaf,
    title: "Frescura garantizada",
    description: "Flores cortadas diariamente de nuestros proveedores locales. Máxima calidad siempre.",
    color: "bg-emerald-50 text-emerald-600",
    border: "border-emerald-100",
  },
  {
    icon: Star,
    title: "Diseños artesanales",
    description: "Cada arreglo es elaborado a mano por nuestros floristas con años de experiencia.",
    color: "bg-amber-50 text-amber-600",
    border: "border-amber-100",
  },
  {
    icon: RefreshCcw,
    title: "Cambio sin preguntas",
    description: "Si no estás satisfecho te hacemos un cambio o reembolso. Tu felicidad es primero.",
    color: "bg-violet-50 text-violet-600",
    border: "border-violet-100",
  },
]

export function FeaturesStrip() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-widest">Por qué elegirnos</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mt-1">
            Más que flores
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Cada pedido es una experiencia diseñada para sorprender y emocionar a quien amas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: "easeOut" }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`rounded-2xl border ${feature.border} p-6 flex flex-col gap-4 bg-white shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.color}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
