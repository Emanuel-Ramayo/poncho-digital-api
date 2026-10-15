import prisma from "../config/prisma.js";

const includeCompletoProducto = {
  categoria: true,
  artesano: {
    select: {
      id: true,
      nombre: true
    }
  }
};

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

export const obtenerProducto = async (id) => {
  return await prisma.producto.findUnique({
    where: { id: Number(id) },
    include: includeCompletoProducto
  });
};

export const crearProducto = async (datos) => {
  return await prisma.producto.create({
    data: datos,
    include: includeCompletoProducto
  });
};

export const actualizarProducto = async (id, datos) => {
  return await prisma.producto.update({
    where: { id: Number(id) },
    data: datos,
    include: includeCompletoProducto
  });
};

export const eliminarProducto = async (id) => {
  return await prisma.producto.delete({
    where: { id: Number(id) }
  });
};
