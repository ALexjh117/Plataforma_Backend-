# Guía corta de endpoints

La explicación para quienes **no han hecho backend** está aquí:

**[como-armar-un-endpoint.md](./como-armar-un-endpoint.md)** — dónde va el modelo, el servicio, el controlador, la ruta y cómo probar.

Conceptos (perfil vs módulo, padre/hijo/nieto): **[guia-para-el-equipo.md](./guia-para-el-equipo.md)**

## Recordatorio

- AdonisJS 7. Tablas de `plataforma_1.sql`. **No alterar el dump** sin acuerdo.
- JSON camelCase. SQL en español.
- Prefijo `/api/v1`. Respuestas `{ "data": ... }`.
- Privado: `auth` + `account`. Solo admin: también `admin`.

## Endpoints listos

| Método | Ruta | Notas |
| --- | --- | --- |
| `POST` | `/auth/login` `/auth/signup` | público. Recuperar (`/auth/recover`) es la tarea de autenticación |
| `GET/PATCH` | `/account/profile` | ficha de la persona |
| `PATCH` | `/account/password` | |
| `POST` | `/account/logout` | |
| `GET` | `/modules` | módulos concedidos (plano) |
| `GET` | `/modules/tree` | árbol con `granted` |
| `GET/POST` | `/modules/catalog` | catálogo, solo admin |
| `GET/POST` | `/roles` | perfiles/roles, solo admin |
| `GET/PATCH` | `/roles/:id` | |
| `PUT` | `/roles/:id/modules` | `{ moduleIds }` |
| `GET` | `/users/options` | perfiles activos y centros, solo admin |
| `GET/POST` | `/users` | listar / crear usuario con `idPerfil`, solo admin |
| `GET/PATCH` | `/users/:id` | ficha y cambio de perfil/datos, solo admin |

Cuentas dump, password `123456`: Carlos Administrador, Juan Almacenista, María Funcionario.
