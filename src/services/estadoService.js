import prisma from "../config/prisma.js";
import { crearError } from "../utils/errores.js";

export const cambiarActivo = async (usuarioId, activo) => {
  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.findUniqueOrThrow({
      where: { id: usuarioId },
      include: { roles: { include: { rol: true } } }
    });

    const esAdmin = usuario.roles.some(
      (a) => a.rol.nombre === "ADMINISTRADOR"
    );

    // Si se va a desactivar un admin, verificar que quede al menos otro activo
    if (!activo && usuario.activo && esAdmin) {
      const otrosAdminsActivos = await tx.usuario.count({
        where: {
          id: { not: usuarioId },
          activo: true,
          roles: { some: { rol: { nombre: "ADMINISTRADOR" } } }
        }
      });

      if (!otrosAdminsActivos) {
        throw crearError("Debe quedar al menos un administrador activo.", 409);
      }
    }

    return tx.usuario.update({
      where: { id: usuarioId },
      data: { activo },
      select: { id: true, activo: true }
    });
  });
};