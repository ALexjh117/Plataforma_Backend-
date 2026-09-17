import ModuleService from '#services/module_service'
import ModuleTransformer from '#transformers/module_transformer'
import { createCatalogModuleValidator } from '#validators/role'
import type { HttpContext } from '@adonisjs/core/http'

export default class ModulesController {
  async index({ auth, serialize }: HttpContext) {
    const modules = await new ModuleService().listForUser(auth.getUserOrFail())
    return serialize(ModuleTransformer.transform(modules))
  }

  async tree({ auth, serialize }: HttpContext) {
    const tree = await new ModuleService().treeForUser(auth.getUserOrFail())
    return serialize(tree)
  }

  async catalog({ serialize }: HttpContext) {
    const tree = await new ModuleService().catalogTree()
    return serialize(tree)
  }

  async store({ request, serialize }: HttpContext) {
    const payload = await request.validateUsing(createCatalogModuleValidator)
    const created = await new ModuleService().createCatalogModule(payload)
    return serialize(ModuleTransformer.transform(created))
  }
}
