import {
  listarProductos as listarProductosService,
  listarMisProductos as listarMisProductosService,
  obtenerProducto as obtenerProductoService,
  crearProducto as crearProductoService,
  actualizarProducto as actualizarProductoService,
  eliminarProducto as eliminarProductoService
} from "../services/productosService.js";

// GET /productos (Público con filtros y paginación)
export const listarProductos = async (req, res, next) => {
  try {
    const filtros = req.queryValidada || req.query;
    const resultado = await listarProductosService(filtros);

    return res.json(resultado);
  } catch (error) {
    return next(error);
  }
};

// GET /productos/mis-productos (Listado propio del artesano autenticado)
export const listarMisProductos = async (req, res, next) => {
  try {
    const artesanoId = req.contextoUsuario.artesano.id;
    const productos = await listarMisProductosService(artesanoId);

    return res.json(productos);
  } catch (error) {
    return next(error);
  }
};

// GET /productos/:id (Público)
export const obtenerProducto = async (req, res, next) => {
  try {
    const id = req.id || req.params.id;
    const producto = await obtenerProductoService(id);

    return res.json(producto);
  } catch (error) {
    return next(error);
  }
};

// POST /productos (Solo artesano autenticado)
export const crearProducto = async (req, res, next) => {
  try {
    const artesanoId = req.contextoUsuario.artesano.id;
    const nuevoProducto = await crearProductoService(req.body, artesanoId);

    return res.status(201).json(nuevoProducto);
  } catch (error) {
    return next(error);
  }
};

// PUT /productos/:id (Solo artesano dueño del producto)
export const actualizarProducto = async (req, res, next) => {
  try {
    const id = req.id || req.params.id;
    const artesanoId = req.contextoUsuario.artesano.id;
    const productoActualizado = await actualizarProductoService(id, artesanoId, req.body);

    return res.json(productoActualizado);
  } catch (error) {
    return next(error);
  }
};

// DELETE /productos/:id (Solo artesano dueño del producto)
export const eliminarProducto = async (req, res, next) => {
  try {
    const id = req.id || req.params.id;
    const artesanoId = req.contextoUsuario.artesano.id;
    const resultado = await eliminarProductoService(id, artesanoId);

    return res.json(resultado);
  } catch (error) {
    return next(error);
  }
};