import {
  productoSchema,
  actualizarProductoSchema,
  consultarProductosSchema
} from "../validators/productosValidator.js";

import { crearError, detallarErroresZod } from "../utils/errores.js";

// Valida datos para creación (POST)
export const validarProducto = (req, res, next) => {
  const resultado = productoSchema.safeParse(req.body);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Datos de producto inválidos", 400, detalles));
  }

  req.body = resultado.data; // DTO limpio
  next();
};

// Valida datos para actualización (PUT)
export const validarActualizarProducto = (req, res, next) => {
  const resultado = actualizarProductoSchema.safeParse(req.body);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Datos de producto inválidos", 400, detalles));
  }

  if (Object.keys(resultado.data).length === 0) {
    return next(crearError("Debe enviar al menos un campo para actualizar", 400));
  }

  req.body = resultado.data;
  next();
};

// Valida parámetros de consulta (GET /productos)
export const validarConsultaProductos = (req, res, next) => {
  const resultado = consultarProductosSchema.safeParse(req.query);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Parámetros de consulta inválidos", 400, detalles));
  }

  req.queryValidada = resultado.data; // En Express 5 req.query es de solo lectura
  next();
};
