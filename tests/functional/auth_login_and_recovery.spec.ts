import { test } from '@japa/runner'

/**
 * Tarea de autenticación (login + recuperar contraseña).
 * Guía: docs/tarea-login-y-recuperar.md
 *
 * Las vistas del front se crean en el otro repo. Aquí va el API de recuperar.
 * El POST /auth/login ya existe; no lo rompas.
 * Cuando el API de recover esté listo, quita `.skip(true)` de cada test y corre `node ace test`.
 */

test.group('Password recovery', () => {
  test('accepts a recover request even if the email does not exist', async ({ client }) => {
    const response = await client.post('/api/v1/auth/recover').json({
      email: 'nadie@correo.com',
    })

    response.assertStatus(200)
  }).skip(true)

  test('does not include a reset code in the recover response', async ({ client, assert }) => {
    const response = await client.post('/api/v1/auth/recover').json({
      email: 'carlos@correo.com',
    })

    response.assertStatus(200)
    const body = response.body() as { message?: string; data?: { code?: string }; code?: string }
    assert.isUndefined(body.code)
    assert.isUndefined(body.data?.code)
  }).skip(true)

  test('rejects an invalid recovery code', async ({ client }) => {
    await client.post('/api/v1/auth/recover').json({
      email: 'carlos@correo.com',
    })

    const response = await client.post('/api/v1/auth/recover/verify').json({
      email: 'carlos@correo.com',
      code: '000000',
    })

    response.assertStatus(422)
  }).skip(true)

  test('resets the password with a valid code and allows login', async ({ client }) => {
    const recover = await client.post('/api/v1/auth/recover').json({
      email: 'carlos@correo.com',
    })
    recover.assertStatus(200)

    const debugCode = recover.body().debugCode as string | undefined
    if (!debugCode) {
      throw new Error(
        'En NODE_ENV=test el POST /auth/recover debe devolver debugCode para poder probar el flujo. No lo mandes fuera de test.',
      )
    }

    const reset = await client.post('/api/v1/auth/recover/reset').json({
      email: 'carlos@correo.com',
      code: debugCode,
      password: 'NuevaClave1',
      passwordConfirmation: 'NuevaClave1',
    })
    reset.assertStatus(200)

    const oldLogin = await client.post('/api/v1/auth/login').json({
      email: 'carlos@correo.com',
      password: '123456',
    })
    oldLogin.assertStatus(400)

    const nextLogin = await client.post('/api/v1/auth/login').json({
      email: 'carlos@correo.com',
      password: 'NuevaClave1',
    })
    nextLogin.assertStatus(200)
  }).skip(true)
})
