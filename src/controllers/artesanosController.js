import prisma from "../config/prisma.js";
import { crearError } from "../utils/errores.js";

// GET /artesanos
export const listarArtesanos = async (req, res, next) => {
try {
const artesanos = await prisma.artesano.findMany({
orderBy: {
id: "asc"
},
include: {
productos: true,
postulaciones: true
}
});


res.json(artesanos);


} catch (error) {
next(error);
}
};

// POST /artesanos
export const crearArtesano = async (req, res, next) => {
try {
const {
nombre,
especialidad,
provincia,
localidad
} = req.body;

if (!nombre || !especialidad || !provincia || !localidad) {
  return next(
    crearError(
      "Nombre, especialidad, provincia y localidad son obligatorios",
      400
    )
  );
}

const artesano = await prisma.artesano.create({
  data: {
    nombre,
    especialidad,
    provincia,
    localidad
  }
});

res.status(201).json(artesano);

} catch (error) {
next(error);
}
};

// GET /artesanos/:id
export const obtenerArtesano = async (req, res, next) => {
try {
const id = req.id;


const artesano = await prisma.artesano.findUnique({
  where: {
    id
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

if (!artesano) {
  return next(crearError("Artesano no encontrado", 404));
}

res.json(artesano);


} catch (error) {
next(error);
}
};

// PUT /artesanos/:id
export const actualizarArtesano = async (req, res, next) => {
try {
const id = req.id;


const {
  nombre,
  especialidad,
  provincia,
  localidad
} = req.body;

if (!nombre || !especialidad || !provincia || !localidad) {
  return next(
    crearError(
      "Nombre, especialidad, provincia y localidad son obligatorios",
      400
    )
  );
}

const artesano = await prisma.artesano.update({
  where: {
    id
  },
  data: {
    nombre,
    especialidad,
    provincia,
    localidad
  }
});

res.json(artesano);


} catch (error) {
if (error.code === "P2025") {
return next(crearError("Artesano no encontrado", 404));
}


next(error);


}
};

// DELETE /artesanos/:id
export const eliminarArtesano = async (req, res, next) => {
try {
const id = req.id;


await prisma.artesano.delete({
  where: {
    id
  }
});

res.json({
  mensaje: "Artesano eliminado correctamente"
});


} catch (error) {
if (error.code === "P2025") {
return next(crearError("Artesano no encontrado", 404));
}


next(error);


}
};
