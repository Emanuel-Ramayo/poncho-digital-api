import prisma from "../config/prisma.js";
import { crearError } from "../utils/errores.js";

// GET - /api/postulaciones
export const listarPostulaciones = async (req, res, next) => {
  try {
    const postulaciones = await prisma.postulacion.findMany({
      orderBy: {
        id: "asc"
      },
      include: {
        artesano: true,
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
    });

    res.json(postulaciones);
  } catch (error) {
    next(error);
  }
};

// GET - /api/postulaciones/:id
export const obtenerPostulacion = async (req, res, next) => {
  try {
    const id = req.id;

    const postulacion = await prisma.postulacion.findUnique({
      where: {
        id
      },
      include: {
        artesano: true,
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
    });

    if (!postulacion) {
      return next(crearError("Postulación no encontrada", 404));
    }

    res.json(postulacion);
  } catch (error) {
    next(error);
  }
};

// POST - /api/postulaciones
export const crearPostulacion = async (req, res, next) => {
  try {
    const { artesano_id, stand_id, estado } = req.body;

    if (!artesano_id) {
      return next(crearError("El artesano_id es obligatorio", 400));
    }

    const nuevaPostulacion = await prisma.postulacion.create({
      data: {
        artesano_id: Number(artesano_id),
        stand_id: stand_id ? Number(stand_id) : null,
        ...(estado && { estado })
      }
    });

    res.status(201).json(nuevaPostulacion);
  } catch (error) {
    next(error);
  }
};

// PUT - /api/postulaciones/:id
export const actualizarPostulacion = async (req, res, next) => {
  try {
    const id = req.id;
    const { artesano_id, stand_id, estado } = req.body;

    if (!artesano_id) {
      return next(crearError("El artesano_id es obligatorio", 400));
    }

    const postulacionActualizada = await prisma.postulacion.update({
      where: {
        id
      },
      data: {
        artesano_id: Number(artesano_id),
        stand_id: stand_id !== undefined ? (stand_id ? Number(stand_id) : null) : undefined,
        ...(estado && { estado })
      }
    });

    res.json(postulacionActualizada);
  } catch (error) {
    if (error.code === "P2025") {
      return next(crearError("Postulación no encontrada", 404));
    }
    next(error);
  }
};

// DELETE - /api/postulaciones/:id
export const eliminarPostulacion = async (req, res, next) => {
  try {
    const id = req.id;

    await prisma.postulacion.delete({
      where: {
        id
      }
    });

    res.json({
      mensaje: "Postulación eliminada correctamente"
    });
  } catch (error) {
    if (error.code === "P2025") {
      return next(crearError("Postulación no encontrada", 404));
    }
    next(error);
  }
};