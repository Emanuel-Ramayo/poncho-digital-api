import productos from "../data/productos.js";
import { crearError } from "../utils/errores.js";
import { nextId } from "../utils/nextId.js";

//GET - /api/productos
export const listarProductos = (req, res) => {
  res.json(productos);
};
//GET - /api/productos/:id
export const obtenerProducto = (req, res, next) => {
  const id = req.id;

  const producto = productos.find((producto) => producto.id === id);

  if (!producto) {
    return next(crearError("Producto no encontrado", 404));
  }
  res.json(producto);
};

//POST - /api/productos
export const crearProducto = (req, res, next) => {
  const { nombre, categoria, precio, artesanoId } = req.body;
  if (!nombre || !categoria || !precio || !artesanoId) {
    return next(crearError("Todos los campos son obligatorios", 400));
  }
  const nuevoProducto = { id: nextId(), nombre, categoria, precio, artesanoId };
  productos.push(nuevoProducto);
  res.status(201).json(nuevoProducto);
};

//PUT - /api/productos/:id
export const actualizarProducto = (req, res, next) => {
  const producto = productos.find((producto) => producto.id === req.id);
  if (!producto) {
    return next(crearError("Producto no encontrado", 404));
  }
  const { nombre, categoria, precio, artesanoId } = req.body;
  if (!nombre || !categoria || !precio || !artesanoId) {
    return next(crearError("Todos los campos son obligatorios", 400));
  }
  producto.nombre = nombre;
  producto.categoria = categoria;
  producto.precio = precio;
  producto.artesanoId = artesanoId;
  res.json(producto);
  res.status(200).json({ message: "Producto actualizado correctamente" });
};

//DELETE - /api/productos/:id
export const eliminarProducto = (req, res, next) => {
  const index = productos.findIndex((producto) => producto.id === req.id);

  if (index === -1) {
    return next(crearError("Producto no encontrado", 404));
  }

  productos.splice(index, 1);
  res.status(204).send();
};
