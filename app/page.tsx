import { redirect } from "next/navigation"

// La raíz redirige a la tienda pública (los clientes llegan aquí)
// El panel de administración está en /dashboard (requiere login)
export default function RootPage() {
  redirect("/store")
}
