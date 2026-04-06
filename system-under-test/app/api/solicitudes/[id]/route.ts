import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ESTADO_INICIAL, ESTADOS_SOLICITUD, type EstadoSolicitud } from "@/lib/types"

// Estados válidos para transición
const VALID_ESTADOS: EstadoSolicitud[] = ["Creada", "EnRevision", "Aprobada", "Rechazada"]

// GET /api/solicitudes/[id] - Visualizar detalle real
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdHeader = request.headers.get("x-user-id")
    if (!userIdHeader) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    const { id } = await params
    const solicitud = await prisma.solicitud.findUnique({
      where: { id },
      include: {
        centro: true,
        almacen: true,
        material: true,
        servicio: true,
        unidadMedida: true,
        usuario: { select: { nombre: true } }
      }
    })

    if (!solicitud) {
      return NextResponse.json({ success: false, error: "Solicitud no encontrada." }, { status: 404 })
    }

    // Seguridad: ¿El usuario tiene permiso sobre el centro de esta solicitud?
    const usuarioAuth = await prisma.usuario.findUnique({
      where: { id: userIdHeader },
      include: { centros: true }
    })

    if (!usuarioAuth || !usuarioAuth.centros.some(c => c.id === solicitud.centroId)) {
      return NextResponse.json({ 
        success: false, 
        error: "No tiene permisos para visualizar esta solicitud." 
      }, { status: 403 })
    }

    // Transformar para el frontend igual que en el listado
    const formatted = {
      ...solicitud,
      itemComprableNombre: solicitud.tipo === 'MATERIAL' ? solicitud.material?.nombre : solicitud.servicio?.nombre,
      usuarioSolicitante: solicitud.usuario.nombre,
      centroNombre: solicitud.centro.nombre,
      unidadMedida: solicitud.unidadMedidaId.trim(),
      fechaEntrega: solicitud.fechaEntrega.toLocaleDateString('es-ES'),
      fechaCreacion: solicitud.fechaCreacion.toLocaleDateString('es-ES')
    }

    return NextResponse.json({ success: true, data: formatted, error: null })
  } catch (err) {
    console.error("ERROR GET /api/solicitudes/[id]:", err)
    return NextResponse.json({ success: false, error: "Error al consultar la solicitud." }, { status: 500 })
  }
}

// PUT /api/solicitudes/[id] - Modificar en DB real
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdHeader = request.headers.get("x-user-id")
    if (!userIdHeader) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { descripcion, cantidad, unidadMedida, fechaEntrega } = body

    // 1. Verificar si existe
    const existente = await prisma.solicitud.findUnique({
      where: { id }
    })

    if (!existente) {
      return NextResponse.json({ success: false, error: "Solicitud no encontrada." }, { status: 404 })
    }

    // Seguridad: ¿El usuario tiene permiso sobre el centro de esta solicitud?
    const usuarioAuth = await prisma.usuario.findUnique({
      where: { id: userIdHeader },
      include: { centros: true }
    })

    if (!usuarioAuth || !usuarioAuth.centros.some(c => c.id === existente.centroId)) {
      return NextResponse.json({ success: false, error: "No tiene permisos para modificar esta solicitud." }, { status: 403 })
    }

    if (existente.estado !== ESTADO_INICIAL) {
      return NextResponse.json({ success: false, error: `Solo se pueden modificar solicitudes en estado ${ESTADO_INICIAL}.` }, { status: 400 })
    }

    // 2. Actualizar en Postgres
    const actualizada = await prisma.solicitud.update({
      where: { id },
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
    return NextResponse.json({ success: false, error: "Error técnico al actualizar en la DB." }, { status: 500 })
  }
}

// PATCH /api/solicitudes/[id] - Cambiar estado de la solicitud
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdHeader = request.headers.get("x-user-id")
    if (!userIdHeader) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    const { id } = await params
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
      where: { id }
    })

    if (!existente) {
      return NextResponse.json({ 
        success: false, 
        error: "Solicitud no encontrada." 
      }, { status: 404 })
    }

    // Seguridad: ¿El usuario tiene permiso sobre el centro de esta solicitud?
    const usuarioAuth = await prisma.usuario.findUnique({
      where: { id: userIdHeader },
      include: { centros: true }
    })

    if (!usuarioAuth || !usuarioAuth.centros.some(c => c.id === existente.centroId)) {
      return NextResponse.json({ 
        success: false, 
        error: "No tiene permisos para cambiar el estado de esta solicitud." 
      }, { status: 403 })
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
      where: { id },
      data: { estado }
    })

    return NextResponse.json({ 
      success: true, 
      data: actualizada, 
      error: null 
    })

  } catch (err) {
    console.error("Error en PATCH /api/solicitudes/[id]:", err)
    return NextResponse.json({ 
      success: false, 
      error: "Error técnico al cambiar el estado." 
    }, { status: 500 })
  }
}
