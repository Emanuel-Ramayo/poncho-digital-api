import { revocarToken } from "../services/revocacionesService.js";

// POST /api/usuarios/logout
export const cerrarSesion = async (req, res, next) => {
  try {
    await revocarToken(req.usuario);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
};
