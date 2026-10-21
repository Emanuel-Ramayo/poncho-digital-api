// src/controllers/usuariosController.js
import {
  registrarUsuario as registrarUsuarioService,
  registrarUsuarioArtesano as registrarUsuarioArtesanoService,
  registrarAdministrador as registrarAdministradorService,
  resolverPostulacion as resolverPostulacionService,
  iniciarSesion as iniciarSesionService
} from "../services/usuariosService.js";
import { generarToken } from "../services/tokensService.js";

// Registro básico
export const registrarUsuario = async (req, res, next) => {
  try {
    const registrarUsuarioDto =
      req.registrarUsuarioDto || req.bodyValidado || req.body;

    const usuario = await registrarUsuarioService(registrarUsuarioDto);

    return res.status(201).json(usuario);
  } catch (error) {
    return next(error);
  }
};

// POST /api/usuarios/registro-artesano (Pública, crea cuenta + artesano + solicitud PENDIENTE)
export const registrarUsuarioArtesano = async (req, res, next) => {
  try {
    const dto = req.bodyValidado || req.registrarUsuarioDto || req.body;
    const resultado = await registrarUsuarioArtesanoService(dto);

    return res.status(201).json(resultado);
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/postulaciones/:id/resolver (Solo ADMINISTRADOR)
export const resolverPostulacion = async (req, res, next) => {
  try {
    const id = req.id || req.params.id;
    const { estado } = req.bodyValidado || req.body;

    const resultado = await resolverPostulacionService(id, estado);
    return res.status(200).json(resultado);
  } catch (error) {
    return next(error);
  }
};

// POST /api/usuarios/registro-administrador (Solo ADMINISTRADOR)
export const crearAdministrador = async (req, res, next) => {
  try {
    const dto = req.bodyValidado || req.body;
    const usuario = await registrarAdministradorService(dto);

    return res.status(201).json(usuario);
  } catch (error) {
    return next(error);
  }
};

// POST /api/usuarios/login
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

// GET /api/usuarios/me 
export const obtenerMiPerfil = (req, res) => {
  return res.status(200).json({ usuario: req.contextoUsuario });
};
