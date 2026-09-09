import stands from "../data/stands.js";

export const listarStands = (req, res) => {
  res.json(stands);
};

export const obtenerStand = (req, res) => {
  const id = Number(req.params.id);

  const stand = stands.find((stand) => stand.id === id);

  if (!stand) {
    return res.status(404).json({
      error: "Stand no encontrado"
    });
  }

  res.json(stand);
};