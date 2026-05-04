"use client"

import { useState, useEffect, useCallback } from "react"
import { SolicitudForm } from "@/components/solicitud-form"
import { SolicitudesTable } from "@/components/solicitudes-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardPlus, List, UserCircle, LogOut, ShieldCheck, ChevronDown } from "lucide-react"
import type { SolicitudCompra, Centro, Almacen, Material, Servicio, Usuario } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Catalogs {
  centros: Centro[]
  almacenes: Almacen[]
  materiales: Material[]
  servicios: Servicio[]
  usuarios: Usuario[]
  unidadesMedida: { id: string; nombre: string }[]
}

export default function SolicitudesPage() {
  const [catalogs, setCatalogs] = useState<Catalogs | null>(null)
  const [solicitudes, setSolicitudes] = useState<SolicitudCompra[]>([])
  const [loadingCatalogs, setLoadingCatalogs] = useState(false)
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false)
  const [activeTab, setActiveTab] = useState("crear")
  const [editingSolicitud, setEditingSolicitud] = useState<SolicitudCompra | null>(null)

  // Estado de Sesión Simulada
  const [availableUsers, setAvailableUsers] = useState<Usuario[]>([])
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [initializing, setInitializing] = useState(true)

  // 1. Cargar usuarios públicos para el selector
  useEffect(() => {
    async function loadPublicUsers() {
      try {
        const res = await fetch("/api/usuarios-simulados")
        const json = await res.json()
        if (json.success) {
          setAvailableUsers(json.data)

          // Intentar recuperar sesión de localStorage
          const savedUserId = localStorage.getItem("qa-session-user-id")
          if (savedUserId) {
            const user = json.data.find((u: Usuario) => u.id === savedUserId)
            if (user) setCurrentUser(user)
          }
        }
      } catch (error) {
        console.error("Error loading simulation users:", error)
      } finally {
        setInitializing(false)
      }
    }
    loadPublicUsers()
  }, [])

  // 2. Fetch de Solicitudes (Protegido)
  const fetchSolicitudes = useCallback(async () => {
    if (!currentUser) return
    setLoadingSolicitudes(true)
    try {
      const res = await fetch("/api/solicitudes", {
        headers: { "x-user-id": currentUser.id }
      })
      const json = await res.json()
      if (json.success) {
        setSolicitudes(json.data)
      } else {
        setSolicitudes([])
      }
    } catch {
      setSolicitudes([])
    } finally {
      setLoadingSolicitudes(false)
    }
  }, [currentUser])

  // 3. Fetch de Catálogos (Protegido)
  useEffect(() => {
    if (!currentUser) {
      setCatalogs(null)
      setSolicitudes([])
      return
    }

    async function loadCatalogs() {
      setLoadingCatalogs(true)
      try {
        const res = await fetch("/api/catalogos", {
          headers: { "x-user-id": currentUser!.id }
        })
        const json = await res.json()
        if (json.success) {
          setCatalogs(json.data)
        }
      } catch {
        setCatalogs(null)
      } finally {
        setLoadingCatalogs(false)
      }
    }

    loadCatalogs()
    fetchSolicitudes()
  }, [currentUser, fetchSolicitudes])

  const handleLogin = (user: Usuario) => {
    setCurrentUser(user)
    localStorage.setItem("qa-session-user-id", user.id)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem("qa-session-user-id")
    setCatalogs(null)
    setSolicitudes([])
  }

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
    if (tab === "listado") {
      setEditingSolicitud(null)
    }
  }

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium animate-pulse">Iniciando Laboratorio QA...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                PR Flow <span className="text-xs font-normal text-muted-foreground ml-1">v2.0 (Senior)</span>
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold">
                Entorno de Pruebas Controlado
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5 transition-all">
                  <UserCircle className="size-4" />
                  <span className="max-w-[120px] truncate hidden sm:inline">
                    {currentUser ? currentUser.nombre : "Seleccionar Usuario"}
                  </span>
                  <ChevronDown className="size-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="flex flex-col gap-1">
                  <span>Simulador de Identidad (QA)</span>
                  <span className="text-[10px] font-normal text-muted-foreground">Elija un rol para probar permisos</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableUsers.map((user) => (
                  <DropdownMenuItem
                    key={user.id}
                    onClick={() => handleLogin(user)}
                    className="flex flex-col items-start gap-1 py-2 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-sm">{user.nombre}</span>
                      {currentUser?.id === user.id && (
                        <Badge variant="secondary" className="text-[9px] h-4 bg-primary/10 text-primary border-none">Activo</Badge>
                      )}
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {user.roles?.map(r => (
                        <span key={r.id} className="text-[9px] uppercase font-bold text-muted-foreground bg-muted px-1 rounded">
                          {r.nombre}
                        </span>
                      ))}
                    </div>
                  </DropdownMenuItem>
                ))}
                {currentUser && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:text-destructive gap-2 cursor-pointer"
                    >
                      <LogOut className="size-4" />
                      Finalizar Simulación
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {!currentUser ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted p-12 text-center bg-card/50">
            <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
              <UserCircle className="size-12" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">Bienvenido al Módulo de Compras</h2>
            <p className="mb-8 max-w-sm text-muted-foreground text-sm">
              Para comenzar las pruebas funcionales, debe seleccionar una identidad en el menú superior.
              Esto simula el inicio de sesión y permite validar permisos de negocio.
            </p>
            <Button onClick={() => document.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')?.click()}>
              Seleccionar Usuario Ahora
            </Button>
          </div>
        ) : (
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
                <div className="flex items-center justify-center py-20 bg-card rounded-xl border border-border">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-sm font-medium">Validando permisos y cargando catalogos...</p>
                  </div>
                </div>
              ) : catalogs ? (
                <SolicitudForm
                  catalogs={{
                    ...catalogs,
                    usuarios: catalogs.usuarios || []
                  }}
                  onSuccess={editingSolicitud ? handleEditSuccess : handleCreateSuccess}
                  editingSolicitud={editingSolicitud}
                  onCancelEdit={handleCancelEdit}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-destructive/5 rounded-xl border border-destructive/20">
                  <p className="text-sm text-destructive font-medium">
                    Error al cargar los catalogos protegidos.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Verifique la conexion con la API.</p>
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
        )}
      </main>
    </div>
  )
}

