import {
  listarProductos as listarProductosService,
  obtenerProducto as obtenerProductoService,
  crearProducto as crearProductoService,
  actualizarProducto as actualizarProductoService,
  eliminarProducto as eliminarProductoService
} from "../services/productosService.js";

import { crearError } from "../utils/errores.js";

// GET /productos
export const listarProductos = async (req, res, next) => {
  try {
    const filtros = req.queryValidada || req.query;
    const resultado = await listarProductosService(filtros);

    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

// GET /productos/:id
export const obtenerProducto = async (req, res, next) => {
  try {
    const id = req.id || req.params.id;

    const producto = await obtenerProductoService(id);

    if (!producto) {
      return next(crearError("Producto no encontrado", 404));
    }

    res.json(producto);
  } catch (error) {
    next(error);
  }
};

// POST /productos
export const crearProducto = async (req, res, next) => {
  try {
    const datos = req.body;
    const producto = await crearProductoService(datos);

    res.status(201).json(producto);
  } catch (error) {
    // Clave foránea inexistente (categoria_id o artesano_id no encontrados)
    if (error.code === "P2003") {
      return next(
        crearError("La categoría o el artesano indicado no existe", 400)
      );
    }

    next(error);
  }
};

// PUT /productos/:id
export const actualizarProducto = async (req, res, next) => {
  try {
    const id = req.id || req.params.id;
    const datos = req.body;

    const producto = await actualizarProductoService(id, datos);

    res.json(producto);
  } catch (error) {
    if (error.code === "P2025") {
      return next(crearError("Producto no encontrado", 404));
    }

    if (error.code === "P2003") {
      return next(
        crearError("La categoría o el artesano indicado no existe", 400)
      );
    }

    next(error);
  }
};

// DELETE /productos/:id
export const eliminarProducto = async (req, res, next) => {
  try {
    const id = req.id || req.params.id;

    await eliminarProductoService(id);

    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    if (error.code === "P2025") {
      return next(crearError("Producto no encontrado", 404));
    }

    next(error);
  }
};
