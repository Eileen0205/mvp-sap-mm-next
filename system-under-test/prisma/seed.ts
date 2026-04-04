import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Carga de Datos Maestros (Seeding) ---');

  // 1. Crear Roles
  const roles = [
    { id: 'SOLICITANTE', nombre: 'Solicitante de Compras' },
    { id: 'APROBADOR', nombre: 'Aprobador de Solicitudes' },
    { id: 'ATF', nombre: 'Administrador Técnico Funcional' },
  ];

  for (const rol of roles) {
    await prisma.rol.upsert({
      where: { id: rol.id },
      update: {},
      create: rol,
    });
  }
  console.log('✔ Roles creados.');

  // 2. Crear Centros
  const centros = [
    { id: '1000', nombre: 'Centro Logístico Central' },
    { id: '2000', nombre: 'Centro de Producción Norte' },
  ];

  for (const centro of centros) {
    await prisma.centro.upsert({
      where: { id: centro.id },
      update: {},
      create: centro,
    });
  }
  console.log('✔ Centros creados.');

  // 3. Crear Almacenes (Asociados al Centro 1000)
  const almacenes = [
    { id: 'ALM1', nombre: 'Almacén de Materia Prima', centroId: '1000' },
    { id: 'ALM2', nombre: 'Almacén de Repuestos', centroId: '1000' },
  ];

  for (const almacen of almacenes) {
    await prisma.almacen.upsert({
      where: { id: almacen.id },
      update: {},
      create: almacen,
    });
  }
  console.log('✔ Almacenes creados.');

  // 4. Crear Materiales
  const materiales = [
    { id: 'MAT-0001', nombre: 'Tornillos de Acero 1/2', descripcion: 'Tornillos industriales de alta resistencia' },
    { id: 'MAT-0002', nombre: 'Pintura Epóxica Gris', descripcion: 'Pintura para suelos industriales' },
  ];

  for (const material of materiales) {
    await prisma.material.upsert({
      where: { id: material.id },
      update: {},
      create: material,
    });
  }
  console.log('✔ Catálogo de Materiales creado.');

  // 5. Crear Servicios
  const servicios = [
    { id: 'SRV-0001', nombre: 'Mantenimiento Preventivo Aire', descripcion: 'Revisión trimestral de equipos AA' },
    { id: 'SRV-0002', nombre: 'Consultoría QA Senior', descripcion: 'Auditoría de procesos de calidad' },
  ];

  for (const servicio of servicios) {
    await prisma.servicio.upsert({
      where: { id: servicio.id },
      update: {},
      create: servicio,
    });
  }
  console.log('✔ Catálogo de Servicios creado.');

  // 6. Crear Unidades de Medida
  const unidadesMedida = [
    { id: 'KG', nombre: 'Kilogramos' },
    { id: 'MTR', nombre: 'Metros' },
    { id: 'LTR', nombre: 'Litros' },
    { id: 'UN', nombre: 'Unidades' },
    { id: 'PA', nombre: 'Paquetes' },
    { id: 'HRS', nombre: 'Horas' },
  ];

  for (const um of unidadesMedida) {
    await prisma.unidadMedida.upsert({
      where: { id: um.id },
      update: {},
      create: um,
    });
  }
  console.log('✔ Catálogo de Unidades de Medida creado.');

  // 7. Crear Usuarios de Prueba (Asignados a Centro 1000)
  const usuarioSolicitante = await prisma.usuario.upsert({
    where: { username: 'eileen_solic_01' },
    update: {},
    create: {
      username: 'eileen_solic_01',
      nombre: 'Eileen Solicitante QA',
      email: 'eileen.qa@example.com',
      estado: 'Activo',
      roles: { connect: { id: 'SOLICITANTE' } },
      centros: { connect: { id: '1000' } },
    },
  });

  const usuarioAprobador = await prisma.usuario.upsert({
    where: { username: 'aprobador_centro_1000' },
    update: {},
    create: {
      username: 'aprobador_centro_1000',
      nombre: 'Jefe Aprobador 1000',
      email: 'aprobador1000@example.com',
      estado: 'Activo',
      roles: { connect: { id: 'APROBADOR' } },
      centros: { connect: { id: '1000' } },
    },
  });

  console.log('✔ Usuarios de prueba creados.');
  console.log('--- Seeding Finalizado con Éxito ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
