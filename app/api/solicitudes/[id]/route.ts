import { NextResponse } from "next/server"
import {
  getSolicitudById,
  updateSolicitud,
  existsDuplicate,
  unidadesMedida,
} from "@/lib/data"
import type { ApiResponse, SolicitudCompra } from "@/lib/types"

function jsonResponse<T>(data: ApiResponse<T>, status: number) {
  return NextResponse.json(data, { status })
}

// GET /api/solicitudes/[id]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const solicitud = getSolicitudById(id)

    if (!solicitud) {
      return jsonResponse(
        { success: false, data: null, error: "La solicitud no existe en el sistema." },
        404
      )
    }

    return jsonResponse<SolicitudCompra>(
      { success: true, data: solicitud, error: null },
      200
    )
  } catch {
    return jsonResponse(
      { success: false, data: null, error: "Error inesperado al obtener la solicitud." },
      500
    )
  }
}

// PUT /api/solicitudes/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // ---- Check solicitud exists (RN05) ----
    const solicitud = getSolicitudById(id)
    if (!solicitud) {
      return jsonResponse(
        { success: false, data: null, error: "La solicitud no existe en el sistema." },
        404
      )
    }

    // ---- Check state is CREADA (RN09) ----
    if (solicitud.estado !== "CREADA") {
      return jsonResponse(
        {
          success: false,
          data: null,
          error: `No puede modificarse en el estado actual (${solicitud.estado}).`,
        },
        400
      )
    }

    const { descripcion, cantidad, unidadMedida, fechaEntrega } = body

    // ---- Validate required fields (RN03: only these 4 are editable) ----
    const camposObligatorios: Record<string, unknown> = {
      descripcion,
      cantidad,
      unidadMedida,
      fechaEntrega,
    }

    const camposFaltantes = Object.entries(camposObligatorios)
      .filter(([, value]) => value === undefined || value === null || value === "")
      .map(([key]) => key)

    if (camposFaltantes.length > 0) {
      return jsonResponse(
        {
          success: false,
          data: null,
          error: `Campos obligatorios faltantes: ${camposFaltantes.join(", ")}`,
        },
        400
      )
    }

    // ---- Validate descripcion (10-40 chars, trimmed) (RN13) ----
    const descTrimmed = String(descripcion).trim()
    if (descTrimmed.length < 10) {
      return jsonResponse(
        {
          success: false,
          data: null,
          error: "La descripcion es demasiado breve (min. 10 caracteres).",
        },
        400
      )
    }
    if (descTrimmed.length > 40) {
      return jsonResponse(
        {
          success: false,
          data: null,
          error: "La descripcion es demasiado larga (max. 40 caracteres).",
        },
        400
      )
    }

    // ---- Validate cantidad (RN08) ----
    const cantidadStr = String(cantidad)
    const cantidadRegex = /^\d{1,10}(\.\d{1,3})?$/
    if (!cantidadRegex.test(cantidadStr)) {
      return jsonResponse(
        {
          success: false,
          data: null,
          error: "La cantidad debe ser numerica. No se permiten valores alfanumericos.",
        },
        400
      )
    }
    const cantidadNum = parseFloat(cantidadStr)
    if (cantidadNum <= 0) {
      return jsonResponse(
        { success: false, data: null, error: "Cantidad debe ser mayor que 0." },
        400
      )
    }

    // ---- Validate unidad de medida (RN13) ----
    const umValida = unidadesMedida.find((u) => u.id === unidadMedida)
    if (!umValida) {
      return jsonResponse(
        { success: false, data: null, error: "Unidad de medida invalida." },
        400
      )
    }

    // ---- Validate fecha de entrega (RN07) ----
    const fechaParts = String(fechaEntrega).split("/")
    if (fechaParts.length !== 3) {
      return jsonResponse(
        { success: false, data: null, error: "Formato de fecha invalido. Use DD/MM/AAAA." },
        400
      )
    }
    const [dia, mes, anio] = fechaParts.map(Number)
    const fechaDate = new Date(anio, mes - 1, dia)
    if (
      isNaN(fechaDate.getTime()) ||
      fechaDate.getDate() !== dia ||
      fechaDate.getMonth() !== mes - 1 ||
      fechaDate.getFullYear() !== anio
    ) {
      return jsonResponse(
        { success: false, data: null, error: "Fecha inexistente." },
        400
      )
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fechaCheck = new Date(anio, mes - 1, dia)
    fechaCheck.setHours(0, 0, 0, 0)
    if (fechaCheck < hoy) {
      return jsonResponse(
        {
          success: false,
          data: null,
          error: "La fecha de entrega no puede ser anterior a hoy.",
        },
        400
      )
    }

    // ---- Validate duplicates (RN10) - excluding current solicitud ----
    if (existsDuplicate(solicitud.itemComprableId, solicitud.centro, fechaEntrega, id)) {
      return jsonResponse(
        {
          success: false,
          data: null,
          error:
            "Ya existe una solicitud activa para el mismo item, centro y fecha de entrega.",
        },
        400
      )
    }

    // ---- Perform update (RN11, RN12) ----
    const updated = updateSolicitud(id, {
      descripcion: descTrimmed,
      cantidad: cantidadNum,
      unidadMedida,
      fechaEntrega,
    })

    if (!updated) {
      return jsonResponse(
        {
          success: false,
          data: null,
          error: "Error al guardar los cambios. No se persistieron cambios parciales.",
        },
        500
      )
    }

    return jsonResponse<SolicitudCompra>(
      { success: true, data: updated, error: null },
      200
    )
  } catch {
    return jsonResponse(
      {
        success: false,
        data: null,
        error: "Ha ocurrido un error inesperado. Los cambios no se guardaron.",
      },
      500
    )
  }
}
