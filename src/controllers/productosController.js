import productos from "../data/productos.js";

export const listarProductos = (req, res) => {
  res.json(productos);
};

export const obtenerProducto = (req, res) => {
  const id = Number(req.params.id);

  const producto = productos.find((producto) => producto.id === id);

  if (!producto) {
    return res.status(404).json({
      error: "Producto no encontrado"
    });
  }

  res.json(producto);
};