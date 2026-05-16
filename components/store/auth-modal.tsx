"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { signIn, signUp, useSession } from "@/lib/auth-client"
import { useStoreModals } from "@/lib/store-modals"

type Tab = "login" | "register"
type State = "idle" | "loading" | "verify-email"

export function AuthModal() {
  const { authOpen, authRedirectTo, closeAuth, openCheckout } = useStoreModals()
  const { data: session } = useSession()
  const [tab, setTab] = useState<Tab>("login")
  const [state, setState] = useState<State>("idle")
  const [error, setError] = useState("")
  const [showPwd, setShowPwd] = useState(false)

  // Form fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Close and optionally redirect to checkout
  function handleClose() {
    closeAuth()
    setError("")
    setState("idle")
  }

  function handleAuthSuccess() {
    closeAuth()
    setError("")
    setState("idle")
    if (authRedirectTo === "checkout") {
      openCheckout()
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setState("loading")
    const result = await signIn.email({ email, password })
    if (result.error) {
      setError(result.error.message ?? "Credenciales incorrectas")
      setState("idle")
    } else {
      handleAuthSuccess()
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setState("loading")
    const result = await signUp.email({ name, email, password, callbackURL: "/" })
    if (result.error) {
      setError(result.error.message ?? "Error al crear la cuenta")
      setState("idle")
    } else {
      setState("verify-email")
    }
  }

  async function handleGoogle() {
    setError("")
    await signIn.social({ provider: "google", callbackURL: "/" })
  }

  // If already logged in, don't render
  if (session) return null

  return (
    <AnimatePresence>
      {authOpen && (
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-sm bg-[#FDF3F6] rounded-2xl shadow-2xl border border-[#E6A1B8]/40 overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4 bg-white border-b border-[#E6A1B8]/30">
                <div className="text-center">
                  <p className="font-serif text-xl font-bold tracking-[0.2em] uppercase text-[#93276F]">
                    Aleslí
                  </p>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#E6A1B8] mt-0.5">
                    Naturalmente para ti
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="absolute right-4 top-4 w-8 h-8 rounded-full hover:bg-[#FDF3F6] flex items-center justify-center transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={16} className="text-[#93276F]" />
                </button>
              </div>

              <div className="p-6">
                {state === "verify-email" ? (
                  /* Verification state */
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#93276F]/10 flex items-center justify-center mx-auto mb-4">
                      <Mail size={28} className="text-[#93276F]" />
                    </div>
                    <h3 className="font-semibold text-[#93276F] text-lg mb-2">
                      ¡Cuenta creada!
                    </h3>
                    <p className="text-sm text-[#93276F]/70 leading-relaxed">
                      Te enviamos un correo de confirmación a{" "}
                      <strong className="text-[#93276F]">{email}</strong>.
                      <br />
                      Revisa tu bandeja y haz clic en el enlace para verificar tu cuenta.
                    </p>
                    <button
                      onClick={handleAuthSuccess}
                      className="mt-6 w-full bg-[#93276F] text-white rounded-full py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-[#7a1f5c] transition-colors"
                    >
                      Continuar sin verificar
                    </button>
                  </motion.div>
                ) : (
                  <>
                    {/* Tabs */}
                    <div className="flex rounded-full bg-[#93276F]/10 p-1 mb-6">
                      {(["login", "register"] as Tab[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => { setTab(t); setError("") }}
                          className={`flex-1 rounded-full py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                            tab === t
                              ? "bg-[#93276F] text-white shadow"
                              : "text-[#93276F]/60 hover:text-[#93276F]"
                          }`}
                        >
                          {t === "login" ? "Ingresar" : "Registrarse"}
                        </button>
                      ))}
                    </div>

                    {/* Google button – only shown when OAuth credentials are configured */}
                    {process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true" && (
                      <>
                        <button
                          onClick={handleGoogle}
                          disabled={state === "loading"}
                          className="w-full flex items-center justify-center gap-2.5 border-2 border-[#E6A1B8] bg-white rounded-full py-2.5 text-sm font-semibold text-[#93276F] hover:bg-[#FDF3F6] transition-colors mb-4 disabled:opacity-50"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Continuar con Google
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-1 h-px bg-[#E6A1B8]/40" />
                          <span className="text-[10px] uppercase tracking-widest text-[#93276F]/40">o</span>
                          <div className="flex-1 h-px bg-[#E6A1B8]/40" />
                        </div>
                      </>
                    )}

                    {/* Forms */}
                    <AnimatePresence mode="wait">
                      {tab === "login" ? (
                        <motion.form
                          key="login"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.15 }}
                          onSubmit={handleLogin}
                          className="flex flex-col gap-3"
                        >
                          <div className="relative">
                            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#93276F]/40" />
                            <input
                              type="email"
                              required
                              placeholder="Correo electrónico"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-9 pr-3 py-2.5 rounded-full border border-[#E6A1B8] bg-white text-sm text-[#93276F] placeholder:text-[#93276F]/40 focus:outline-none focus:border-[#93276F] transition-colors"
                            />
                          </div>
                          <div className="relative">
                            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#93276F]/40" />
                            <input
                              type={showPwd ? "text" : "password"}
                              required
                              placeholder="Contraseña"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-9 pr-10 py-2.5 rounded-full border border-[#E6A1B8] bg-white text-sm text-[#93276F] placeholder:text-[#93276F]/40 focus:outline-none focus:border-[#93276F] transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPwd(!showPwd)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#93276F]/40 hover:text-[#93276F]"
                            >
                              {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>

                          {error && (
                            <p className="text-red-500 text-xs text-center">{error}</p>
                          )}

                          <button
                            type="submit"
                            disabled={state === "loading"}
                            className="w-full bg-[#93276F] text-white rounded-full py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#7a1f5c] transition-colors shadow-lg shadow-[#93276F]/30 disabled:opacity-60 mt-1"
                          >
                            {state === "loading" ? "Ingresando…" : "Ingresar"}
                          </button>
                        </motion.form>
                      ) : (
                        <motion.form
                          key="register"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15 }}
                          onSubmit={handleRegister}
                          className="flex flex-col gap-3"
                        >
                          <div className="relative">
                            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#93276F]/40" />
                            <input
                              type="text"
                              required
                              placeholder="Tu nombre"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full pl-9 pr-3 py-2.5 rounded-full border border-[#E6A1B8] bg-white text-sm text-[#93276F] placeholder:text-[#93276F]/40 focus:outline-none focus:border-[#93276F] transition-colors"
                            />
                          </div>
                          <div className="relative">
                            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#93276F]/40" />
                            <input
                              type="email"
                              required
                              placeholder="Correo electrónico"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-9 pr-3 py-2.5 rounded-full border border-[#E6A1B8] bg-white text-sm text-[#93276F] placeholder:text-[#93276F]/40 focus:outline-none focus:border-[#93276F] transition-colors"
                            />
                          </div>
                          <div className="relative">
                            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#93276F]/40" />
                            <input
                              type={showPwd ? "text" : "password"}
                              required
                              minLength={8}
                              placeholder="Contraseña (mín. 8 caracteres)"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-9 pr-10 py-2.5 rounded-full border border-[#E6A1B8] bg-white text-sm text-[#93276F] placeholder:text-[#93276F]/40 focus:outline-none focus:border-[#93276F] transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPwd(!showPwd)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#93276F]/40 hover:text-[#93276F]"
                            >
                              {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>

                          {error && (
                            <p className="text-red-500 text-xs text-center">{error}</p>
                          )}

                          <button
                            type="submit"
                            disabled={state === "loading"}
                            className="w-full bg-[#93276F] text-white rounded-full py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#7a1f5c] transition-colors shadow-lg shadow-[#93276F]/30 disabled:opacity-60 mt-1"
                          >
                            {state === "loading" ? "Creando cuenta…" : "Crear cuenta"}
                          </button>

                          <p className="text-[10px] text-center text-[#93276F]/40 mt-1">
                            Al registrarte aceptas nuestros{" "}
                            <a href="/terminos" className="underline hover:text-[#93276F]">términos</a>
                            {" "}y{" "}
                            <a href="/privacidad" className="underline hover:text-[#93276F]">privacidad</a>.
                          </p>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
