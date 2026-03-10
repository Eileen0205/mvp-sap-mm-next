"use client"

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
import { FileText, Package, Wrench, Pencil } from "lucide-react"
import type { SolicitudCompra } from "@/lib/types"

interface Props {
  solicitudes: SolicitudCompra[]
  isLoading: boolean
  onEdit?: (solicitud: SolicitudCompra) => void
}

const estadoConfig: Record<
  string,
  { label: string; className: string }
> = {
  CREADA: {
    label: "Creada",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
  },
  EN_REVISION: {
    label: "En Revision",
    className: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
  },
  APROBADA: {
    label: "Aprobada",
    className: "bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-100",
  },
  RECHAZADA: {
    label: "Rechazada",
    className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
  },
}

export function SolicitudesTable({ solicitudes, isLoading, onEdit }: Props) {
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
                  <TableHead>F. Creacion</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="pr-6 w-[100px]">Acciones</TableHead>
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
                        {s.almacen || (
                          <span className="text-muted-foreground italic">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {s.fechaEntrega}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {s.fechaCreacion}
                      </TableCell>
                      <TableCell>
                        <Badge className={config.className}>
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={!canEdit}
                                onClick={() => canEdit && onEdit?.(s)}
                                className="gap-1.5 text-xs"
                              >
                                <Pencil className="size-3" />
                                <span className="hidden lg:inline">Modificar</span>
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {!canEdit && (
                            <TooltipContent side="left">
                              <p className="text-xs">
                                No puede modificarse en el estado actual
                              </p>
                            </TooltipContent>
                          )}
                        </Tooltip>
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
  )
}
