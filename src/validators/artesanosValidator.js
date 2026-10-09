import { z } from "zod";

// DTO para Creación / Reemplazo completo (POST / PUT)
export const artesanoSchema = z.object({
  nombre: z
    .string({
      required_error: "El nombre es obligatorio",
      invalid_type_error: "El nombre debe ser un texto",
      message: "El nombre es obligatorio"
    })
    .trim()
    .min(1, "El nombre es obligatorio"),

  rubro_id: z.preprocess(
    (val) => (val !== undefined && val !== null && val !== "" ? Number(val) : val),
    z
      .number({
        required_error: "El rubro es obligatorio",
        invalid_type_error: "El rubro debe ser un número entero",
        message: "El rubro es obligatorio"
      })
      .int("El rubro debe ser un número entero")
      .positive("El rubro debe ser un identificador válido")
  ),

  localidad_id: z.preprocess(
    (val) => (val !== undefined && val !== null && val !== "" ? Number(val) : val),
    z
      .number({
        required_error: "La localidad es obligatoria",
        invalid_type_error: "La localidad debe ser un número entero",
        message: "La localidad es obligatoria"
      })
      .int("La localidad debe ser un número entero")
      .positive("La localidad debe ser un identificador válido")
  )
});

// DTO para Actualización Parcial (PATCH / PUT)
export const actualizarArtesanoSchema = artesanoSchema.partial();

const CAMPOS_ORDEN = [
  "id",
  "nombre",
  "rubro_id",
  "localidad_id",
  "createdAt"
];

const DIRECCIONES = ["asc", "desc"];

// DTO para Consulta, Filtros y Paginación (GET /artesanos)
export const consultarArtesanosSchema = z.object({
  nombre: z
    .string({
      invalid_type_error: "El nombre debe ser un texto",
      message: "El nombre debe ser un texto"
    })
    .trim()
    .min(1, "El nombre no puede estar vacío")
    .optional(),

  rubro_id: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === "") return undefined;
      const num = Number(val);
      return Number.isNaN(num) ? val : num;
    },
    z
      .number({
        invalid_type_error: "El rubro debe ser un número",
        message: "El rubro debe ser un número"
      })
      .int("El rubro debe ser un número entero")
      .positive("El rubro debe ser un identificador válido")
      .optional()
  ),

  localidad_id: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === "") return undefined;
      const num = Number(val);
      return Number.isNaN(num) ? val : num;
    },
    z
      .number({
        invalid_type_error: "La localidad debe ser un número",
        message: "La localidad debe ser un número"
      })
      .int("La localidad debe ser un número entero")
      .positive("La localidad debe ser un identificador válido")
      .optional()
  ),

  provincia_id: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === "") return undefined;
      const num = Number(val);
      return Number.isNaN(num) ? val : num;
    },
    z
      .number({
        invalid_type_error: "La provincia debe ser un número",
        message: "La provincia debe ser un número"
      })
      .int("La provincia debe ser un número entero")
      .positive("La provincia debe ser un identificador válido")
      .optional()
  ),

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