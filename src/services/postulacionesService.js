import prisma from "../config/prisma.js";

const includeCompletoPostulacion = {
  artesano: {
    include: {
      rubro: true,
      localidad: {
        include: {
          provincia: true
        }
      }
    }
  },
  anio: true,
  stand: {
    include: {
      sector: {
        include: {
          pabellon: true
        }
      }
    }
  }
};

export const listarPostulaciones = async ({
  estado,
  artesano_id,
  anio_id,
  pagina = 1,
  limite = 10,
  ordenPor = "id",
  direccion = "asc"
}) => {
  const where = {};

  if (estado) {
    where.estado = estado;
  }
  if (artesano_id) {
    where.artesano_id = Number(artesano_id);
  }
  if (anio_id) {
    where.anio_id = Number(anio_id);
  }

  const skip = (Number(pagina) - 1) * Number(limite);

  const [postulaciones, total] = await Promise.all([
    prisma.postulacion.findMany({
      where,
      orderBy: { [ordenPor]: direccion },
      skip,
      take: Number(limite),
      include: includeCompletoPostulacion
    }),
    prisma.postulacion.count({ where })
  ]);

  return {
    datos: postulaciones,
    paginacion: {
      pagina: Number(pagina),
      limite: Number(limite),
      total,
      totalPaginas: Math.ceil(total / Number(limite))
    }
  };
};

export const obtenerPostulacion = async (id) => {
  return await prisma.postulacion.findUnique({
    where: { id: Number(id) },
    include: includeCompletoPostulacion
  });
};

export const crearPostulacion = async (datos) => {
  return await prisma.postulacion.create({
    data: datos,
    include: includeCompletoPostulacion
  });
};

export const actualizarPostulacion = async (id, datos) => {
  return await prisma.postulacion.update({
    where: { id: Number(id) },
    data: datos,
    include: includeCompletoPostulacion
  });
};

export const eliminarPostulacion = async (id) => {
  return await prisma.postulacion.delete({
    where: { id: Number(id) }
  });
};