import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/solicitudes/[id] - Visualizar detalle
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const solicitud = await prisma.solicitud.findUnique({
      where: { id },
      include: {
        centro: true,
        almacen: true,
        material: true,
        servicio: true,
        unidadMedida: true,
        usuario: { select: { nombre: true, id: true } }
      }
    })

    if (!solicitud) {
      return NextResponse.json({ success: false, error: "Solicitud no encontrada." }, { status: 404 })
    }

    const formatted = {
      ...solicitud,
      cantidad: Number(solicitud.cantidad),
      itemComprableNombre: solicitud.tipo === 'MATERIAL' ? solicitud.material?.nombre : solicitud.servicio?.nombre,
      usuarioSolicitante: solicitud.usuario.nombre,
      unidadMedidaId: solicitud.unidadMedidaId.trim(),
      fechaEntrega: solicitud.fechaEntrega.toLocaleDateString('es-ES'),
      fechaCreacion: solicitud.fechaCreacion.toLocaleDateString('es-ES')
    }

    return NextResponse.json({ success: true, data: formatted })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error al obtener el detalle." }, { status: 500 })
  }
}

// PUT /api/solicitudes/[id] - Modificar solicitud
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const userIdHeader = request.headers.get("x-user-id")

    if (!userIdHeader) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 })
    }

    // 1. Validar existencia y estado (Regla de Negocio: Solo 'Creada' es modificable)
    const existente = await prisma.solicitud.findUnique({ where: { id } })
    if (!existente) return NextResponse.json({ success: false, error: "No existe." }, { status: 404 })
    
    if (existente.estado !== "Creada") {
      return NextResponse.json({ 
        success: false, 
        error: `Regla de Negocio: No se puede modificar una solicitud en estado ${existente.estado}.` 
      }, { status: 400 })
    }

    // 2. Validar que el usuario es el dueño (o tiene permisos suficientes)
    if (existente.usuarioId !== userIdHeader) {
      return NextResponse.json({ success: false, error: "No tiene permisos para modificar esta solicitud." }, { status: 403 })
    }

    // 3. Procesar campos permitidos
    const { descripcion, cantidad, unidadMedida: umId, fechaEntrega } = body
    
    // Validacion de longitud de descripcion (Regla de Negocio EPIC-01)
    if (descripcion && (descripcion.length < 10 || descripcion.length > 40)) {
      return NextResponse.json({ success: false, error: "La descripción debe tener entre 10 y 40 caracteres." }, { status: 400 })
    }

    const [dia, mes, anio] = fechaEntrega.split('/').map(Number)
    const fechaEntregaObj = new Date(anio, mes - 1, dia)

    const actualizada = await prisma.solicitud.update({
      where: { id },
      data: {
        descripcion: descripcion?.trim(),
        cantidad: parseFloat(cantidad),
        unidadMedidaId: umId,
        fechaEntrega: fechaEntregaObj
      }
    })

    return NextResponse.json({ success: true, data: actualizada })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error al actualizar." }, { status: 500 })
  }
}

// PATCH /api/solicitudes/[id] - Cambio de Estado (Workflow)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const { estado } = await request.json()
    const userIdHeader = request.headers.get("x-user-id")

    const existente = await prisma.solicitud.findUnique({ where: { id } })
    if (!existente) return NextResponse.json({ success: false, error: "No existe." }, { status: 404 })

    // Validar Transición (Regla de Negocio GE | Validar transiciones)
    // Creada -> EnRevision
    if (existente.estado === "Creada" && estado === "EnRevision") {
      const actualizada = await prisma.solicitud.update({
        where: { id },
        data: { estado }
      })
      return NextResponse.json({ success: true, data: actualizada })
    }

    // EnRevision -> Aprobada/Rechazada (Solo si el rol es APROBADOR - Simplificado aquí)
    if (existente.estado === "EnRevision" && (estado === "Aprobada" || estado === "Rechazada")) {
      const actualizada = await prisma.solicitud.update({
        where: { id },
        data: { estado }
      })
      return NextResponse.json({ success: true, data: actualizada })
    }

    return NextResponse.json({ 
      success: false, 
      error: `Transición de estado no permitida: ${existente.estado} -> ${estado}` 
    }, { status: 400 })

  } catch (error) {
    return NextResponse.json({ success: false, error: "Error en el workflow de estados." }, { status: 500 })
  }
}
