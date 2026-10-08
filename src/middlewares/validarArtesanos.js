import {
  artesanoSchema,
  actualizarArtesanoSchema,
  consultarArtesanosSchema
} from "../validators/artesanosValidator.js";

import {
  crearError,
  detallarErroresZod
} from "../utils/errores.js";

// Valida datos para creación (POST)
export const validarArtesano = (req, res, next) => {
  const resultado = artesanoSchema.safeParse(req.body);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Datos de artesano inválidos", 400, detalles));
  }

  req.body = resultado.data; // DTO limpio
  next();
};

// Valida datos para actualización (PUT)
export const validarActualizarArtesano = (req, res, next) => {
  const resultado = actualizarArtesanoSchema.safeParse(req.body);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Datos de artesano inválidos", 400, detalles));
  }

  if (Object.keys(resultado.data).length === 0) {
    return next(crearError("Debe enviar al menos un campo para actualizar", 400));
  }

  req.body = resultado.data;
  next();
};

// Valida parámetros de consulta (GET /artesanos)
export const validarConsultaArtesanos = (req, res, next) => {
  const resultado = consultarArtesanosSchema.safeParse(req.query);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Parámetros de consulta inválidos", 400, detalles));
  }

  req.queryValidada = resultado.data; // DTO de consulta validado
  next();
};