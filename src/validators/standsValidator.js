import { z } from "zod";
import {
  aBooleano,
  idRequerido,
  idOpcional,
  pagina,
  limite,
  ordenPor,
  direccion
} from "./comunes.js";

// DTO para Creación / Reemplazo (POST / PUT)
// "disponible" es opcional: si no viene, Prisma usa @default(true).
export const standSchema = z.object({
  numero: idRequerido("El número de stand"),
  sector_id: idRequerido("El sector"),
  disponible: z
    .boolean({ error: "disponible debe ser true o false" })
    .optional()
});

// DTO para Actualización parcial (PUT)
export const actualizarStandSchema = standSchema.partial();

const CAMPOS_ORDEN = ["id", "numero", "disponible", "sector_id", "createdAt"];

// DTO para Consulta, Filtros y Paginación (GET /stands)
export const consultarStandsSchema = z.object({
  disponible: z.preprocess(
    aBooleano,
    z.boolean({ error: "disponible debe ser true o false" }).optional()
  ),
  numero: idOpcional("El número de stand"),
  sector_id: idOpcional("El sector"),
  pabellon_id: idOpcional("El pabellón"),
  pagina,
  limite,
  ordenPor: ordenPor(CAMPOS_ORDEN),
  direccion
});
