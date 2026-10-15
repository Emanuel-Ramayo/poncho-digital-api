import {
  standSchema,
  actualizarStandSchema,
  consultarStandsSchema
} from "../validators/standsValidator.js";

import { crearError, detallarErroresZod } from "../utils/errores.js";

// Valida datos para creación (POST)
export const validarStand = (req, res, next) => {
  const resultado = standSchema.safeParse(req.body);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Datos de stand inválidos", 400, detalles));
  }

  req.body = resultado.data;
  next();
};

// Valida datos para actualización (PUT)
export const validarActualizarStand = (req, res, next) => {
  const resultado = actualizarStandSchema.safeParse(req.body);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Datos de stand inválidos", 400, detalles));
  }

  if (Object.keys(resultado.data).length === 0) {
    return next(crearError("Debe enviar al menos un campo para actualizar", 400));
  }

  req.body = resultado.data;
  next();
};

// Valida parámetros de consulta (GET /stands)
export const validarConsultaStands = (req, res, next) => {
  const resultado = consultarStandsSchema.safeParse(req.query);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Parámetros de consulta inválidos", 400, detalles));
  }

  req.queryValidada = resultado.data;
  next();
};
