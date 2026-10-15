export const manejadorErrores = (err, req, res, next) => {
  const status = err.status || 500;
  const mensaje = err.message || "Error interno del servidor";

  // Objeto base de respuesta
  const respuesta = {
    error: mensaje
  };

  // Solo agrega la propiedad 'detalles' si contiene un array o valor con contenido
  if (err.detalles && (!Array.isArray(err.detalles) || err.detalles.length > 0)) {
    respuesta.detalles = err.detalles;
  }

  return res.status(status).json(respuesta);
};