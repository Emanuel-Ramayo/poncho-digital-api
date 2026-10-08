import { z } from "zod";

// DTO para Creación / Reemplazo completo 
export const artesanoSchema = z.object({
  nombre: z
    .string({
      required_error: "El nombre es obligatorio",
      invalid_type_error: "El nombre debe ser un texto",
      message: "El nombre es obligatorio"
    })
    .trim()
    .min(1, "El nombre es obligatorio"),

  especialidad: z
    .string({
      required_error: "La especialidad es obligatoria",
      invalid_type_error: "La especialidad debe ser un texto",
      message: "La especialidad es obligatoria"
    })
    .trim()
    .min(1, "La especialidad es obligatoria"),

  provincia: z
    .string({
      required_error: "La provincia es obligatoria",
      invalid_type_error: "La provincia debe ser un texto",
      message: "La provincia es obligatoria"
    })
    .trim()
    .min(1, "La provincia es obligatoria"),

  localidad: z
    .string({
      required_error: "La localidad es obligatoria",
      invalid_type_error: "La localidad debe ser un texto",
      message: "La localidad es obligatoria"
    })
    .trim()
    .min(1, "La localidad es obligatoria")
});

// DTO para Actualización Parcial (PUT)
export const actualizarArtesanoSchema = artesanoSchema.partial();

const CAMPOS_ORDEN = [
  "id",
  "nombre",
  "especialidad",
  "provincia",
  "localidad",
  "createdAt"
];

const DIRECCIONES = ["asc", "desc"];

// DTO para Consulta y Paginación (GET /artesanos)
export const consultarArtesanosSchema = z.object({
  nombre: z
    .string({
      invalid_type_error: "El nombre debe ser un texto",
      message: "El nombre debe ser un texto"
    })
    .trim()
    .min(1, "El nombre no puede estar vacío")
    .optional(),

  especialidad: z
    .string({
      invalid_type_error: "La especialidad debe ser un texto",
      message: "La especialidad debe ser un texto"
    })
    .trim()
    .min(1, "La especialidad no puede estar vacía")
    .optional(),

  provincia: z
    .string({
      invalid_type_error: "La provincia debe ser un texto",
      message: "La provincia debe ser un texto"
    })
    .trim()
    .min(1, "La provincia no puede estar vacía")
    .optional(),

  localidad: z
    .string({
      invalid_type_error: "La localidad debe ser un texto",
      message: "La localidad debe ser un texto"
    })
    .trim()
    .min(1, "La localidad no puede estar vacía")
    .optional(),

  pagina: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === "") return 1;
      const num = Number(val);
      return Number.isNaN(num) ? val : num;
    },
    z
      .number({
        invalid_type_error: "La página debe ser un número",
        message: "La página debe ser un número"
      })
      .int("La página debe ser un número entero")
      .positive("La página debe ser un número positivo")
  ).default(1),

  limite: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === "") return 10;
      const num = Number(val);
      return Number.isNaN(num) ? val : num;
    },
    z
      .number({
        invalid_type_error: "El límite debe ser un número",
        message: "El límite debe ser un número"
      })
      .int("El límite debe ser un número entero")
      .min(1, "El límite mínimo es 1")
      .max(50, "El límite máximo es 50")
  ).default(10),

  ordenPor: z
    .string({
      invalid_type_error: "El campo de ordenamiento debe ser un texto",
      message: "Campo de ordenamiento no válido"
    })
    .default("id")
    .refine((val) => CAMPOS_ORDEN.includes(val), {
      message: "Campo de ordenamiento no válido"
    }),

  direccion: z
    .string({
      invalid_type_error: "La dirección debe ser un texto",
      message: "La dirección debe ser 'asc' o 'desc'"
    })
    .default("asc")
    .refine((val) => DIRECCIONES.includes(val), {
      message: "La dirección debe ser 'asc' o 'desc'"
    })
});