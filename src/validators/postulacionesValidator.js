import { z } from "zod";

const ESTADOS_VALIDOS = ["PENDIENTE", "APROBADA", "RECHAZADA"];

// DTO para Creación (POST /postulaciones)
export const postulacionSchema = z.object({
  artesano_id: z.preprocess(
    (val) => (val !== undefined && val !== null && val !== "" ? Number(val) : val),
    z
      .number({
        required_error: "El artesano es obligatorio",
        invalid_type_error: "El artesano debe ser un número entero",
        message: "El artesano es obligatorio"
      })
      .int("El identificador del artesano debe ser un número entero")
      .positive("El identificador del artesano debe ser válido")
  ),

  anio_id: z.preprocess(
    (val) => (val !== undefined && val !== null && val !== "" ? Number(val) : val),
    z
      .number({
        required_error: "El año de postulación es obligatorio",
        invalid_type_error: "El año de postulación debe ser un número entero",
        message: "El año de postulación es obligatorio"
      })
      .int("El identificador del año debe ser un número entero")
      .positive("El identificador del año debe ser válido")
  ),

  estado: z
    .enum(ESTADOS_VALIDOS, {
      invalid_type_error: "El estado debe ser PENDIENTE, APROBADA o RECHAZADA",
      message: "El estado debe ser PENDIENTE, APROBADA o RECHAZADA"
    })
    .default("PENDIENTE"),

  stand_id: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === "") return null;
      const num = Number(val);
      return Number.isNaN(num) ? val : num;
    },
    z
      .number({
        invalid_type_error: "El stand debe ser un número entero"
      })
      .int("El stand debe ser un número entero")
      .positive("El identificador de stand debe ser válido")
      .nullable()
      .optional()
  )
});

// DTO para Actualización (PUT /postulaciones/:id)
export const actualizarPostulacionSchema = postulacionSchema.partial();

const CAMPOS_ORDEN = ["id", "estado", "artesano_id", "anio_id", "createdAt"];
const DIRECCIONES = ["asc", "desc"];

// DTO para Filtros y Paginación (GET /postulaciones)
export const consultarPostulacionesSchema = z.object({
  estado: z
    .enum(ESTADOS_VALIDOS, {
      invalid_type_error: "Estado no válido",
      message: "El estado debe ser PENDIENTE, APROBADA o RECHAZADA"
    })
    .optional(),

  artesano_id: z.preprocess(
    (val) => (val !== undefined && val !== null && val !== "" ? Number(val) : undefined),
    z.number().int().positive().optional()
  ),

  anio_id: z.preprocess(
    (val) => (val !== undefined && val !== null && val !== "" ? Number(val) : undefined),
    z.number().int().positive().optional()
  ),

  pagina: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === "") return 1;
      const num = Number(val);
      return Number.isNaN(num) ? val : num;
    },
    z.number().int().positive().default(1)
  ),

  limite: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === "") return 10;
      const num = Number(val);
      return Number.isNaN(num) ? val : num;
    },
    z.number().int().min(1).max(50).default(10)
  ),

  ordenPor: z
    .string()
    .default("id")
    .refine((val) => CAMPOS_ORDEN.includes(val), {
      message: "Campo de ordenamiento no válido"
    }),

  direccion: z
    .string()
    .default("asc")
    .refine((val) => DIRECCIONES.includes(val), {
      message: "La dirección debe ser 'asc' o 'desc'"
    })
});