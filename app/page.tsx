import { redirect } from "next/navigation"

// La raíz redirige al login; el middleware protegerá el admin
export default function RootPage() {
  redirect("/login")
}
