import postulaciones from "../data/postulaciones.js";
import { crearError } from "../utils/errores.js"; 
import { nextId } from "../utils/nextId.js";  

export const listarPostulaciones = (req, res) => {
  res.json(postulaciones);
};

export const obtenerPostulacion = (req, res) => {
  const id = Number(req.params.id);

  const postulacion = postulaciones.find(
    (postulacion) => postulacion.id === id
  );

  if (!postulacion) {
    return res.status(404).json({
      error: "Postulación no encontrada"
    });
  }

  res.json(postulacion);
};