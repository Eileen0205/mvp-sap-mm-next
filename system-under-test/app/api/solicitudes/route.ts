import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const solicitudes = await prisma.solicitud.findMany({
      orderBy: { id: 'desc' },
      include: {
        centro: true,
        almacen: true,
        material: true,
        servicio: true,
        usuario: { select: { nombre: true } }
      }
    })
    
    // Transformar para que el frontend reciba los nombres como espera
    const formattedData = solicitudes.map(s => ({
      ...s,
      itemComprableNombre: s.tipo === 'MATERIAL' ? s.material?.nombre : s.servicio?.nombre,
      usuarioSolicitante: s.usuario.nombre,
      centroNombre: s.centro.nombre,
      unidadMedida: s.unidadMedidaId, // Mapeo para el frontend
      // Convertir fechas a formato legible DD/MM/AAAA para el frontend actual
      fechaEntrega: s.fechaEntrega.toLocaleDateString('es-ES'),
      fechaCreacion: s.fechaCreacion.toLocaleDateString('es-ES')
    }))

    return NextResponse.json({ success: true, data: formattedData, error: null })
  } catch (error) {
    console.error("Error fetching solicitudes:", error)
    return NextResponse.json({ success: false, data: null, error: "Error al obtener solicitudes." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tipo, itemComprableId, descripcion, cantidad, unidadMedida, fechaEntrega, centro: centroId, almacen: almacenId } = body

    // 1. Validaciones de Negocio Críticas (RN07, RN04)
    if (!tipo || !itemComprableId || !descripcion || !cantidad || !unidadMedida || !fechaEntrega || !centroId) {
      return NextResponse.json({ success: false, error: "Faltan campos obligatorios." }, { status: 400 })
    }

    const numCantidad = parseFloat(cantidad)
    if (isNaN(numCantidad) || numCantidad <= 0) {
      return NextResponse.json({ success: false, error: "La cantidad debe ser un número mayor a 0." }, { status: 400 })
    }

    if (descripcion.trim().length < 10 || descripcion.trim().length > 40) {
      return NextResponse.json({ success: false, error: "La descripción debe tener entre 10 y 40 caracteres." }, { status: 400 })
    }

    // 2. Procesar Fechas
    // Esperamos formato DD/MM/AAAA del frontend
    const [dia, mes, anio] = fechaEntrega.split('/').map(Number)
    const fechaEntregaObj = new Date(anio, mes - 1, dia)
    
    if (fechaEntregaObj < new Date().setHours(0,0,0,0)) {
      return NextResponse.json({ success: false, error: "La fecha de entrega no puede ser anterior a hoy." }, { status: 400 })
    }

    // 3. Obtener Usuario desde Headers (Simulando autenticacion para QA)
    const userIdHeader = request.headers.get("x-user-id")
    
    if (!userIdHeader) {
      return NextResponse.json({ success: false, error: "No se ha identificado un usuario en sesion." }, { status: 401 })
    }

    const usuario = await prisma.usuario.findUnique({ 
      where: { id: userIdHeader },
      include: { roles: true }
    })

    if (!usuario) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado en la base de datos." }, { status: 401 })
    }

    // Validación de Rol para Creación (RN: Solo Solicitantes pueden crear)
    const isSolicitante = usuario.roles.some(r => r.id === 'SOLICITANTE')
    if (!isSolicitante) {
      return NextResponse.json({ 
        success: false, 
        error: `El usuario ${usuario.nombre} tiene rol ${usuario.roles[0]?.id || 'N/A'} y no tiene permisos para CREAR solicitudes.` 
      }, { status: 403 })
    }

    // 4. Generar ID Secuencial (PR-2026-####)
    const count = await prisma.solicitud.count()
    const currentYear = new Date().getFullYear()
    const nextId = `PR-${currentYear}-${String(count + 1).padStart(4, '0')}`

    // 5. Persistir en la Base de Datos
    const nuevaSolicitud = await prisma.solicitud.create({
      data: {
        id: nextId,
        tipo,
        descripcion: descripcion.trim(),
        cantidad: numCantidad,
        unidadMedidaId: unidadMedida, // Usamos el ID que viene del combo
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
    
    // Manejo de la Tríada de Unicidad (P2 - Nivel 3 Robustez)
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        success: false, 
        error: "Ya existe una solicitud activa para el mismo ítem, centro y fecha de entrega." 
      }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Error técnico al procesar la solicitud." }, { status: 500 })
  }
}
