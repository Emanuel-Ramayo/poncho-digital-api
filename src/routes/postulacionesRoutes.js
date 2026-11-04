import express from "express";
import {listarPostulaciones,obtenerPostulacion,crearPostulacion,actualizarPostulacion,eliminarPostulacion} from "../controllers/postulacionesController.js";
import { resolverPostulacion } from "../controllers/usuariosController.js";
import { validarId } from "../middlewares/validarId.js";
import {validarPostulacion,validarActualizarPostulacion,validarConsultaPostulaciones,validarResolverPostulacion} from "../middlewares/validarPostulaciones.js";
import { autenticarUsuario } from "../middlewares/autenticacionMiddleware.js";
import {cargarContextoUsuario,autorizarRoles} from "../middlewares/autorizacionMiddleware.js";

const router = express.Router();

// Listado de solicitudes (Solo ADMINISTRADOR)
router.get(
  "/",
  /* #swagger.tags = ["Postulaciones"]
     #swagger.summary = "Listar postulaciones con filtros y paginación"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ADMINISTRADOR."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['estado'] = {
       in: "query", description: "Filtrar por estado de la postulación.",
       "@schema": { type: "string", enum: ["PENDIENTE", "APROBADA", "RECHAZADA", "CANCELADA"] }
     }
     #swagger.parameters['artesano_id'] = {
       in: "query", description: "Filtrar por ID del artesano.",
       "@schema": { type: "integer", minimum: 1 }
     }
     #swagger.parameters['anio_id'] = {
       in: "query", description: "Filtrar por ID del año de postulación.",
       "@schema": { type: "integer", minimum: 1 }
     }
     #swagger.parameters['pagina'] = {
       in: "query", description: "Número de página.",
       "@schema": { type: "integer", minimum: 1, default: 1 }
     }
     #swagger.parameters['limite'] = {
       in: "query", description: "Elementos por página.",
       "@schema": { type: "integer", minimum: 1, maximum: 50, default: 10 }
     }
     #swagger.parameters['ordenPor'] = {
       in: "query", description: "Campo de ordenamiento.",
       "@schema": { type: "string", enum: ["id", "estado", "artesano_id", "anio_id", "createdAt"], default: "id" }
     }
     #swagger.parameters['direccion'] = {
       in: "query", description: "Dirección de ordenamiento.",
       "@schema": { type: "string", enum: ["asc", "desc"], default: "asc" }
     }
     #swagger.responses[200] = {
       description: "Listado paginado de postulaciones.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ListadoPostulaciones" }
         }
       }
     }
     #swagger.responses[400] = {
       description: "Filtros inválidos o cabecera Bearer mal formada."
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
       description: "Cuenta inactiva o se requiere rol ADMINISTRADOR."
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarConsultaPostulaciones,
  listarPostulaciones
);

// Postulación pública (sin autenticación previa)
router.post(
  "/",
  /* #swagger.tags = ["Postulaciones"]
     #swagger.summary = "Crear una nueva postulación"
     #swagger.auto = false
     #swagger.security = []
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/NuevaPostulacion" }
         }
       }
     }
     #swagger.responses[201] = {
       description: "Postulación creada correctamente.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/Postulacion" }
         }
       }
     }
     #swagger.responses[400] = {
       description: "Cuerpo inválido o artesano/año/stand inexistente."
     }
     #swagger.responses[409] = {
       description: "El artesano ya posee una postulación registrada para ese año."
     }
  */
  validarPostulacion,
  crearPostulacion
);

// Resolución de solicitudes (Solo ADMINISTRADOR: aprueba o rechaza)
// Orden: autenticación -> contexto -> rol -> validación -> controlador
router.patch(
  "/:id/resolver",
  /* #swagger.tags = ["Postulaciones"]
     #swagger.summary = "Resolver el estado de una postulación pendiente"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ADMINISTRADOR. Si pasa a APROBADA, otorga el rol ARTESANO al usuario."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path", required: true, description: "ID de la postulación.",
       "@schema": { type: "integer", minimum: 1, maximum: 2147483647 }
     }
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ResolverPostulacion" }
         }
       }
     }
     #swagger.responses[200] = {
       description: "Postulación resuelta correctamente."
     }
     #swagger.responses[400] = {
       description: "ID o estado inválido, o cabecera Bearer mal formada."
     }
     #swagger.responses[401] = {
       description: "Token ausente o inválido."
     }
     #swagger.responses[403] = {
       description: "Cuenta inactiva o se requiere rol ADMINISTRADOR."
     }
     #swagger.responses[404] = {
       description: "Postulación no encontrada."
     }
     #swagger.responses[409] = {
       description: "La solicitud ya ha sido resuelta previamente."
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarId,
  validarResolverPostulacion,
  resolverPostulacion
);

// Detalle de solicitud por ID (Solo ADMINISTRADOR)
// Orden: autenticación -> contexto -> rol -> validación -> controlador
router.get(
  "/:id",
  /* #swagger.tags = ["Postulaciones"]
     #swagger.summary = "Obtener el detalle de una postulación por ID"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ADMINISTRADOR."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path", required: true, description: "ID de la postulación.",
       "@schema": { type: "integer", minimum: 1, maximum: 2147483647 }
     }
     #swagger.responses[200] = {
       description: "Detalle de la postulación.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/Postulacion" }
         }
       }
     }
     #swagger.responses[400] = {
       description: "ID inválido o cabecera Bearer mal formada."
     }
     #swagger.responses[401] = {
       description: "Token ausente o inválido."
     }
     #swagger.responses[403] = {
       description: "Cuenta inactiva o se requiere rol ADMINISTRADOR."
     }
     #swagger.responses[404] = {
       description: "Postulación no encontrada.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ErrorApi" },
           example: { error: "Postulación no encontrada" }
         }
       }
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarId,
  obtenerPostulacion
);

// Modificación de postulación (Solo ADMINISTRADOR)
router.put(
  "/:id",
  /* #swagger.tags = ["Postulaciones"]
     #swagger.summary = "Actualizar una postulación por ID"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ADMINISTRADOR."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path", required: true, description: "ID de la postulación.",
       "@schema": { type: "integer", minimum: 1, maximum: 2147483647 }
     }
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ActualizarPostulacion" }
         }
       }
     }
     #swagger.responses[200] = {
       description: "Postulación actualizada correctamente.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/Postulacion" }
         }
       }
     }
     #swagger.responses[400] = {
       description: "ID o cuerpo inválido, o cabecera Bearer mal formada."
     }
     #swagger.responses[401] = {
       description: "Token ausente o inválido."
     }
     #swagger.responses[403] = {
       description: "Cuenta inactiva o se requiere rol ADMINISTRADOR."
     }
     #swagger.responses[404] = {
       description: "Postulación no encontrada."
     }
     #swagger.responses[409] = {
       description: "El artesano ya posee una postulación registrada para ese año."
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarId,
  validarActualizarPostulacion,
  actualizarPostulacion
);

// Eliminación de postulación (Solo ADMINISTRADOR)
router.delete(
  "/:id",
  /* #swagger.tags = ["Postulaciones"]
     #swagger.summary = "Eliminar una postulación"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ADMINISTRADOR."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path", required: true, description: "ID de la postulación.",
       "@schema": { type: "integer", minimum: 1, maximum: 2147483647 }
     }
     #swagger.responses[200] = {
       description: "Postulación eliminada correctamente.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/MensajeExito" },
           example: { mensaje: "Postulación eliminada correctamente" }
         }
       }
     }
     #swagger.responses[400] = {
       description: "ID inválido o cabecera Bearer mal formada."
     }
     #swagger.responses[401] = {
       description: "Token ausente o inválido."
     }
     #swagger.responses[403] = {
       description: "Cuenta inactiva o se requiere rol ADMINISTRADOR."
     }
     #swagger.responses[404] = {
       description: "Postulación no encontrada."
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarId,
  eliminarPostulacion
);

export default router;
