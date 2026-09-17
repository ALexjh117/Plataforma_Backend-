import { Exception } from '@adonisjs/core/exceptions'
import User from '#models/usuario'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.getUserOrFail()
    const account = await User.query().where('id', user.id).preload('perfil').firstOrFail()

    if (account.perfil?.nombre !== 'Administrador') {
      throw new Exception('Solo un administrador puede hacer esta acción', {
        status: 403,
        code: 'E_FORBIDDEN',
      })
    }

    return next()
  }
}
