import { asignarAdministrador, retirarRol } from "../services/rolesService.js";

export const agregarRol = async (req, res, next) => {
  try {
    const usuarioId = req.parametrosValidados?.id || req.params.id;
    await asignarAdministrador(usuarioId);
    return res.json({ mensaje: "Rol ADMINISTRADOR asignado." });
  } catch (error) {
    return next(error);
  }
};

export const eliminarRol = async (req, res, next) => {
  try {
    const { id, rol } = req.parametrosValidados || req.params;
    await retirarRol(id, rol);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
};