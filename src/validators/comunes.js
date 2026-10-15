import { z } from "zod";

// Convierte strings/números a número. Si no se puede convertir, devuelve el valor
// original para que Zod informe el error de tipo. Vacío/null -> undefined.
export const aNumero = (val) => {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val === "string" || typeof val === "number") {
    const num = Number(val);
    return Number.isNaN(num) ? val : num;
  }
  return val;
};

// Convierte "true"/"false" (query string) a booleano real. Vacío/null -> undefined.
export const aBooleano = (val) => {
  if (val === undefined || val === null || val === "") return undefined;
  if (val === "true") return true;
  if (val === "false") return false;
  return val;
};

// ID obligatorio (body de POST/PUT). etiqueta: "El artesano", "La categoría", etc.
export const idRequerido = (etiqueta) =>
  z.preprocess(
    aNumero,
    z
      .number({
        error: (iss) =>
          iss.input === undefined
            ? `Debe indicar ${etiqueta.toLowerCase()}`
            : `${etiqueta} debe ser un número entero`
      })
      .int(`${etiqueta} debe ser un número entero`)
      .positive(`${etiqueta} debe ser un identificador válido`)
  );

// ID opcional (filtros de consulta)
export const idOpcional = (etiqueta) =>
  z.preprocess(
    aNumero,
    z
      .number({ error: `${etiqueta} debe ser un número` })
      .int(`${etiqueta} debe ser un número entero`)
      .positive(`${etiqueta} debe ser un identificador válido`)
      .optional()
  );

// Paginación y orden, comunes a todos los listados
export const pagina = z.preprocess(
  (val) => aNumero(val) ?? 1,
  z
    .number({ error: "La página debe ser un número" })
    .int("La página debe ser un número entero")
    .positive("La página debe ser un número positivo")
);

export const limite = z.preprocess(
  (val) => aNumero(val) ?? 10,
  z
    .number({ error: "El límite debe ser un número" })
    .int("El límite debe ser un número entero")
    .min(1, "El límite mínimo es 1")
    .max(50, "El límite máximo es 50")
);

export const ordenPor = (camposPermitidos) =>
  z
    .string({ error: "El campo de ordenamiento debe ser un texto" })
    .default("id")
    .refine((val) => camposPermitidos.includes(val), {
      error: "Campo de ordenamiento no válido"
    });

export const direccion = z
  .enum(["asc", "desc"], { error: "La dirección debe ser 'asc' o 'desc'" })
  .default("asc");
