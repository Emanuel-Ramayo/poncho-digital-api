import prisma from "../config/prisma.js";
import { crearError } from "../utils/errores.js";

// GET /stands
export const listarStands = async (req, res, next) => {
  try {
    const stands = await prisma.stand.findMany({
      orderBy: { id: "asc" },
      include: {
        sector: true
      }
    });

    res.json(stands);
  } catch (error) {
    next(error);
  }
};

// GET /stands/:id
export const obtenerStand = async (req, res, next) => {
  try {
    const id = req.id;

    const stand = await prisma.stand.findUnique({
      where: { id },
      include: {
        sector: true
      }
    });

    if (!stand) {
      return next(crearError("Stand no encontrado", 404));
    }

    res.json(stand);
  } catch (error) {
    next(error);
  }
};

// POST /stands
export const crearStand = async (req, res, next) => {
  try {
    const { numero, sector_id, disponible } = req.body;

    if (!numero || !sector_id) {
      return next(crearError("numero y sector_id son obligatorios", 400));
    }

    const stand = await prisma.stand.create({
      data: {
        numero,
        sector_id,
        // disponible es opcional: si no viene, Prisma usa el @default(true) del schema
        ...(disponible !== undefined && { disponible })
      }
    });

    res.status(201).json(stand);
  } catch (error) {
    if (error.code === "P2003") {
      return next(crearError("El sector indicado no existe", 400));
    }
    next(error);
  }
};

// PUT /stands/:id
export const actualizarStand = async (req, res, next) => {
  try {
    const id = req.id;
    const { numero, sector_id, disponible } = req.body;

    // Fix bug original: `!disponible` rechazaba `disponible: false` (un stand ocupado
    // es un valor válido). Ahora se valida solo si el campo vino undefined.
    if (!numero || !sector_id || disponible === undefined) {
      return next(
        crearError("numero, sector_id y disponible son obligatorios", 400)
      );
    }

    const stand = await prisma.stand.update({
      where: { id },
      data: {
        numero,
        sector_id,
        disponible
      }
    });

    // Fix bug original: se mandaban dos respuestas (res.json + res.status().json())
    // lo cual tira "Cannot set headers after they are sent". Se deja una sola.
    res.status(200).json(stand);
  } catch (error) {
    if (error.code === "P2025") {
      return next(crearError("Stand no encontrado", 404));
    }
    if (error.code === "P2003") {
      return next(crearError("El sector indicado no existe", 400));
    }
    next(error);
  }
};

// DELETE /stands/:id
export const eliminarStand = async (req, res, next) => {
  try {
    const id = req.id;

    await prisma.stand.delete({ where: { id } });

    res.status(200).json({ mensaje: "Stand eliminado correctamente" });
  } catch (error) {
    if (error.code === "P2025") {
      return next(crearError("Stand no encontrado", 404));
    }
    next(error);
  }
};