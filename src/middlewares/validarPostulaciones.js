import {
  postulacionSchema,
  actualizarPostulacionSchema,
  consultarPostulacionesSchema,
  resolverPostulacionSchema
} from "../validators/postulacionesValidator.js";

import { crearError, detallarErroresZod } from "../utils/errores.js";

export const validarPostulacion = (req, res, next) => {
  const resultado = postulacionSchema.safeParse(req.body);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Datos de postulación inválidos", 400, detalles));
  }

  req.body = resultado.data;
  next();
};

export const validarActualizarPostulacion = (req, res, next) => {
  const resultado = actualizarPostulacionSchema.safeParse(req.body);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Datos de postulación inválidos", 400, detalles));
  }

  if (Object.keys(resultado.data).length === 0) {
    return next(crearError("Debe enviar al menos un campo para actualizar", 400));
  }

  req.body = resultado.data;
  next();
};

export const validarResolverPostulacion = (req, res, next) => {
  const resultado = resolverPostulacionSchema.safeParse(req.body);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Datos de resolución inválidos", 400, detalles));
  }

  req.bodyValidado = resultado.data;
  req.body = resultado.data;
  next();
};

export const validarConsultaPostulaciones = (req, res, next) => {
  const resultado = consultarPostulacionesSchema.safeParse(req.query);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Parámetros de consulta inválidos", 400, detalles));
  }

  req.queryValidada = resultado.data;
  next();
};
