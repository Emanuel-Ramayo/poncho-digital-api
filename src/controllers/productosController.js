import prisma from "../config/prisma.js";
import { crearError } from "../utils/errores.js";

// GET /productos
export const listarProductos = async (req, res, next) => {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: { id: "asc" },
      include: {
        categoria: true,
        artesano: true
      }
    });

    res.json(productos);
  } catch (error) {
    next(error);
  }
};

// GET /productos/:id
export const obtenerProducto = async (req, res, next) => {
  try {
    const id = req.id;

    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: true,
        artesano: true
      }
    });

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
    const { nombre, descripcion, precio, categoria_id, artesano_id } = req.body;

    if (!nombre || !precio || !categoria_id || !artesano_id) {
      return next(
        crearError(
          "Nombre, precio, categoria_id y artesano_id son obligatorios",
          400
        )
      );
    }

    const producto = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        precio,
        categoria_id,
        artesano_id
      }
    });

    res.status(201).json(producto);
  } catch (error) {
    if (error.code === "P2003") {
      return next(crearError("La categoría o el artesano indicado no existe", 400));
    }
    next(error);
  }
};

// PUT /productos/:id
export const actualizarProducto = async (req, res, next) => {
  try {
    const id = req.id;
    const { nombre, descripcion, precio, categoria_id, artesano_id } = req.body;

    if (!nombre || !precio || !categoria_id || !artesano_id) {
      return next(
        crearError(
          "Nombre, precio, categoria_id y artesano_id son obligatorios",
          400
        )
      );
    }

    const producto = await prisma.producto.update({
      where: { id },
      data: {
        nombre,
        descripcion,
        precio,
        categoria_id,
        artesano_id
      }
    });

    res.json(producto);
  } catch (error) {
    if (error.code === "P2025") {
      return next(crearError("Producto no encontrado", 404));
    }
    if (error.code === "P2003") {
      return next(crearError("La categoría o el artesano indicado no existe", 400));
    }
    next(error);
  }
};

// DELETE /productos/:id
export const eliminarProducto = async (req, res, next) => {
  try {
    const id = req.id;

    await prisma.producto.delete({ where: { id } });

    res.status(200).json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    if (error.code === "P2025") {
      return next(crearError("Producto no encontrado", 404));
    }
    next(error);
  }
};