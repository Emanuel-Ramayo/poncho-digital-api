# Documentación del módulo de Postulaciones

Base de las rutas: `http://localhost:3000/api/postulaciones`

Una postulación representa la solicitud de un artesano para participar en una edición de Poncho Digital. Se vincula a un artesano, a un año de postulación y, opcionalmente, a un stand.

## Estados

| Estado | Descripción |
| --- | --- |
| `PENDIENTE` | Estado inicial. Espera la resolución de un administrador. |
| `APROBADA` | Solicitud aceptada. Asigna el rol `ARTESANO` a la cuenta dueña del perfil. |
| `RECHAZADA` | Solicitud rechazada por el administrador. |
| `CANCELADA` | Solicitud cancelada. |

Reglas importantes:

- Un artesano solo puede tener **una** postulación por año (`artesano_id` + `anio_id` son únicos).
- Solo se puede resolver una postulación que esté `PENDIENTE`. Intentar resolverla otra vez devuelve `409`.
- Aprobar una postulación asigna el rol `ARTESANO` dentro de la misma transacción.
- El alta pública no requiere token. El listado, detalle, modificación, resolución y borrado requieren rol `ADMINISTRADOR`.

## Flujo recomendado

1. El artesano se registra con `POST /api/usuarios/registro-artesano`.
   Ese endpoint crea la cuenta, el perfil de artesano y la postulación `PENDIENTE`.
2. El administrador consulta las pendientes con `GET /api/postulaciones?estado=PENDIENTE`.
3. El administrador resuelve con `PATCH /api/postulaciones/:id/resolver`.
4. Si se aprueba, la cuenta recibe el rol `ARTESANO` y ya puede operar sus productos.

## POST `/api/postulaciones` (público)

Crea una postulación para un artesano ya existente.

**Body**

```json
{
  "artesano_id": 1,
  "anio_id": 1,
  "stand_id": null,
  "estado": "PENDIENTE"
}
```

| Campo | Obligatorio | Descripción |
| --- | --- | --- |
| `artesano_id` | Sí | ID del artesano. |
| `anio_id` | Sí | ID del año de postulación. |
| `stand_id` | No | Stand asignado (puede ser `null`). |
| `estado` | No | Por defecto `PENDIENTE`. |

**Respuesta `201`**

```json
{
  "id": 1,
  "estado": "PENDIENTE",
  "artesano_id": 1,
  "anio_id": 1,
  "stand_id": null,
  "artesano": { "...": "datos del artesano con rubro y localidad" },
  "anio": { "id": 1, "anio": 2026 },
  "stand": null
}
```

| Código | Caso |
| --- | --- |
| `400` | Datos inválidos o referencias inexistentes (`P2003`). |
| `409` | El artesano ya tiene una postulación para ese año (`P2002`). |

## GET `/api/postulaciones` (ADMINISTRADOR)

Lista postulaciones con paginación y filtros.

**Query params**

| Parámetro | Valores | Por defecto |
| --- | --- | --- |
| `estado` | `PENDIENTE`, `APROBADA`, `RECHAZADA`, `CANCELADA` | sin filtro |
| `artesano_id` | entero positivo | sin filtro |
| `anio_id` | entero positivo | sin filtro |
| `pagina` | entero positivo | `1` |
| `limite` | 1 a 50 | `10` |
| `ordenPor` | `id`, `estado`, `artesano_id`, `anio_id`, `createdAt` | `id` |
| `direccion` | `asc`, `desc` | `asc` |

**Ejemplo**

```http
GET /api/postulaciones?estado=PENDIENTE&pagina=1&limite=10
Authorization: Bearer <TOKEN>
```

**Respuesta `200`**

```json
{
  "datos": [
    {
      "id": 1,
      "estado": "PENDIENTE",
      "artesano_id": 1,
      "anio_id": 1,
      "artesano": { "...": "..." },
      "anio": { "id": 1, "anio": 2026 },
      "stand": null
    }
  ],
  "paginacion": {
    "pagina": 1,
    "limite": 10,
    "total": 1,
    "totalPaginas": 1
  }
}
```

## GET `/api/postulaciones/:id` (ADMINISTRADOR)

Devuelve el detalle completo de una postulación.

| Código | Caso |
| --- | --- |
| `200` | Postulación encontrada. |
| `400` | `:id` no es un entero positivo. |
| `404` | Postulación inexistente. |

## PATCH `/api/postulaciones/:id/resolver` (ADMINISTRADOR)

Aprueba, rechaza o cancela una solicitud pendiente.

**Body**

```json
{ "estado": "APROBADA" }
```

Valores permitidos: `APROBADA`, `RECHAZADA`, `CANCELADA`.

**Respuesta `200`**

```json
{
  "id": 1,
  "estado": "APROBADA",
  "artesano_id": 1,
  "anio_id": 1,
  "stand_id": null,
  "createdAt": "2026-11-04T12:00:00.000Z",
  "updatedAt": "2026-11-04T12:05:00.000Z"
}
```

| Código | Caso |
| --- | --- |
| `200` | Transición aplicada. |
| `400` | Estado inválido o `:id` inválido. |
| `403` | El token no tiene rol `ADMINISTRADOR`. |
| `404` | Postulación inexistente. |
| `409` | La postulación ya fue resuelta antes. |

> Si el estado es `APROBADA`, además se crea (si no existía) la asignación del rol `ARTESANO` al usuario dueño del artesano.

## PUT `/api/postulaciones/:id` (ADMINISTRADOR)

Actualiza campos de una postulación. Acepta los mismos campos que el alta, todos opcionales, pero exige al menos uno.

**Body de ejemplo**

```json
{ "estado": "PENDIENTE", "stand_id": 3 }
```

| Código | Caso |
| --- | --- |
| `200` | Postulación actualizada. |
| `400` | Sin campos o datos inválidos. |
| `404` | Postulación inexistente. |
| `409` | Conflicto de unicidad o referencia. |

## DELETE `/api/postulaciones/:id` (ADMINISTRADOR)

Elimina una postulación.

**Respuesta `200`**

```json
{ "mensaje": "Postulación eliminada correctamente" }
```

| Código | Caso |
| --- | --- |
| `200` | Postulación eliminada. |
| `404` | Postulación inexistente. |

## Ejemplo de resolución con curl

```bash
curl -X PATCH http://localhost:3000/api/postulaciones/1/resolver \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -d "{\"estado\":\"APROBADA\"}"
```
