import ProfileService from '#services/profile_service'
import UserTransformer from '#transformers/user_transformer'
import { changePasswordValidator, updateProfileValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  async show({ auth, serialize }: HttpContext) {
    const user = await new ProfileService().load(auth.getUserOrFail())
    return serialize(UserTransformer.transform(user))
  }

  async update({ auth, request, serialize }: HttpContext) {
    const account = auth.getUserOrFail()
    const payload = await request.validateUsing(updateProfileValidator)
    const user = await new ProfileService().update(account, payload)
    return serialize(UserTransformer.transform(user))
  }

  async changePassword({ auth, request }: HttpContext) {
    const account = auth.getUserOrFail()
    const payload = await request.validateUsing(changePasswordValidator)
    await new ProfileService().changePassword(account, payload.currentPassword, payload.password)

    return {
      message: 'Contraseña actualizada',
    }
  }
}
