import artesanos from "../data/artesanos.js";
import { crearError } from "../utils/errores.js";
import { nextId } from "../utils/generadorId.js";

//GET - /api/artesanos
export const listarArtesanos = (req, res) => {
  res.json(artesanos);
};

//GET - /api/artesanos/:id
export const obtenerArtesano = (req, res,next) => {
  const id = req.id;

  const artesano = artesanos.find((artesano) => artesano.id === id);

  if (!artesano) {
    return next(crearError("Artesano no encontrado", 404));
  }
  res.json(artesano);
};

//POST - /api/artesanos
export const crearArtesano = (req, res,next) => {
  const { nombre, especialidad, localidad } = req.body;

  if (!nombre || !especialidad || !localidad) {
    return next(crearError("Todos los campos son obligatorios", 400));
  }
  const nuevoArtesano = {id:nextId(artesanos), nombre, especialidad, localidad};
  artesanos.push(nuevoArtesano);
  res.status(201).json(nuevoArtesano);      
}

//PUT - /api/artesanos/:id
export const actualizarArtesano = (req, res,next) => {
  const artesano = artesanos.find((artesano) => artesano.id === req.id);

  if (!artesano) {
    return next(crearError("Artesano no encontrado", 404));
  }
  const { nombre, especialidad, localidad } = req.body;

  if (!nombre || !especialidad || !localidad) {
    return next(crearError("Todos los campos son obligatorios", 400));
  } 
  artesano.nombre = nombre;
  artesano.especialidad = especialidad;
  artesano.localidad = localidad;
  res.json(artesano);
  res.status(200).json({ message: "Artesano actualizado correctamente" });


}
//DELETE - /api/artesanos/:id
export const eliminarArtesano = (req, res, next) => {
    const index = artesanos.findIndex((artesano) => artesano.id === req.id);

    if (index === -1) {
        return next(crearError("Artesano no encontrado", 404));
    }

    artesanos.splice(index, 1);
    res.status(204).send();
};

