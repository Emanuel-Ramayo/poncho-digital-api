import postulaciones from "../data/postulaciones.js";
import { crearError } from "../utils/errores.js"; 
import { nextId } from "../utils/generadorId.js";  

// GET - /api/postulaciones
export const listarPostulaciones = (req, res) => {
  res.json(postulaciones);
};

// GET - /api/postulaciones/:id
export const obtenerPostulacion = (req, res, next) => {
  const id = req.id;

  const postulacion = postulaciones.find((postulacion) => postulacion.id === id);

  if (!postulacion) {
    return next(crearError("Postulación no encontrada", 404));
  }
  res.json(postulacion);
};

// POST - /api/postulaciones
export const crearPostulacion = (req, res, next) => {
  const { artesanoId, standId, estado, fecha } = req.body;

  if (!artesanoId || !standId || !estado || !fecha) {
    return next(crearError("Todos los campos son obligatorios", 400));
  }
  
  const nuevaPostulacion = { 
    id: generarId(postulaciones), 
    artesanoId, 
    standId, 
    estado, 
    fecha 
  };
  
  postulaciones.push(nuevaPostulacion);
  res.status(201).json(nuevaPostulacion);
};

// PUT - /api/postulaciones/:id
export const actualizarPostulacion = (req, res, next) => {
  const postulacion = postulaciones.find((postulacion) => postulacion.id === req.id);

  if (!postulacion) {
    return next(crearError("Postulación no encontrada", 404));
  }
  
  const { artesanoId, standId, estado, fecha } = req.body;

  if (!artesanoId || !standId || !estado || !fecha) {
    return next(crearError("Todos los campos son obligatorios", 400));
  } 
  
  postulacion.artesanoId = artesanoId;
  postulacion.standId = standId;
  postulacion.estado = estado;
  postulacion.fecha = fecha;
  
  res.status(200).json({ 
    message: "Postulación actualizada correctamente", 
    postulacion 
  });
};

// DELETE - /api/postulaciones/:id
export const eliminarPostulacion = (req, res, next) => {
    const index = postulaciones.findIndex((postulacion) => postulacion.id === req.id);

    if (index === -1) {
        return next(crearError("Postulación no encontrada", 404));
    }

    postulaciones.splice(index, 1);
    res.status(204).send();
};