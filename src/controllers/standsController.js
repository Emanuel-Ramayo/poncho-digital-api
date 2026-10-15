import {
  listarStands as listarStandsService,
  obtenerStand as obtenerStandService,
  crearStand as crearStandService,
  actualizarStand as actualizarStandService,
  eliminarStand as eliminarStandService
} from "../services/standsService.js";

import { crearError } from "../utils/errores.js";

// GET /stands
export const listarStands = async (req, res, next) => {
  try {
    const filtros = req.queryValidada || req.query;
    const resultado = await listarStandsService(filtros);

    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

// GET /stands/:id
export const obtenerStand = async (req, res, next) => {
  try {
    const id = req.id || req.params.id;

    const stand = await obtenerStandService(id);

    if (!stand) {
      return next(crearError("Stand no encontrado", 404));
    }

    res.json(stand);
  } catch (error) {
    next(error);
  }
};

// POST /stands
export const crearStand = async (req, res, next) => {
  try {
    const datos = req.body;
    const stand = await crearStandService(datos);

    res.status(201).json(stand);
  } catch (error) {
    // Clave foránea inexistente (sector_id no encontrado)
    if (error.code === "P2003") {
      return next(crearError("El sector indicado no existe", 400));
    }

    // Violación de @@unique([numero, sector_id])
    if (error.code === "P2002") {
      return next(
        crearError("Ya existe un stand con ese número en el sector indicado", 409)
      );
    }

    next(error);
  }
};

// PUT /stands/:id
export const actualizarStand = async (req, res, next) => {
  try {
    const id = req.id || req.params.id;
    const datos = req.body;

    const stand = await actualizarStandService(id, datos);

    res.json(stand);
  } catch (error) {
    if (error.code === "P2025") {
      return next(crearError("Stand no encontrado", 404));
    }

    if (error.code === "P2003") {
      return next(crearError("El sector indicado no existe", 400));
    }

    if (error.code === "P2002") {
      return next(
        crearError("Ya existe un stand con ese número en el sector indicado", 409)
      );
    }

    next(error);
  }
};

// DELETE /stands/:id
export const eliminarStand = async (req, res, next) => {
  try {
    const id = req.id || req.params.id;

    await eliminarStandService(id);

    res.json({ mensaje: "Stand eliminado correctamente" });
  } catch (error) {
    if (error.code === "P2025") {
      return next(crearError("Stand no encontrado", 404));
    }

    next(error);
  }
};
