# Cómo armar un endpoint (leído despacio)

**Autor: Alex.** Esta guía se empezó a armar **desde mayo**, pensada justo para esto: que alguien nuevo en el equipo sepa dónde va cada archivo, por qué se hace así, y no tenga que adivinar. **Cualquier duda, pregúntenme a mí (Alex).** .

Esto **no** es el endpoint listo , estas guias seran usadas seguramente bueno no se JAJAJA para
el semillero entonces para l@s que este viendo esta guia . Es el mapa + **un molde de código** en cada paso.

Los recuadros de código son para **ver la forma**. Ustedes los copian, cambian nombres, y los arman. Si pegan todo y ya, no entendieron: hay que escribirlo en las carpetas que dice cada paso.

Si una palabra no se entiende, está explicada la primera vez que sale.

---

## Palabras que van a aparecer

**Front** = la pantalla que ve la persona (React).

**Back** = este proyecto (`Plataformaback`). Aquí se arman las respuestas.

**Endpoint** = una dirección a la que el front le pide algo. Ejemplo: “dame los productos”. Esa dirección se escribe así: `/api/v1/inventario/elementos`.

**Tabla** = una hoja en Postgres. Ejemplo: la hoja `elemento` tiene los productos.

**JSON** = el papelito de respuesta. Un texto con nombres y valores que el front sabe leer.

**Token** = un permiso de “ya inicié sesión”. Sin eso, el back no te atiende en las rutas privadas.

---

## La idea, en una frase

El front pregunta. El back busca en la tabla. El back responde.

Para que eso no se vuelva un desastre, **no se pone todo en un solo archivo**. Se parte en 7 piezas. Siempre las mismas. Siempre en el mismo orden.

**Por qué se parte (buena práctica):** si todo vive en el controlador, al mes nadie sabe dónde está la regla, se copian errores, y un cambio rompe tres pantallas. Cada pieza hace **una** cosa. Así pueden rotar de rol: una arma el modelo, otra el servicio, y se entienden.

---

## Los 7 pasos (de abajo hacia arriba)

Piensen en un **mostrador de tienda**:

1. **Modelo** — el estante del depósito. Ahí están las cosas (la tabla).
2. **Validador** — mirar el papel del cliente. Si viene en blanco, no se busca nada.
3. **Servicio** — las reglas de la tienda. “Juan solo ve lo de su centro.”
4. **Transformer** — empacar bonito para la vitrina. El front no quiere ver la bodega por dentro.
5. **Controlador** — la persona del mostrador. Recibe la pregunta, pide al depósito, entrega el paquete. **No decide las reglas.**
6. **Ruta** — el letrero de la puerta. “Los productos se piden en *esta* dirección.”
7. **Prueba** — antes de abrir al público, ustedes mismos preguntan y miran si la respuesta es la correcta.

**No empiecen por el letrero (ruta).** Tendrían una puerta y adentro no hay estante.

**No empiecen por el mostrador (controlador).** Van a esconder las reglas ahí y después nadie sabe dónde están.

---

## Dónde vive cada pieza (carpetas)

Abran el proyecto `Plataformaback`. Las carpetas ya existen. Ustedes **agregan archivos**, no inventan carpetas nuevas.

| Orden | Carpeta | En cristiano |
| --- | --- | --- |
| 1 | `app/models/` | “Esta clase es la tabla X.” |
| 2 | `app/validators/` | “Si el papel viene mal, se rechaza.” |
| 3 | `app/services/` | “Las reglas.” |
| 4 | `app/transformers/` | “Cómo se ve la respuesta.” |
| 5 | `app/controllers/` | “Entra la pregunta, sale la respuesta.” |
| 6 | `start/routes.ts` | “Esta dirección usa este mostrador.” Un solo archivo. Se **agrega** una línea, no se crea otro. |
| 7 | `tests/functional/` | “Probamos solos.” |

---

## Paso 1 — Modelo

**Qué es:** un archivo que dice: “yo soy la tabla `elemento`”.

**Para qué sirve:** es el único lugar que “conoce” la tabla. El resto del back no habla SQL a lo loco: le pide al modelo “tráeme los elementos”.

**Por qué es buena práctica:** si mañana la tabla cambia un nombre de columna, se arregla **aquí**, no en 15 archivos. Por eso va **primero**: sin estante, el mostrador no tiene de dónde sacar.

**Por qué primero:** todo lo demás pregunta al modelo. Si no existe, no hay de dónde sacar los destornilladores.

**Dónde:** `app/models/`  
Un archivo por tabla. Nombre en singular, como la tabla: `elemento.ts`, `bodega.ts`.

**Qué tiene que decir, sí o sí:** el nombre **exacto** de la tabla en Postgres.

En la tabla se llama `elemento`. En el modelo tiene que decir `elemento`. No `elementos`. No `productos`. No `inventory`.

**Cómo se hace:** no lo inventen de cero. Abran `app/models/modulo.ts` o `app/models/usuario.ts` y copien la forma.

Miren que ahí dice algo como `static table = 'usuario'`. Eso es el puente: este archivo ↔ esa tabla.

**Inventario:** las tablas **ya están** en Postgres. Ustedes solo hacen el modelo que las nombra. No creen la tabla otra vez.

Tablas que ya existen: `categoria`, `subcategoria`, `bodega`, `stand`, `elemento`, `item`, `unidad_medida`.

No existe una tabla llamada `inventario`. Inventario es el **botón del menú**, no una hoja de Excel.

**Ejemplo de forma** — archivo `app/models/elemento.ts`:

```ts
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Elemento extends BaseModel {
  // el nombre EXACTO de la tabla en Postgres
  static table = 'elemento'

  @column({ isPrimary: true, columnName: 'id_elemento' })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare cantidad: number

  @column()
  declare estado: boolean
}
```

`columnName` se usa cuando en SQL se llama `id_elemento` y en el código quieren `id`.  
Copien también `app/models/modulo.ts` (ese sí está completo y ya corre).

---

## Paso 2 — Validador

**Qué es:** el que revisa el papel **antes** de guardar.

**Para qué sirve:** no deja entrar basura a la tabla. Nombre vacío, cantidad negativa, un texto donde iba un número: se corta **antes** de tocar Postgres.

**Por qué es buena práctica:** si validan “a mano” en el controlador, se les olvida un caso y la base queda sucia. El validador es la misma regla siempre: mal → **422**, la tabla ni se entera. Eso es más barato que borrar filas rotas después.

**Cuándo sí hace falta:** cuando el front **manda** datos (crear o editar). “Nombre vacío” no puede entrar.

**Cuándo no:** cuando solo **preguntan** la lista (un GET). Ahí no hay papel que revisar.

**Dónde:** `app/validators/`

**Cómo se hace:** copien `app/validators/usuario.ts` o `app/validators/role.ts`.

Si el papel viene mal, el back responde **422**. Eso significa: “no entendí / te faltó un dato”. La tabla no se toca.

**Ejemplo de forma** — archivo `app/validators/elemento.ts`:

```ts
import vine from '@vinejs/vine'

export const createElementoValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(150),
  quantity: vine.number().min(0),
})
```

`name` y `quantity` son como los manda el front. El servicio después los pasa a `nombre` y `cantidad`.  
Un GET de lista **no** usa este archivo.

---

## Paso 3 — Servicio

**Qué es:** las reglas. Aquí sí se piensa.

**Para qué sirve:** aquí vive “quién puede ver qué” y “se puede guardar o no”. El mostrador solo pregunta; el servicio responde con criterio.

**Por qué es buena práctica:** las reglas se escriben **una vez**. Si hay GET y POST, los dos usan el mismo servicio. Si la regla está en el controlador, mañana copian el archivo, cambian una línea y Juan ve bodegas de otro centro. El permiso de Inventario tampoco se pega en cada producto: se mira persona → perfil → módulo.

Ejemplos de reglas:

- Juan del centro X no ve la bodega del centro Y.
- Si el perfil no tiene Inventario, no entra.
- No se guarda un producto si el estante no existe.

**Dónde:** `app/services/`

**Por qué no va en el controlador:** el mostrador no decide la política de la tienda. Si mañana hay otra puerta que pide lo mismo, reutilizan **este** archivo.

**Cómo se hace:** copien `app/services/module_service.ts`. Ahí ya hay reglas de verdad.

El permiso de Inventario **no** se pega en cada producto. Se mira: esta persona → su perfil → ¿tiene el módulo Inventario?

**Ejemplo de forma** — archivo `app/services/elemento_service.ts`:

```ts
import Elemento from '#models/elemento'
import type User from '#models/usuario'

export default class ElementoService {
  async listForUser(user: User) {
    return Elemento.query().where('estado', true)
  }
}
```

Ahí ustedes agregan la regla del centro (Juan no ve otra bodega). El `user` llega del controlador.  
No pongan `Elemento.query()` en el controlador: va **aquí**.  
Copien el estilo de `app/services/module_service.ts`.

---

## Paso 4 — Transformer

**Qué es:** el que traduce.

**Para qué sirve:** la base habla español (`nombre`, `id_cformacion`). El front habla camelCase (`name`). El transformer es el diccionario. También **esconde** lo que no debe salir (contraseña, seriales en el listado).

**Por qué es buena práctica:** si mandan la fila cruda de Postgres, el front se acopla a la base. El día que cambien una columna, se rompe React. Traduciendo aquí, la tabla puede cambiar y el contrato del front se mantiene. Una sola forma de responder: `{ "data": ... }`.

En la base el campo se llama `nombre`.  
El front espera algo como `name`.  
Ustedes no cambian la tabla. Traducen en este archivo.

También sirve para **no mandar de más**. La contraseña nunca sale. El serial del extintor no sale en la lista de productos; sale en el detalle.

**Dónde:** `app/transformers/`

**Cómo se hace:** copien `app/transformers/module_transformer.ts`.

La respuesta siempre va envuelta así: `{ "data": ... }`. Eso lo hace el `serialize` del controlador. Ustedes no arman esa caja a mano.

**Ejemplo de forma** — archivo `app/transformers/elemento_transformer.ts`:

```ts
import type Elemento from '#models/elemento'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ElementoTransformer extends BaseTransformer<Elemento> {
  toObject() {
    return {
      id: this.resource.id,
      name: this.resource.nombre,
      quantity: this.resource.cantidad,
    }
  }
}
```

A la izquierda: como lo quiere el front (`name`).  
A la derecha: como está en la tabla (`nombre`).  
Copien `app/transformers/module_transformer.ts`.

---

## Paso 5 — Controlador

**Qué es:** la persona del mostrador.

**Para qué sirve:** es la puerta HTTP. Entra el pedido, sale el JSON. No es el depósito ni el reglamento.

**Por qué es buena práctica:** un controlador flaco se lee en 20 segundos. Si meten consultas y `if` de permisos aquí, nadie encuentra nada y no se puede reutilizar. El mostrador hace tres cosas y nada más:

1. Recibe la pregunta.
2. Llama al **servicio**.
3. Entrega lo que armó el **transformer**.

**No** busca en la tabla aquí. **No** pone las reglas aquí.

**Dónde:** `app/controllers/`

El archivo se tiene que llamar así, o Adonis no lo encuentra:

`elementos_controller.ts`

(plural + `_controller`). Copien `app/controllers/modules_controller.ts`.

Nombres de funciones que ya usa el equipo:

| Nombre | Qué significa | Pedido típico |
| --- | --- | --- |
| `index` | dame la lista | GET |
| `show` | dame uno | GET con un número |
| `store` | créalo | POST |
| `update` | cámbialo | PATCH |

**Ejemplo de forma** — archivo `app/controllers/elementos_controller.ts`:

```ts
import ElementoService from '#services/elemento_service'
import ElementoTransformer from '#transformers/elemento_transformer'
import { createElementoValidator } from '#validators/elemento'
import type { HttpContext } from '@adonisjs/core/http'

export default class ElementosController {
  // GET — dame la lista
  async index({ auth, serialize }: HttpContext) {
    const elementos = await new ElementoService().listForUser(auth.getUserOrFail())
    return serialize(ElementoTransformer.transform(elementos))
  }

  // POST — créalo (acá sí se usa el validador)
  async store({ request, auth, serialize }: HttpContext) {
    const payload = await request.validateUsing(createElementoValidator)
    const creado = await new ElementoService().create(auth.getUserOrFail(), payload)
    return serialize(ElementoTransformer.transform(creado))
  }
}
```

Lean raya por raya:

- `auth.getUserOrFail()` = “quién está preguntando”
- `new ElementoService()...` = “que lo resuelva el servicio”
- `serialize(...)` = “envuélvelo en `{ data: ... }`”
- **No** hay `Elemento.query()` aquí. Si lo ponen, está mal el paso 3.

`create` en el servicio ustedes lo escriben. Este recuadro solo muestra el mostrador.

---

## Paso 6 — Ruta

**Qué es:** el letrero. Une la dirección con el mostrador.

**Para qué sirve:** el front no adivina archivos. Llama a una URL. La ruta dice: esta URL → este controlador → esta función, y si hay que traer token.

**Por qué es buena práctica:** **un** archivo de rutas (`start/routes.ts`) es el índice de toda la API. Si cada quien crea `routes-inventario.ts`, a la semana hay cinco puertas y nadie sabe cuál vale. El middleware (`auth`, `account`) se pone aquí **una vez** para todo el grupo: no se copia “¿hay token?” en cada función.

**Dónde:** **solo** `start/routes.ts`. Un archivo para todo el proyecto. Se agrega un grupo adentro del que ya dice `/api/v1`.

No creen `routes-inventario.ts`. No pongan la dirección en el controlador.

Ejemplo de letrero (inventario, listar productos):

`GET /api/v1/inventario/elementos` → controlador `Elementos`, función `index`.

**Ejemplo de forma** — se **pega adentro** del grupo que ya tiene `.prefix('/api/v1')` en `start/routes.ts` (miren cómo están `modules` y `users`):

```ts
router
  .group(() => {
    router.get('elementos', [controllers.Elementos, 'index'])
    router.post('elementos', [controllers.Elementos, 'store'])
  })
  .prefix('inventario')
  .as('inventario')
  .use(middleware.auth())
  .use(middleware.account())
```

Eso arma:

- GET `/api/v1/inventario/elementos` → `index`
- POST `/api/v1/inventario/elementos` → `store`

`controllers.Elementos` aparece solo si el archivo se llama `elementos_controller.ts`. Si no sale, el nombre del archivo está mal. No editen `.adonisjs/server/controllers.ts` a mano.

En ese archivo también se pone **quién puede entrar**:

| Palabra que van a ver | Significa | Si falta |
| --- | --- | --- |
| `auth` | hay que haber iniciado sesión (traer token) | el back dice **401** |
| `account` | la cuenta no está bloqueada | el back dice **403** |
| `admin` | solo Administrador | el back dice **403** |

Inventario **no** lleva `admin`. Juan (Almacenista) tiene que poder entrar. Lo de “¿tiene el módulo Inventario?” va en el **servicio**.

Para ver si el letrero quedó colgado:

1. Guardan.
2. Tienen el servidor prendido (`npm run dev`).
3. En la terminal: `node ace list:routes`
4. Tiene que aparecer su dirección. Si no aparece, el letrero no quedó bien puesto.

---

## Paso 7 — Cómo saber que sí está bien

**Para qué sirve:** para no decir “en mi máquina sí”. La prueba pregunta sola: sin carnet, con carnet, con Juan.

**Por qué es buena práctica:** mañana alguien cambia una línea y rompe el 401. Si hay un archivo en `tests/functional/`, `node ace test` lo caza **antes** de subirlo. Probar a mano una vez está bien; dejarlo escrito es lo que cuenta cuando rotan de rol.

Hay dos formas. Hagan las dos.

### A. A mano (como una persona)

1. Piden login: correo `juan@correo.com`, clave `123456`.
2. Les devuelven un `token`. Lo copian.
3. Piden su endpoint **con** ese token.
4. Tiene que salir **200** y una lista dentro de `data`.
5. Piden lo mismo **sin** token. Tiene que salir **401**.

Eso se puede hacer en Thunder Client, Insomnia o similar. El front todavía no hace falta.

### B. Automático (el archivo de prueba)

**Dónde:** `tests/functional/`  
Copien `tests/functional/users.spec.ts` (ahí ya está el login).

**Ejemplo de forma** — archivo `tests/functional/inventario_elementos.spec.ts`:

```ts
import { test } from '@japa/runner'
import type { ApiClient } from '@japa/api-client'

async function login(client: ApiClient, email: string, password = '123456') {
  const response = await client.post('/api/v1/auth/login').json({ email, password })
  response.assertStatus(200)
  return response.body().data.token as string
}

test.group('Inventario elementos', () => {
  test('sin token no entra', async ({ client }) => {
    const response = await client.get('/api/v1/inventario/elementos')
    response.assertStatus(401)
  })

  test('juan ve la lista', async ({ client }) => {
    const token = await login(client, 'juan@correo.com')
    const response = await client.get('/api/v1/inventario/elementos').bearerToken(token)
    response.assertStatus(200)
  })
})
```

Mínimo tres preguntas:

1. Sin token → **401** (la puerta pide carnet).
2. Alguien que no deba → **403** (carnet de otro lado).
3. Juan con Inventario → **200** y se ven productos de verdad.

Correr:

```bash
node ace test
```

Si eso pasa, no es “en mi máquina se veía”. Quedó escrito.

### Qué significa cada número

| Número | En cristiano |
| --- | --- |
| 200 | sí, aquí está |
| 401 | no iniciaste sesión |
| 403 | iniciaste, pero no te toca esto |
| 404 | esa dirección o ese producto no existe |
| 422 | el papel venía mal (falta el nombre, etc.) |

---

## Qué no toquen (aunque Adonis lo muestre)

| Cosa | Por qué |
| --- | --- |
| `database/schema.ts` | Un papel que genera Adonis. **No** es la base. Se ignora. |
| Crear de nuevo la tabla `elemento` | Ya existe. Si la crean otra vez, choca. |
| Cambiar el SQL del grupo a escondidas | Si Figma pide un campo que no está, se avisa. No se inventa. |
| Meter las reglas en el controlador | Después nadie encuentra nada. |

---

## Checklist (impriman esto)

Antes de decir “ya quedó”:

1. Hay un modelo que nombra la tabla **tal cual** está en Postgres.
2. No creé la tabla otra vez.
3. Las reglas están en el servicio, no en el mostrador.
4. La respuesta va en `{ "data": ... }`.
5. El letrero está en `start/routes.ts`.
6. Sin token sale 401.
7. Con Juan sale 200 y datos reales.
8. `node ace test` pasa.

---

## Si les tocó inventario

Primera dirección a armar (ustedes, no está hecha):

**listar productos** → `GET /api/v1/inventario/elementos`

En la lista debe verse, más o menos: nombre, categoría, stand, bodega, cantidad.

Los seriales (EXT-019) **no** van en esa lista. Van cuando se abre **un** producto.

Préstamos = **después**, otra tabla, otras fechas. No lo mezclen aquí.

---

## Archivos viejos para copiar el estilo

No copien este documento como código. Copien archivos que **ya corren**:

- Un modelo: `app/models/modulo.ts`
- Un servicio: `app/services/module_service.ts`
- Un mostrador: `app/controllers/modules_controller.ts`
- El letrero: `start/routes.ts`
- Una prueba: `tests/functional/users.spec.ts`

Orden cada vez: **modelo → validador (si hay que guardar) → servicio → transformer → controlador → ruta → prueba.**

---

## Autor y dudas

Guía armada por **Alex**, desde **mayo**, para que el equipo no tenga que adivinar este orden cuando les toque un endpoint nuevo.

Si algo no cierra —carpeta, permiso, 401, 403, o “¿esto va en el servicio o en el controlador?”— **me preguntan a mí**. Mejor una duda de más que una tabla duplicada o un controlador con toda la lógica adentro.
