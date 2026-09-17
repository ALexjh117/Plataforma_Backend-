import RoleService from '#services/role_service'
import RoleTransformer from '#transformers/role_transformer'
import {
  assignModulesValidator,
  createRoleValidator,
  updateRoleValidator,
} from '#validators/role'
import type { HttpContext } from '@adonisjs/core/http'
import type Perfil from '#models/perfil'
import type { ModuleNode } from '#services/module_tree'

function roleDetail(role: Perfil, moduleIds: number[], tree: ModuleNode[]) {
  return {
    id: role.id,
    name: role.nombre,
    description: role.descripcion ?? '',
    active: role.estado,
    moduleIds,
    tree,
  }
}

export default class RolesController {
  async index({ serialize }: HttpContext) {
    const roles = await new RoleService().list()
    return serialize(RoleTransformer.transform(roles))
  }

  async show({ params, serialize }: HttpContext) {
    const result = await new RoleService().show(Number(params.id))
    return serialize(roleDetail(result.role, result.moduleIds, result.tree))
  }

  async store({ request, serialize }: HttpContext) {
    const payload = await request.validateUsing(createRoleValidator)
    const role = await new RoleService().create(payload)
    return serialize(RoleTransformer.transform(role))
  }

  async update({ params, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateRoleValidator)
    const role = await new RoleService().update(Number(params.id), payload)
    return serialize(RoleTransformer.transform(role))
  }

  async syncModules({ params, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(assignModulesValidator)
    const result = await new RoleService().assignModules(Number(params.id), payload.moduleIds)
    return serialize(roleDetail(result.role, result.moduleIds, result.tree))
  }
}
