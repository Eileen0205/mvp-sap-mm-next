"use client"

import { useState, useEffect, useCallback } from "react"
import { SolicitudForm } from "@/components/solicitud-form"
import { SolicitudesTable } from "@/components/solicitudes-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardPlus, List } from "lucide-react"
import type { SolicitudCompra, Centro, Almacen, Material, Servicio } from "@/lib/types"

// URL base de la API - usa variable de entorno o ruta relativa por defecto
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

interface Catalogs {
  centros: Centro[]
  almacenes: Almacen[]
  materiales: Material[]
  servicios: Servicio[]
  unidadesMedida: { id: string; nombre: string }[]
}

export default function SolicitudesPage() {
  const [catalogs, setCatalogs] = useState<Catalogs | null>(null)
  const [solicitudes, setSolicitudes] = useState<SolicitudCompra[]>([])
  const [loadingCatalogs, setLoadingCatalogs] = useState(true)
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true)
  const [activeTab, setActiveTab] = useState("crear")
  const [editingSolicitud, setEditingSolicitud] = useState<SolicitudCompra | null>(null)

  const fetchSolicitudes = useCallback(async () => {
    setLoadingSolicitudes(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/solicitudes`)
      const json = await res.json()
      if (json.success) {
        setSolicitudes(json.data)
      }
    } catch {
      // Silently handle error - table will show empty state
    } finally {
      setLoadingSolicitudes(false)
    }
  }, [])

  useEffect(() => {
    async function loadCatalogs() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/catalogos`)
        const json = await res.json()
        if (json.success) {
          setCatalogs(json.data)
        }
      } catch {
        // Handle error
      } finally {
        setLoadingCatalogs(false)
      }
    }

    // Migrar estados antiguos (UPPERCASE) a nuevo formato (PascalCase) si existen
    async function migrateEstados() {
      try {
        await fetch(`${API_BASE_URL}/api/solicitudes`, { method: "PATCH" })
      } catch {
        // Silently handle - migration is optional
      }
    }

    loadCatalogs()
    migrateEstados().then(() => fetchSolicitudes())
  }, [fetchSolicitudes])

  const handleCreateSuccess = () => {
    fetchSolicitudes()
    setActiveTab("listado")
  }

  const handleEditSuccess = () => {
    fetchSolicitudes()
    setEditingSolicitud(null)
    setActiveTab("listado")
  }

  const handleEditRequest = (solicitud: SolicitudCompra) => {
    setEditingSolicitud(solicitud)
    setActiveTab("crear")
  }

  const handleCancelEdit = () => {
    setEditingSolicitud(null)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Clear edit state when switching to create tab without an edit context
    if (tab === "crear" && editingSolicitud) {
      // Keep edit mode active when navigating to the form tab
    }
    if (tab === "listado") {
      // Clear edit mode when going to list
      setEditingSolicitud(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              PR Flow
            </h1>
            <p className="text-sm text-muted-foreground">
              Gestion de Solicitudes de Compra
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              US
            </div>
            <span className="hidden sm:inline">Usuario Solicitante</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="crear" className="gap-2">
              <ClipboardPlus className="size-4" />
              <span className="hidden sm:inline">
                {editingSolicitud ? "Modificar Solicitud" : "Crear Solicitud"}
              </span>
              <span className="sm:hidden">
                {editingSolicitud ? "Modificar" : "Crear"}
              </span>
            </TabsTrigger>
            <TabsTrigger value="listado" className="gap-2">
              <List className="size-4" />
              <span className="hidden sm:inline">Listado</span>
              <span className="sm:hidden">Lista</span>
              {solicitudes.length > 0 && (
                <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {solicitudes.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crear">
            {loadingCatalogs ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  <p className="text-sm">Cargando catalogos...</p>
                </div>
              </div>
            ) : catalogs ? (
              <SolicitudForm
                catalogs={catalogs}
                onSuccess={editingSolicitud ? handleEditSuccess : handleCreateSuccess}
                editingSolicitud={editingSolicitud}
                onCancelEdit={handleCancelEdit}
              />
            ) : (
              <div className="flex items-center justify-center py-20">
                <p className="text-sm text-destructive">
                  Error al cargar los catalogos. Recargue la pagina.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="listado">
            <SolicitudesTable
              solicitudes={solicitudes}
              isLoading={loadingSolicitudes}
              onEdit={handleEditRequest}
              onRefresh={fetchSolicitudes}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
