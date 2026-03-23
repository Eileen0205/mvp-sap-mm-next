import { NextResponse } from "next/server"
import { centros, almacenes, materiales, servicios, unidadesMedida } from "@/lib/data"

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      centros,
      almacenes,
      materiales,
      servicios,
      unidadesMedida,
    },
    error: null,
  })
}
