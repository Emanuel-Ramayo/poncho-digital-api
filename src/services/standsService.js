import prisma from "../config/prisma.js";

const includeCompletoStand = {
  sector: {
    include: {
      pabellon: true
    }
  },
  postulaciones: {
    select: {
      id: true,
      estado: true,
      artesano_id: true,
      anio_id: true
    }
  }
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
      include: includeCompletoStand
    }),
    prisma.stand.count({ where })
  ]);

  return {
    datos: stands,
    paginacion: {
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite)
    }
  };
};

export const obtenerStand = async (id) => {
  return await prisma.stand.findUnique({
    where: { id: Number(id) },
    include: includeCompletoStand
  });
};

export const crearStand = async (datos) => {
  return await prisma.stand.create({
    data: datos,
    include: includeCompletoStand
  });
};

export const actualizarStand = async (id, datos) => {
  return await prisma.stand.update({
    where: { id: Number(id) },
    data: datos,
    include: includeCompletoStand
  });
};

export const eliminarStand = async (id) => {
  return await prisma.stand.delete({
    where: { id: Number(id) }
  });
};
