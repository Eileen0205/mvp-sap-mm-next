import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [centros, almacenes, materiales, servicios, usuarios, unidadesMedida] = await Promise.all([
      prisma.centro.findMany({ orderBy: { id: 'asc' } }),
      prisma.almacen.findMany({ orderBy: { id: 'asc' } }),
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
