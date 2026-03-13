"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { FileText, Package, Wrench, Pencil, Eye, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { SolicitudCompra } from "@/lib/types"

interface Props {
  solicitudes: SolicitudCompra[]
  isLoading: boolean
  onEdit?: (solicitud: SolicitudCompra) => void
  onRefresh?: () => void
}

const estadoConfig: Record<
  string,
  { label: string; className: string }
> = {
  CREADA: {
    label: "Creada",
    className: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100",
  },
  EN_REVISION: {
    label: "En Revision",
    className: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
  },
  APROBADA: {
    label: "Aprobada",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
  },
  RECHAZADA: {
    label: "Rechazada",
    className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
  },
}

function DetailRow({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1 ${className || ""}`}>
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

export function SolicitudesTable({ solicitudes, isLoading, onEdit, onRefresh }: Props) {
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudCompra | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleViewDetail = (solicitud: SolicitudCompra) => {
    setSelectedSolicitud(solicitud)
    setIsDialogOpen(true)
  }

  const handleEnviarRevision = async () => {
    if (!selectedSolicitud) return

    setIsSending(true)
    try {
      const res = await fetch(`/api/solicitudes/${selectedSolicitud.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "EN_REVISION" }),
      })

      const json = await res.json()

      if (json.success) {
        toast.success("Estado actualizado", {
          description: `La solicitud ${selectedSolicitud.id} fue enviada a revision.`,
        })
        setIsDialogOpen(false)
        setSelectedSolicitud(null)
        onRefresh?.()
      } else {
        toast.error("Error al actualizar", {
          description: json.error || "No se pudo cambiar el estado.",
        })
      }
    } catch {
      toast.error("Error de conexion", {
        description: "No se pudo conectar con el servidor.",
      })
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            <p className="text-sm">Cargando solicitudes...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (solicitudes.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="mb-4 size-12 text-muted-foreground/40" />
          <p className="text-lg font-medium text-foreground">
            No hay solicitudes registradas
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cree una nueva solicitud usando el formulario.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">
                Solicitudes Registradas
              </CardTitle>
              <CardDescription>
                {solicitudes.length} solicitud{solicitudes.length !== 1 ? "es" : ""}{" "}
                registrada{solicitudes.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <TooltipProvider delayDuration={300}>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6 w-[120px]">ID</TableHead>
                    <TableHead className="w-[80px]">Tipo</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="max-w-[180px]">Descripcion</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="w-[60px]">UM</TableHead>
                    <TableHead>Centro</TableHead>
                    <TableHead>Almacen</TableHead>
                    <TableHead>F. Entrega</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="pr-6 w-[140px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitudes.map((s) => {
                    const canEdit = s.estado === "CREADA"
                    const config = estadoConfig[s.estado] || estadoConfig.CREADA

                    return (
                      <TableRow key={s.id}>
                        <TableCell className="pl-6 font-mono text-xs font-medium">
                          {s.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {s.tipo === "MATERIAL" ? (
                              <Package className="size-3.5 text-muted-foreground" />
                            ) : (
                              <Wrench className="size-3.5 text-muted-foreground" />
                            )}
                            <span className="text-xs">{s.tipo === "MATERIAL" ? "MAT" : "SRV"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">{s.itemComprableNombre}</span>
                        </TableCell>
                        <TableCell className="max-w-[180px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block truncate text-xs">
                                {s.descripcion}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-xs">
                              <p className="text-xs">{s.descripcion}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {s.cantidad}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {s.unidadMedida}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{s.centro}</TableCell>
                        <TableCell className="text-xs">
                          {s.tipo === "MATERIAL" ? (
                            s.almacen || <span className="text-muted-foreground">-</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {s.fechaEntrega}
                        </TableCell>
                        <TableCell>
                          <Badge className={config.className}>
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6">
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetail(s)}
                                  className="size-8 p-0"
                                >
                                  <Eye className="size-4" />
                                  <span className="sr-only">Ver detalle</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                <p className="text-xs">Ver detalle</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!canEdit}
                                    onClick={() => canEdit && onEdit?.(s)}
                                    className="size-8 p-0"
                                  >
                                    <Pencil className="size-3.5" />
                                    <span className="sr-only">Modificar</span>
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {!canEdit ? (
                                <TooltipContent side="left">
                                  <p className="text-xs">
                                    No puede modificarse en estado {config.label}
                                  </p>
                                </TooltipContent>
                              ) : (
                                <TooltipContent side="left">
                                  <p className="text-xs">Modificar</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedSolicitud && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="size-5" />
                  Detalle de Solicitud
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <span className="font-mono text-foreground">{selectedSolicitud.id}</span>
                  <Badge className={estadoConfig[selectedSolicitud.estado]?.className}>
                    {estadoConfig[selectedSolicitud.estado]?.label}
                  </Badge>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Informacion General */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-foreground">
                    Informacion General
                  </h4>
                  <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
                    <DetailRow
                      label="Fecha de Creacion"
                      value={selectedSolicitud.fechaCreacion}
                    />
                    <DetailRow
                      label="Fecha de Entrega"
                      value={selectedSolicitud.fechaEntrega}
                    />
                  </div>
                </div>

                <Separator />

                {/* Datos del Item */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-foreground">
                    Datos del Item
                  </h4>
                  <div className="space-y-4 rounded-lg bg-muted/50 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <DetailRow
                        label="Tipo"
                        value={
                          <div className="flex items-center gap-1.5">
                            {selectedSolicitud.tipo === "MATERIAL" ? (
                              <Package className="size-4 text-primary" />
                            ) : (
                              <Wrench className="size-4 text-primary" />
                            )}
                            <span>
                              {selectedSolicitud.tipo === "MATERIAL" ? "Material" : "Servicio"}
                            </span>
                          </div>
                        }
                      />
                      <DetailRow label="Item" value={selectedSolicitud.itemComprableNombre} />
                    </div>
                    <DetailRow
                      label="Descripcion"
                      value={selectedSolicitud.descripcion}
                      className="col-span-2"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <DetailRow
                        label="Cantidad"
                        value={
                          <span className="font-mono">
                            {selectedSolicitud.cantidad} {selectedSolicitud.unidadMedida}
                          </span>
                        }
                      />
                      <DetailRow label="Unidad de Medida" value={selectedSolicitud.unidadMedida} />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Logistica */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-foreground">
                    Logistica
                  </h4>
                  <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
                    <DetailRow label="Centro" value={selectedSolicitud.centro} />
                    {selectedSolicitud.tipo === "MATERIAL" && (
                      <DetailRow
                        label="Almacen"
                        value={selectedSolicitud.almacen || "-"}
                      />
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cerrar
                </Button>
                {selectedSolicitud.estado === "CREADA" && (
                  <Button
                    onClick={handleEnviarRevision}
                    disabled={isSending}
                    className="gap-2"
                  >
                    {isSending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    Enviar a Revision
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
