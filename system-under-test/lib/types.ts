// ========== Roles ==========

export type UserRole = "SOLICITANTE" | "APROBADOR" | "ADMIN"

export const USER_ROLES: { id: UserRole; label: string }[] = [
  { id: "SOLICITANTE", label: "Solicitante" },
  { id: "APROBADOR", label: "Aprobador" },
  { id: "ADMIN", label: "Administrador Tecnico/Funcional" },
]

// ========== Domain Entities ==========

// Constantes de Estado (PascalCase - Estándar del Proyecto)
export const ESTADO_INICIAL = "Creada" as const
export const ESTADOS_SOLICITUD = {
  CREADA: "Creada",
  EN_REVISION: "EnRevision",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
} as const

export type EstadoSolicitud = "Creada" | "EnRevision" | "Aprobada" | "Rechazada"

export interface SolicitudCompra {
  id: string
  descripcion: string
  cantidad: number
  unidadMedida: string
  fechaCreacion: string
  fechaEntrega: string
  centroId: string
  centro: Centro
  almacenId?: string
  almacen?: Almacen
  tipo: "MATERIAL" | "SERVICIO"
  estado: EstadoSolicitud
  itemComprableId: string
  itemComprableNombre: string
  usuarioSolicitante: string
}

export interface Centro {
  id: string
  nombre: string
}

export interface Almacen {
  id: string
  nombre: string
  centroId: string
}

export interface Material {
  id: string
  nombre: string
  descripcion?: string
}

export interface Servicio {
  id: string
  nombre: string
  descripcion?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T | null
  error: string | null
}

// ========== Form Data ==========

export interface SolicitudFormData {
  tipo: "MATERIAL" | "SERVICIO"
  itemComprableId: string
  descripcion: string
  cantidad: string
  unidadMedida: string
  fechaEntrega: string
  centro: string
  almacen?: string
}

export interface SolicitudUpdateData {
  descripcion: string
  cantidad: string
  unidadMedida: string
  fechaEntrega: string
}

// ========== State Transition Actions ==========

export type SolicitudAction = "ENVIAR_REVISION" | "APROBAR" | "RECHAZAR"

export interface AvailableActions {
  canModify: boolean
  canSendToReview: boolean
  canApprove: boolean
  canReject: boolean
}
