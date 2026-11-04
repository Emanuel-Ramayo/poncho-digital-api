import prisma from "../config/prisma.js";

// Proyección de base de datos para recuperar solo los datos estrictamente necesarios
const selectBaseStand = {
  id: true,
  numero: true,
  disponible: true,
  sector: {
    select: {
      nombre: true,
      pabellon: {
        select: {
          nombre: true
        }
      }
    }
  },
  postulaciones: {
    where: {
      estado: "APROBADA"
    },
    take: 1,
    select: {
      artesano: {
        select: {
          nombre: true
        }
      }
    }
  }
};

// Formatea la salida limpia: numero/nombre del stand, pabellon, ocupado y artesano si está ocupado
const formatearRespuestaStand = (stand) => {
  const estaOcupado = !stand.disponible;
  const nombreArtesano = stand.postulaciones?.[0]?.artesano?.nombre ?? null;

  return {
    numero: stand.numero,
    pabellon: stand.sector?.pabellon?.nombre ?? null,
    ocupado: estaOcupado,
    ...(estaOcupado && { artesano: nombreArtesano })
  };
};

export const listarStands = async ({
  disponible,
  numero,
  sector_id,
  pabellon_id,
  pagina = 1,
  limite = 10,
  ordenPor = "id",
  direccion = "asc"
}) => {
  const where = {};

  if (disponible !== undefined) {
    where.disponible = disponible;
  }

  if (numero) {
    where.numero = numero;
  }

  if (sector_id) {
    where.sector_id = sector_id;
  }

  if (pabellon_id) {
    where.sector = { pabellon_id };
  }

  const skip = (pagina - 1) * limite;

  const [stands, total] = await Promise.all([
    prisma.stand.findMany({
      where,
      orderBy: { [ordenPor]: direccion },
      skip,
      take: limite,
      select: selectBaseStand
    }),
    prisma.stand.count({ where })
  ]);

  return {
    datos: stands.map(formatearRespuestaStand),
    paginacion: {
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite)
    }
  };
};

export const obtenerStand = async (id) => {
  const stand = await prisma.stand.findUnique({
    where: { id: Number(id) },
    select: selectBaseStand
  });

  if (!stand) {
    return null;
  }

  return formatearRespuestaStand(stand);
};

export const crearStand = async (datos) => {
  const nuevoStand = await prisma.stand.create({
    data: datos,
    select: selectBaseStand
  });

  return formatearRespuestaStand(nuevoStand);
};

export const actualizarStand = async (id, datos) => {
  const standActualizado = await prisma.stand.update({
    where: { id: Number(id) },
    data: datos,
    select: selectBaseStand
  });

  return formatearRespuestaStand(standActualizado);
};

export const eliminarStand = async (id) => {
  return await prisma.stand.delete({
    where: { id: Number(id) }
  });
};
