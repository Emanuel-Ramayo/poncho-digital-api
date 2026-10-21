import { cambiarActivo } from "../services/estadoService.js";

export const actualizarActivo = async (req, res, next) => {
  try {
    const usuarioId = req.parametrosValidados?.id || req.params.id;
    const activo = req.bodyValidado?.activo ?? req.body.activo;
    
    const usuario = await cambiarActivo(usuarioId, activo);
    return res.json(usuario);
  } catch (error) {
    return next(error);
  }
};