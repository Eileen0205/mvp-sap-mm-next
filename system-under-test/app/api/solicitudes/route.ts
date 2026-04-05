import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// GET /api/solicitudes - Listar todas
export async function GET(request: Request) {
  try {
    const userIdHeader = request.headers.get("x-user-id")
    if (!userIdHeader) {
      return NextResponse.json({ success: false, error: "Acceso denegado: No se ha identificado un usuario en sesión." }, { status: 401 })
    }

    const usuario = await prisma.usuario.findUnique({ 
      where: { id: userIdHeader },
      include: { roles: true }
    })

    if (!usuario) {
      return NextResponse.json({ success: false, error: "Usuario no autorizado." }, { status: 403 })
    }

    const solicitudes = await prisma.solicitud.findMany({
      orderBy: { id: 'desc' },
      include: {
        centro: true,
        almacen: true,
        material: true,
        servicio: true,
        unidadMedida: true,
        usuario: { select: { nombre: true } }
      }
    })
    
    const formattedData = solicitudes.map(s => ({
      ...s,
      cantidad: Number(s.cantidad),
      itemComprableNombre: s.tipo === 'MATERIAL' ? s.material?.nombre : s.servicio?.nombre,
      usuarioSolicitante: s.usuario.nombre,
      centroNombre: s.centro.nombre,
      unidadMedidaId: s.unidadMedidaId.trim(),
      fechaEntrega: s.fechaEntrega.toLocaleDateString('es-ES'),
      fechaCreacion: s.fechaCreacion.toLocaleDateString('es-ES')
    }))

    return NextResponse.json({ success: true, data: formattedData, error: null })
  } catch (error) {
    console.error("Error fetching solicitudes:", error)
    return NextResponse.json({ success: false, data: null, error: "Error al obtener solicitudes." }, { status: 500 })
  }
}

// POST /api/solicitudes - Crear nueva
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tipo, itemComprableId, descripcion, cantidad, unidadMedida: umId, fechaEntrega, centro: centroId, almacen: almacenId } = body

    if (!tipo || !itemComprableId || !descripcion || !cantidad || !umId || !fechaEntrega || !centroId) {
      return NextResponse.json({ success: false, error: "Faltan campos obligatorios." }, { status: 400 })
    }

    const numCantidad = parseFloat(cantidad)
    if (isNaN(numCantidad) || numCantidad <= 0) {
      return NextResponse.json({ success: false, error: "La cantidad debe ser un número mayor a 0." }, { status: 400 })
    }

    const [dia, mes, anio] = fechaEntrega.split('/').map(Number)
    const fechaEntregaObj = new Date(anio, mes - 1, dia)
    
    if (fechaEntregaObj.getTime() < new Date().setHours(0,0,0,0)) {
      return NextResponse.json({ success: false, error: "La fecha de entrega no puede ser anterior a hoy." }, { status: 400 })
    }

    const userIdHeader = request.headers.get("x-user-id")
    if (!userIdHeader) {
      return NextResponse.json({ success: false, error: "No se ha identificado un usuario en sesión." }, { status: 401 })
    }

    const usuario = await prisma.usuario.findUnique({ 
      where: { id: userIdHeader },
      include: { roles: true }
    })

    if (!usuario) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado." }, { status: 401 })
    }

    const count = await prisma.solicitud.count()
    const currentYear = new Date().getFullYear()
    const nextId = `PR-${currentYear}-${String(count + 1).padStart(4, '0')}`

    const nuevaSolicitud = await prisma.solicitud.create({
      data: {
        id: nextId,
        tipo,
        descripcion: descripcion.trim(),
        cantidad: numCantidad,
        unidadMedidaId: umId,
        fechaEntrega: fechaEntregaObj,
        estado: "Creada",
        usuarioId: usuario.id,
        centroId,
        almacenId: tipo === "MATERIAL" ? almacenId : null,
        materialId: tipo === "MATERIAL" ? itemComprableId : null,
        servicioId: tipo === "SERVICIO" ? itemComprableId : null,
      }
    })

    return NextResponse.json({ success: true, data: nuevaSolicitud, error: null }, { status: 201 })

  } catch (error: any) {
    console.error("Error creating solicitud:", error)
    if (error.code === 'P2002') return NextResponse.json({ success: false, error: "Ya existe una solicitud activa para el mismo ítem, centro y fecha de entrega." }, { status: 400 })
    if (error.code === 'P2003') return NextResponse.json({ success: false, error: "Error de integridad: La unidad de medida o centro no existen." }, { status: 400 })
    return NextResponse.json({ success: false, error: "Error técnico al procesar la solicitud." }, { status: 500 })
  }
}

// PATCH /api/solicitudes - Dummy para evitar 405 de la función migrateEstados
export async function PATCH() {
  return NextResponse.json({ success: true, message: "No migration needed." })
}
