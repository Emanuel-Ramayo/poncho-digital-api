import prisma from "../config/prisma.js";
import { crearError } from "../utils/errores.js";

// Proyección optimizada para listado público (GET /api/artesanos)
// Aplica selección explícita (select) y relaciones anidadas restringidas
// para devolver únicamente la información requerida de visualización:
// nombre del artesano, nombre del rubro, nombre de localidad y nombre de provincia.
const selectResumenArtesano = {
  nombre: true,
  rubro: {
    select: {
      nombre: true
    }
  },
  localidad: {
    select: {
      nombre: true,
      provincia: {
        select: {
          nombre: true
        }
      }
    }
  }
};

// Proyección optimizada para detalle público individual (GET /api/artesanos/:id)
// Utiliza select explícito para no filtrar metadatos sensibles (usuarioId)
// y recuperar la ficha completa del artesano y sus productos con categoría.
const selectDetalleArtesano = {
  id: true,
  nombre: true,
  createdAt: true,
  rubro: {
    select: {
      id: true,
      nombre: true
    }
  },
  localidad: {
    select: {
      id: true,
      nombre: true,
      provincia: {
        select: {
          id: true,
          nombre: true
        }
      }
    }
  },
  productos: {
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      precio: true,
      categoria: {
        select: {
          id: true,
          nombre: true
        }
      }
    }
  },
  postulaciones: {
    select: {
      id: true,
      estado: true,
      anio: {
        select: {
          anio: true
        }
      },
      stand: {
        select: {
          id: true,
          numero: true,
          sector: {
            select: {
              id: true,
              nombre: true,
              pabellon: {
                select: {
                  id: true,
                  nombre: true
                }
              }
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
      select: selectResumenArtesano
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
    select: selectDetalleArtesano
  });
};

export const crearArtesano = async (datos) => {
  return await prisma.artesano.create({
    data: datos,
    select: selectDetalleArtesano
  });
};

export const actualizarArtesano = async (id, datos) => {
  return await prisma.artesano.update({
    where: {
      id: Number(id)
    },
    data: datos,
    select: selectDetalleArtesano
  });
};

export const eliminarArtesano = async (id) => {
  return await prisma.artesano.delete({
    where: {
      id: Number(id)
    }
  });
};
export const asignarArtesano = async (dto) => {
  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.findUniqueOrThrow({
      where: { id: dto.usuarioId },
      include: {
        roles: { include: { rol: true } },
        artesano: true
      }
    });

    const esAdmin = usuario.roles.some(
      (a) => a.rol.nombre === "ADMINISTRADOR"
    );

    if (!usuario.activo || !esAdmin || usuario.artesano) {
      throw crearError(
        "Requiere administrador activo sin perfil de artesano.",
        409
      );
    }

    const actualizado = await tx.usuario.update({
      where: { id: usuario.id },
      data: {
        artesano: {
          create: {
            nombre: dto.nombre,
            rubro_id: dto.rubro_id,
            localidad_id: dto.localidad_id
          }
        },
        roles: {
          create: {
            rol: { connect: { nombre: "ARTESANO" } }
          }
        }
      },
      select: { artesano: true }
    });

    return actualizado.artesano;
  });
};

export const obtenerArtesanoPorIdUsuario = async (usuarioId) => {
  const artesano = await prisma.artesano.findUnique({
    where: { usuarioId },
    select: {
      id: true,
      nombre: true,
      rubro: {
        select: {
          id: true,
          nombre: true
        }
      },
      localidad: {
        select: {
          id: true,
          nombre: true,
          provincia: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      }
    }
  });

  if (!artesano) {
    throw crearError("No se encontró un perfil de artesano asociado a este usuario.", 404);
  }

  return artesano;
};
