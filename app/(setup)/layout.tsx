import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Configuración inicial",
}

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      {children}
    </div>
  )
}
