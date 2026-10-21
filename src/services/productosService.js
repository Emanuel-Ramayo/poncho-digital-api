import prisma from "../config/prisma.js";
import { crearError } from "../utils/errores.js";

const includeCompletoProducto = {
  categoria: true,
  artesano: {
    select: {
      id: true,
      nombre: true
    }
  }
};

// Listado público general con filtros y paginación
export const listarProductos = async ({
  nombre,
  categoria_id,
  artesano_id,
  precioMin,
  precioMax,
  pagina = 1,
  limite = 10,
  ordenPor = "id",
  direccion = "asc"
}) => {
  const where = {};

  if (nombre) {
    where.nombre = { contains: nombre, mode: "insensitive" };
  }

  if (categoria_id) {
    where.categoria_id = categoria_id;
  }

  if (artesano_id) {
    where.artesano_id = artesano_id;
  }

  if (precioMin !== undefined || precioMax !== undefined) {
    where.precio = {
      ...(precioMin !== undefined && { gte: precioMin }),
      ...(precioMax !== undefined && { lte: precioMax })
    };
  }

  const skip = (pagina - 1) * limite;

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      orderBy: { [ordenPor]: direccion },
      skip,
      take: limite,
      include: includeCompletoProducto
    }),
    prisma.producto.count({ where })
  ]);

  return {
    datos: productos,
    paginacion: {
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite)
    }
  };
};

// Listado propio sin parámetros del cliente 
export const listarMisProductos = async (artesanoId) => {
  return await prisma.producto.findMany({
    where: { artesano_id: artesanoId },
    include: includeCompletoProducto,
    orderBy: { id: "asc" }
  });
};

// Detalle público por ID
export const obtenerProducto = async (id) => {
  const producto = await prisma.producto.findUnique({
    where: { id: Number(id) },
    include: includeCompletoProducto
  });

  if (!producto) {
    throw crearError("Producto no encontrado", 404);
  }

  return producto;
};

// Alta: el artesano_id proviene de la cuenta autenticada
export const crearProducto = async (datos, artesanoId) => {
  return await prisma.producto.create({
    data: {
      ...datos,
      artesano_id: artesanoId
    },
    include: includeCompletoProducto
  });
};

// Modificación: filtra por id y por el propietario en la misma consulta
// Producto ajeno o inexistente -> 404 con el mismo mensaje
export const actualizarProducto = async (id, artesanoId, datos) => {
  const numId = Number(id);

  const resultado = await prisma.producto.updateMany({
    where: {
      id: numId,
      artesano_id: artesanoId
    },
    data: datos
  });

  if (resultado.count === 0) {
    throw crearError("Producto no encontrado", 404);
  }

  return await prisma.producto.findUnique({
    where: { id: numId },
    include: includeCompletoProducto
  });
};

// Baja: filtra por id y por el propietario en la misma consulta
// Producto ajeno o inexistente -> 404 con el mismo mensaje
export const eliminarProducto = async (id, artesanoId) => {
  const numId = Number(id);

  const resultado = await prisma.producto.deleteMany({
    where: {
      id: numId,
      artesano_id: artesanoId
    }
  });

  if (resultado.count === 0) {
    throw crearError("Producto no encontrado", 404);
  }

  return { mensaje: "Producto eliminado correctamente" };
};