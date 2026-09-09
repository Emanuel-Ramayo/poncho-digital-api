import artesanos from "../data/artesanos.js";

export const listarArtesanos = (req, res) => {
  res.json(artesanos);
};

export const obtenerArtesano = (req, res) => {
  const id = Number(req.params.id);

  const artesano = artesanos.find((artesano) => artesano.id === id);

  if (!artesano) {
    return res.status(404).json({
      error: "Artesano no encontrado"
    });
  }

  res.json(artesano);
};