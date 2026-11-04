# Documentación del módulo de Usuarios

Base de las rutas: `http://localhost:3000/api/usuarios`

Los cuerpos de las peticiones y las respuestas son JSON. Los errores usan el formato:

```json
{
  "error": "Mensaje del error.",
  "detalles": [{ "campo": "email", "mensaje": "El email no tiene un formato válido." }]
}
```

`detalles` solo aparece cuando hay errores de validación (Zod).

## Roles y protección de rutas

| Rol | Alcance |
| --- | --- |
| `ADMINISTRADOR` | Gestiona usuarios, roles, estado de cuentas y resuelve postulaciones. |
| `ARTESANO` | Se asigna automáticamente al aprobar su postulación. Opera sus propios productos. |
| Sin rol | Usuario recién registrado: solo puede consultar `/me` y cerrar sesión. |

Las rutas protegidas esperan el encabezado:

```http
Authorization: Bearer <token>
```

Errores de autenticación/autorización:

| Situación | Código |
| --- | --- |
| Falta el encabezado o el token es inválido/vencido/revocado | `401` |
| El token es válido pero la cuenta no tiene el rol requerido | `403` |
| El formato del encabezado no es `Bearer <token>` | `400` |

## Endpoints públicos

### POST `/api/usuarios/registro`

Crea una cuenta básica (sin roles).

**Body**

```json
{
  "nombre": "Ana Pérez",
  "email": "ana@example.com",
  "password": "Password123!"
}
```

**Respuesta `201`**

```json
{
  "id": "uuid",
  "nombre": "Ana Pérez",
  "email": "ana@example.com",
  "activo": true,
  "createdAt": "2026-11-04T12:00:00.000Z",
  "updatedAt": "2026-11-04T12:00:00.000Z"
}
```

| Código | Caso |
| --- | --- |
| `400` | Datos inválidos (nombre corto, email inválido, contraseña de menos de 8 caracteres). |
| `409` | Ya existe un usuario con ese email. |

### POST `/api/usuarios/registro-artesano`

Registro público de un artesano. En una sola transacción crea:

1. La cuenta de usuario (activa, sin rol).
2. El perfil de `Artesano` (validando unicidad por `dni`).
3. Una `Postulacion` en estado `PENDIENTE`.

El rol `ARTESANO` **no** se asigna todavía: se asigna cuando un administrador aprueba la postulación.

**Body**

```json
{
  "nombre": "Artesano Uno",
  "dni": "38123456",
  "email": "artesano1@example.com",
  "password": "Password123!",
  "rubro_id": 1,
  "localidad_id": 1,
  "anio_id": 1
}
```

`anio_id` es opcional: si no se envía, se usa (o se crea) el año actual.

**Respuesta `201`**

```json
{
  "id": "uuid",
  "nombre": "Artesano Uno",
  "email": "artesano1@example.com",
  "activo": true,
  "artesano": { "id": 1, "dni": "38123456", "rubro_id": 1, "localidad_id": 1 },
  "postulacion": { "id": 1, "anio_id": 1, "estado": "PENDIENTE" }
}
```

| Código | Caso |
| --- | --- |
| `400` | Datos inválidos (p. ej. DNI fuera de formato de 7-8 dígitos) o referencias (`rubro_id`, `localidad_id`) inexistentes. |
| `409` | Email o DNI de artesano ya registrado. |

### POST `/api/usuarios/login`

**Body**

```json
{ "email": "ana@example.com", "password": "Password123!" }
```

**Respuesta `200`**

```json
{
  "mensaje": "Inicio de sesión exitoso.",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": { "id": "uuid", "nombre": "Ana Pérez", "email": "ana@example.com" }
}
```

| Código | Caso |
| --- | --- |
| `401` | Email inexistente, contraseña incorrecta o cuenta inactiva. |
| `400` | Body inválido. |

> El token incluye `sub`, `jti`, `iat` y `exp`; no incluye email, contraseña ni hash.

## Endpoints de la cuenta autenticada

### GET `/api/usuarios/me`

Requiere token. Devuelve el perfil con sus roles y, si tiene, su perfil de artesano.

**Respuesta `200`**

```json
{
  "usuario": {
    "id": "uuid",
    "nombre": "Admin Test",
    "email": "admin@test.com",
    "activo": true,
    "roles": ["ADMINISTRADOR"],
    "artesano": null
  }
}
```

### POST `/api/usuarios/logout`

Requiere token. Revoca el token actual (se guarda su `jti` hasta su vencimiento).

**Respuesta:** `204 No Content`.

## Endpoints exclusivos del rol ADMINISTRADOR

### POST `/api/usuarios/registro-administrador`

```json
{ "nombre": "Otro Admin", "email": "otro@example.com", "password": "Password123!" }
```

**Respuesta `201`:** `{ id, nombre, email, activo }`.

### POST `/api/usuarios/asignar-artesano`

Vincula un perfil de artesano a una cuenta existente.

```json
{
  "usuarioId": "uuid",
  "nombre": "Artesano Existente",
  "dni": "30123456",
  "rubro_id": 1,
  "localidad_id": 1
}
```

**Respuesta `201`:** perfil de artesano creado.

### POST `/api/usuarios/:id/roles`

Asigna el rol `ADMINISTRADOR` a un usuario.

```json
{ "rol": "ADMINISTRADOR" }
```

**Respuesta `200`:** `{ "mensaje": "Rol ADMINISTRADOR asignado." }`.

### DELETE `/api/usuarios/:id/roles/:rol`

Retira un rol. `:rol` acepta `ARTESANO` o `ADMINISTRADOR`.

**Respuesta:** `204 No Content`.

### PATCH `/api/usuarios/:id/activo`

Activa o desactiva una cuenta. Una cuenta inactiva no puede iniciar sesión.

```json
{ "activo": false }
```

**Respuesta `200`:** usuario actualizado.

## Resumen de códigos

| Código | Significado |
| --- | --- |
| `200` / `201` / `204` | Operación exitosa. |
| `400` | Datos o parámetros inválidos. |
| `401` | Falta autenticación o el token no es válido. |
| `403` | Autenticado sin permisos. |
| `404` | Recurso inexistente. |
| `409` | Conflicto (email o DNI duplicado, transición inválida). |
| `500` | Error interno no controlado. |

## Ejemplo con curl

```bash
# 1. Login
curl -X POST http://localhost:3000/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@test.com\",\"password\":\"AdminTest2026!\"}"

# 2. Consultar el perfil usando el token devuelto
curl http://localhost:3000/api/usuarios/me \
  -H "Authorization: Bearer <TOKEN>"
```
