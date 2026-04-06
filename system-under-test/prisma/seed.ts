import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Carga de Datos Maestros (Seeding Senior) ---');

  // 1. Roles
  const roles = [
    { id: 'SOLICITANTE', nombre: 'Solicitante de Compras' },
    { id: 'APROBADOR', nombre: 'Aprobador de Solicitudes' },
    { id: 'ATF', nombre: 'Administrador Técnico Funcional' },
  ];
  for (const rol of roles) await prisma.rol.upsert({ where: { id: rol.id }, update: {}, create: rol });

  // 2. Centros (1000, 2000, 3000)
  const centros = [
    { id: '1000', nombre: 'Centro Logístico Central' },
    { id: '2000', nombre: 'Centro de Producción Norte' },
    { id: '3000', nombre: 'Centro Restringido (Confidencial)' }, // <--- Nuevo Centro No Autorizado
  ];
  for (const c of centros) await prisma.centro.upsert({ where: { id: c.id }, update: {}, create: c });

  // 3. Almacenes
  const almacenes = [
    { id: 'ALM1', nombre: 'Almacén Materia Prima 1000', centroId: '1000' },
    { id: 'ALM2', nombre: 'Almacén Repuestos 1000', centroId: '1000' },
    { id: 'ALM3', nombre: 'Almacén Planta Norte 2000', centroId: '2000' },
    { id: 'ALM4', nombre: 'Almacén Prohibido 3000', centroId: '3000' }, // <--- Almacén del Centro 3000
  ];
  for (const a of almacenes) await prisma.almacen.upsert({ where: { id: a.id }, update: {}, create: a });

  // 4. Catálogo de Materiales y Servicios
  const materiales = [{ id: 'MAT-0001', nombre: 'Tornillos 1/2' }, { id: 'MAT-0002', nombre: 'Pintura Gris' }];
  for (const m of materiales) await prisma.material.upsert({ where: { id: m.id }, update: {}, create: m });

  // 5. Unidades de Medida
  const unidades = [{ id: 'KG', nombre: 'Kilogramos' }, { id: 'UN', nombre: 'Unidades' }];
  for (const u of unidades) await prisma.unidadMedida.upsert({ where: { id: u.id }, update: {}, create: u });

  // 6. Usuario Eileen (ACCESO SOLO A 1000 Y 2000)
  await prisma.usuario.upsert({
    where: { username: 'eileen_solic_01' },
    update: {
      centros: { set: [{ id: '1000' }, { id: '2000' }] } // <--- Centro 3000 queda fuera
    },
    create: {
      username: 'eileen_solic_01',
      nombre: 'Eileen Solicitante QA',
      email: 'eileen.qa@example.com',
      estado: 'Activo',
      roles: { connect: { id: 'SOLICITANTE' } },
      centros: { connect: [{ id: '1000' }, { id: '2000' }] },
    },
  });

  console.log('✔ Triple Frontera configurada: Autorizados (1000, 2000), Prohibido (3000).');
}

main().catch(console.error).finally(() => prisma.$disconnect());
