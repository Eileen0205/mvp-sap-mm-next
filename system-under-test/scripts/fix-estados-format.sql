-- Script para corregir el formato de estados existentes
-- Los estados deben usar PascalCase segun el estandar del proyecto

-- Actualizar CREADA -> Creada
UPDATE "Solicitud" SET estado = 'Creada' WHERE estado = 'CREADA';

-- Actualizar EN_REVISION -> EnRevision
UPDATE "Solicitud" SET estado = 'EnRevision' WHERE estado = 'EN_REVISION';

-- Actualizar APROBADA -> Aprobada
UPDATE "Solicitud" SET estado = 'Aprobada' WHERE estado = 'APROBADA';

-- Actualizar RECHAZADA -> Rechazada
UPDATE "Solicitud" SET estado = 'Rechazada' WHERE estado = 'RECHAZADA';
