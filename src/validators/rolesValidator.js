import { z } from "zod";

export const asignarAdministradorSchema = z
  .object({
    rol: z.literal("ADMINISTRADOR", {
      error: (iss) =>
        iss.input === undefined
          ? "El rol es obligatorio"
          : "Solo se puede asignar el rol ADMINISTRADOR"
    })
  })
  .strict();

export const retirarRolParametrosSchema = z
  .object({
    id: z.string().uuid("El ID de usuario debe ser un UUID válido"),
    rol: z.enum(["ARTESANO", "ADMINISTRADOR"], {
      error: "Rol inválido para retirar"
    })
  })
  .strict();
