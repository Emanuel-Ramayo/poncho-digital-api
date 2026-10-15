import {
  registrarUsuario as registrarUsuarioService,
  iniciarSesion as iniciarSesionService,
  obtenerUsuarioPorId
} from "../services/usuariosService.js";
import { generarToken } from "../services/tokensService.js";
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
    const token = generarToken(usuario);

    return res.status(200).json({
      mensaje: "Inicio de sesión exitoso.",
      token,
      usuario
    });
  } catch (error) {
    return next(error);
  }
};

export const obtenerMiPerfil = async (req, res, next) => {
  try {
    const usuario = await obtenerUsuarioPorId(req.usuario.id);

    if (!usuario) {
      res.set("WWW-Authenticate", 'Bearer error="invalid_token"');
      return res
        .status(401)
        .json({ error: "La cuenta asociada al token no existe." });
    }

    return res.status(200).json({ usuario });
  } catch (error) {
    return next(error);
  }
};