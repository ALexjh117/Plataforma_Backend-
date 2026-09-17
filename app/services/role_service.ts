import { Exception } from '@adonisjs/core/exceptions'
import Modulo from '#models/modulo'
import Perfil from '#models/perfil'
import { buildModuleTree } from '#services/module_tree'

export default class RoleService {
  async list() {
    return Perfil.query().orderBy('id_perfil', 'asc')
  }

  async show(id: number) {
    const role = await Perfil.query()
      .where('id', id)
      .preload('modulos', (query) => {
        query.where('modulo.estado', true).wherePivot('estado', true)
      })
      .first()

    if (!role) {
      throw new Exception('El perfil no existe', { status: 404, code: 'E_NOT_FOUND' })
    }

    const catalog = await Modulo.query().where('estado', true).orderBy('id_modulo', 'asc')
    const grantedIds = new Set(role.modulos.map((item) => item.id))

    return {
      role,
      moduleIds: [...grantedIds],
      tree: buildModuleTree(catalog, grantedIds),
    }
  }

  async create(payload: { name: string; description?: string }) {
    const exists = await Perfil.query().where('nombre', payload.name).first()
    if (exists) {
      throw new Exception('Ya existe un perfil con ese nombre', {
        status: 422,
        code: 'E_VALIDATION_ERROR',
      })
    }

    return Perfil.create({
      nombre: payload.name,
      descripcion: payload.description ?? null,
      estado: true,
    })
  }

  async update(
    id: number,
    payload: { name?: string; description?: string; active?: boolean }
  ) {
    const role = await Perfil.find(id)
    if (!role) {
      throw new Exception('El perfil no existe', { status: 404, code: 'E_NOT_FOUND' })
    }

    if (payload.name && payload.name !== role.nombre) {
      const exists = await Perfil.query().where('nombre', payload.name).whereNot('id', id).first()
      if (exists) {
        throw new Exception('Ya existe un perfil con ese nombre', {
          status: 422,
          code: 'E_VALIDATION_ERROR',
        })
      }
    }

    role.merge({
      ...(payload.name !== undefined ? { nombre: payload.name } : {}),
      ...(payload.description !== undefined ? { descripcion: payload.description } : {}),
      ...(payload.active !== undefined ? { estado: payload.active } : {}),
    })
    await role.save()
    return role
  }

  async assignModules(id: number, moduleIds: number[]) {
    const role = await Perfil.find(id)
    if (!role) {
      throw new Exception('El perfil no existe', { status: 404, code: 'E_NOT_FOUND' })
    }

    const uniqueIds = [...new Set(moduleIds)]

    if (uniqueIds.length) {
      const found = await Modulo.query().whereIn('id', uniqueIds).where('estado', true)
      if (found.length !== uniqueIds.length) {
        throw new Exception('Hay un módulo que no existe o está inactivo', {
          status: 422,
          code: 'E_VALIDATION_ERROR',
        })
      }
    }

    const pivot = Object.fromEntries(uniqueIds.map((moduleId) => [moduleId, { estado: true }]))
    await role.related('modulos').sync(pivot)
    return this.show(id)
  }
}
