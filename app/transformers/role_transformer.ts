import type Perfil from '#models/perfil'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class RoleTransformer extends BaseTransformer<Perfil> {
  toObject() {
    return {
      id: this.resource.id,
      name: this.resource.nombre,
      description: this.resource.descripcion ?? '',
      active: this.resource.estado,
    }
  }
}
