import { z } from "zod";

// DTO para Creación / Reemplazo completo (POST / PUT)
export const artesanoSchema = z.object({
  nombre: z
    .string({
      error: "El nombre es obligatorio"
    })
    .trim()
    .min(1, "El nombre es obligatorio"),

  rubro_id: z.preprocess(
    (val) => (val !== undefined && val !== null && val !== "" ? Number(val) : val),
    z
      .number({
        error: "El rubro es obligatorio"
      })
      .int("El rubro debe ser un número entero")
      .positive("El rubro debe ser un identificador válido")
  ),

  localidad_id: z.preprocess(
    (val) => (val !== undefined && val !== null && val !== "" ? Number(val) : val),
    z
      .number({
        error: "La localidad es obligatoria"
      })
      .int("La localidad debe ser un número entero")
      .positive("La localidad debe ser un identificador válido")
  ),

  usuarioId: z
    .string({
      error: "El usuarioId es obligatorio"
    })
    .uuid("El usuarioId debe ser un UUID válido")
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
      error: "El nombre debe ser un texto"
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
        error: "El rubro debe ser un número"
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
        error: "La localidad debe ser un número"
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
        error: "La provincia debe ser un número"
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
        error: "La página debe ser un número"
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
        error: "El límite debe ser un número"
      })
      .int("El límite debe ser un número entero")
      .min(1, "El límite mínimo es 1")
      .max(50, "El límite máximo es 50")
  ).default(10),

  ordenPor: z
    .string({
      error: "Campo de ordenamiento no válido"
    })
    .default("id")
    .refine((val) => CAMPOS_ORDEN.includes(val), {
      message: "Campo de ordenamiento no válido"
    }),

  direccion: z
    .string({
      error: "La dirección debe ser 'asc' o 'desc'"
    })
    .default("asc")
    .refine((val) => DIRECCIONES.includes(val), {
      message: "La dirección debe ser 'asc' o 'desc'"
    })
});
