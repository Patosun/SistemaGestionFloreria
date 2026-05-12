import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { POS_ROLES } from "@/lib/constants"

export default async function PosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) redirect("/login")

  const role = (session.user as { role?: string }).role ?? ""
  if (!POS_ROLES.includes(role as never)) redirect("/unauthorized")

  return <>{children}</>
}