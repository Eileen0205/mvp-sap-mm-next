import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixEstadosFormat() {
  console.log('Iniciando corrección de formato de estados...')

  // Mapeo de estados UPPERCASE a PascalCase
  const estadoMapping: Record<string, string> = {
    'CREADA': 'Creada',
    'EN_REVISION': 'EnRevision',
    'APROBADA': 'Aprobada',
    'RECHAZADA': 'Rechazada',
  }

  for (const [oldEstado, newEstado] of Object.entries(estadoMapping)) {
    const result = await prisma.solicitudCompra.updateMany({
      where: { estado: oldEstado },
      data: { estado: newEstado },
    })
    
    if (result.count > 0) {
      console.log(`Actualizadas ${result.count} solicitudes de "${oldEstado}" a "${newEstado}"`)
    }
  }

  console.log('Corrección de estados completada.')
}

fixEstadosFormat()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
