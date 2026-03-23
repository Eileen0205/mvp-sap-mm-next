import type {
  SolicitudCompra,
  Centro,
  Almacen,
  Material,
  Servicio,
  UserRole,
  EstadoSolicitud,
  AvailableActions,
} from "./types"

// ========== In-Memory Store ==========

const solicitudes: SolicitudCompra[] = []
let solicitudCounter = 0

export function getSolicitudes(): SolicitudCompra[] {
  return [...solicitudes]
}

export function addSolicitud(solicitud: Omit<SolicitudCompra, "id" | "estado" | "fechaCreacion">): SolicitudCompra {
  solicitudCounter++
  const year = new Date().getFullYear()
  const id = `PR-${year}-${String(solicitudCounter).padStart(4, "0")}`

  const nueva: SolicitudCompra = {
    ...solicitud,
    id,
    estado: "Creada",
    fechaCreacion: new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  }

  solicitudes.push(nueva)
  return nueva
}

export function getSolicitudById(id: string): SolicitudCompra | undefined {
  return solicitudes.find((s) => s.id === id)
}

export function updateSolicitud(
  id: string,
  updates: { descripcion: string; cantidad: number; unidadMedida: string; fechaEntrega: string }
): SolicitudCompra | null {
  const index = solicitudes.findIndex((s) => s.id === id)
  if (index === -1) return null

  solicitudes[index] = {
    ...solicitudes[index],
    ...updates,
  }

  return { ...solicitudes[index] }
}

export function existsDuplicate(
  itemComprableId: string,
  centro: string,
  fechaEntrega: string,
  excludeId?: string,
): boolean {
  return solicitudes.some(
    (s) =>
      s.itemComprableId === itemComprableId &&
      s.centro === centro &&
      s.fechaEntrega === fechaEntrega &&
      s.estado !== "Rechazada" &&
      (excludeId ? s.id !== excludeId : true)
  )
}

// ========== Seed Catalogs ==========

export const centros: Centro[] = [
  { id: "1000", nombre: "Centro Industrial Norte" },
  { id: "2000", nombre: "Centro Logistico Sur" },
  { id: "3000", nombre: "Centro Operativo Este" },
  { id: "4000", nombre: "Centro Administrativo Oeste" },
]

export const almacenes: Almacen[] = [
  { id: "ALM01", nombre: "Almacen General", centroId: "1000" },
  { id: "ALM02", nombre: "Almacen Materias Primas", centroId: "1000" },
  { id: "ALM03", nombre: "Almacen Producto Terminado", centroId: "2000" },
  { id: "ALM04", nombre: "Almacen Insumos", centroId: "2000" },
  { id: "ALM05", nombre: "Almacen Repuestos", centroId: "3000" },
  { id: "ALM06", nombre: "Almacen Oficina", centroId: "4000" },
]

export const materiales: Material[] = [
  { id: "MAT-0001", nombre: "Acero Inoxidable 304", descripcion: "Lamina de acero inoxidable grado 304" },
  { id: "MAT-0002", nombre: "Tuberia PVC 4 pulgadas", descripcion: "Tuberia de PVC para desague" },
  { id: "MAT-0003", nombre: "Cable Electrico 12 AWG", descripcion: "Cable de cobre calibre 12" },
  { id: "MAT-0004", nombre: "Cemento Portland Tipo I", descripcion: "Cemento gris de uso general" },
  { id: "MAT-0005", nombre: "Pintura Epoxica Industrial", descripcion: "Pintura de alta resistencia" },
]

export const servicios: Servicio[] = [
  { id: "SRV-0001", nombre: "Mantenimiento Preventivo", descripcion: "Servicio de mantenimiento programado" },
  { id: "SRV-0002", nombre: "Consultoria Tecnica", descripcion: "Asesoria tecnica especializada" },
  { id: "SRV-0003", nombre: "Transporte de Carga", descripcion: "Servicio de transporte industrial" },
  { id: "SRV-0004", nombre: "Limpieza Industrial", descripcion: "Servicio de limpieza especializada" },
  { id: "SRV-0005", nombre: "Calibracion de Equipos", descripcion: "Servicio de calibracion certificada" },
]

export const unidadesMedida = [
  { id: "KG", nombre: "Kilogramos" },
  { id: "MTR", nombre: "Metros" },
  { id: "LT", nombre: "Litros" },
  { id: "PZA", nombre: "Piezas" },
  { id: "HR", nombre: "Horas" },
  { id: "LB", nombre: "Libras" },
  { id: "M2", nombre: "Metros Cuadrados" },
  { id: "GL", nombre: "Galones" },
]

export function getAlmacenesByCentro(centroId: string): Almacen[] {
  return almacenes.filter((a) => a.centroId === centroId)
}
