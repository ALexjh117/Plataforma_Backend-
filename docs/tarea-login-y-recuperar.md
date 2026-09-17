# Tarea: login y recuperar contraseña

Esta tarea es **tuya**: backend **y** frontend. El resto del equipo no la implementa.

Las **vistas de login y recuperar se borraron a propósito**. Tú creas las pantallas, conectas recordar sesión, y armás recuperar contraseña en el API (migración → modelo → validador → servicio → controlador → rutas → tests).

El `POST /api/v1/auth/login` **sí se queda**: perfil, roles y módulos lo usan para entrar. No lo borres ni cambies el JSON `{ user, token }`.

Receta general de capas (modelo → validador → servicio → transformer → controlador → ruta → test): [guia-para-el-equipo.md](./guia-para-el-equipo.md).

---

## Qué ya hay (no lo vuelvas a crear)

| Pieza | Dónde |
| --- | --- |
| `POST /api/v1/auth/login` | `app/controllers/access_tokens_controller.ts` método `store` |
| Validador | `app/validators/user.ts` → `loginValidator` |
| Ruta pública | `start/routes.ts` grupo `auth` |
| Usuario + contraseña del dump | `app/models/user.ts` (`verifyPassword`) |
| Guardar token y entrar | Frontend `src/lib/auth.tsx` función `login` |
| Llamadas HTTP | Frontend `src/lib/api.ts` |

Cuentas para probar (contraseña `123456`):

- `carlos@correo.com` Administrador
- `juan@correo.com` Almacenista
- `maria@correo.com` Funcionario

El front puede mandar correo **o** documento:

```json
{ "email": "carlos@correo.com", "password": "123456" }
```

```json
{ "usuario": "1001001001", "password": "123456" }
```

Respuesta: `{ "data": { "user": { ...perfil }, "token": "..." } }`.

---

## Lo que te falta (esto sí lo haces tú)

### Frontend — crear las vistas

No hay `LoginPage.tsx` ni `RecoverPasswordPage.tsx`. En `App.tsx` hay un hueco (`AuthPending`) en `/login` y `/recuperar`. Tú:

1. Creas `src/pages/LoginPage.tsx` y la montas en `/login`.
2. Creas `src/pages/RecoverPasswordPage.tsx` y la montas en `/recuperar`.
3. Creas `src/lib/recovery.ts` con las 3 llamadas al API.
4. Checkbox **Recordar sesión**: si está marcado, el token queda en `localStorage`; si no, en `sessionStorage`. Hoy `setToken` en `src/lib/api.ts` siempre usa `localStorage`.
5. Mensajes claros si el correo no existe, la clave es mala o la cuenta está inactiva (el API ya manda 422 / 401 / 403).
6. En el login, enlace **¿Olvidaste tu contraseña?** a `/recuperar`.

Copia el look del Figma y de `Dashboard` / `Header` (fondo `/img/imageninicio.jpg`, `SenaMark`, inputs redondos, botón verde SENA). No rediseñes.

Backend (solo si hace falta, en el login):

- No cambies el contrato `{ user, token }` sin avisar: perfil y módulos lo usan.
- No pongas la contraseña en logs ni en el JSON.

### Recuperar contraseña (de cero: API + vista)

Flujo de la vista:

1. Correo institucional
2. Código de **6 dígitos**
3. Clave nueva + confirmación
4. Volver a `/login` e iniciar sesión con la clave nueva

En SQL del dump **no** hay tabla de códigos. **No alteres `plataforma_1.sql`**. Creas una tabla **nueva**, igual que ya se hizo con `auth_access_tokens`.

---

## Backend — orden obligatorio para recuperar

### Paso 1 — Migración (tabla nueva)

```bash
node ace make:migration create_password_reset_codes_table
```

Columnas mínimas (nombres en español, como el resto):

| Columna | Para qué |
| --- | --- |
| `id` | PK |
| `id_usuario` | FK a `usuario.id_usuario`, `onDelete CASCADE` |
| `correo` | el correo al que se pidió el código |
| `codigo_hash` | el código de 6 **hasheado**, nunca en texto |
| `expira_en` | p. ej. 15 minutos |
| `usado_en` | `null` hasta que cambien la clave |
| `created_at` | |

Copia el estilo de `database/migrations/1768620764696_create_access_tokens_table.ts`.

```bash
node ace migration:run
```

### Paso 2 — Modelo

`app/models/password_reset_code.ts`

- `static table = 'password_reset_codes'`
- `columnName` si el campo SQL no coincide con el nombre en TypeScript
- Relación `belongsTo` hacia `User` si la necesitas

### Paso 3 — Validador

`app/validators/password_recovery.ts`

Tres bodies distintos:

```ts
import vine from '@vinejs/vine'

export const recoverRequestValidator = vine.create({
  email: vine.string().trim().email().maxLength(150),
})

export const recoverVerifyValidator = vine.create({
  email: vine.string().trim().email().maxLength(150),
  code: vine.string().trim().fixedLength(6),
})

export const recoverResetValidator = vine.create({
  email: vine.string().trim().email().maxLength(150),
  code: vine.string().trim().fixedLength(6),
  password: vine.string().minLength(8).maxLength(32),
  passwordConfirmation: vine.string().minLength(8).maxLength(32).sameAs('password'),
})
```

### Paso 4 — Servicio (aquí va la lógica)

`app/services/password_recovery_service.ts`

Reglas (no las saltes):

1. **No reveles si el correo existe.** Si no hay usuario, igual respondes `200` con el mismo mensaje.
2. Código de 6 dígitos, números. Guarda **hash**, no el código plano.
3. Caduca (15 minutos es razonable). Un código vencido no sirve.
4. Al cambiar la clave, marca `usado_en` y **invalida** códigos viejos de esa persona.
5. La clave nueva se guarda en `usuario.password` (el modelo ya hashea si usas Lucid como en el resto).
6. **Nunca** mandes el código en el JSON de producción. Mientras no haya correo real: en desarrollo puedes hacer `logger.info` **solo del hecho** de que se emitió. Para probar a mano, mira la consola del backend si dejas un log temporal del código y **quitas ese log** cuando funcione. En tests, `NODE_ENV=test` puede devolver `debugCode` para no adivinar.
7. No pongas la contraseña nueva en logs.

Métodos sugeridos: `request(email)`, `verify(email, code)`, `reset(email, code, password)`.

### Paso 5 — Controlador

`app/controllers/password_recovery_controller.ts`

El controlador **no** arma SQL. Solo:

```ts
async store({ request }: HttpContext) {
  const payload = await request.validateUsing(recoverRequestValidator)
  await new PasswordRecoveryService().request(payload.email)
  return { message: 'Si el correo está registrado, enviaremos un código.' }
}
```

Igual para `verify` y `reset`. Respuesta de recurso con `serialize` solo si devuelves datos. Aquí basta un `{ message }`.

Si Adonis no lista el controlador, mira `.adonisjs/server/controllers.ts` (se genera solo; reinicia `npm run dev`).

### Paso 6 — Rutas (públicas, junto al login)

En `start/routes.ts`, **dentro** del grupo `auth` (sin `middleware.auth()`):

```ts
router.post('login', [controllers.AccessTokens, 'store'])
router.post('signup', [controllers.NewAccount, 'store'])
router.post('recover', [controllers.PasswordRecovery, 'store'])
router.post('recover/verify', [controllers.PasswordRecovery, 'verify'])
router.post('recover/reset', [controllers.PasswordRecovery, 'reset'])
```

URLs finales:

| Método | Ruta | Body |
| --- | --- | --- |
| `POST` | `/api/v1/auth/recover` | `{ "email" }` |
| `POST` | `/api/v1/auth/recover/verify` | `{ "email", "code" }` |
| `POST` | `/api/v1/auth/recover/reset` | `{ "email", "code", "password", "passwordConfirmation" }` |

Errores: `422` datos mal, código malo o vencido. `200` si salió bien. **No** uses `404` cuando el correo no existe (eso delata cuentas).

### Paso 7 — Prueba

Archivo ya dejado (en skip) para que sepas cuándo está listo:

`tests/functional/auth_login_and_recovery.spec.ts`

Cuando tu API cumpla eso:

1. Quita `.skip` de cada `test`.
2. Corre:

```bash
node ace test
```

También: login con correo malo / clave mala no debe devolver `200`. El login del API ya se usa en `profile_and_modules.spec.ts`; esos tests tienen que **seguir pasando**.

---

## Frontend — qué tocar

Repo: `plataforma` (este mismo producto, carpeta distinta).

| Archivo | Qué haces |
| --- | --- |
| `src/pages/LoginPage.tsx` | **Lo creas.** Diseño Figma + `login()` de `auth.tsx`. Recordar sesión. Errores del API. |
| `src/pages/RecoverPasswordPage.tsx` | **Lo creas.** 3 pasos (correo → código → clave). Mismo estilo de tarjeta. |
| `src/lib/recovery.ts` | **Lo creas.** Las 3 llamadas con `api()`. |
| `src/App.tsx` | Quita `AuthPending` y monta las dos páginas en `/login` y `/recuperar`. |
| `src/lib/api.ts` | Reutiliza `api()`. Si implementas recordar sesión, `getToken` / `setToken` deben mirar `sessionStorage` o `localStorage`. |
| `src/lib/auth.tsx` | El `login` del contexto ya entra. No lo rompas. El logout y el perfil no son esta tarea. |

Las tres llamadas (prefijo `/api/v1` lo pone `api()`):

```ts
await api('/auth/recover', { method: 'POST', body: JSON.stringify({ email }) })
await api('/auth/recover/verify', { method: 'POST', body: JSON.stringify({ email, code }) })
await api('/auth/recover/reset', {
  method: 'POST',
  body: JSON.stringify({ email, code, password, passwordConfirmation }),
})
```

Después del reset: `navigate('/login')`.

---

## Cómo saber si terminaste

- [ ] Sigue existiendo `POST /api/v1/auth/login` y las demás pueden entrar con Carlos
- [ ] Existen `LoginPage.tsx` y `RecoverPasswordPage.tsx` (ya no el hueco de `AuthPending`)
- [ ] Recordar sesión funciona en el front
- [ ] `/recuperar`: correo → código → clave nueva → login con la clave nueva
- [ ] Correo inexistente: misma respuesta 200, sin delatar
- [ ] Código malo o vencido: `422`
- [ ] La clave no aparece en logs ni en el GET de perfil
- [ ] Tabla nueva por migración; dump `plataforma_1.sql` intacto
- [ ] Tests de recuperar sin `.skip` y `node ace test` en verde
- [ ] Probaste el flujo en el navegador (front `npm run dev` + back `npm run dev`)
