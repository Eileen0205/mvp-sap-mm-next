import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ESTADO_INICIAL } from "@/lib/types"

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
        unidadMedida: unidadMedida || existente.unidadMedida,
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
