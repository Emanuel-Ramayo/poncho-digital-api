import {
  registrarUsuarioSchema,
  iniciarSesionSchema
} from "../validators/usuariosValidator.js";
import { crearError, detallarErroresZod } from "../utils/errores.js";

export const validarRegistroUsuario = (req, res, next) => {
  const resultado = registrarUsuarioSchema.safeParse(req.body);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Los datos enviados son inválidos.", 400, detalles));
  }

  req.registrarUsuarioDto = resultado.data;
  req.bodyValidado = resultado.data;
  next();
};

export const validarInicioSesion = (req, res, next) => {
  const resultado = iniciarSesionSchema.safeParse(req.body);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Los datos enviados son inválidos.", 400, detalles));
  }

  req.iniciarSesionDto = resultado.data;
  req.bodyValidado = resultado.data;
  next();
};