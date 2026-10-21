import { z } from "zod";
import {
  aNumero,
  idRequerido,
  idOpcional,
  pagina,
  limite,
  ordenPor,
  direccion
} from "./comunes.js";

const PRECIO_MAXIMO = 99999999.99; // Decimal(10, 2)

// DTO para Creación / Reemplazo (POST / PUT)
// El artesano_id NO va en el body; se obtiene de la sesión autenticada
export const productoSchema = z.object({
  nombre: z
    .string({
      error: (iss) =>
        iss.input === undefined
          ? "El nombre es obligatorio"
          : "El nombre debe ser un texto"
    })
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no puede superar los 100 caracteres"),

  descripcion: z
    .string({ error: "La descripción debe ser un texto" })
    .trim()
    .max(500, "La descripción no puede superar los 500 caracteres")
    .nullable()
    .optional(),

  precio: z.preprocess(
    aNumero,
    z
      .number({
        error: (iss) =>
          iss.input === undefined
            ? "El precio es obligatorio"
            : "El precio debe ser un número"
      })
      .positive("El precio debe ser mayor a 0")
      .max(PRECIO_MAXIMO, "El precio supera el máximo permitido")
      .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, {
        error: "El precio admite como máximo 2 decimales"
      })
  ),

  categoria_id: idRequerido("La categoría")
});

// DTO para Actualización parcial (PUT)
export const actualizarProductoSchema = productoSchema.partial();

const CAMPOS_ORDEN = [
  "id",
  "nombre",
  "precio",
  "categoria_id",
  "artesano_id",
  "createdAt"
];

const precioFiltro = (etiqueta) =>
  z.preprocess(
    aNumero,
    z
      .number({ error: `${etiqueta} debe ser un número` })
      .min(0, `${etiqueta} no puede ser negativo`)
      .optional()
  );

// DTO para Consulta pública, Filtros y Paginación (GET /productos)
export const consultarProductosSchema = z
  .object({
    nombre: z
      .string({ error: "El nombre debe ser un texto" })
      .trim()
      .min(1, "El nombre no puede estar vacío")
      .optional(),
    categoria_id: idOpcional("La categoría"),
    artesano_id: idOpcional("El artesano"),
    precioMin: precioFiltro("El precio mínimo"),
    precioMax: precioFiltro("El precio máximo"),
    pagina,
    limite,
    ordenPor: ordenPor(CAMPOS_ORDEN),
    direccion
  })
  .refine(
    (d) =>
      d.precioMin === undefined ||
      d.precioMax === undefined ||
      d.precioMin <= d.precioMax,
    {
      error: "El precio mínimo no puede ser mayor que el precio máximo",
      path: ["precioMin"]
    }
  );