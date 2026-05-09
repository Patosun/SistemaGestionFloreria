export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">403</h1>
        <p className="text-muted-foreground">No tienes permiso para acceder a esta página.</p>
      </div>
    </div>
  )
}
