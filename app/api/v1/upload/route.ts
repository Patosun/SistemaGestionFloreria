import { NextRequest } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { err, ok } from "@/lib/api"

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const formData = await req.formData()
  const file = formData.get("file")

  if (!file || typeof file === "string") return err("Archivo requerido", 400)

  if (!ALLOWED_TYPES.includes(file.type)) {
    return err("Tipo de archivo no permitido. Solo JPG, PNG o WEBP.", 400)
  }

  if (file.size > MAX_SIZE) {
    return err("El archivo supera el límite de 5 MB.", 400)
  }

  const ext = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg"
  const filename = `${randomUUID()}.${ext}`
  const uploadDir = join(process.cwd(), "public", "uploads")
  const filepath = join(uploadDir, filename)

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filepath, buffer)

  return ok({ url: `/uploads/${filename}` })
}
