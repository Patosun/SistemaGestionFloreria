"use client"

import { motion, type Variants } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

// Animated floating blob
function Blob({
  className,
  delay = 0,
  duration = 8,
}: {
  className: string
  delay?: number
  duration?: number
}) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-30 pointer-events-none ${className}`}
      animate={{
        scale: [1, 1.15, 0.95, 1.1, 1],
        x: [0, 20, -10, 15, 0],
        y: [0, -15, 10, -8, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      }}
    />
  )
}

const FLOWER_ICONS = ["🌸", "🌹", "💐", "🌷", "🌺", "🌼", "🌻"]

function FloatingFlower({
  emoji,
  style,
  delay,
}: {
  emoji: string
  style: React.CSSProperties
  delay: number
}) {
  return (
    <motion.span
      className="absolute text-2xl sm:text-3xl select-none pointer-events-none"
      style={style}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.7, 0.5, 0.8, 0.6],
        scale: [0.5, 1, 0.9, 1.05, 0.95],
        rotate: [-10, 10, -5, 8, -10],
        y: [0, -12, 5, -8, 0],
      }}
      transition={{
        duration: 6 + delay,
        delay: delay * 0.8,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      }}
    >
      {emoji}
    </motion.span>
  )
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
}

export function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-white to-emerald-50/30">
      {/* Animated background blobs */}
      <Blob
        className="w-96 h-96 bg-primary top-[-8rem] left-[-6rem]"
        delay={0}
        duration={10}
      />
      <Blob
        className="w-80 h-80 bg-rose-300 bottom-[-4rem] right-[-4rem]"
        delay={2}
        duration={12}
      />
      <Blob
        className="w-64 h-64 bg-emerald-200 top-1/2 left-1/3"
        delay={1}
        duration={9}
      />

      {/* Floating flowers */}
      {[
        { emoji: "🌸", style: { top: "12%", left: "8%" }, delay: 0 },
        { emoji: "🌹", style: { top: "20%", right: "10%" }, delay: 1 },
        { emoji: "💐", style: { bottom: "25%", left: "12%" }, delay: 2 },
        { emoji: "🌷", style: { bottom: "18%", right: "8%" }, delay: 0.5 },
        { emoji: "🌺", style: { top: "45%", right: "5%" }, delay: 1.5 },
        { emoji: "🌼", style: { top: "8%", left: "40%" }, delay: 0.8 },
        { emoji: "🌻", style: { bottom: "10%", left: "45%" }, delay: 2.5 },
      ].map((f, i) => (
        <FloatingFlower key={i} emoji={f.emoji} style={f.style as React.CSSProperties} delay={f.delay} />
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-6"
        >
          {/* Pill badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-sm font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              Flores frescas · Entregas el mismo día
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold text-foreground leading-[1.1] tracking-tight"
          >
            Flores que
            <br />
            <span className="text-primary relative">
              hablan por ti
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-1 bg-primary/30 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="max-w-xl text-lg sm:text-xl text-muted-foreground leading-relaxed"
          >
            Arreglos florales artesanales elaborados con amor para celebrar cada momento especial de tu vida.
            Naturalmente para ti.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
          >
            <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/25 text-base gap-2">
              <Link href="/store/productos">
                Ver colección
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-8 text-base bg-white/70 backdrop-blur-sm"
            >
              <Link href="/store/contacto">Arreglo personalizado</Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-8 pt-4 border-t border-foreground/10 mt-2 w-full sm:w-auto justify-center"
          >
            {[
              { value: "500+", label: "Pedidos al mes" },
              { value: "100%", label: "Frescura garantizada" },
              { value: "4.9★", label: "Calificación" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-heading text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 40C240 0 480 80 720 40C960 0 1200 80 1440 40V80H0V40Z"
            fill="white"
            fillOpacity="0.8"
          />
          <path
            d="M0 55C240 15 480 95 720 55C960 15 1200 95 1440 55V80H0V55Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}
