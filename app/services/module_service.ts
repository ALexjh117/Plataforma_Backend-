import { Exception } from '@adonisjs/core/exceptions'
import Modulo from '#models/modulo'
import { buildModuleTree } from '#services/module_tree'
import type User from '#models/usuario'

export default class ModuleService {
  async listForUser(user: User) {
    return user.allowedModules()
  }

  async treeForUser(user: User) {
    const [granted, catalog] = await Promise.all([user.allowedModules(), this.listCatalog()])
    const grantedIds = new Set(granted.map((item) => item.id))
    const visibleIds = this.withAncestors(catalog, grantedIds)
    const visible = catalog.filter((item) => visibleIds.has(item.id))
    return buildModuleTree(visible, grantedIds)
  }

  async listCatalog() {
    return Modulo.query().where('estado', true).orderBy('id_modulo', 'asc')
  }

  async catalogTree() {
    const catalog = await this.listCatalog()
    return buildModuleTree(catalog)
  }

  async createCatalogModule(payload: {
    name: string
    description?: string
    parentId?: number | null
  }) {
    if (payload.parentId) {
      const parent = await Modulo.find(payload.parentId)
      if (!parent) {
        throw new Exception('El módulo padre no existe', {
          status: 422,
          code: 'E_VALIDATION_ERROR',
        })
      }
    }

    return Modulo.create({
      nombre: payload.name,
      descripcion: payload.description ?? null,
      estado: true,
      idModuloPadre: payload.parentId ?? null,
    })
  }

  private withAncestors(catalog: Modulo[], grantedIds: Set<number>) {
    const byId = new Map(catalog.map((item) => [item.id, item]))
    const visible = new Set<number>()

    for (const id of grantedIds) {
      let current = byId.get(id)
      while (current) {
        visible.add(current.id)
        current = current.idModuloPadre ? byId.get(current.idModuloPadre) : undefined
      }
    }

    return visible
  }
}
