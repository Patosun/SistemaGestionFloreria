import { CustomerShell } from "@/components/store/customer-shell"

export default function CatalogoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <CustomerShell />
    </>
  )
}
