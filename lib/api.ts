import { NextRequest, NextResponse } from "next/server"

export type ApiSuccess<T = unknown> = {
  ok: true
  data: T
  meta?: { page?: number; limit?: number; total?: number }
}

export type ApiError = {
  ok: false
  error: string
  details?: unknown
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

export function ok<T>(data: T, meta?: ApiSuccess["meta"]): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ ok: true, data, ...(meta ? { meta } : {}) })
}

export function err(
  message: string,
  status: number = 400,
  details?: unknown,
): NextResponse<ApiError> {
  return NextResponse.json({ ok: false, error: message, ...(details ? { details } : {}) }, { status })
}

export function unauthorized(): NextResponse<ApiError> {
  return err("No autorizado", 401)
}

export function forbidden(): NextResponse<ApiError> {
  return err("Acceso denegado", 403)
}

export function notFound(entity: string): NextResponse<ApiError> {
  return err(`${entity} no encontrado`, 404)
}

/**
 * Parsea y valida el body de una request con un schema Zod.
 * Devuelve { data } o { validationError } para manejar en el handler.
 */
export async function parseBody<T>(
  req: NextRequest,
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: { message: string } } },
): Promise<{ data: T } | { validationError: NextResponse<ApiError> }> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return { validationError: err("Body JSON inválido", 400) }
  }
  const result = schema.safeParse(body)
  if (!result.success) {
    return { validationError: err("Datos inválidos", 422, result.error?.message) }
  }
  return { data: result.data as T }
}
