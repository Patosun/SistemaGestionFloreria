import nodemailer from "nodemailer"

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env["SMTP_HOST"],
    port: Number(process.env["SMTP_PORT"] ?? "587"),
    secure: process.env["SMTP_SECURE"] === "true",
    auth: {
      user: process.env["SMTP_USER"],
      pass: process.env["SMTP_PASS"],
    },
  })
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!process.env["SMTP_HOST"]) {
    console.warn("[email] SMTP_HOST not configured – skipping email to:", to)
    return
  }
  const transporter = createTransporter()
  await transporter.sendMail({
    from: process.env["SMTP_FROM"] ?? "Aleslí <noreply@alesli.com>",
    to,
    subject,
    html,
  })
}

export async function sendVerificationEmail(to: string, url: string) {
  await sendEmail({
    to,
    subject: "Verifica tu cuenta en Aleslí",
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;background:#FDF3F6">
        <div style="text-align:center;margin-bottom:32px">
          <h1 style="color:#93276F;font-size:28px;letter-spacing:0.2em;text-transform:uppercase;margin:0">Aleslí</h1>
          <p style="color:#E6A1B8;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin-top:4px">Naturalmente para ti</p>
        </div>
        <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #E6A1B8">
          <h2 style="color:#93276F;font-size:20px;margin-top:0">Confirma tu correo</h2>
          <p style="color:#555;line-height:1.6">Gracias por registrarte. Haz clic en el botón para verificar tu cuenta y empezar a hacer pedidos.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${url}" style="background:#93276F;color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:12px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase">
              Verificar mi cuenta
            </a>
          </div>
          <p style="color:#999;font-size:12px">Si no creaste esta cuenta puedes ignorar este mensaje.</p>
        </div>
        <p style="text-align:center;color:#E6A1B8;font-size:10px;margin-top:24px;text-transform:uppercase;letter-spacing:0.2em">
          © 2026 Aleslí Diseño Floral · La Paz, Bolivia
        </p>
      </div>
    `,
  })
}

export async function sendOrderConfirmation({
  to,
  name,
  orderNumber,
  items,
  total,
  scheduledDate,
  deliverySlot,
  shippingAddress,
}: {
  to: string
  name: string
  orderNumber: string
  items: { name: string; quantity: number; unitPrice: number }[]
  total: number
  scheduledDate: string
  deliverySlot: string
  shippingAddress: string
}) {
  const slotLabel: Record<string, string> = {
    SLOT_09_12: "09:00 – 12:00",
    SLOT_12_15: "12:00 – 15:00",
    SLOT_15_18: "15:00 – 18:00",
    SLOT_18_21: "18:00 – 21:00",
  }

  const itemsHtml = items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px;color:#555">${i.name}</td>
        <td style="padding:8px;text-align:center;color:#555">${i.quantity}</td>
        <td style="padding:8px;text-align:right;color:#93276F;font-weight:bold">Bs. ${(i.unitPrice * i.quantity).toFixed(0)}</td>
      </tr>`
    )
    .join("")

  await sendEmail({
    to,
    subject: `Pedido confirmado #${orderNumber.slice(-8).toUpperCase()} – Aleslí`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;background:#FDF3F6">
        <div style="text-align:center;margin-bottom:32px">
          <h1 style="color:#93276F;font-size:28px;letter-spacing:0.2em;text-transform:uppercase;margin:0">Aleslí</h1>
          <p style="color:#E6A1B8;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin-top:4px">Naturalmente para ti</p>
        </div>
        <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #E6A1B8">
          <h2 style="color:#93276F;margin-top:0">¡Gracias por tu pedido, ${name}!</h2>
          <p style="color:#555">Tu pedido <strong>#${orderNumber.slice(-8).toUpperCase()}</strong> fue recibido y está siendo preparado con mucho amor.</p>

          <h3 style="color:#93276F;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;margin-top:24px">Detalles de entrega</h3>
          <div style="background:#FDF3F6;border-radius:8px;padding:16px;margin-bottom:24px">
            <p style="margin:4px 0;color:#555"><strong>Fecha:</strong> ${scheduledDate}</p>
            <p style="margin:4px 0;color:#555"><strong>Horario:</strong> ${slotLabel[deliverySlot] ?? deliverySlot}</p>
            <p style="margin:4px 0;color:#555"><strong>Dirección:</strong> ${shippingAddress}</p>
          </div>

          <h3 style="color:#93276F;font-size:13px;letter-spacing:0.1em;text-transform:uppercase">Tu pedido</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
            <thead>
              <tr style="border-bottom:1px solid #E6A1B8">
                <th style="padding:8px;text-align:left;color:#93276F;font-size:12px">Producto</th>
                <th style="padding:8px;text-align:center;color:#93276F;font-size:12px">Cant.</th>
                <th style="padding:8px;text-align:right;color:#93276F;font-size:12px">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr style="border-top:2px solid #E6A1B8">
                <td colspan="2" style="padding:12px 8px;font-weight:bold;color:#93276F">Total</td>
                <td style="padding:12px 8px;text-align:right;font-size:20px;font-weight:bold;color:#93276F">Bs. ${total.toFixed(0)}</td>
              </tr>
            </tfoot>
          </table>

          <p style="color:#555;font-size:13px">
            ¿Alguna consulta? Escríbenos por WhatsApp al
            <a href="https://wa.me/59177793200" style="color:#93276F">+591 77793200</a>.
          </p>
        </div>
        <p style="text-align:center;color:#E6A1B8;font-size:10px;margin-top:24px;text-transform:uppercase;letter-spacing:0.2em">
          © 2026 Aleslí Diseño Floral · La Paz, Bolivia
        </p>
      </div>
    `,
  })
}
