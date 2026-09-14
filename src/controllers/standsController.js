import stands from "../data/stands.js";
import { crearError } from "../utils/errores.js";
import { nextId } from "../utils/generadorId.js";


//GET - /api/stands
export const listarStands = (req, res) => {
  res.json(stands);
};

//GET - /api/stands/:id
export const obtenerStand = (req, res) => {
  const id = req.id;

  const stand = stands.find((stand) => stand.id === id);

  if (!stand) {
    return next(crearError("Stand no encontrado", 404));
  }

  res.json(stand);
};

//POST - /api/stands
export const crearStand = (req, res) => {
  const { numero,ubicacion,disponible } = req.body;
if (!numero || !ubicacion || !disponible ) {
    return next(crearError("Todos los campos son obligatorios", 400));
  }
  const nuevoStand = { id: nextId(stands), numero, ubicacion, disponible };
  stands.push(nuevoStand);
  res.status(201).json(nuevoStand);
};

 
//PUT - /api/stands/:id
export const actualizarStand = (req, res) => {
  const stand = stands.find((stand) => stand.id === req.id);
  if (!stand) {
    return next(crearError("Stand no encontrado", 404));
  }
  const { numero, ubicacion, disponible } = req.body;
  if (!numero || !ubicacion || !disponible) {
    return next(crearError("Todos los campos son obligatorios", 400));
  } 
  stand.numero = numero;
  stand.ubicacion = ubicacion;
  stand.disponible = disponible;
  res.json(stand);
  res.status(200).json({ message: "Stand actualizado correctamente" });
}



//DELETE - /api/stands/:id
export const eliminarStand = (req, res) => {
  const index = stands.findIndex((stand) => stand.id === req.id);

  if (index === -1) {
    return next(crearError("Stand no encontrado", 404));
  }
  stands.splice(index, 1);
  res.status(200).json({ message: "Stand eliminado correctamente" }); 
};
