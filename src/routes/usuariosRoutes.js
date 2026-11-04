import express from "express";
import { registrarUsuario,registrarUsuarioArtesano,crearAdministrador,iniciarSesion,obtenerMiPerfil } from "../controllers/usuariosController.js";
import { cerrarSesion } from "../controllers/sesionesController.js";
import { validarRegistroUsuario,validarRegistroArtesano,validarInicioSesion,validarRegistroAdmin,validarAsignarArtesano,validarIdUsuario,validarActualizarActivo,validarAsignarRol,validarRetirarRol } from "../middlewares/validarUsuarios.js";
import { autenticarUsuario } from "../middlewares/autenticacionMiddleware.js";
import { cargarContextoUsuario,autorizarRoles } from "../middlewares/autorizacionMiddleware.js";
import { asociarArtesano } from "../controllers/artesanosController.js";
import { agregarRol, eliminarRol } from "../controllers/rolesController.js";
import { actualizarActivo } from "../controllers/estadoController.js";

const router = express.Router();

// --- Rutas públicas ---
router.post(
  "/registro",
  /* #swagger.tags = ["Usuarios"]
     #swagger.summary = "Registrar una cuenta básica de usuario"
     #swagger.auto = false
     #swagger.security = []
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/RegistroUsuario" }
         }
       }
     }
     #swagger.responses[201] = {
       description: "Usuario registrado correctamente.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/UsuarioSeguro" }
         }
       }
     }
     #swagger.responses[400] = {
       description: "Datos de registro inválidos."
     }
     #swagger.responses[409] = {
       description: "Ya existe un usuario con ese email."
     }
  */
  validarRegistroUsuario,
  registrarUsuario
);

router.post(
  "/registro-artesano",
  /* #swagger.tags = ["Usuarios"]
     #swagger.summary = "Registrar cuenta de usuario, perfil de artesano y postulación inicial"
     #swagger.auto = false
     #swagger.security = []
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/RegistroArtesano" }
         }
       }
     }
     #swagger.responses[201] = {
       description: "Usuario, artesano y solicitud PENDIENTE creados en transacción.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/RespuestaRegistroArtesano" }
         }
       }
     }
     #swagger.responses[400] = {
       description: "Datos de entrada inválidos."
     }
     #swagger.responses[409] = {
       description: "El email ya está registrado o conflicto con datos existentes."
     }
  */
  validarRegistroArtesano,
  registrarUsuarioArtesano
);

router.post(
  "/login",
  /* #swagger.tags = ["Usuarios"]
     #swagger.summary = "Iniciar sesión y obtener token JWT"
     #swagger.auto = false
     #swagger.security = []
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/LoginUsuario" }
         }
       }
     }
     #swagger.responses[200] = {
       description: "Inicio de sesión exitoso.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/RespuestaLogin" }
         }
       }
     }
     #swagger.responses[400] = {
       description: "Cuerpo de solicitud inválido."
     }
     #swagger.responses[401] = {
       description: "Credenciales inválidas o cuenta inactiva.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ErrorApi" },
           example: { error: "Las credenciales son inválidas." }
         }
       }
     }
  */
  validarInicioSesion,
  iniciarSesion
);

// --- Rutas protegidas de cuenta (requieren token) ---
router.get(
  "/me",
  /* #swagger.tags = ["Usuarios"]
     #swagger.summary = "Consultar perfil y roles del usuario autenticado"
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.responses[200] = {
       description: "Datos del usuario autenticado."
     }
     #swagger.responses[401] = {
       description: "Token ausente o inválido.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ErrorApi" },
           example: { error: "Se requiere un token de acceso." }
         }
       }
     }
     #swagger.responses[403] = {
       description: "Cuenta inactiva."
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  obtenerMiPerfil
);

router.post(
  "/logout",
  /* #swagger.tags = ["Usuarios"]
     #swagger.summary = "Cerrar sesión y revocar el token JWT actual"
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.responses[204] = {
       description: "Sesión cerrada y token revocado (sin contenido)."
     }
     #swagger.responses[401] = {
       description: "Token ausente, inválido o ya revocado."
     }
  */
  autenticarUsuario,
  cerrarSesion
);

// --- Rutas exclusivas para ADMINISTRADOR ---

// Creación de administradores
router.post(
  "/registro-administrador",
  /* #swagger.tags = ["Usuarios"]
     #swagger.summary = "Crear una cuenta con rol ADMINISTRADOR"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ADMINISTRADOR."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/RegistroUsuario" }
         }
       }
     }
     #swagger.responses[201] = {
       description: "Administrador creado correctamente."
     }
     #swagger.responses[400] = {
       description: "Cuerpo inválido o cabecera Bearer mal formada."
     }
     #swagger.responses[401] = {
       description: "Token ausente o inválido."
     }
     #swagger.responses[403] = {
       description: "Cuenta inactiva o se requiere rol ADMINISTRADOR."
     }
     #swagger.responses[409] = {
       description: "El email ya se encuentra registrado."
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarRegistroAdmin,
  crearAdministrador
);

// Asignar artesano a cuenta
router.post(
  "/asignar-artesano",
  /* #swagger.tags = ["Usuarios"]
     #swagger.summary = "Asociar un perfil de artesano y rol ARTESANO a un administrador"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ADMINISTRADOR."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/AsignarArtesano" }
         }
       }
     }
     #swagger.responses[201] = {
       description: "Perfil de artesano creado y asociado."
     }
     #swagger.responses[400] = {
       description: "Cuerpo inválido o cabecera Bearer mal formada."
     }
     #swagger.responses[401] = {
       description: "Token ausente o inválido."
     }
     #swagger.responses[403] = {
       description: "Cuenta inactiva o se requiere rol ADMINISTRADOR."
     }
     #swagger.responses[409] = {
       description: "Requiere administrador activo sin perfil de artesano previo."
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarAsignarArtesano,
  asociarArtesano
);

// Asignación de rol
router.post(
  "/:id/roles",
  /* #swagger.tags = ["Usuarios"]
     #swagger.summary = "Asignar rol ADMINISTRADOR a un usuario"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ADMINISTRADOR."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path", required: true, description: "UUID del usuario.",
       "@schema": { type: "string", format: "uuid" }
     }
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/AsignarRol" }
         }
       }
     }
     #swagger.responses[200] = {
       description: "Rol ADMINISTRADOR asignado.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/MensajeExito" },
           example: { mensaje: "Rol ADMINISTRADOR asignado." }
         }
       }
     }
     #swagger.responses[400] = {
       description: "UUID o rol inválido."
     }
     #swagger.responses[401] = {
       description: "Token ausente o inválido."
     }
     #swagger.responses[403] = {
       description: "Cuenta inactiva o se requiere rol ADMINISTRADOR."
     }
     #swagger.responses[404] = {
       description: "Usuario no encontrado."
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarIdUsuario,
  validarAsignarRol,
  agregarRol
);

// Revocación de rol
router.delete(
  "/:id/roles/:rol",
  /* #swagger.tags = ["Usuarios"]
     #swagger.summary = "Retirar un rol (ARTESANO o ADMINISTRADOR) a un usuario"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ADMINISTRADOR."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path", required: true, description: "UUID del usuario.",
       "@schema": { type: "string", format: "uuid" }
     }
     #swagger.parameters['rol'] = {
       in: "path", required: true, description: "Nombre del rol a retirar.",
       "@schema": { type: "string", enum: ["ARTESANO", "ADMINISTRADOR"] }
     }
     #swagger.responses[204] = {
       description: "Rol retirado correctamente (sin contenido)."
     }
     #swagger.responses[400] = {
       description: "Parámetros inválidos."
     }
     #swagger.responses[401] = {
       description: "Token ausente o inválido."
     }
     #swagger.responses[403] = {
       description: "Cuenta inactiva o se requiere rol ADMINISTRADOR."
     }
     #swagger.responses[404] = {
       description: "Usuario o asignación de rol no encontrada."
     }
     #swagger.responses[409] = {
       description: "No se puede retirar el último administrador activo."
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarRetirarRol,
  eliminarRol
);

// Activar o desactivar cuenta
router.patch(
  "/:id/activo",
  /* #swagger.tags = ["Usuarios"]
     #swagger.summary = "Activar o desactivar la cuenta de un usuario"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ADMINISTRADOR."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path", required: true, description: "UUID del usuario.",
       "@schema": { type: "string", format: "uuid" }
     }
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ActualizarActivo" }
         }
       }
     }
     #swagger.responses[200] = {
       description: "Estado de la cuenta actualizado."
     }
     #swagger.responses[400] = {
       description: "UUID o cuerpo inválido."
     }
     #swagger.responses[401] = {
       description: "Token ausente o inválido."
     }
     #swagger.responses[403] = {
       description: "Cuenta inactiva o se requiere rol ADMINISTRADOR."
     }
     #swagger.responses[404] = {
       description: "Usuario no encontrado."
     }
     #swagger.responses[409] = {
       description: "No se puede desactivar el último administrador activo."
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarIdUsuario,
  validarActualizarActivo,
  actualizarActivo
);

export default router;
