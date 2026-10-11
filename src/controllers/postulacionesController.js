import {
  listarPostulaciones as listarPostulacionesService,
  obtenerPostulacion as obtenerPostulacionService,
  crearPostulacion as crearPostulacionService,
  actualizarPostulacion as actualizarPostulacionService,
  eliminarPostulacion as eliminarPostulacionService
} from "../services/postulacionesService.js";

import { crearError } from "../utils/errores.js";

// GET /postulaciones
export const listarPostulaciones = async (req, res, next) => {
  try {
    const filtros = req.queryValidada || req.query;
    const resultado = await listarPostulacionesService(filtros);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

// POST /postulaciones
export const crearPostulacion = async (req, res, next) => {
  try {
    const datos = req.bodyValidado || req.body;
    const postulacion = await crearPostulacionService(datos);
    res.status(201).json(postulacion);
  } catch (error) {
    // Clave duplicada: unicidad compuesta artesano_id + anio_id
    if (error.code === "P2002") {
      return next(
        crearError("El artesano ya posee una postulación registrada para ese año", 409)
      );
    }

    // Clave foránea inexistente (artesano_id, anio_id o stand_id inexistente)
    if (error.code === "P2003") {
      return next(
        crearError("El artesano, año o stand especificado no existe", 400)
      );
    }

    next(error);
  }
};

// GET /postulaciones/:id
export const obtenerPostulacion = async (req, res, next) => {
  try {
    const id = req.id || req.params.id;
    const postulacion = await obtenerPostulacionService(id);

    if (!postulacion) {
      return next(crearError("Postulación no encontrada", 404));
    }

    res.json(postulacion);
  } catch (error) {
    next(error);
  }
};

// PUT /postulaciones/:id
export const actualizarPostulacion = async (req, res, next) => {
  try {
    const id = req.id || req.params.id;
    const datos = req.bodyValidado || req.body;

    const postulacion = await actualizarPostulacionService(id, datos);
    res.json(postulacion);
  } catch (error) {
    if (error.code === "P2025") {
      return next(crearError("Postulación no encontrada", 404));
    }

    if (error.code === "P2002") {
      return next(
        crearError("El artesano ya posee una postulación registrada para ese año", 409)
      );
    }

    if (error.code === "P2003") {
      return next(
        crearError("El artesano, año o stand especificado no existe", 400)
      );
    }

    next(error);
  }
};

// DELETE /postulaciones/:id
export const eliminarPostulacion = async (req, res, next) => {
  try {
    const id = req.id || req.params.id;
    await eliminarPostulacionService(id);

    res.json({ mensaje: "Postulación eliminada correctamente" });
  } catch (error) {
    if (error.code === "P2025") {
      return next(crearError("Postulación no encontrada", 404));
    }
    next(error);
  }
};