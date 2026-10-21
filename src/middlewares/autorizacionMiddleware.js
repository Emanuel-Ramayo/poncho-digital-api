import { obtenerUsuarioPorId } from "../services/usuariosService.js";
import { crearError } from "../utils/errores.js";

export const cargarContextoUsuario = async (req, res, next) => {
  try {
    const usuario = await obtenerUsuarioPorId(req.usuario.id);

    if (!usuario) {
      res.set("WWW-Authenticate", "Bearer");
      return next(crearError("Cuenta inexistente.", 401));
    }

    if (!usuario.activo) {
      return next(crearError("Cuenta inactiva.", 403));
    }

    req.contextoUsuario = usuario;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const autorizarRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    const usuario = req.contextoUsuario;
    const permitido = (usuario?.roles ?? []).some((rol) =>
      rolesPermitidos.includes(rol)
    );

    if (!permitido) {
      return next(
        crearError("No tiene permiso para esta operación.", 403)
      );
    }

    return next();
  };
};