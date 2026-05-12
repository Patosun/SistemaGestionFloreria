import { NextRequest } from "next/server"
import { ok } from "@/lib/api"
import { getStockSummaries, getFreshnessAlerts } from "@/lib/inventory"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const view = searchParams.get("view") ?? "summary"

  if (view === "alerts") {
    const days = Number(searchParams.get("days") ?? "3")
    const alerts = await getFreshnessAlerts(days)
    return ok(alerts)
  }

  const summaries = await getStockSummaries()
  return ok(summaries)
}
