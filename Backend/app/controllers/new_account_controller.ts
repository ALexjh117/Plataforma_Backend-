import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'
import ProfileService from '#services/profile_service'

export default class NewAccountController {
  async store({ request, serialize }: HttpContext) {
    const payload = await request.validateUsing(signupValidator)

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

    const profile = await new ProfileService().load(user)
    const token = await User.accessTokens.create(user)

    return serialize({
      user: UserTransformer.transform(profile),
      token: token.value!.release(),
    })
  }
}
