import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { materiales, servicios } from "@/lib/data"

export const dynamic = 'force-dynamic';
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
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tipo, itemComprableId, descripcion, cantidad, unidadMedida, fechaEntrega, centro, almacen } = body;

    // --- 1. VALIDACIÓN DE CAMPOS OBLIGATORIOS (RN07) ---
    if (!tipo || !itemComprableId || !descripcion || !cantidad || !unidadMedida || !fechaEntrega || !centro) {
      return NextResponse.json({ success: false, error: "Faltan campos obligatorios para procesar la solicitud." }, { status: 400 });
    }

    // --- 2. VALIDACIÓN DE DESCRIPCIÓN (RN07 - QA CONS) ---
    const descTrim = descripcion.trim();
    if (descTrim.length < 10 || descTrim.length > 40) {
      return NextResponse.json({
        success: false,
        error: `La descripción debe tener entre 10 y 40 caracteres (Actual: ${descTrim.length}).`
      }, { status: 400 });
    }

    // --- 3. VALIDACIÓN DE CANTIDAD (RN04) ---
    const numCantidad = parseFloat(cantidad);
    if (isNaN(numCantidad) || numCantidad <= 0) {
      return NextResponse.json({
        success: false, error: "La cantidad debe ser un número mayor a 0."
      }, { status: 400 });
    }
    // Validación de formato decimal (Máx 3 decimales)
    if (!/^\d+(\.\d{1,3})?$/.test(cantidad.toString())) {
      return NextResponse.json({ success: false, error: "La cantidad permite un máximo de 3 decimales." }, { status: 400 });
    }

    // --- 4. VALIDACIÓN DE FECHA DE ENTREGA (RN03) ---
    const [dia, mes, anio] = fechaEntrega.split('/').map(Number);
    const fechaEntregaObj = new Date(anio, mes - 1, dia);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaEntregaObj < hoy) {
      return NextResponse.json({ success: false, error: "La fecha de entrega no puede ser anterior a la fecha actual." }, { status: 400 });
    }

    // --- 5. LÓGICA DE ALMACÉN (RN08) ---
    if (tipo === "MATERIAL" && !almacen) {
      return NextResponse.json({ success: false, error: "El almacén es obligatorio para solicitudes de material." }, { status: 400 });
    }
    const almacenFinal = tipo === "MATERIAL" ? almacen : null;

    // --- 6. VALIDACIÓN DE DUPLICIDAD (RN10) ---
    const duplicado = await prisma.solicitud.findFirst({
      where: {
        itemComprableId,
        centro,
        fechaEntrega,
        estado: { not: "RECHAZADA" }
      }
    });

    if (duplicado) {
      return NextResponse.json({
        success: false,
        error: "Ya existe una solicitud activa para el mismo ítem, centro y fecha de entrega."
      }, { status: 400 });
    }

    // --- 7. OBTENER NOMBRE DEL ÍTEM ---
    const itemNombre = (tipo === "MATERIAL"
      ? materiales.find(m => m.id === itemComprableId)?.nombre : servicios.find(s => s.id === itemComprableId)?.nombre) || "Item Desconocido";

    // --- 8. GENERACIÓN DE ID Y PERSISTENCIA ATÓMICA ---
    const count = await prisma.solicitud.count();
    const currentYear = new Date().getFullYear();
    const nextId = `PR-${currentYear}-${String(count + 1).padStart(4, '0')}`;
    const nuevaSolicitud = await prisma.solicitud.create({
      data: {
        id: nextId,
        tipo,
        itemComprableId,
        itemComprableNombre: itemNombre,
        descripcion: descTrim,
        cantidad: numCantidad,
        unidadMedida,
        fechaEntrega,
        fechaCreacion: new Date().toLocaleDateString("es-ES"),
        centro,
        almacen: almacenFinal,
        estado: "CREADA"
      }
    });
    return NextResponse.json({ success: true, data: nuevaSolicitud, error: null }, {
      status: 201
    });

  } catch (err) {
    console.error("CRITICAL ERROR POST /api/solicitudes:", err);
    return NextResponse.json({
      success: false,
      error: "Error técnico inesperado. Por favor, contacte a soporte."
    }, { status: 500 });

  }

}