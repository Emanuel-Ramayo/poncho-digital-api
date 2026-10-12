import { z } from "zod";

// POST /api/usuarios (o registro)
export const registrarUsuarioSchema = z.object({
  nombre: z
    .string({
      required_error: "El nombre es obligatorio",
      invalid_type_error: "El nombre debe ser una cadena de texto"
    })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres."),

  email: z
    .string({
      required_error: "El email es obligatorio",
      invalid_type_error: "El email debe ser una cadena de texto"
    })
    .trim()
    .toLowerCase()
    .email("El email no tiene un formato válido."),

  password: z
    .string({
      required_error: "La contraseña es obligatoria",
      invalid_type_error: "La contraseña debe ser una cadena de texto"
    })
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
});

// POST /api/usuarios/login 
export const iniciarSesionSchema = z.object({
  email: z
    .string({
      required_error: "El email es obligatorio"
    })
    .trim()
    .toLowerCase()
    .email("El email no tiene un formato válido."),

  password: z
    .string({
      required_error: "La contraseña es obligatoria"
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