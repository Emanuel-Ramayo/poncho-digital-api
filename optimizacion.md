# Optimización de Consultas con Prisma ORM
## Trabajo de Investigación Aplicada: Selección de Campos y Recuperación Eficiente de Relaciones

* **Institución:** Facultad de Tecnología y Ciencias Aplicadas
* **Carrera:** Tecnicatura Universitaria en Diseño de Software
* **Cátedra:** Desarrollo Backend
* **Grupo:** 3
* **Integrantes:** Guillermo Ponessa y Emanuel Ramayo
* **Proyecto:** Poncho Digital API
* **Módulo seleccionado:** Artesanos (`src/services/artesanosService.js`)

---

## 1. Fundamentación Teórica y Diagnóstico

### 1.1. Diferencia entre `select` e `include`
* **`include`:** Carga relaciones completas manteniendo todos los atributos escalares del modelo principal. Resulta perjudicial cuando las entidades contienen claves foráneas redundantes, timestamps o datos que el cliente no necesita consumir en un listado público.
* **`select`:** Permite especificar de forma granular y explícita qué campos escalares y qué relaciones (con sus propios subcampos) deben ser recuperados y transferidos desde la base de datos hacia la aplicación.

### 1.2. El Problema de Consultas N+1
El problema N+1 se produce cuando, tras consultar un conjunto de $N$ registros principales (por ejemplo, 10 artesanos), el sistema ejecuta una consulta adicional en la base de datos por cada uno de ellos para recuperar sus entidades hijas. Esto dispara $1 + N = 11$ consultas individuales a la base de datos, incrementando la latencia de red y el consumo de conexiones.

* **Cómo lo previene Prisma:** Al utilizar relaciones anidadas dentro de una única llamada a `findMany({ select: { ... } })`, Prisma ejecuta internamente sentencias optimizadas en PostgreSQL (mediante cláusulas `IN (...)` y joins), reduciendo la interacción a una sola operación de base de datos eficiente.

---

## 2. Cambios Implementados en el Código

Los cambios se focalizaron en el archivo [`src/services/artesanosService.js`](src/services/artesanosService.js):

### A. Listado General de Artesanos (`GET /api/artesanos`)
1. **Selección ultra compacta (`selectResumenArtesano`):** Se adaptó la respuesta para entregar únicamente la información visual requerida:
   * Nombre del artesano.
   * Nombre del rubro.
   * Nombre de la localidad y de su provincia asociada.
2. **Eliminación total de metadatos e IDs innecesarios:** Se descartaron `id`, `usuarioId`, `createdAt`, `updatedAt`, `rubro_id`, `localidad_id`, `provincia_id`, y el árbol de postulaciones/stands.

### B. Detalle Individual de Artesano (`GET /api/artesanos/:id`)
1. **Protección de datos (`selectDetalleArtesano`):** Se ocultó el campo sensible `usuarioId` (UUID de la cuenta privada de autenticación), el cual antes era visible públicamente por el uso de `include`.
2. **Relaciones anidadas limpias:** Se devuelven los productos con su categoría y sus postulaciones con información de stand sin duplicar identificadores relacionales.

---

## 3. Evidencias Comparativas (Antes vs. Después)

### 3.1. Comparativa de Código en `src/services/artesanosService.js`

#### Código Anterior (Inclusión completa y no discriminada)
```javascript
const includeCompletoArtesano = {
  rubro: {
    select: {
      id: true,
      nombre: true
    }
  },
  localidad: {
    include: {
      provincia: true
    }
  },
  productos: {
    include: {
      categoria: true
    }
  },
  postulaciones: {
    include: {
      anio: true,
      stand: {
        include: {
          sector: {
            include: {
              pabellon: true
            }
          }
        }
      }
    }
  }
};

// findMany({ ..., include: includeCompletoArtesano })
```

#### Código Optimizado (Selección granular exacta)
```javascript
const selectResumenArtesano = {
  nombre: true,
  rubro: {
    select: {
      nombre: true
    }
  },
  localidad: {
    select: {
      nombre: true,
      provincia: {
        select: {
          nombre: true
        }
      }
    }
  }
};

// findMany({ ..., select: selectResumenArtesano })
```

---

### 3.2. Comparativa de Respuestas JSON (`GET /api/artesanos`)

#### Respuesta Anterior (Sobrecarga de metadatos y relaciones)
```json
{
  "id": 1,
  "nombre": "María López",
  "rubro_id": 1,
  "localidad_id": 1,
  "usuarioId": "11111111-1111-4111-8111-111111111111",
  "createdAt": "2026-10-22T10:14:15.167Z",
  "updatedAt": "2026-10-22T10:14:15.167Z",
  "rubro": {
    "id": 1,
    "nombre": "Textil"
  },
  "localidad": {
    "id": 1,
    "nombre": "San Fernando del Valle de Catamarca",
    "provincia_id": 1,
    "createdAt": "2026-10-22T10:14:15.167Z",
    "updatedAt": "2026-10-22T10:14:15.167Z",
    "provincia": {
      "id": 1,
      "nombre": "Catamarca",
      "createdAt": "2026-10-22T10:14:15.167Z",
      "updatedAt": "2026-10-22T10:14:15.167Z"
    }
  },
  "productos": [],
  "postulaciones": []
}
```

#### Respuesta Optimizada (Estructura requerida)
```json
{
  "nombre": "María López",
  "rubro": {
    "nombre": "Textil"
  },
  "localidad": {
    "nombre": "San Fernando del Valle de Catamarca",
    "provincia": {
      "nombre": "Catamarca"
    }
  }
}
```

---

### 3.3. Tabla de Métricas Reales

Medición automatizada y reproducible mediante el script de benchmark [`src/scripts/medirOptimizacion.js`](src/scripts/medirOptimizacion.js) (ejecutable con `npm run test:optimizacion`) sobre los 6 artesanos de prueba:

| Criterio | Consulta Original (`include`) | Consulta Optimizada (`select`) | Variación / Impacto |
| :--- | :---: | :---: | :---: |
| **Tamaño Payload (Bytes)** | **3.469 B** (~3.47 KB) | **835 B** (~0.84 KB) | **-75.93% de reducción en transferencia** |
| **Campos por elemento** | 12 atributos (4 niveles) | 4 atributos esenciales | **-66.67% de campos reducidos** |
| **Tiempo de respuesta DB** | ~216 ms - 250 ms | ~3 ms | **Reducción sustancial de latencia interna** |
| **Seguridad de la información** | Expone `usuarioId` (UUID) | Oculta `usuarioId` | Mayor protección de datos de usuario |
| **Consultas a la base de datos** | 1 consulta compuesta (sin N+1) | 1 consulta compuesta (sin N+1) | Mantiene alta eficiencia en base de datos |

---

## 4. Conclusión
La utilización estratégica de `select` y selecciones anidadas permite que la API entregue exactamente lo requerido por las interfaces de usuario. La reducción de casi el **76% en el volumen de datos transferidos** demuestra el impacto directo de eliminar la información redundante, manteniendo intactas las capacidades de filtrado, ordenamiento y paginación del endpoint.
