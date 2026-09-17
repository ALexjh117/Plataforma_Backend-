import { Exception } from '@adonisjs/core/exceptions'
import Perfil from '#models/perfil'
import TrainingCenter from '#models/training_center'
import User from '#models/usuario'

type CreateUserPayload = {
  nombres: string
  apellidos: string
  tipoDocumento: string
  numeroDocumento: string
  email: string
  password: string
  idPerfil: number
  idCformacion: number
}

type UpdateUserPayload = {
  nombres?: string
  apellidos?: string
  tipoDocumento?: string
  numeroDocumento?: string
  email?: string
  password?: string
  idPerfil?: number
  idCformacion?: number
  active?: boolean
}

export default class UsuarioService {
  async list() {
    return User.query()
      .preload('perfil')
      .preload('trainingCenter', (query) => {
        query.preload('regional')
      })
      .orderBy('id_usuario', 'asc')
  }

  async show(id: number) {
    const user = await User.query()
      .where('id', id)
      .preload('perfil')
      .preload('trainingCenter', (query) => {
        query.preload('regional')
      })
      .first()

    if (!user) {
      throw new Exception('El usuario no existe', { status: 404, code: 'E_NOT_FOUND' })
    }

    return user
  }

  async options() {
    const [roles, centers] = await Promise.all([
      Perfil.query().where('estado', true).orderBy('nombre', 'asc'),
      TrainingCenter.query().preload('regional').orderBy('nombre', 'asc'),
    ])

    return {
      roles: roles.map((role) => ({
        id: role.id,
        name: role.nombre,
      })),
      centers: centers.map((center) => ({
        id: center.id,
        name: center.nombre,
        regional: center.regional?.nombre ?? '',
      })),
    }
  }

  async create(payload: CreateUserPayload) {
    await this.assertActiveRole(payload.idPerfil)
    await this.assertCenter(payload.idCformacion)

    const user = await User.create({
      nombres: payload.nombres,
      apellidos: payload.apellidos,
      tipoDocumento: payload.tipoDocumento,
      numeroDocumento: payload.numeroDocumento,
      email: payload.email,
      password: payload.password,
      idPerfil: payload.idPerfil,
      idCformacion: payload.idCformacion,
      estado: true,
    })

    return this.show(user.id)
  }

  async update(id: number, payload: UpdateUserPayload, actorId: number) {
    const user = await User.find(id)
    if (!user) {
      throw new Exception('El usuario no existe', { status: 404, code: 'E_NOT_FOUND' })
    }

    if (id === actorId && payload.active === false) {
      throw new Exception('No puedes desactivar tu propia cuenta', {
        status: 422,
        code: 'E_VALIDATION_ERROR',
      })
    }

    if (payload.email && payload.email !== user.email) {
      const taken = await User.query().where('email', payload.email).whereNot('id', id).first()
      if (taken) {
        throw new Exception('El correo ya está en uso', {
          status: 422,
          code: 'E_VALIDATION_ERROR',
        })
      }
    }

    if (payload.numeroDocumento && payload.numeroDocumento !== user.numeroDocumento) {
      const taken = await User.query()
        .where('numeroDocumento', payload.numeroDocumento)
        .whereNot('id', id)
        .first()
      if (taken) {
        throw new Exception('El documento ya está en uso', {
          status: 422,
          code: 'E_VALIDATION_ERROR',
        })
      }
    }

    if (payload.idPerfil !== undefined) {
      await this.assertActiveRole(payload.idPerfil)
    }

    if (payload.idCformacion !== undefined) {
      await this.assertCenter(payload.idCformacion)
    }

    user.merge({
      ...(payload.nombres !== undefined ? { nombres: payload.nombres } : {}),
      ...(payload.apellidos !== undefined ? { apellidos: payload.apellidos } : {}),
      ...(payload.tipoDocumento !== undefined ? { tipoDocumento: payload.tipoDocumento } : {}),
      ...(payload.numeroDocumento !== undefined
        ? { numeroDocumento: payload.numeroDocumento }
        : {}),
      ...(payload.email !== undefined ? { email: payload.email } : {}),
      ...(payload.idPerfil !== undefined ? { idPerfil: payload.idPerfil } : {}),
      ...(payload.idCformacion !== undefined ? { idCformacion: payload.idCformacion } : {}),
      ...(payload.active !== undefined ? { estado: payload.active } : {}),
    })

    if (payload.password) {
      user.password = payload.password
    }

    await user.save()
    return this.show(user.id)
  }

  private async assertActiveRole(idPerfil: number) {
    const role = await Perfil.find(idPerfil)
    if (!role || !role.estado) {
      throw new Exception('El perfil no existe o está inactivo', {
        status: 422,
        code: 'E_VALIDATION_ERROR',
      })
    }
  }

  private async assertCenter(idCformacion: number) {
    const center = await TrainingCenter.find(idCformacion)
    if (!center) {
      throw new Exception('El centro de formación no existe', {
        status: 422,
        code: 'E_VALIDATION_ERROR',
      })
    }
  }
}
