import {
  registrarUsuario as registrarUsuarioService,
  iniciarSesion as iniciarSesionService
} from "../services/usuariosService.js";
import { crearError } from "../utils/errores.js";

export const registrarUsuario = async (req, res, next) => {
  try {
    const registrarUsuarioDto =
      req.registrarUsuarioDto || req.bodyValidado || req.body;

    const usuario = await registrarUsuarioService(registrarUsuarioDto);

    return res.status(201).json(usuario);
  } catch (error) {
    if (error.code === "P2002") {
      return next(crearError("Ya existe un usuario con ese email.", 409));
    }
    return next(error);
  }
};

export const iniciarSesion = async (req, res, next) => {
  try {
    const iniciarSesionDto =
      req.iniciarSesionDto || req.bodyValidado || req.body;

    const usuario = await iniciarSesionService(iniciarSesionDto);

    return res.status(200).json({
      mensaje: "Credenciales verificadas correctamente.",
      usuario
    });
  } catch (error) {
    return next(error);
  }
};