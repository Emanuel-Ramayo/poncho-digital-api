import {
  listarArtesanos as listarArtesanosService,
  obtenerArtesano as obtenerArtesanoService,
  crearArtesano as crearArtesanoService,
  actualizarArtesano as actualizarArtesanoService,
  eliminarArtesano as eliminarArtesanoService
} from "../services/artesanosService.js";

import { crearError } from "../utils/errores.js";

// GET /artesanos
export const listarArtesanos = async (req, res, next) => {
  try {
    const filtros = req.queryValidada || req.query;
    const resultado = await listarArtesanosService(filtros);

    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

// POST /artesanos
export const crearArtesano = async (req, res, next) => {
  try {
    const datos = req.bodyValidado || req.body;
    const artesano = await crearArtesanoService(datos);

    res.status(201).json(artesano);
  } catch (error) {
    // Clave foránea inexistente (rubro_id o localidad_id no encontrados en la BD)
    if (error.code === "P2003") {
      return next(
        crearError("El rubro o la localidad especificada no existe", 400)
      );
    }

    next(error);
  }
};

// GET /artesanos/:id
export const obtenerArtesano = async (req, res, next) => {
  try {
    const id = req.id || req.params.id;

    const artesano = await obtenerArtesanoService(id);

    if (!artesano) {
      return next(crearError("Artesano no encontrado", 404));
    }

    res.json(artesano);
  } catch (error) {
    next(error);
  }
};

// PUT /artesanos/:id
export const actualizarArtesano = async (req, res, next) => {
  try {
    const id = req.id || req.params.id;
    const datos = req.bodyValidado || req.body;

    const artesano = await actualizarArtesanoService(id, datos);

    res.json(artesano);
  } catch (error) {
    // Registro no encontrado para actualizar
    if (error.code === "P2025") {
      return next(crearError("Artesano no encontrado", 404));
    }

    // Clave foránea inválida en la actualización
    if (error.code === "P2003") {
      return next(
        crearError("El rubro o la localidad especificada no existe", 400)
      );
    }

    next(error);
  }
};

// DELETE /artesanos/:id
export const eliminarArtesano = async (req, res, next) => {
  try {
    const id = req.id || req.params.id;

    await eliminarArtesanoService(id);

    res.json({
      mensaje: "Artesano eliminado correctamente"
    });
  } catch (error) {
    // Registro no encontrado para eliminar
    if (error.code === "P2025") {
      return next(crearError("Artesano no encontrado", 404));
    }

    // Conflicto de restricción referencial (por ejemplo, si tiene registros vinculados que impiden su borrado)
    if (error.code === "P2003") {
      return next(
        crearError(
          "No se puede eliminar el artesano porque posee registros asociados",
          409
        )
      );
    }

    next(error);
  }
};