import type User from '#models/usuario'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    const trainingCenter = this.resource.trainingCenter
    const regional = trainingCenter?.regional
    const roleName = this.resource.perfil?.nombre ?? ''

    return {
      id: this.resource.id,
      fullName: this.resource.fullName,
      roleLabel: roleName,
      location: [trainingCenter?.nombre, regional?.nombre].filter(Boolean).join(' — '),
      avatarUrl: '',
      documentType: this.resource.tipoDocumento,
      documentId: this.resource.numeroDocumento,
      email: this.resource.email,
      phone: '',
      address: '',
      trainingCenter: trainingCenter?.nombre ?? '',
      groupCode: '',
      role: roleName,
      initials: this.resource.initials,
    }
  }
}
