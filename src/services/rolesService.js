import prisma from "../config/prisma.js";
import { crearError } from "../utils/errores.js";

// Asignar rol ADMINISTRADOR a un usuario existente
export const asignarAdministrador = async (usuarioId) => {
  return prisma.$transaction(async (tx) => {
    await tx.usuario.findUniqueOrThrow({
      where: { id: usuarioId },
      select: { id: true }
    });

    const rol = await tx.rol.findUniqueOrThrow({
      where: { nombre: "ADMINISTRADOR" }
    });

    const clave = { usuarioId, rolId: rol.id };

    return tx.usuarioRol.upsert({
      where: { usuarioId_rolId: clave },
      update: {},
      create: clave
    });
  });
};

// Retirar un rol aplicando reglas de negocio estrictas
export const retirarRol = async (usuarioId, nombreRol) => {
  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.findUniqueOrThrow({
      where: { id: usuarioId },
      include: { roles: { include: { rol: true } } }
    });

    // Validar si se intenta retirar el rol de ARTESANO
    if (nombreRol === "ARTESANO") {
      const cantidadPostulaciones = await tx.postulacion.count({
        where: { artesano: { usuarioId } }
      });

      if (cantidadPostulaciones > 0) {
        throw crearError(
          "Tiene postulaciones asociadas: no se puede retirar el rol de ARTESANO.",
          409
        );
      }
    }

    const asignacion = usuario.roles.find(
      (a) => a.rol.nombre === nombreRol
    );

    if (!asignacion) return; // Si no lo tiene, no hace nada

    // Regla: El usuario debe conservar al menos un rol
    if (usuario.roles.length === 1) {
      throw crearError("Debe conservar al menos un rol.", 409);
    }

    // Regla: Si se retira ADMINISTRADOR a una cuenta activa, debe quedar otro admin activo
    if (nombreRol === "ADMINISTRADOR" && usuario.activo) {
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

    // Si el rol a retirar es ARTESANO, eliminamos también su perfil vinculado
    if (nombreRol === "ARTESANO") {
      await tx.artesano.delete({
        where: { usuarioId }
      });
    }

    // Eliminar la asignación en la tabla intermedia
    await tx.usuarioRol.delete({
      where: {
        usuarioId_rolId: { usuarioId, rolId: asignacion.rolId }
      }
    });
  });
};