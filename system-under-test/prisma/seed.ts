import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Carga de Datos Maestros (Seeding US-04) ---');

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
    { id: '3000', nombre: 'Centro Restringido (Confidencial)' },
  ];
  for (const c of centros) await prisma.centro.upsert({ where: { id: c.id }, update: {}, create: c });

  // 3. Almacenes
  const almacenes = [
    { id: 'ALM1', nombre: 'Almacén Materia Prima 1000', centroId: '1000' },
    { id: 'ALM2', nombre: 'Almacén Repuestos 1000', centroId: '1000' },
    { id: 'ALM3', nombre: 'Almacén Planta Norte 2000', centroId: '2000' },
    { id: 'ALM4', nombre: 'Almacén Prohibido 3000', centroId: '3000' },
  ];
  for (const a of almacenes) await prisma.almacen.upsert({ where: { id: a.id }, update: {}, create: a });

  // 4. Catálogo de Materiales y Servicios
  const materiales = [
    { id: 'MAT-0001', nombre: 'Tornillos 1/2' },
    { id: 'MAT-0002', nombre: 'Pintura Gris' },
    { id: 'MAT-0003', nombre: 'Cinta Aislante' }
  ];
  for (const m of materiales) await prisma.material.upsert({ where: { id: m.id }, update: {}, create: m });

  const servicios = [
    { id: 'SRV-0001', nombre: 'Mantenimiento Preventivo' },
    { id: 'SRV-0002', nombre: 'Limpieza Industrial' }
  ];
  for (const s of servicios) await prisma.servicio.upsert({ where: { id: s.id }, update: {}, create: s });

  // 5. Unidades de Medida
  const unidades = [{ id: 'KG', nombre: 'Kilogramos' }, { id: 'UN', nombre: 'Unidades' }, { id: 'HRS', nombre: 'Horas' }];
  for (const u of unidades) await prisma.unidadMedida.upsert({ where: { id: u.id }, update: {}, create: u });

  // --- 6. USUARIOS (MOCKS DE IDENTIDAD SEGÚN TABLA QA) ---

  // Solicitante 01: Eileen (1000, 2000)
  await prisma.usuario.upsert({
    where: { username: 'eileen_solic_01' },
    update: { centros: { set: [{ id: '1000' }, { id: '2000' }] } },
    create: {
      username: 'eileen_solic_01',
      nombre: 'Eileen Solicitante 01',
      email: 'eileen.qa@example.com',
      estado: 'Activo',
      roles: { connect: { id: 'SOLICITANTE' } },
      centros: { connect: [{ id: '1000' }, { id: '2000' }] },
    },
  });

  // Solicitante 02: Diego (3000, 2000)
  await prisma.usuario.upsert({
    where: { username: 'diego_solic_02' },
    update: { centros: { set: [{ id: '3000' }, { id: '2000' }] } },
    create: {
      username: 'diego_solic_02',
      nombre: 'Diego Solicitante 02',
      email: 'diego.qa@example.com',
      estado: 'Activo',
      roles: { connect: { id: 'SOLICITANTE' } },
      centros: { connect: [{ id: '3000' }, { id: '2000' }] },
    },
  });

  // Solicitante Vacio: Sophie (1000, 3000)
  await prisma.usuario.upsert({
    where: { username: 'sophie_solic_vacio' },
    update: { centros: { set: [{ id: '1000' }, { id: '3000' }] } },
    create: {
      username: 'sophie_solic_vacio',
      nombre: 'Sophie Solicitante Vacio',
      email: 'sophie.qa@example.com',
      estado: 'Activo',
      roles: { connect: { id: 'SOLICITANTE' } },
      centros: { connect: [{ id: '1000' }, { id: '3000' }] },
    },
  });

  // Aprobador: Centro 1000
  await prisma.usuario.upsert({
    where: { username: 'aprobador_centro_1000' },
    update: { centros: { set: [{ id: '1000' }] } },
    create: {
      username: 'aprobador_centro_1000',
      nombre: 'Aprobador Centro 1000',
      email: 'aprobador.1000@example.com',
      estado: 'Activo',
      roles: { connect: { id: 'APROBADOR' } },
      centros: { connect: [{ id: '1000' }] },
    },
  });

  // Admin (ATF): Global (1000, 2000, 3000)
  await prisma.usuario.upsert({
    where: { username: 'atf_admin_01' },
    update: { centros: { set: [{ id: '1000' }, { id: '2000' }, { id: '3000' }] } },
    create: {
      username: 'atf_admin_01',
      nombre: 'Admin Soporte Global',
      email: 'atf.admin@example.com',
      estado: 'Activo',
      roles: { connect: { id: 'ATF' } },
      centros: { connect: [{ id: '1000' }, { id: '2000' }, { id: '3000' }] },
    },
  });

  // Inactivo: user_inactivo_01 (1000)
  await prisma.usuario.upsert({
    where: { username: 'user_inactivo_01' },
    update: { estado: 'Inactivo' },
    create: {
      username: 'user_inactivo_01',
      nombre: 'Usuario Inactivo QA',
      email: 'inactivo.qa@example.com',
      estado: 'Inactivo',
      roles: { connect: { id: 'SOLICITANTE' } },
      centros: { connect: [{ id: '1000' }] },
    },
  });

  console.log('✔ Base de datos actualizada con la matriz de usuarios QA.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
