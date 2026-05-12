import { Package, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const mockProducts = [
  { id: "1", sku: "ROS-001", name: "Rosas rojas", category: "Flores", variants: 3, stock: 12, price: "Bs. 15.00", status: "active" },
  { id: "2", sku: "GIR-001", name: "Girasoles", category: "Flores", variants: 2, stock: 8, price: "Bs. 12.00", status: "active" },
  { id: "3", sku: "LIL-001", name: "Lilies blancos", category: "Flores", variants: 2, stock: 25, price: "Bs. 18.00", status: "active" },
  { id: "4", sku: "ARR-001", name: "Ramo primaveral", category: "Arreglos", variants: 1, stock: 5, price: "Bs. 120.00", status: "active" },
  { id: "5", sku: "ARR-002", name: "Bouquet romántico", category: "Arreglos", variants: 2, stock: 3, price: "Bs. 180.00", status: "active" },
  { id: "6", sku: "CAJ-001", name: "Caja de rosas", category: "Arreglos", variants: 3, stock: 0, price: "Bs. 250.00", status: "inactive" },
]

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Productos</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Gestiona el catálogo de Aleslí
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar producto..." className="pl-9" />
        </div>
        <Button variant="outline">Todas las categorías</Button>
        <Button variant="outline">Activos</Button>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total productos", value: "6" },
          { label: "Con stock bajo", value: "2", alert: true },
          { label: "Sin stock", value: "1", alert: true },
          { label: "Categorías", value: "2" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.alert ? "text-rose-500" : ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Producto</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">SKU</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Categoría</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Variantes</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Stock</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Precio base</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockProducts.map((product) => (
              <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">
                      🌸
                    </div>
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground f