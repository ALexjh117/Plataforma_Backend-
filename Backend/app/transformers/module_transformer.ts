import { presentModule } from '#data/module_presentation'
import type Modulo from '#models/modulo'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ModuleTransformer extends BaseTransformer<Modulo> {
  toObject() {
    const presentation = presentModule(this.resource.nombre)

    return {
      id: this.resource.id,
      code: presentation.code,
      label: this.resource.nombre,
      description: this.resource.descripcion ?? '',
      to: presentation.to,
      icon: presentation.icon,
      parentId: this.resource.idModuloPadre,
      order: this.resource.id,
    }
  }
}
