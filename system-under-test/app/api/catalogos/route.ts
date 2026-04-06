import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const userIdHeader = request.headers.get("x-user-id")
    if (!userIdHeader) {
      return NextResponse.json({ success: false, error: "Acceso denegado: Se requiere identificación de usuario." }, { status: 401 })
    }

    const usuarioAutenticado = await prisma.usuario.findUnique({ 
      where: { id: userIdHeader },
      include: { centros: { select: { id: true } } }
    })

    if (!usuarioAutenticado) {
      return NextResponse.json({ success: false, error: "Usuario no autorizado." }, { status: 403 })
    }

    const centroIdsAutorizados = usuarioAutenticado.centros.map(c => c.id)

    const [centros, almacenes, materiales, servicios, usuarios, unidadesMedida] = await Promise.all([
      // FILTRADO: Solo centros autorizados para este usuario
      prisma.centro.findMany({ 
        where: { id: { in: centroIdsAutorizados } },
        orderBy: { id: 'asc' } 
      }),
      // FILTRADO: Solo almacenes pertenecientes a esos centros
      prisma.almacen.findMany({ 
        where: { centroId: { in: centroIdsAutorizados } },
        orderBy: { id: 'asc' } 
      }),
      prisma.material.findMany({ orderBy: { id: 'asc' } }),
      prisma.servicio.findMany({ orderBy: { id: 'asc' } }),
      prisma.usuario.findMany({ 
        include: { roles: true },
        orderBy: { nombre: 'asc' } 
      }),
      prisma.unidadMedida.findMany({ orderBy: { id: 'asc' } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        centros,
        almacenes,
        materiales,
        servicios,
        usuarios,
        unidadesMedida,
      },
      error: null,
    })
  } catch (error) {
    console.error("Error fetching catalogs:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Error al cargar los catálogos desde la base de datos.",
    }, { status: 500 })
  }
}
