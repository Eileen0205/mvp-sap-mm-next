import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ESTADO_INICIAL, ESTADOS_SOLICITUD, type EstadoSolicitud } from "@/lib/types"

// Estados válidos para transición
const VALID_ESTADOS: EstadoSolicitud[] = ["Creada", "EnRevision", "Aprobada", "Rechazada"]

// GET /api/solicitudes/[id] - Visualizar detalle real
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.$connect()
    
    const solicitud = await prisma.solicitud.findUnique({
      where: { id: params.id }
    })

    if (!solicitud) {
      return NextResponse.json({ success: false, error: "Solicitud no encontrada." }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: solicitud, error: null })
  } catch (err) {
    console.error("ERROR GET /api/solicitudes/[id]:", err)
    try {
      await prisma.$disconnect()
    } catch {
      // Ignorar errores de desconexión
    }
    return NextResponse.json({ success: false, error: "Error al consultar la solicitud." }, { status: 500 })
  }
}

// PUT /api/solicitudes/[id] - Modificar en DB real
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.$connect()
    
    const body = await request.json()
    const { descripcion, cantidad, unidadMedida, fechaEntrega } = body

    // 1. Verificar si existe y si está en estado CREADA (RN)
    const existente = await prisma.solicitud.findUnique({
      where: { id: params.id }
    })

    if (!existente) {
      return NextResponse.json({ success: false, error: "Solicitud no encontrada." }, { status: 404 })
    }

    if (existente.estado !== ESTADO_INICIAL) {
      return NextResponse.json({ success: false, error: `Solo se pueden modificar solicitudes en estado ${ESTADO_INICIAL}.` }, { status: 400 })
    }

    // 2. Actualizar en Postgres
    const actualizada = await prisma.solicitud.update({
      where: { id: params.id },
      data: {
        descripcion: descripcion ? descripcion.trim() : existente.descripcion,
        cantidad: cantidad ? parseFloat(cantidad) : existente.cantidad,
        unidadMedidaId: unidadMedida || existente.unidadMedidaId,
        fechaEntrega: fechaEntrega || existente.fechaEntrega,
      }
    })

    return NextResponse.json({ success: true, data: actualizada, error: null })
  } catch (err) {
    console.error("Error en PUT /api/solicitudes/[id]:", err)
    try {
      await prisma.$disconnect()
    } catch {
      // Ignorar errores de desconexión
    }
    return NextResponse.json({ success: false, error: "Error técnico al actualizar en la DB." }, { status: 500 })
  }
}

// PATCH /api/solicitudes/[id] - Cambiar estado de la solicitud
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.$connect()
    
    const body = await request.json()
    const { estado } = body

    // Validar que se envió un estado
    if (!estado) {
      return NextResponse.json({ 
        success: false, 
        error: "El campo 'estado' es requerido." 
      }, { status: 400 })
    }

    // Validar que el estado es válido
    if (!VALID_ESTADOS.includes(estado)) {
      return NextResponse.json({ 
        success: false, 
        error: `Estado inválido. Estados permitidos: ${VALID_ESTADOS.join(", ")}` 
      }, { status: 400 })
    }

    // Verificar si existe la solicitud
    const existente = await prisma.solicitud.findUnique({
      where: { id: params.id }
    })

    if (!existente) {
      return NextResponse.json({ 
        success: false, 
        error: "Solicitud no encontrada." 
      }, { status: 404 })
    }

    // Validar transición de estado (solo desde "Creada" se puede enviar a revisión)
    if (estado === ESTADOS_SOLICITUD.EN_REVISION && existente.estado !== ESTADO_INICIAL) {
      return NextResponse.json({ 
        success: false, 
        error: `Solo se pueden enviar a revisión solicitudes en estado ${ESTADO_INICIAL}.` 
      }, { status: 400 })
    }

    // Actualizar estado en la base de datos
    const actualizada = await prisma.solicitud.update({
      where: { id: params.id },
      data: { estado }
    })

    return NextResponse.json({ 
      success: true, 
      data: actualizada, 
      error: null 
    })

  } catch (err) {
    console.error("Error en PATCH /api/solicitudes/[id]:", err)
    try {
      await prisma.$disconnect()
    } catch {
      // Ignorar errores de desconexión
    }
    return NextResponse.json({ 
      success: false, 
      error: "Error técnico al cambiar el estado." 
    }, { status: 500 })
  }
}
