import { z } from "zod";

const ESTADOS_VALIDOS = ["PENDIENTE", "APROBADA", "RECHAZADA", "CANCELADA"];
const ESTADOS_RESOLUCION = ["APROBADA", "RECHAZADA", "CANCELADA"];

// DTO para Creación (POST /postulaciones)
export const postulacionSchema = z.object({
  artesano_id: z.preprocess(
    (val) => (val !== undefined && val !== null && val !== "" ? Number(val) : val),
    z
      .number({
        error: "El artesano es obligatorio"
      })
      .int("El identificador del artesano debe ser un número entero")
      .positive("El identificador del artesano debe ser válido")
  ),

  anio_id: z.preprocess(
    (val) => (val !== undefined && val !== null && val !== "" ? Number(val) : val),
    z
      .number({
        error: "El año de postulación es obligatorio"
      })
      .int("El identificador del año debe ser un número entero")
      .positive("El identificador del año debe ser válido")
  ),

  estado: z
    .enum(ESTADOS_VALIDOS, {
      error: "El estado debe ser PENDIENTE, APROBADA, RECHAZADA o CANCELADA"
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
        error: "El stand debe ser un número entero"
      })
      .int("El stand debe ser un número entero")
      .positive("El identificador de stand debe ser válido")
      .nullable()
      .optional()
  )
});

// DTO para Resolución de solicitud (PATCH /postulaciones/:id/resolver)
export const resolverPostulacionSchema = z
  .object({
    estado: z.enum(ESTADOS_RESOLUCION, {
      error: "El estado debe ser APROBADA, RECHAZADA o CANCELADA."
    })
  })
  .strict();

// DTO para Actualización (PUT /postulaciones/:id)
export const actualizarPostulacionSchema = postulacionSchema.partial();

const CAMPOS_ORDEN = ["id", "estado", "artesano_id", "anio_id", "createdAt"];
const DIRECCIONES = ["asc", "desc"];

// DTO para Filtros y Paginación (GET /postulaciones)
export const consultarPostulacionesSchema = z.object({
  estado: z
    .enum(ESTADOS_VALIDOS, {
      error: "El estado debe ser PENDIENTE, APROBADA, RECHAZADA o CANCELADA"
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
