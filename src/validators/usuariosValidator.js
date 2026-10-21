import { z } from "zod";

// POST /api/usuarios (o registro)
export const registrarUsuarioSchema = z.object({
  nombre: z
    .string({
      required_error: "El nombre es obligatorio",
      invalid_type_error: "El nombre debe ser una cadena de texto",
      error: (iss) =>
        iss.input === undefined
          ? "El nombre es obligatorio"
          : "El nombre debe ser una cadena de texto"
    })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres."),

  email: z
    .string({
      required_error: "El email es obligatorio",
      invalid_type_error: "El email debe ser una cadena de texto",
      error: (iss) =>
        iss.input === undefined
          ? "El email es obligatorio"
          : "El email debe ser una cadena de texto"
    })
    .trim()
    .toLowerCase()
    .email("El email no tiene un formato válido."),

  password: z
    .string({
      required_error: "La contraseña es obligatoria",
      invalid_type_error: "La contraseña debe ser una cadena de texto",
      error: (iss) =>
        iss.input === undefined
          ? "La contraseña es obligatoria"
          : "La contraseña debe ser una cadena de texto"
    })
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
});

// POST /api/usuarios/login 
export const iniciarSesionSchema = z.object({
  email: z
    .string({
      required_error: "El email es obligatorio",
      error: "El email es obligatorio"
    })
    .trim()
    .toLowerCase()
    .email("El email no tiene un formato válido."),

  password: z
    .string({
      required_error: "La contraseña es obligatoria",
      error: "La contraseña es obligatoria"
    })
    .min(1, "La contraseña es obligatoria.")
});

// PUT /api/usuarios/:id (campos opcionales para actualizar)
export const actualizarUsuarioSchema = registrarUsuarioSchema.partial();

// Validar params.id en formato UUID
export const idUuidSchema = z.object({
  id: z.string().uuid("El identificador debe ser un UUID válido")
});

// GET /api/usuarios (filtros y paginación)
const CAMPOS_ORDEN = ["nombre", "email", "createdAt"];
const DIRECCIONES = ["asc", "desc"];

export const consultarUsuariosSchema = z.object({
  nombre: z.string().trim().optional(),
  email: z.string().trim().toLowerCase().optional(),

  pagina: z.preprocess(
    (val) => (val !== undefined && val !== null && val !== "" ? Number(val) : 1),
    z.number().int().positive().default(1)
  ),

  limite: z.preprocess(
    (val) => (val !== undefined && val !== null && val !== "" ? Number(val) : 10),
    z.number().int().min(1).max(50).default(10)
  ),

  ordenPor: z
    .string()
    .default("createdAt")
    .refine((val) => CAMPOS_ORDEN.includes(val), {
      message: "Campo de ordenamiento no válido"
    }),

  direccion: z
    .string()
    .default("desc")
    .refine((val) => DIRECCIONES.includes(val), {
      message: "La dirección debe ser 'asc' o 'desc'"
    })
});

// Esquema base con los datos propios de Artesano
export const artesanoDatosSchema = z.object({
  nombre: z
    .string({
      required_error: "El nombre es obligatorio",
      invalid_type_error: "El nombre debe ser una cadena de texto",
      error: (iss) =>
        iss.input === undefined
          ? "El nombre es obligatorio"
          : "El nombre debe ser una cadena de texto"
    })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(120, "El nombre no puede superar los 120 caracteres."),

  rubro_id: z
    .number({
      required_error: "El rubro_id es obligatorio",
      invalid_type_error: "El rubro_id debe ser un número entero",
      error: (iss) =>
        iss.input === undefined
          ? "El rubro_id es obligatorio"
          : "El rubro_id debe ser un número entero"
    })
    .int("El rubro_id debe ser un número entero")
    .positive("El rubro_id debe ser un número positivo"),

  localidad_id: z
    .number({
      required_error: "El localidad_id es obligatorio",
      invalid_type_error: "El localidad_id debe ser un número entero",
      error: (iss) =>
        iss.input === undefined
          ? "El localidad_id es obligatorio"
          : "El localidad_id debe ser un número entero"
    })
    .int("El localidad_id debe ser un número entero")
    .positive("El localidad_id debe ser un número positivo")
}).strict();

// POST /api/usuarios/registro-artesano (Registro público: Usuario + Artesano + Solicitud PENDIENTE)
export const registroArtesanoSchema = registrarUsuarioSchema.extend({
  nombre: artesanoDatosSchema.shape.nombre,
  rubro_id: artesanoDatosSchema.shape.rubro_id,
  localidad_id: artesanoDatosSchema.shape.localidad_id,
  anio_id: z
    .number({
      invalid_type_error: "El anio_id debe ser un número entero",
      error: "El anio_id debe ser un número entero"
    })
    .int("El anio_id debe ser un número entero")
    .positive("El anio_id debe ser un número positivo")
    .optional()
}).strict();

// POST /api/usuarios/registro-administrador (Uso exclusivo de ADMINISTRADOR)
export const registroAdminSchema = registrarUsuarioSchema.strict();

// POST /api/usuarios/asignar-artesano (Para que un ADMIN se asigne perfil de Artesano)
export const asignarArtesanoSchema = artesanoDatosSchema.extend({
  usuarioId: z.string().uuid("El usuarioId debe ser un UUID válido")
}).strict();
