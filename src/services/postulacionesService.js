import prisma from "../config/prisma.js";
import { crearError } from "../utils/errores.js";

// Proyección de base de datos con selección explícita (select)
// Evita transferir usuarioId, fechas de auditoría y claves foráneas redundantes
const selectBasePostulacion = {
  id: true,
  estado: true,
  anio: {
    select: {
      anio: true
    }
  },
  artesano: {
    select: {
      nombre: true,
      rubro: {
        select: {
          nombre: true
        }
      }
    }
  },
  stand: {
    select: {
      numero: true,
      sector: {
        select: {
          pabellon: {
            select: {
              nombre: true
            }
          }
        }
      }
    }
  }
};

// Formatea la respuesta con la estructura limpia solicitada
const formatearPostulacion = (postulacion) => {
  return {
    id: postulacion.id,
    estado: postulacion.estado,
    anio: postulacion.anio?.anio ?? null,
    artesano: {
      nombre: postulacion.artesano?.nombre ?? null,
      rubro: postulacion.artesano?.rubro?.nombre ?? null
    },
    stand: postulacion.stand
      ? {
          numero: postulacion.stand.numero,
          pabellon: postulacion.stand.sector?.pabellon?.nombre ?? null
        }
      : null
  };
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
      select: selectBasePostulacion
    }),
    prisma.postulacion.count({ where })
  ]);

  return {
    datos: postulaciones.map(formatearPostulacion),
    paginacion: {
      pagina: Number(pagina),
      limite: Number(limite),
      total,
      totalPaginas: Math.ceil(total / Number(limite))
    }
  };
};

export const obtenerPostulacion = async (id) => {
  const postulacion = await prisma.postulacion.findUnique({
    where: { id: Number(id) },
    select: selectBasePostulacion
  });

  if (!postulacion) {
    return null;
  }

  return formatearPostulacion(postulacion);
};

export const crearPostulacion = async (datos) => {
  if (datos.stand_id) {
    const standOcupado = await prisma.postulacion.findFirst({
      where: {
        anio_id: Number(datos.anio_id),
        stand_id: Number(datos.stand_id)
      },
      select: { id: true }
    });

    if (standOcupado) {
      throw crearError("El stand ya se encuentra asignado a otro artesano para este año", 409);
    }
  }

  const nueva = await prisma.postulacion.create({
    data: datos,
    select: selectBasePostulacion
  });

  return formatearPostulacion(nueva);
};

export const actualizarPostulacion = async (id, datos) => {
  const numId = Number(id);

  if (datos.stand_id !== undefined && datos.stand_id !== null) {
    // Obtenemos la postulación actual para conocer su año (o si viene en datos)
    const actual = await prisma.postulacion.findUnique({
      where: { id: numId },
      select: { anio_id: true }
    });

    if (actual) {
      const anioId = datos.anio_id ? Number(datos.anio_id) : actual.anio_id;
      const standOcupado = await prisma.postulacion.findFirst({
        where: {
          id: { not: numId },
          anio_id: anioId,
          stand_id: Number(datos.stand_id)
        },
        select: { id: true }
      });

      if (standOcupado) {
        throw crearError("El stand ya se encuentra asignado a otro artesano para este año", 409);
      }
    }
  }

  const actualizada = await prisma.postulacion.update({
    where: { id: numId },
    data: datos,
    select: selectBasePostulacion
  });

  return formatearPostulacion(actualizada);
};

export const eliminarPostulacion = async (id) => {
  return await prisma.postulacion.delete({
    where: { id: Number(id) }
  });
};
