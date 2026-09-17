import { presentModule } from '#data/module_presentation'
import type Modulo from '#models/modulo'

export type ModuleNode = {
  id: number
  code: string
  label: string
  description: string
  to: string | null
  icon: string
  parentId: number | null
  granted: boolean
  children: ModuleNode[]
}

export function toModulePayload(mod: Modulo, granted = false): Omit<ModuleNode, 'children'> {
  const presentation = presentModule(mod.nombre)
  return {
    id: mod.id,
    code: presentation.code,
    label: mod.nombre,
    description: mod.descripcion ?? '',
    to: presentation.to,
    icon: presentation.icon,
    parentId: mod.idModuloPadre,
    granted,
  }
}

export function buildModuleTree(modules: Modulo[], grantedIds: Set<number> = new Set()): ModuleNode[] {
  const nodes = new Map<number, ModuleNode>()

  for (const mod of modules) {
    nodes.set(mod.id, {
      ...toModulePayload(mod, grantedIds.has(mod.id)),
      children: [],
    })
  }

  const roots: ModuleNode[] = []
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : null
    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
