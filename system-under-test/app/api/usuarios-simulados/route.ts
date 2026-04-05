import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Solo devolvemos lo mínimo necesario para el selector de la UI
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        username: true,
        roles: {
          select: { id: true, nombre: true }
        }
      },
      orderBy: { nombre: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: usuarios,
      error: null,
    })
  } catch (error) {
    console.error("Error fetching simulation users:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Error al cargar usuarios para la simulación.",
    }, { status: 500 })
  }
}
