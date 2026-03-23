import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { materiales, servicios, centros, almacenes } from "@/lib/data"
import { ESTADO_INICIAL, ESTADOS_SOLICITUD } from "@/lib/types"

// Forzar que la API consulte siempre la base de datos real (Postgres)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Asegurar conexión activa antes de la consulta
    await prisma.$connect()
    
    const data = await prisma.solicitud.findMany({
      orderBy: { id: 'desc' }
    })
    return NextResponse.json({ success: true, data, error: null })
  } catch (err) {
    console.error("ERROR GET /api/solicitudes:", err)
    // Intentar reconectar en caso de conexión perdida
    try {
      await prisma.$disconnect()
    } catch {
      // Ignorar errores de desconexión
    }
    return NextResponse.json({ success: false, data: null, error: "Error al obtener solicitudes de la base de datos." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Blindaje contra Body Vacío
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: "El cuerpo de la petición está vacío o no es un JSON válido."
      }, { status: 400 });
    }

    const { tipo, itemComprableId, descripcion, cantidad, unidadMedida, fechaEntrega, centro, almacen } = body;

    // 1. Validar Campos Obligatorios Básicos (RN07)
    // Nota: cantidad usa verificación explícita para permitir el valor 0 (que luego se valida como rango)
    if (!tipo || !itemComprableId || !descripcion || cantidad === undefined || cantidad === null || cantidad === '' || !unidadMedida || !fechaEntrega || !centro) {
      return NextResponse.json({ success: false, error: "Faltan campos obligatorios para procesar la solicitud." }, { status: 400 });
    }

    // 2. Validar Cantidad - Valores alfanuméricos (bloqueo total)
    const cantidadStr = cantidad.toString();
    if (isNaN(Number(cantidad)) || /[a-zA-Z$%&@!#*]/.test(cantidadStr)) {
      return NextResponse.json({ success: false, error: "La cantidad no permite valores alfanuméricos." }, { status: 400 });
    }

    // 3. Validar Cantidad - Rango (> 0) (RN04)
    const numCantidad = parseFloat(cantidadStr);
    if (numCantidad <= 0) {
      return NextResponse.json({ success: false, error: "La cantidad debe ser un valor mayor que 0." }, { status: 400 });
    }

    // 4. Validar Cantidad - Máximo 3 decimales
    if (/\.\d{4,}/.test(cantidadStr)) {
      return NextResponse.json({ success: false, error: "La cantidad solo permite hasta 3 decimales." }, { status: 400 });
    }

    // 5. Validar Cantidad - Máximo 10 enteros
    const parteEntera = cantidadStr.split('.')[0];
    if (parteEntera.length > 10) {
      return NextResponse.json({ success: false, error: "Error de validación por longitud, solo se permiten hasta 10 enteros." }, { status: 400 });
    }

    // 6. Validar Fecha de Entrega - Formato Estricto DD/MM/YYYY (TC-12)
    const formatoFechaRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const matchFecha = fechaEntrega.match(formatoFechaRegex);
    if (!matchFecha) {
      return NextResponse.json({ success: false, error: "Formato de fecha inválido. Use DD/MM/YYYY." }, { status: 400 });
    }
    const [, diaStr, mesStr, anioStr] = matchFecha;
    const dia = parseInt(diaStr, 10);
    const mes = parseInt(mesStr, 10);
    const anio = parseInt(anioStr, 10);
    
    // Validar que sea una fecha de calendario real
    const fechaEntregaObj = new Date(anio, mes - 1, dia);
    if (
      fechaEntregaObj.getFullYear() !== anio ||
      fechaEntregaObj.getMonth() !== mes - 1 ||
      fechaEntregaObj.getDate() !== dia
    ) {
      return NextResponse.json({ success: false, error: "Formato de fecha inválido. Use DD/MM/YYYY." }, { status: 400 });
    }

    // 7. Validar Fecha de Entrega - No permitir fechas pasadas (RN03)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaEntregaObj < hoy) {
      return NextResponse.json({ success: false, error: "La fecha de entrega no puede ser anterior a la fecha actual." }, { status: 400 });
    }

    // 8. VALIDACIÓN DE DATOS MAESTROS (SEGURIDAD DE CATÁLOGOS)
    // Validar Centro
    const centroExiste = centros.find(c => c.id === centro);
    if (!centroExiste) {
      return NextResponse.json({ success: false, error: "El Centro seleccionado no es válido o no existe en el sistema." }, { status: 400 });
    }

    // Validar Item Comprable (Material o Servicio)
    const materialEncontrado = materiales.find(m => m.id === itemComprableId);
    const servicioEncontrado = servicios.find(s => s.id === itemComprableId);

    if (tipo === "MATERIAL" && !materialEncontrado) {
      return NextResponse.json({ success: false, error: "El ID de Material no existe en el catálogo oficial." }, { status: 400 });
    }
    if (tipo === "SERVICIO" && !servicioEncontrado) {
      return NextResponse.json({ success: false, error: "El ID de Servicio no existe en el catálogo oficial." }, { status: 400 });
    }

    // Validar Almacén (Solo para MATERIAL)
    if (tipo === "MATERIAL") {
      if (!almacen) {
        return NextResponse.json({ success: false, error: "El Almacén es obligatorio para solicitudes de material." }, { status: 400 });
      }
      const almacenExiste = almacenes.find(a => a.id === almacen && a.centroId === centro);
      if (!almacenExiste) {
        return NextResponse.json({ success: false, error: "El Almacén seleccionado no existe o no pertenece al Centro indicado." }, { status: 400 });
      }
    }

    // 9. Validar Descripción (10-40 caracteres) (RN07)
    const descTrim = descripcion.trim();
    if (descTrim.length < 10 || descTrim.length > 40) {
      return NextResponse.json({
        success: false,
        error: `La descripción debe tener entre 10 y 40 caracteres (Actual: ${descTrim.length}).`
      }, { status: 400 });
    }

    // 10. Validar Duplicidad Real en Postgres (RN10)
    const duplicado = await prisma.solicitud.findFirst({
      where: {
        itemComprableId,
        centro,
        fechaEntrega,
        estado: { not: ESTADOS_SOLICITUD.RECHAZADA }
      }
    });

    if (duplicado) {
      return NextResponse.json({
        success: false,
        error: "Ya existe una solicitud activa para el mismo ítem, centro y fecha de entrega."
      }, { status: 400 });
    }

    // 11. Preparar datos finales para persistencia
    const itemNombre = tipo === "MATERIAL" ? materialEncontrado!.nombre : servicioEncontrado!.nombre;
    const almacenFinal = tipo === "MATERIAL" ? almacen : null;

    // 12. Generar ID Secuencial y Guardar en PostgreSQL
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
        estado: ESTADO_INICIAL
      }
    });

    return NextResponse.json({ success: true, data: nuevaSolicitud, error: null }, { status: 201 });

  } catch (err) {
    console.error("CRITICAL ERROR POST /api/solicitudes:", err);
    // Intentar limpiar conexión en caso de error
    try {
      await prisma.$disconnect()
    } catch {
      // Ignorar errores de desconexión
    }
    return NextResponse.json({
      success: false,
      error: "Error técnico inesperado al persistir en la base de datos."
    }, { status: 500 });
  }
}
