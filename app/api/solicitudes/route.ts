import { NextResponse } from "next/server"
import {
  getSolicitudes,
  addSolicitud,
  existsDuplicate,
  centros,
  almacenes,
  materiales,
  servicios,
  unidadesMedida,
  getAlmacenesByCentro,
} from "@/lib/data"
import type { ApiResponse, SolicitudCompra } from "@/lib/types"

function jsonResponse<T>(data: ApiResponse<T>, status: number) {
  return NextResponse.json(data, { status })
}

// GET /api/solicitudes
export async function GET() {
  try {
    const data = getSolicitudes()
    return jsonResponse<SolicitudCompra[]>(
      { success: true, data, error: null },
      200
    )
  } catch {
    return jsonResponse(
      { success: false, data: null, error: "Error inesperado al obtener solicitudes." },
      500
    )
  }
}

// POST /api/solicitudes
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      tipo,
      itemComprableId,
      descripcion,
      cantidad,
      unidadMedida,
      fechaEntrega,
      centro,
      almacen,
    } = body

    // ---- Validate required fields ----
    const camposObligatorios: Record<string, unknown> = {
      tipo,
      itemComprableId,
      descripcion,
      cantidad,
      unidadMedida,
      fechaEntrega,
      centro,
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

    // ---- Validate tipo ----
    if (tipo !== "MATERIAL" && tipo !== "SERVICIO") {
      return jsonResponse(
        { success: false, data: null, error: "El tipo debe ser MATERIAL o SERVICIO." },
        400
      )
    }

    // ---- Validate descripcion (10-40 chars, trimmed) ----
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

    // ---- Validate cantidad ----
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
        { success: false, data: null, error: "La cantidad debe ser mayor que 0." },
        400
      )
    }

    // ---- Validate unidad de medida ----
    const umValida = unidadesMedida.find((u) => u.id === unidadMedida)
    if (!umValida) {
      return jsonResponse(
        { success: false, data: null, error: "Unidad de medida invalida." },
        400
      )
    }

    // ---- Validate fecha de entrega ----
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

    // ---- Validate centro ----
    const centroValido = centros.find((c) => c.id === centro)
    if (!centroValido) {
      return jsonResponse(
        { success: false, data: null, error: "Centro invalido o no autorizado." },
        400
      )
    }

    // ---- Validate item comprable ----
    let itemNombre = ""
    if (tipo === "MATERIAL") {
      const mat = materiales.find((m) => m.id === itemComprableId)
      if (!mat) {
        return jsonResponse(
          { success: false, data: null, error: "Material seleccionado no existe en el catalogo." },
          400
        )
      }
      itemNombre = mat.nombre
    } else {
      const srv = servicios.find((s) => s.id === itemComprableId)
      if (!srv) {
        return jsonResponse(
          { success: false, data: null, error: "Servicio seleccionado no existe en el catalogo." },
          400
        )
      }
      itemNombre = srv.nombre
    }

    // ---- Validate almacen (required for MATERIAL, not applicable for SERVICIO) ----
    if (tipo === "MATERIAL") {
      if (!almacen || almacen === "") {
        return jsonResponse(
          {
            success: false,
            data: null,
            error: "El almacen es obligatorio para solicitudes de material.",
          },
          400
        )
      }

      const almacenValido = almacenes.find((a) => a.id === almacen)
      if (!almacenValido) {
        return jsonResponse(
          { success: false, data: null, error: "Almacen invalido." },
          400
        )
      }

      const almacenesCentro = getAlmacenesByCentro(centro)
      const perteneceAlCentro = almacenesCentro.some((a) => a.id === almacen)
      if (!perteneceAlCentro) {
        return jsonResponse(
          {
            success: false,
            data: null,
            error: "El almacen seleccionado no pertenece al centro seleccionado.",
          },
          400
        )
      }
    }

    // ---- Validate duplicates (RN10) ----
    if (existsDuplicate(itemComprableId, centro, fechaEntrega)) {
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

    // ---- Create solicitud ----
    const nueva = addSolicitud({
      tipo,
      itemComprableId,
      itemComprableNombre: itemNombre,
      descripcion: descTrimmed,
      cantidad: cantidadNum,
      unidadMedida,
      fechaEntrega,
      centro,
      almacen: tipo === "MATERIAL" ? almacen : undefined,
    })

    return jsonResponse<SolicitudCompra>(
      { success: true, data: nueva, error: null },
      201
    )
  } catch {
    return jsonResponse(
      {
        success: false,
        data: null,
        error: "Ha ocurrido un error inesperado. Por favor, intente nuevamente.",
      },
      500
    )
  }
}
