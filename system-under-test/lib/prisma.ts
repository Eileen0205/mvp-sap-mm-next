import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Configuración optimizada para entornos serverless (Vercel)
// - connection_limit: Limita conexiones para evitar agotar el pool
// - pool_timeout: Tiempo máximo de espera para obtener conexión
// - connect_timeout: Tiempo máximo para establecer conexión inicial
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
}

// Singleton pattern para reutilizar conexiones y evitar crear múltiples instancias
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

// En desarrollo, guardamos en global para evitar múltiples instancias con HMR
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Manejo de cierre limpio de conexiones en caso de señales de terminación
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
