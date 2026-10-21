import { z } from "zod";

export const actualizarActivoSchema = z
  .object({
    activo: z.boolean({
      error: (iss) =>
        iss.input === undefined
          ? "El campo activo es obligatorio"
          : "El campo activo debe ser un valor booleano"
    })
  })
  .strict();
