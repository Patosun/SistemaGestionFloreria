import { config } from "dotenv"
// .env tiene DATABASE_URL real; .env.local tiene BETTER_AUTH_SECRET/URL.
// Cargamos .env primero y .env.local sin sobreescribir lo ya cargado.
config({ path: ".env" })
config({ path: ".env.local", override: false })
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"
import { auth } from "../lib/auth"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const db = new PrismaClient({ adapter })

const SEED_USERS = [
  {
    name: "Super Admin",
    email: "admin@floreriapro.com",
    password: "Admin1234!",
    role: "SUPER_ADMIN",
  },
]

async function main() {
  console.log("🌸  Seeding Florería Pro…\n")

  for (const u of SEED_USERS) {
    const existing = await db.user.findUnique({ where: { email: u.email } })

    if (existing) {
      console.log(`⚠️   Usuario ${u.email} ya existe, omitiendo.`)
      continue
    }

    // Registrar usando la misma lógica de better-auth (hash bcrypt incluido)
    const result = await auth.api.signUpEmail({
      body: {
        name: u.name,
        email: u.email,
        password: u.password,
      },
    })

    if (!result?.user) {
      console.error(`❌  Error creando ${u.email}`)
      continue
    }

    // Actualizar el rol (better-auth crea con el default "CASHIER")
    await db.user.update({
      where: { id: result.user.id },
      data: { role: u.role as never },
    })

    console.log(`✅  Creado: ${u.email}  (rol: ${u.role})`)
  }

  console.log("\n📋  Credenciales del sistema:")
  console.log("   Email    : admin@floreriapro.com")
  console.log("   Contraseña: Admin1234!")
  console.log("\n   ⚠️  Cambia la contraseña en tu primer inicio de sesión.\n")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
    await pool.end()
  })
