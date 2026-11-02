import { z } from "zod";
import {
  artesanoSchema,
  actualizarArtesanoSchema
} from "../validators/artesanosValidator.js";
import {
  productoSchema,
  actualizarProductoSchema
} from "../validators/productosValidator.js";
import {
  standSchema,
  actualizarStandSchema
} from "../validators/standsValidator.js";
import {
  postulacionSchema,
  actualizarPostulacionSchema,
  resolverPostulacionSchema
} from "../validators/postulacionesValidator.js";
import {
  registrarUsuarioSchema,
  registroArtesanoSchema,
  iniciarSesionSchema,
  asignarArtesanoSchema
} from "../validators/usuariosValidator.js";
import { actualizarActivoSchema } from "../validators/estadoValidator.js";
import { asignarAdministradorSchema } from "../validators/rolesValidator.js";

// ==========================================
// ESQUEMAS COMUNES (ERRORES Y PAGINACIÓN)
// ==========================================

export const ErrorApi = {
  type: "object",
  required: ["error"],
  properties: {
    error: { type: "string" }
  },
  example: {
    error: "Se requiere un token de acceso."
  }
};

export const MensajeExito = {
  type: "object",
  required: ["mensaje"],
  properties: {
    mensaje: { type: "string" }
  },
  example: {
    mensaje: "Operación realizada correctamente"
  }
};

export const Paginacion = {
  type: "object",
  required: ["pagina", "limite", "total", "totalPaginas"],
  properties: {
    pagina: { type: "integer" },
    limite: { type: "integer" },
    total: { type: "integer" },
    totalPaginas: { type: "integer" }
  },
  example: {
    pagina: 1,
    limite: 10,
    total: 25,
    totalPaginas: 3
  }
};

// ==========================================
// ESQUEMAS DE ARTESANOS
// ==========================================

export const NuevoArtesano = {
  ...z.toJSONSchema(artesanoSchema, {
    target: "openapi-3.0",
    io: "input"
  }),
  required: ["nombre", "rubro_id", "localidad_id", "usuarioId"],
  example: {
    nombre: "María Catamarca",
    rubro_id: 1,
    localidad_id: 1,
    usuarioId: "550e8400-e29b-41d4-a716-446655440000"
  }
};

export const ActualizarArtesano = {
  ...z.toJSONSchema(actualizarArtesanoSchema, {
    target: "openapi-3.0",
    io: "input"
  }),
  example: {
    nombre: "María Catamarca Modificado",
    rubro_id: 2,
    localidad_id: 1
  }
};

export const ArtesanoResumen = {
  type: "object",
  required: ["nombre", "rubro", "localidad"],
  properties: {
    nombre: { type: "string" },
    rubro: {
      type: "object",
      required: ["nombre"],
      properties: {
        nombre: { type: "string" }
      }
    },
    localidad: {
      type: "object",
      required: ["nombre", "provincia"],
      properties: {
        nombre: { type: "string" },
        provincia: {
          type: "object",
          required: ["nombre"],
          properties: {
            nombre: { type: "string" }
          }
        }
      }
    }
  },
  example: {
    nombre: "María Catamarca",
    rubro: { nombre: "Textil" },
    localidad: {
      nombre: "Belén",
      provincia: { nombre: "Catamarca" }
    }
  }
};

export const ListadoArtesanos = {
  type: "object",
  required: ["datos", "paginacion"],
  properties: {
    datos: {
      type: "array",
      items: { $ref: "#/components/schemas/ArtesanoResumen" }
    },
    paginacion: { $ref: "#/components/schemas/Paginacion" }
  },
  example: {
    datos: [
      {
        nombre: "María Catamarca",
        rubro: { nombre: "Textil" },
        localidad: {
          nombre: "Belén",
          provincia: { nombre: "Catamarca" }
        }
      }
    ],
    paginacion: {
      pagina: 1,
      limite: 10,
      total: 1,
      totalPaginas: 1
    }
  }
};

export const PerfilArtesano = {
  type: "object",
  required: ["id", "nombre", "rubro", "localidad"],
  properties: {
    id: { type: "integer" },
    nombre: { type: "string" },
    rubro: {
      type: "object",
      required: ["id", "nombre"],
      properties: {
        id: { type: "integer" },
        nombre: { type: "string" }
      }
    },
    localidad: {
      type: "object",
      required: ["id", "nombre", "provincia"],
      properties: {
        id: { type: "integer" },
        nombre: { type: "string" },
        provincia: {
          type: "object",
          required: ["id", "nombre"],
          properties: {
            id: { type: "integer" },
            nombre: { type: "string" }
          }
        }
      }
    }
  },
  example: {
    id: 1,
    nombre: "María Catamarca",
    rubro: { id: 1, nombre: "Textil" },
    localidad: {
      id: 1,
      nombre: "Belén",
      provincia: { id: 1, nombre: "Catamarca" }
    }
  }
};

export const ArtesanoDetalle = {
  type: "object",
  required: ["id", "nombre", "usuario", "rubro", "localidad", "productos", "postulaciones"],
  properties: {
    id: { type: "integer" },
    nombre: { type: "string" },
    usuario: {
      type: "object",
      required: ["id", "nombre", "email", "activo", "roles"],
      properties: {
        id: { type: "string", format: "uuid" },
        nombre: { type: "string" },
        email: { type: "string", format: "email" },
        activo: { type: "boolean" },
        roles: {
          type: "array",
          items: {
            type: "object",
            properties: {
              rol: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  nombre: { type: "string" }
                }
              }
            }
          }
        }
      }
    },
    rubro: {
      type: "object",
      required: ["id", "nombre"],
      properties: {
        id: { type: "integer" },
        nombre: { type: "string" }
      }
    },
    localidad: {
      type: "object",
      required: ["id", "nombre", "provincia"],
      properties: {
        id: { type: "integer" },
        nombre: { type: "string" },
        provincia: {
          type: "object",
          required: ["id", "nombre"],
          properties: {
            id: { type: "integer" },
            nombre: { type: "string" }
          }
        }
      }
    },
    productos: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nombre: { type: "string" },
          descripcion: { type: "string", nullable: true },
          precio: { type: "number" },
          categoria: {
            type: "object",
            properties: {
              id: { type: "integer" },
              nombre: { type: "string" }
            }
          }
        }
      }
    },
    postulaciones: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          estado: { type: "string" },
          anio: {
            type: "object",
            properties: {
              id: { type: "integer" },
              anio: { type: "integer" }
            }
          },
          stand: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "integer" },
              numero: { type: "integer" },
              disponible: { type: "boolean" }
            }
          }
        }
      }
    }
  },
  example: {
    id: 1,
    nombre: "María Catamarca",
    usuario: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      nombre: "María Catamarca",
      email: "maria@poncho.gob.ar",
      activo: true,
      roles: [{ rol: { id: 2, nombre: "ARTESANO" } }]
    },
    rubro: { id: 1, nombre: "Textil" },
    localidad: {
      id: 1,
      nombre: "Belén",
      provincia: { id: 1, nombre: "Catamarca" }
    },
    productos: [],
    postulaciones: []
  }
};

// ==========================================
// ESQUEMAS DE PRODUCTOS
// ==========================================

export const NuevoProducto = {
  ...z.toJSONSchema(productoSchema, {
    target: "openapi-3.0",
    io: "input"
  }),
  required: ["nombre", "precio", "categoria_id"],
  example: {
    nombre: "Poncho de Vicuña Tradicional",
    descripcion: "Tejido en telar criollo con lana de vicuña",
    precio: 250000.5,
    categoria_id: 1
  }
};

export const ActualizarProducto = {
  ...z.toJSONSchema(actualizarProductoSchema, {
    target: "openapi-3.0",
    io: "input"
  }),
  example: {
    nombre: "Poncho de Vicuña Especial",
    descripcion: "Edición limitada tejida a mano",
    precio: 280000.0,
    categoria_id: 1
  }
};

export const ProductoResumen = {
  type: "object",
  required: ["nombre", "precio", "categoria", "artesano"],
  properties: {
    nombre: { type: "string" },
    precio: { type: "number" },
    categoria: {
      type: "object",
      required: ["nombre"],
      properties: {
        nombre: { type: "string" }
      }
    },
    artesano: {
      type: "object",
      required: ["nombre"],
      properties: {
        nombre: { type: "string" }
      }
    }
  },
  example: {
    nombre: "Poncho de Vicuña Tradicional",
    precio: 250000.5,
    categoria: { nombre: "Indumentaria Textil" },
    artesano: { nombre: "María Catamarca" }
  }
};

export const Producto = {
  type: "object",
  required: ["id", "nombre", "precio", "categoria", "artesano"],
  properties: {
    id: { type: "integer" },
    nombre: { type: "string" },
    precio: { type: "number" },
    categoria: {
      type: "object",
      required: ["nombre"],
      properties: {
        nombre: { type: "string" }
      }
    },
    artesano: {
      type: "object",
      required: ["nombre"],
      properties: {
        nombre: { type: "string" }
      }
    }
  },
  example: {
    id: 10,
    nombre: "Poncho de Vicuña Tradicional",
    precio: 250000.5,
    categoria: { nombre: "Indumentaria Textil" },
    artesano: { nombre: "María Catamarca" }
  }
};

export const ListadoProductos = {
  type: "object",
  required: ["datos", "paginacion"],
  properties: {
    datos: {
      type: "array",
      items: { $ref: "#/components/schemas/ProductoResumen" }
    },
    paginacion: { $ref: "#/components/schemas/Paginacion" }
  },
  example: {
    datos: [
      {
        nombre: "Poncho de Vicuña Tradicional",
        precio: 250000.5,
        categoria: { nombre: "Indumentaria Textil" },
        artesano: { nombre: "María Catamarca" }
      }
    ],
    paginacion: {
      pagina: 1,
      limite: 10,
      total: 1,
      totalPaginas: 1
    }
  }
};

// ==========================================
// ESQUEMAS DE STANDS
// ==========================================

export const NuevoStand = {
  ...z.toJSONSchema(standSchema, {
    target: "openapi-3.0",
    io: "input"
  }),
  required: ["numero", "sector_id"],
  example: {
    numero: 15,
    sector_id: 1,
    disponible: true
  }
};

export const ActualizarStand = {
  ...z.toJSONSchema(actualizarStandSchema, {
    target: "openapi-3.0",
    io: "input"
  }),
  example: {
    numero: 15,
    sector_id: 1,
    disponible: false
  }
};

export const Stand = {
  type: "object",
  required: ["numero", "pabellon", "ocupado"],
  properties: {
    numero: { type: "integer" },
    pabellon: { type: "string", nullable: true },
    ocupado: { type: "boolean" },
    artesano: { type: "string", nullable: true }
  },
  example: {
    numero: 15,
    pabellon: "Pabellón Peregrina Zárate",
    ocupado: false
  }
};

export const ListadoStands = {
  type: "object",
  required: ["datos", "paginacion"],
  properties: {
    datos: {
      type: "array",
      items: { $ref: "#/components/schemas/Stand" }
    },
    paginacion: { $ref: "#/components/schemas/Paginacion" }
  },
  example: {
    datos: [
      {
        numero: 15,
        pabellon: "Pabellón Peregrina Zárate",
        ocupado: false
      }
    ],
    paginacion: {
      pagina: 1,
      limite: 10,
      total: 1,
      totalPaginas: 1
    }
  }
};

// ==========================================
// ESQUEMAS DE POSTULACIONES
// ==========================================

export const NuevaPostulacion = {
  ...z.toJSONSchema(postulacionSchema, {
    target: "openapi-3.0",
    io: "input"
  }),
  required: ["artesano_id", "anio_id"],
  example: {
    artesano_id: 1,
    anio_id: 1,
    estado: "PENDIENTE",
    stand_id: null
  }
};

export const ActualizarPostulacion = {
  ...z.toJSONSchema(actualizarPostulacionSchema, {
    target: "openapi-3.0",
    io: "input"
  }),
  example: {
    estado: "APROBADA",
    stand_id: 5
  }
};

export const ResolverPostulacion = {
  ...z.toJSONSchema(resolverPostulacionSchema, {
    target: "openapi-3.0",
    io: "input"
  }),
  example: {
    estado: "APROBADA"
  }
};

export const Postulacion = {
  type: "object",
  required: ["id", "estado", "anio", "artesano", "stand"],
  properties: {
    id: { type: "integer" },
    estado: {
      type: "string",
      enum: ["PENDIENTE", "APROBADA", "RECHAZADA", "CANCELADA"]
    },
    anio: { type: "integer", nullable: true },
    artesano: {
      type: "object",
      properties: {
        nombre: { type: "string", nullable: true },
        rubro: { type: "string", nullable: true }
      }
    },
    stand: {
      type: "object",
      nullable: true,
      properties: {
        numero: { type: "integer" },
        pabellon: { type: "string", nullable: true }
      }
    }
  },
  example: {
    id: 1,
    estado: "PENDIENTE",
    anio: 2026,
    artesano: {
      nombre: "María Catamarca",
      rubro: "Textil"
    },
    stand: null
  }
};

export const ListadoPostulaciones = {
  type: "object",
  required: ["datos", "paginacion"],
  properties: {
    datos: {
      type: "array",
      items: { $ref: "#/components/schemas/Postulacion" }
    },
    paginacion: { $ref: "#/components/schemas/Paginacion" }
  },
  example: {
    datos: [
      {
        id: 1,
        estado: "PENDIENTE",
        anio: 2026,
        artesano: {
          nombre: "María Catamarca",
          rubro: "Textil"
        },
        stand: null
      }
    ],
    paginacion: {
      pagina: 1,
      limite: 10,
      total: 1,
      totalPaginas: 1
    }
  }
};

// ==========================================
// ESQUEMAS DE USUARIOS Y AUTENTICACIÓN
// ==========================================

export const RegistroUsuario = {
  ...z.toJSONSchema(registrarUsuarioSchema, {
    target: "openapi-3.0",
    io: "input"
  }),
  example: {
    nombre: "Juan Pérez",
    email: "juan.perez@poncho.gob.ar",
    password: "ClaveSegura2026!"
  }
};

export const RegistroArtesano = {
  ...z.toJSONSchema(registroArtesanoSchema, {
    target: "openapi-3.0",
    io: "input"
  }),
  example: {
    nombre: "María Catamarca",
    email: "maria@poncho.gob.ar",
    password: "ClaveSegura2026!",
    rubro_id: 1,
    localidad_id: 1,
    anio_id: 1
  }
};

export const LoginUsuario = {
  ...z.toJSONSchema(iniciarSesionSchema, {
    target: "openapi-3.0",
    io: "input"
  }),
  example: {
    email: "maria@poncho.gob.ar",
    password: "ClaveSegura2026!"
  }
};

export const AsignarArtesano = {
  ...z.toJSONSchema(asignarArtesanoSchema, {
    target: "openapi-3.0",
    io: "input"
  }),
  example: {
    usuarioId: "550e8400-e29b-41d4-a716-446655440000",
    nombre: "Administrador Artesano",
    rubro_id: 1,
    localidad_id: 1
  }
};

export const AsignarRol = {
  ...z.toJSONSchema(asignarAdministradorSchema, {
    target: "openapi-3.0",
    io: "input"
  }),
  example: {
    rol: "ADMINISTRADOR"
  }
};

export const ActualizarActivo = {
  ...z.toJSONSchema(actualizarActivoSchema, {
    target: "openapi-3.0",
    io: "input"
  }),
  example: {
    activo: true
  }
};

export const UsuarioSeguro = {
  type: "object",
  required: ["id", "nombre", "email", "activo"],
  properties: {
    id: { type: "string", format: "uuid" },
    nombre: { type: "string" },
    email: { type: "string", format: "email" },
    activo: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  },
  example: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    nombre: "Juan Pérez",
    email: "juan.perez@poncho.gob.ar",
    activo: true,
    createdAt: "2026-11-02T18:00:00.000Z",
    updatedAt: "2026-11-02T18:00:00.000Z"
  }
};

export const RespuestaLogin = {
  type: "object",
  required: ["mensaje", "token", "usuario"],
  properties: {
    mensaje: { type: "string" },
    token: { type: "string" },
    usuario: {
      type: "object",
      required: ["id", "nombre", "email"],
      properties: {
        id: { type: "string", format: "uuid" },
        nombre: { type: "string" },
        email: { type: "string", format: "email" }
      }
    }
  },
  example: {
    mensaje: "Inicio de sesión exitoso.",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    usuario: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      nombre: "María Catamarca",
      email: "maria@poncho.gob.ar"
    }
  }
};

export const RespuestaRegistroArtesano = {
  type: "object",
  required: ["id", "nombre", "email", "activo", "artesano", "postulacion"],
  properties: {
    id: { type: "string", format: "uuid" },
    nombre: { type: "string" },
    email: { type: "string", format: "email" },
    activo: { type: "boolean" },
    artesano: {
      type: "object",
      properties: {
        id: { type: "integer" },
        rubro_id: { type: "integer" },
        localidad_id: { type: "integer" }
      }
    },
    postulacion: {
      type: "object",
      properties: {
        id: { type: "integer" },
        anio_id: { type: "integer" },
        estado: { type: "string" }
      }
    }
  },
  example: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    nombre: "María Catamarca",
    email: "maria@poncho.gob.ar",
    activo: true,
    artesano: {
      id: 1,
      rubro_id: 1,
      localidad_id: 1
    },
    postulacion: {
      id: 1,
      anio_id: 1,
      estado: "PENDIENTE"
    }
  }
};
