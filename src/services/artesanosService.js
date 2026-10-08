import prisma from "../config/prisma.js";

export const listarArtesanos = async ({
  nombre,
  especialidad,
  provincia,
  localidad,
  pagina = 1,
  limite = 10,
  ordenPor = "id",
  direccion = "asc"
}) => {
  const where = {};

  if (nombre) {
    where.nombre = { contains: nombre, mode: "insensitive" };
  }

  if (especialidad) {
    where.especialidad = { contains: especialidad, mode: "insensitive" };
  }

  if (provincia) {
    where.provincia = { contains: provincia, mode: "insensitive" };
  }

  if (localidad) {
    where.localidad = { contains: localidad, mode: "insensitive" };
  }

  const skip = (Number(pagina) - 1) * Number(limite);

  const [artesanos, total] = await Promise.all([
    prisma.artesano.findMany({
      where,
      orderBy: {
        [ordenPor]: direccion
      },
      skip,
      take: Number(limite),
      include: {
        productos: true,
        postulaciones: true
      }
    }),
    prisma.artesano.count({ where })
  ]);

  return {
    datos: artesanos,
    paginacion: {
      pagina: Number(pagina),
      limite: Number(limite),
      total,
      totalPaginas: Math.ceil(total / Number(limite))
    }
  };
};

export const obtenerArtesano = async (id) => {
  return await prisma.artesano.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      productos: true,
      postulaciones: {
        include: {
          stand: {
            include: {
              sector: {
                include: {
                  pabellon: true
                }
              }
            }
          }
        }
      }
    }
  });
};

export const crearArtesano = async (datos) => {
  return await prisma.artesano.create({
    data: datos
  });
};

export const actualizarArtesano = async (id, datos) => {
  return await prisma.artesano.update({
    where: {
      id: Number(id)
    },
    data: datos
  });
};

export const eliminarArtesano = async (id) => {
  return await prisma.artesano.delete({
    where: {
      id: Number(id)
    }
  });
};