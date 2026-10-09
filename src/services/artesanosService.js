import prisma from "../config/prisma.js";

const includeCompletoArtesano = {
  rubro: {
    select: {
      id: true,
      nombre: true
    }
  },
  localidad: {
    include: {
      provincia: true
    }
  },
  productos: {
    include: {
      categoria: true
    }
  },
  postulaciones: {
    include: {
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
    }
  }
};

export const listarArtesanos = async ({
  nombre,
  rubro_id,
  localidad_id,
  provincia_id,
  pagina = 1,
  limite = 10,
  ordenPor = "id",
  direccion = "asc"
}) => {
  const where = {};

  if (nombre) {
    where.nombre = { contains: nombre, mode: "insensitive" };
  }

  if (rubro_id) {
    where.rubro_id = Number(rubro_id);
  }

  if (localidad_id) {
    where.localidad_id = Number(localidad_id);
  }

  if (provincia_id) {
    where.localidad = {
      provincia_id: Number(provincia_id)
    };
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
      include: includeCompletoArtesano
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
    include: includeCompletoArtesano
  });
};

export const crearArtesano = async (datos) => {
  return await prisma.artesano.create({
    data: datos,
    include: includeCompletoArtesano
  });
};

export const actualizarArtesano = async (id, datos) => {
  return await prisma.artesano.update({
    where: {
      id: Number(id)
    },
    data: datos,
    include: includeCompletoArtesano
  });
};

export const eliminarArtesano = async (id) => {
  return await prisma.artesano.delete({
    where: {
      id: Number(id)
    }
  });
};