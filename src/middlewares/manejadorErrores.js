export const manejadorErrores = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  // Diccionario de códigos de error comunes de Prisma
  const mensajes = {
    P2002: "Ya existe un registro con esos datos únicos.",
    P2003: "La operación afecta registros relacionados.",
    P2025: "Registro no encontrado.",
    P2034: "Hubo otro cambio simultáneo. Reintentar."
  };

  const mensajeErrorPrisma = mensajes[err.code];

  // Si es P2025 devuelve 404, otros errores de Prisma en la lista devuelven 409
  const status = mensajeErrorPrisma
    ? (err.code === "P2025" ? 404 : 409)
    : (err.status || 500);

  // Oculta detalles internos si es un error 500 no controlado
  const mensaje = status >= 500
    ? "Error interno del servidor."
    : (mensajeErrorPrisma || err.message);

  // Objeto base de respuesta
  const respuesta = {
    error: mensaje
  };

  // Solo se agrega la propiedad 'detalles' si contiene un array o valor con contenido
  if (err.detalles && (!Array.isArray(err.detalles) || err.detalles.length > 0)) {
    respuesta.detalles = err.detalles;
  }

  return res.status(status).json(respuesta);
};