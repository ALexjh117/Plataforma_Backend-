type ModulePresentation = {
  icon: string
  to: string | null
}

/**
 * Presentation-only mapping for the frontend. The database dump only stores
 * nombre/descripcion/estado; icons and routes live in the API so we never
 * alter the `modulo` table.
 */
const MODULE_PRESENTATION: Record<string, ModulePresentation> = {
  Inventario: { icon: 'inventory', to: '/inventario' },
  'Materiales de Formación': { icon: 'report', to: '/materiales' },
  Ambiental: { icon: 'leaf', to: '/ambiental' },
}

export function slugifyModuleName(nombre: string) {
  return nombre
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function presentModule(nombre: string): ModulePresentation & { code: string } {
  const extras = MODULE_PRESENTATION[nombre] ?? { icon: 'home', to: null }
  return {
    code: slugifyModuleName(nombre),
    ...extras,
  }
}
