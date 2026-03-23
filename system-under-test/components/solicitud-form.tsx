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
import { Loader2, Package, Wrench, CheckCircle2, AlertCircle, Lock } from "lucide-react"
import type {
  Centro,
  Almacen,
  Material,
  Servicio,
  SolicitudFormData,
  SolicitudCompra,
} from "@/lib/types"

interface Catalogs {
  centros: Centro[]
  almacenes: Almacen[]
  materiales: Material[]
  servicios: Servicio[]
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

const CANTIDAD_REGEX = /^\d{1,10}(\.\d{1,3})?$/

function formatDateForInput(dateStr: string): string {
  const parts = dateStr.split("/")
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`
  }
  return dateStr
}

function formatDateForApi(dateStr: string): string {
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

  const getInitialFormData = useCallback((): SolicitudFormData => {
    if (editingSolicitud) {
      return {
        tipo: editingSolicitud.tipo,
        itemComprableId: editingSolicitud.itemComprableId,
        descripcion: editingSolicitud.descripcion,
        cantidad: String(editingSolicitud.cantidad),
        unidadMedida: editingSolicitud.unidadMedida,
        fechaEntrega: formatDateForInput(editingSolicitud.fechaEntrega),
        centro: editingSolicitud.centro,
        almacen: editingSolicitud.almacen || "",
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

  // Reset form when editingSolicitud changes
  useEffect(() => {
    setFormData(getInitialFormData())
    setErrors({})
    setTouched({})
    setSubmitStatus(null)
  }, [editingSolicitud, getInitialFormData])

  // Get filtered catalogs
  const items =
    formData.tipo === "MATERIAL" ? catalogs.materiales : catalogs.servicios
  const almacenesFiltrados = formData.centro
    ? catalogs.almacenes.filter((a) => a.centroId === formData.centro)
    : []

  // Resolve display names for read-only fields in edit mode
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

  // Validation functions (only validate editable fields in edit mode)
  const validateField = useCallback(
    (name: string, value: string): string | undefined => {
      // In edit mode, skip validation for read-only fields
      if (isEditMode && ["tipo", "itemComprableId", "centro", "almacen"].includes(name)) {
        return undefined
      }

      switch (name) {
        case "tipo":
          if (!value) return "Seleccione el tipo de solicitud."
          break
        case "itemComprableId":
          if (!value) return "Seleccione un item del catalogo."
          break
        case "descripcion": {
          const trimmed = value.trim()
          if (!trimmed) return "La descripcion es obligatoria."
          if (trimmed.length < 10)
            return "Debe tener entre 10 y 40 caracteres."
          if (trimmed.length > 40)
            return "Debe tener entre 10 y 40 caracteres."
          break
        }
        case "cantidad":
          if (!value) return "La cantidad es obligatoria."
          if (!CANTIDAD_REGEX.test(value))
            return "No se permiten valores alfanumericos."
          if (parseFloat(value) <= 0) return "Cantidad debe ser mayor que 0."
          break
        case "unidadMedida":
          if (!value) return "Seleccione una unidad de medida."
          break
        case "fechaEntrega": {
          if (!value) return "La fecha de entrega es obligatoria."
          const dateVal = new Date(value)
          if (isNaN(dateVal.getTime())) return "Formato Invalido."
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          dateVal.setHours(0, 0, 0, 0)
          if (dateVal < today)
            return "La fecha de entrega no puede ser anterior a hoy."
          break
        }
        case "centro":
          if (!value) return "Seleccione un centro."
          break
        case "almacen":
          if (formData.tipo === "MATERIAL" && !value)
            return "El almacen es obligatorio para solicitudes de material."
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
    // Block updates to read-only fields in edit mode
    if (isEditMode && ["tipo", "itemComprableId", "centro", "almacen"].includes(name)) {
      return
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: value }
      // Reset dependent fields (only in create mode)
      if (!isEditMode) {
        if (name === "tipo") {
          updated.itemComprableId = ""
          updated.almacen = ""
        }
        if (name === "centro") {
          updated.almacen = ""
        }
      }
      return updated
    })

    // Clear error on change if field was touched
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }

    // Clear submit status on any change
    if (submitStatus) setSubmitStatus(null)
  }

  // Clear almacen error when tipo changes to SERVICIO
  useEffect(() => {
    if (formData.tipo === "SERVICIO") {
      setErrors((prev) => ({ ...prev, almacen: undefined }))
    }
  }, [formData.tipo])

  const validateAll = (): boolean => {
    const fields: (keyof SolicitudFormData)[] = isEditMode
      ? ["descripcion", "cantidad", "unidadMedida", "fechaEntrega"]
      : [
          "tipo",
          "itemComprableId",
          "descripcion",
          "cantidad",
          "unidadMedida",
          "fechaEntrega",
          "centro",
          ...(formData.tipo === "MATERIAL" ? ["almacen" as keyof SolicitudFormData] : []),
        ]

    const newErrors: FieldErrors = {}
    const allTouched: Record<string, boolean> = {}

    let hasErrors = false
    for (const field of fields) {
      const value = formData[field] || ""
      const error = validateField(field, value)
      if (error) {
        newErrors[field] = error
        hasErrors = true
      }
      allTouched[field] = true
    }

    setErrors(newErrors)
    setTouched((prev) => ({ ...prev, ...allTouched }))
    return !hasErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent double submission (concurrency guard)
    if (isSubmittingRef.current) return
    if (!validateAll()) return

    isSubmittingRef.current = true
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      if (isEditMode && editingSolicitud) {
        // PUT - update
        const body = {
          descripcion: formData.descripcion,
          cantidad: formData.cantidad,
          unidadMedida: formData.unidadMedida,
          fechaEntrega: formatDateForApi(formData.fechaEntrega),
        }

        const res = await fetch(`/api/solicitudes/${editingSolicitud.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })

        const json = await res.json()

        if (res.ok && json.success) {
          setSubmitStatus({
            type: "success",
            message: `Solicitud ${editingSolicitud.id} modificada exitosamente.`,
          })
          onSuccess()
        } else {
          setSubmitStatus({
            type: "error",
            message: json.error || "Error al modificar la solicitud.",
          })
        }
      } else {
        // POST - create
        const body = {
          ...formData,
          fechaEntrega: formatDateForApi(formData.fechaEntrega),
          almacen: formData.tipo === "MATERIAL" ? formData.almacen : undefined,
        }

        const res = await fetch("/api/solicitudes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })

        const json = await res.json()

        if (res.ok && json.success) {
          setSubmitStatus({
            type: "success",
            message: `Solicitud ${json.data.id} creada exitosamente.`,
          })
          // Reset form
          setFormData({
            tipo: "MATERIAL",
            itemComprableId: "",
            descripcion: "",
            cantidad: "",
            unidadMedida: "",
            fechaEntrega: "",
            centro: "",
            almacen: "",
          })
          setTouched({})
          setErrors({})
          onSuccess()
        } else {
          setSubmitStatus({
            type: "error",
            message: json.error || "Error al crear la solicitud.",
          })
        }
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message:
          "Ha ocurrido un error inesperado. Los cambios no se guardaron.",
      })
    } finally {
      setIsSubmitting(false)
      isSubmittingRef.current = false
    }
  }

  const descLength = formData.descripcion.trim().length

  return (
    <Card className="border-border">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">
              {isEditMode
                ? `Modificar Solicitud ${editingSolicitud?.id}`
                : "Nueva Solicitud de Compra"}
            </CardTitle>
            <CardDescription>
              {isEditMode
                ? "Solo puede modificar: Descripcion, Cantidad, Fecha de Entrega y Unidad de Medida."
                : "Complete los campos obligatorios para registrar una nueva solicitud."}
            </CardDescription>
          </div>
          {isEditMode && (
            <Badge variant="outline" className="shrink-0 gap-1.5 border-primary/30 text-primary">
              <Lock className="size-3" />
              Modo Edicion
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          {/* Submit status message */}
          {submitStatus && (
            <div
              role="alert"
              className={`flex items-center gap-3 rounded-lg border p-4 text-sm ${
                submitStatus.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-destructive/30 bg-destructive/5 text-destructive"
              }`}
            >
              {submitStatus.type === "success" ? (
                <CheckCircle2 className="size-5 shrink-0" />
              ) : (
                <AlertCircle className="size-5 shrink-0" />
              )}
              {submitStatus.message}
            </div>
          )}

          {/* ============ READ-ONLY SECTION (Edit Mode) ============ */}
          {isEditMode && (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Lock className="size-3.5" />
                Campos no modificables
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Tipo</Label>
                  <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground">
                    {formData.tipo === "MATERIAL" ? (
                      <Package className="size-4 text-muted-foreground" />
                    ) : (
                      <Wrench className="size-4 text-muted-foreground" />
                    )}
                    {formData.tipo === "MATERIAL" ? "Material" : "Servicio"}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">
                    {formData.tipo === "MATERIAL" ? "Material" : "Servicio"}
                  </Label>
                  <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground">
                    <span className="mr-2 font-mono text-xs text-muted-foreground">
                      {formData.itemComprableId}
                    </span>
                    {itemNombre}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Centro</Label>
                  <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground">
                    <span className="mr-2 font-mono text-xs text-muted-foreground">
                      {formData.centro}
                    </span>
                    {centroNombre}
                  </div>
                </div>
                {formData.tipo === "MATERIAL" && formData.almacen && (
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">Almacen</Label>
                    <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground">
                      <span className="mr-2 font-mono text-xs text-muted-foreground">
                        {formData.almacen}
                      </span>
                      {almacenNombre}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============ CREATE MODE FIELDS ============ */}
          {!isEditMode && (
            <>
              {/* Tipo de Solicitud */}
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-foreground">
                  Tipo de Solicitud <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => updateField("tipo", "MATERIAL")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                      formData.tipo === "MATERIAL"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <Package className="size-4" />
                    Material
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField("tipo", "SERVICIO")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                      formData.tipo === "SERVICIO"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <Wrench className="size-4" />
                    Servicio
                  </button>
                </div>
              </div>

              {/* Item Comprable */}
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-foreground">
                  {formData.tipo === "MATERIAL" ? "Material" : "Servicio"}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.itemComprableId}
                  onValueChange={(val) => updateField("itemComprableId", val)}
                >
                  <SelectTrigger
                    className={`w-full ${
                      errors.itemComprableId && touched.itemComprableId
                        ? "border-destructive"
                        : ""
                    }`}
                    onBlur={() => handleBlur("itemComprableId")}
                  >
                    <SelectValue
                      placeholder={`Seleccionar ${
                        formData.tipo === "MATERIAL" ? "material" : "servicio"
                      }`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <span className="text-muted-foreground mr-2 font-mono text-xs">
                          {item.id}
                        </span>
                        {item.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.itemComprableId && touched.itemComprableId && (
                  <p className="text-destructive text-xs">{errors.itemComprableId}</p>
                )}
              </div>
            </>
          )}

          {/* ============ EDITABLE FIELDS (both modes) ============ */}

          {/* Descripcion */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                Descripcion <span className="text-destructive">*</span>
              </Label>
              <span
                className={`text-xs tabular-nums ${
                  descLength > 40 ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {descLength}/40
              </span>
            </div>
            <Textarea
              value={formData.descripcion}
              onChange={(e) => updateField("descripcion", e.target.value)}
              onBlur={() => handleBlur("descripcion")}
              placeholder="Ingrese una descripcion (10-40 caracteres)"
              maxLength={50}
              rows={2}
              className={`resize-none ${
                errors.descripcion && touched.descripcion
                  ? "border-destructive"
                  : ""
              }`}
            />
            {errors.descripcion && touched.descripcion && (
              <p className="text-destructive text-xs">{errors.descripcion}</p>
            )}
          </div>

          {/* Cantidad + Unidad de Medida */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Cantidad <span className="text-destructive">*</span>
              </Label>
              <Input
                type="text"
                inputMode="decimal"
                value={formData.cantidad}
                onChange={(e) => updateField("cantidad", e.target.value)}
                onBlur={() => handleBlur("cantidad")}
                placeholder="Ej: 100 o 50.5"
                className={
                  errors.cantidad && touched.cantidad
                    ? "border-destructive"
                    : ""
                }
              />
              {errors.cantidad && touched.cantidad && (
                <p className="text-destructive text-xs">{errors.cantidad}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Unidad de Medida <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.unidadMedida}
                onValueChange={(val) => updateField("unidadMedida", val)}
              >
                <SelectTrigger
                  className={`w-full ${
                    errors.unidadMedida && touched.unidadMedida
                      ? "border-destructive"
                      : ""
                  }`}
                  onBlur={() => handleBlur("unidadMedida")}
                >
                  <SelectValue placeholder="Seleccionar UM" />
                </SelectTrigger>
                <SelectContent>
                  {catalogs.unidadesMedida.map((um) => (
                    <SelectItem key={um.id} value={um.id}>
                      <Badge variant="outline" className="mr-2 font-mono">
                        {um.id}
                      </Badge>
                      {um.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unidadMedida && touched.unidadMedida && (
                <p className="text-destructive text-xs">{errors.unidadMedida}</p>
              )}
            </div>
          </div>

          {/* Fecha de Entrega */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">
              Fecha de Entrega <span className="text-destructive">*</span>
            </Label>
            <Input
              type="date"
              value={formData.fechaEntrega}
              min={getTodayString()}
              onChange={(e) => updateField("fechaEntrega", e.target.value)}
              onBlur={() => handleBlur("fechaEntrega")}
              className={
                errors.fechaEntrega && touched.fechaEntrega
                  ? "border-destructive"
                  : ""
              }
            />
            {errors.fechaEntrega && touched.fechaEntrega && (
              <p className="text-destructive text-xs">{errors.fechaEntrega}</p>
            )}
          </div>

          {/* ============ CREATE MODE ONLY: Centro + Almacen ============ */}
          {!isEditMode && (
            <>
              {/* Centro */}
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-foreground">
                  Centro <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.centro}
                  onValueChange={(val) => updateField("centro", val)}
                >
                  <SelectTrigger
                    className={`w-full ${
                      errors.centro && touched.centro ? "border-destructive" : ""
                    }`}
                    onBlur={() => handleBlur("centro")}
                  >
                    <SelectValue placeholder="Seleccionar centro" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogs.centros.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="text-muted-foreground mr-2 font-mono text-xs">
                          {c.id}
                        </span>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.centro && touched.centro && (
                  <p className="text-destructive text-xs">{errors.centro}</p>
                )}
              </div>

              {/* Almacen (only for MATERIAL) */}
              {formData.tipo === "MATERIAL" && (
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-foreground">
                    Almacen <span className="text-destructive">*</span>
                  </Label>
                  {!formData.centro ? (
                    <p className="text-muted-foreground text-xs italic">
                      Seleccione primero un centro para ver los almacenes
                      disponibles.
                    </p>
                  ) : almacenesFiltrados.length === 0 ? (
                    <p className="text-muted-foreground text-xs italic">
                      No hay almacenes disponibles para el centro seleccionado.
                    </p>
                  ) : (
                    <Select
                      value={formData.almacen}
                      onValueChange={(val) => updateField("almacen", val)}
                    >
                      <SelectTrigger
                        className={`w-full ${
                          errors.almacen && touched.almacen
                            ? "border-destructive"
                            : ""
                        }`}
                        onBlur={() => handleBlur("almacen")}
                      >
                        <SelectValue placeholder="Seleccionar almacen" />
                      </SelectTrigger>
                      <SelectContent>
                        {almacenesFiltrados.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            <span className="text-muted-foreground mr-2 font-mono text-xs">
                              {a.id}
                            </span>
                            {a.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {errors.almacen && touched.almacen && (
                    <p className="text-destructive text-xs">{errors.almacen}</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Submit / Cancel */}
          <div className="flex justify-end gap-3 pt-2">
            {isEditMode && onCancelEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancelEdit}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Guardando...
                </>
              ) : isEditMode ? (
                "Guardar Cambios"
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
