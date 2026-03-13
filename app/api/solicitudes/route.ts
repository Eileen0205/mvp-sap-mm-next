import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { centros, unidadesMedida, materiales, servicios } from "@/lib/data"

// GET /api/solicitudes - Leer de la DB real
export async function GET() {
  try {
    const data = await prisma.solicitud.findMany({
      orderBy: { id: 'desc' }
    })
    return NextResponse.json({ success: true, data, error: null })
  } catch (err) {
    console.error("Error en GET /api/solicitudes:", err)
    return NextResponse.json({ success: false, data: null, error: "Error al obtener solicitudes de la DB." }, { status: 500 })
  }
}

// POST /api/solicitudes - Guardar en la DB real
export async function POST(request: Request) {
  try {
    // 1. Validar si el cuerpo de la petición existe
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: "Cuerpo de petición (JSON) inválido o vacío." }, { status: 400 });
    }

    const { tipo, itemComprableId, descripcion, cantidad, unidadMedida, fechaEntrega, centro, almacen } = body;

    // 1. Validar campos obligatorios básicos
    if (!tipo || !itemComprableId || !descripcion || !cantidad || !unidadMedida || !fechaEntrega || !centro) {
        return NextResponse.json({ success: false, error: "Campos obligatorios faltantes." }, { status: 400 })
    }

    // 2. Validar Duplicidad (RN10) en la DB real
    const duplicado = await prisma.solicitud.findFirst({
      where: {
        itemComprableId,
        centro,
        fechaEntrega,
        estado: { not: "RECHAZADA" }
      }
    })

    if (duplicado) {
      return NextResponse.json({ 
        success: false, 
        error: "Ya existe una solicitud activa para el mismo item, centro y fecha de entrega." 
      }, { status: 400 })
    }

    // 3. Obtener Nombre del Item para guardar integridad
    const itemNombre = (tipo === "MATERIAL" 
      ? materiales.find(m => m.id === itemComprableId)?.nombre 
      : servicios.find(s => s.id === itemComprableId)?.nombre) || "Item Desconocido"

    // 4. Generar ID secuencial real basado en el conteo total
    const count = await prisma.solicitud.count()
    const year = new Date().getFullYear()
    const nextId = `PR-${year}-${String(count + 1).padStart(4, '0')}`

    // 5. Crear en Postgres
    const nueva = await prisma.solicitud.create({
      data: {
        id: nextId,
        tipo,
        itemComprableId,
        itemComprableNombre: itemNombre,
        descripcion: descripcion.trim(),
        cantidad: parseFloat(cantidad),
        unidadMedida,
        fechaEntrega,
        fechaCreacion: new Date().toLocaleDateString("es-ES"),
        centro,
        almacen: tipo === "MATERIAL" ? almacen : null,
        estado: "CREADA"
      }
    })

    return NextResponse.json({ success: true, data: nueva, error: null }, { status: 201 })
  } catch (err) {
    console.error("Error en POST /api/solicitudes:", err)
    return NextResponse.json({ success: false, error: "Error técnico al persistir en la DB." }, { status: 500 })
  }
}
