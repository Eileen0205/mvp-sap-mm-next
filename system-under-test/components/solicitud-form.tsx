"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, Wrench, CheckCircle2, AlertCircle, Lock, UserCircle2, Info } from "lucide-react"
import type {
  Centro,
  Almacen,
  Material,
  Servicio,
  Usuario,
  SolicitudFormData,
  SolicitudCompra,
} from "@/lib/types"

interface Catalogs {
  centros: Centro[]
  almacenes: Almacen[]
  materiales: Material[]
  servicios: Servicio[]
  usuarios: Usuario[]
  unidadesMedida: { id: string; nombre: string }[]
}

interface FieldErrors {
  tipo?: string
  itemComprableId?: string
  descripcion?: string
  cantidad?: string
  unidadMedida?: string
  fechaEntrega?: string
  centro?: string
  almacen?: string
}

interface Props {
  catalogs: Catalogs
  onSuccess: () => void
  editingSolicitud?: SolicitudCompra | null
  onCancelEdit?: () => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

function formatDateForInput(dateStr: string): string {
  if (!dateStr) return ""
  const parts = dateStr.split("/")
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`
  }
  return dateStr
}

function formatDateForApi(dateStr: string): string {
  if (!dateStr) return ""
  const parts = dateStr.split("-")
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dateStr
}

function getTodayString(): string {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, "0")
  const d = String(today.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function SolicitudForm({ catalogs, onSuccess, editingSolicitud, onCancelEdit }: Props) {
  const isEditMode = !!editingSolicitud

  // --- SIMULADOR DE SESION (MODO LABORATORIO QA) ---
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)

  // Inicializar sesion con el primer solicitante del seed
  useEffect(() => {
    if (catalogs.usuarios.length > 0 && !currentUser) {
      const solicitante = catalogs.usuarios.find(u => u.roles?.some(r => r.id === 'SOLICITANTE')) || catalogs.usuarios[0]
      setCurrentUser(solicitante)
    }
  }, [catalogs.usuarios, currentUser])

  const getInitialFormData = useCallback((): SolicitudFormData => {
    if (editingSolicitud) {
      return {
        tipo: editingSolicitud.tipo,
        itemComprableId: editingSolicitud.itemComprableId,
        descripcion: editingSolicitud.descripcion,
        cantidad: String(editingSolicitud.cantidad),
        unidadMedida: editingSolicitud.unidadMedida,
        fechaEntrega: formatDateForInput(editingSolicitud.fechaEntrega),
        centro: editingSolicitud.centroId,
        almacen: editingSolicitud.almacenId || "",
      }
    }
    return {
      tipo: "MATERIAL",
      itemComprableId: "",
      descripcion: "",
      cantidad: "",
      unidadMedida: "",
      fechaEntrega: "",
      centro: "",
      almacen: "",
    }
  }, [editingSolicitud])

  const [formData, setFormData] = useState<SolicitudFormData>(getInitialFormData)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const isSubmittingRef = useRef(false)

  useEffect(() => {
    setFormData(getInitialFormData())
    setErrors({})
    setTouched({})
    setSubmitStatus(null)
  }, [editingSolicitud, getInitialFormData])

  const items = formData.tipo === "MATERIAL" ? catalogs.materiales : catalogs.servicios
  const almacenesFiltrados = formData.centro
    ? catalogs.almacenes.filter((a) => a.centroId === formData.centro)
    : []

  const centroNombre = isEditMode
    ? catalogs.centros.find((c) => c.id === formData.centro)?.nombre || formData.centro
    : ""
  const itemNombre = isEditMode
    ? (formData.tipo === "MATERIAL"
        ? catalogs.materiales.find((m) => m.id === formData.itemComprableId)?.nombre
        : catalogs.servicios.find((s) => s.id === formData.itemComprableId)?.nombre) ||
      editingSolicitud?.itemComprableNombre ||
      formData.itemComprableId
    : ""
  const almacenNombre = isEditMode && formData.almacen
    ? catalogs.almacenes.find((a) => a.id === formData.almacen)?.nombre || formData.almacen
    : ""

  const validateField = useCallback(
    (name: string, value: string): string | undefined => {
      if (isEditMode && ["tipo", "itemComprableId", "centro", "almacen"].includes(name)) {
        return undefined
      }

      switch (name) {
        case "descripcion": {
          const trimmed = value.trim()
          if (!trimmed) return "La descripcion es obligatoria."
          if (trimmed.length < 10 || trimmed.length > 40)
            return "Debe tener entre 10 y 40 caracteres."
          break
        }
        case "cantidad":
          if (!value) return "La cantidad es obligatoria."
          const num = parseFloat(value)
          if (isNaN(num)) return "Debe ser un valor numerico."
          if (num <= 0) return "Cantidad debe ser mayor que 0."
          if (/\.\d{4,}/.test(value)) return "Maximo 3 decimales permitidos."
          break
        case "unidadMedida":
          if (!value) return "Seleccione una unidad de medida."
          break
        case "fechaEntrega": {
          if (!value) return "La fecha de entrega es obligatoria."
          const dateVal = new Date(value)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          dateVal.setHours(0, 0, 0, 0)
          if (dateVal < today) return "La fecha no puede ser anterior a hoy."
          break
        }
        case "centro":
          if (!value) return "Seleccione un centro."
          break
        case "itemComprableId":
          if (!value) return "Seleccione un item del catalogo."
          break
        case "almacen":
          if (formData.tipo === "MATERIAL" && !value)
            return "El almacen es obligatorio para materiales."
          break
      }
      return undefined
    },
    [formData.tipo, isEditMode]
  )

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    const value = formData[name as keyof SolicitudFormData] || ""
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const updateField = (name: keyof SolicitudFormData, value: string) => {
    if (isEditMode && ["tipo", "itemComprableId", "centro", "almacen"].includes(name)) return

    setFormData((prev) => {
      const updated = { ...prev, [name]: value }
      if (!isEditMode) {
        if (name === "tipo") {
          updated.itemComprableId = ""
          updated.almacen = ""
        }
        if (name === "centro") updated.almacen = ""
      }
      return updated
    })

    if (touched[name]) {
      const error = validateField(name, value)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
    if (submitStatus) setSubmitStatus(null)
  }

  const validateAll = (): boolean => {
    const fields: (keyof SolicitudFormData)[] = isEditMode
      ? ["descripcion", "cantidad", "unidadMedida", "fechaEntrega"]
      : ["tipo", "itemComprableId", "descripcion", "cantidad", "unidadMedida", "fechaEntrega", "centro", ...(formData.tipo === "MATERIAL" ? ["almacen" as keyof SolicitudFormData] : [])]

    const newErrors: FieldErrors = {}
    let hasErrors = false
    for (const field of fields) {
      const error = validateField(field, formData[field] || "")
      if (error) {
        newErrors[field] = error
        hasErrors = true
      }
    }
    setErrors(newErrors)
    setTouched(Object.fromEntries(fields.map(f => [f, true])))
    return !hasErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmittingRef.current || !validateAll()) return

    isSubmittingRef.current = true
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const endpoint = isEditMode 
        ? `${API_BASE_URL}/api/solicitudes/${editingSolicitud?.id}`
        : `${API_BASE_URL}/api/solicitudes`
      
      const method = isEditMode ? "PUT" : "POST"

      // Enviar el usuario seleccionado en los headers (Simulando autenticacion)
      const res = await fetch(endpoint, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": currentUser?.id || "" 
        },
        body: JSON.stringify({
          ...formData,
          fechaEntrega: formatDateForApi(formData.fechaEntrega),
        }),
      })

      const json = await res.json()

      if (res.ok && json.success) {
        setSubmitStatus({
          type: "success",
          message: `Solicitud ${isEditMode ? editingSolicitud?.id : json.data.id} procesada exitosamente.`,
        })
        if (!isEditMode) setFormData(getInitialFormData())
        setTouched({})
        onSuccess()
      } else {
        setSubmitStatus({ type: "error", message: json.error || "Error al procesar la solicitud." })
      }
    } catch {
      setSubmitStatus({ type: "error", message: "Error inesperado de red." })
    } finally {
      setIsSubmitting(false)
      isSubmittingRef.current = false
    }
  }

  const userRole = currentUser?.roles?.[0]?.id || "SIN ROL"

  return (
    <div className="flex flex-col gap-6">
      {/* --- MODO LABORATORIO QA: SIMULADOR DE USUARIO --- */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <UserCircle2 className="size-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Usuario en Sesion (Modo QA)</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{currentUser?.nombre || "Cargando..."}</span>
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                    {userRole}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Cambiar Usuario para Pruebas</Label>
              <Select 
                value={currentUser?.id} 
                onValueChange={(val) => setCurrentUser(catalogs.usuarios.find(u => u.id === val) || null)}
              >
                <SelectTrigger className="h-9 bg-background">
                  <SelectValue placeholder="Seleccionar usuario" />
                </SelectTrigger>
                <SelectContent>
                  {catalogs.usuarios.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nombre} ({u.roles?.[0]?.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex items-start gap-2 rounded border border-blue-200 bg-blue-50 p-2 text-[11px] text-blue-700">
            <Info className="size-3.5 shrink-0 mt-0.5" />
            <p>
              <strong>Nota QA:</strong> Use este selector para probar las restricciones de roles. 
              Ej: Seleccione el <strong>Aprobador</strong> y verifique que no pueda crear solicitudes.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-foreground">
                {isEditMode ? `Modificar Solicitud ${editingSolicitud?.id}` : "Nueva Solicitud de Compra"}
              </CardTitle>
              <CardDescription>
                {isEditMode ? "Actualice los campos permitidos." : "Complete el formulario para iniciar el proceso de compra."}
              </CardDescription>
            </div>
            {isEditMode && (
              <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary">
                <Lock className="size-3" />
                Solo Lectura Activo
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            {submitStatus && (
              <div role="alert" className={`flex items-center gap-3 rounded-lg border p-4 text-sm ${submitStatus.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-destructive/30 bg-destructive/5 text-destructive"}`}>
                {submitStatus.type === "success" ? <CheckCircle2 className="size-5 shrink-0" /> : <AlertCircle className="size-5 shrink-0" />}
                {submitStatus.message}
              </div>
            )}

            {/* Read-Only Fields in Edit Mode */}
            {isEditMode && (
              <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Centro</Label>
                  <p className="text-sm font-medium">{formData.centro} - {centroNombre}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Item Seleccionado</Label>
                  <p className="text-sm font-medium">{formData.itemComprableId} - {itemNombre}</p>
                </div>
              </div>
            )}

            {/* Create Mode Only: Tipo e Item */}
            {!isEditMode && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold">Tipo de Solicitud <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Button type="button" variant={formData.tipo === "MATERIAL" ? "default" : "outline"} className="flex-1" onClick={() => updateField("tipo", "MATERIAL")}>
                      <Package className="mr-2 size-4" /> Material
                    </Button>
                    <Button type="button" variant={formData.tipo === "SERVICIO" ? "default" : "outline"} className="flex-1" onClick={() => updateField("tipo", "SERVICIO")}>
                      <Wrench className="mr-2 size-4" /> Servicio
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold">{formData.tipo === "MATERIAL" ? "Material" : "Servicio"} <span className="text-destructive">*</span></Label>
                  <Select value={formData.itemComprableId} onValueChange={(val) => updateField("itemComprableId", val)}>
                    <SelectTrigger className={errors.itemComprableId && touched.itemComprableId ? "border-destructive" : ""}>
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map(i => <SelectItem key={i.id} value={i.id}><span className="font-mono text-xs text-muted-foreground mr-2">{i.id}</span> {i.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.itemComprableId && touched.itemComprableId && <p className="text-destructive text-[10px]">{errors.itemComprableId}</p>}
                </div>
              </div>
            )}

            {/* Common Fields: Descripcion, Cantidad, UM, Fecha */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-bold">Descripcion <span className="text-destructive">*</span></Label>
              <Textarea 
                value={formData.descripcion} 
                onChange={e => updateField("descripcion", e.target.value)} 
                onBlur={() => handleBlur("descripcion")}
                placeholder="Indique brevemente el motivo o detalle de la necesidad..."
                className={`min-h-[80px] ${errors.descripcion && touched.descripcion ? "border-destructive" : ""}`}
              />
              <div className="flex justify-between">
                {errors.descripcion && touched.descripcion && <p className="text-destructive text-[10px]">{errors.descripcion}</p>}
                <p className={`ml-auto text-[10px] font-mono ${formData.descripcion.length > 40 ? "text-destructive" : "text-muted-foreground"}`}>
                  {formData.descripcion.length}/40
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold">Cantidad <span className="text-destructive">*</span></Label>
                <Input type="text" value={formData.cantidad} onChange={e => updateField("cantidad", e.target.value)} onBlur={() => handleBlur("cantidad")} placeholder="0.000" className={errors.cantidad && touched.cantidad ? "border-destructive" : ""} />
                {errors.cantidad && touched.cantidad && <p className="text-destructive text-[10px]">{errors.cantidad}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold">U.M. <span className="text-destructive">*</span></Label>
                <Select value={formData.unidadMedida} onValueChange={val => updateField("unidadMedida", val)}>
                  <SelectTrigger className={errors.unidadMedida && touched.unidadMedida ? "border-destructive" : ""}>
                    <SelectValue placeholder="UM" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogs.unidadesMedida.map(um => <SelectItem key={um.id} value={um.id}>{um.id} - {um.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.unidadMedida && touched.unidadMedida && <p className="text-destructive text-[10px]">{errors.unidadMedida}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold">Fecha Entrega <span className="text-destructive">*</span></Label>
                <Input type="date" min={getTodayString()} value={formData.fechaEntrega} onChange={e => updateField("fechaEntrega", e.target.value)} onBlur={() => handleBlur("fechaEntrega")} className={errors.fechaEntrega && touched.fechaEntrega ? "border-destructive" : ""} />
                {errors.fechaEntrega && touched.fechaEntrega && <p className="text-destructive text-[10px]">{errors.fechaEntrega}</p>}
              </div>
            </div>

            {/* Create Mode Only: Centro y Almacen */}
            {!isEditMode && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold">Centro <span className="text-destructive">*</span></Label>
                  <Select value={formData.centro} onValueChange={val => updateField("centro", val)}>
                    <SelectTrigger className={errors.centro && touched.centro ? "border-destructive" : ""}>
                      <SelectValue placeholder="Seleccione Centro..." />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogs.centros.map(c => <SelectItem key={c.id} value={c.id}>{c.id} - {c.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.centro && touched.centro && <p className="text-destructive text-[10px]">{errors.centro}</p>}
                </div>

                {formData.tipo === "MATERIAL" && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-bold">Almacen <span className="text-destructive">*</span></Label>
                    <Select disabled={!formData.centro} value={formData.almacen} onValueChange={val => updateField("almacen", val)}>
                      <SelectTrigger className={errors.almacen && touched.almacen ? "border-destructive" : ""}>
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {almacenesFiltrados.map(a => <SelectItem key={a.id} value={a.id}>{a.id} - {a.nombre}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.almacen && touched.almacen && <p className="text-destructive text-[10px]">{errors.almacen}</p>}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              {isEditMode && onCancelEdit && (
                <Button type="button" variant="ghost" onClick={onCancelEdit} disabled={isSubmitting}>Cancelar</Button>
              )}
              <Button type="submit" disabled={isSubmitting || (userRole !== 'SOLICITANTE' && !isEditMode)} className="px-8">
                {isSubmitting ? <><Loader2 className="mr-2 size-4 animate-spin" /> Procesando...</> : isEditMode ? "Modificar" : "Crear Solicitud"}
              </Button>
            </div>
            
            {!isEditMode && userRole !== 'SOLICITANTE' && (
              <p className="text-center text-[10px] text-destructive font-medium italic">
                * El rol actual ({userRole}) no tiene permisos para crear solicitudes de compra.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
