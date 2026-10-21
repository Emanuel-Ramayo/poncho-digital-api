import { registrarUsuarioSchema,iniciarSesionSchema,registroArtesanoSchema,registroAdminSchema,asignarArtesanoSchema,idUuidSchema } from "../validators/usuariosValidator.js";
import { actualizarActivoSchema } from "../validators/estadoValidator.js";
import { asignarAdministradorSchema, retirarRolParametrosSchema } from "../validators/rolesValidator.js";
import { crearError, detallarErroresZod } from "../utils/errores.js";

// Registro básico
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

// Registro público de artesano
export const validarRegistroArtesano = (req, res, next) => {
  const resultado = registroArtesanoSchema.safeParse(req.body);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Los datos enviados son inválidos.", 400, detalles));
  }

  req.registrarUsuarioDto = resultado.data;
  req.bodyValidado = resultado.data;
  next();
};

// Login
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

// Registro de administrador 
export const validarRegistroAdmin = (req, res, next) => {
  const resultado = registroAdminSchema.safeParse(req.body);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Los datos enviados son inválidos.", 400, detalles));
  }

  req.bodyValidado = resultado.data;
  next();
};

// Asignar perfil de Artesano a un Administrador
export const validarAsignarArtesano = (req, res, next) => {
  const resultado = asignarArtesanoSchema.safeParse(req.body);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Los datos enviados son inválidos.", 400, detalles));
  }

  req.bodyValidado = resultado.data;
  next();
};

// Validación de parámetro :id UUID de usuario
export const validarIdUsuario = (req, res, next) => {
  const resultado = idUuidSchema.safeParse(req.params);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Los parámetros enviados son inválidos.", 400, detalles));
  }

  req.parametrosValidados = resultado.data;
  next();
};

// Validación de activo booleano 
export const validarActualizarActivo = (req, res, next) => {
  const resultado = actualizarActivoSchema.safeParse(req.body);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Los datos enviados son inválidos.", 400, detalles));
  }

  req.bodyValidado = resultado.data;
  next();
};

// Validación de asignación de rol administrador
export const validarAsignarRol = (req, res, next) => {
  const resultado = asignarAdministradorSchema.safeParse(req.body);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Los datos enviados son inválidos.", 400, detalles));
  }

  req.bodyValidado = resultado.data;
  next();
};

// Validación de parámetros (:id UUID y :rol) al retirar un rol
export const validarRetirarRol = (req, res, next) => {
  const resultado = retirarRolParametrosSchema.safeParse(req.params);

  if (!resultado.success) {
    const detalles = detallarErroresZod(resultado.error);
    return next(crearError("Los parámetros enviados son inválidos.", 400, detalles));
  }

  req.parametrosValidados = resultado.data;
  next();
};
