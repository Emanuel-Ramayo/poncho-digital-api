import express from "express";
import {listarArtesanos,obtenerArtesano,crearArtesano,actualizarArtesano,eliminarArtesano,obtenerMiPerfilArtesano} from "../controllers/artesanosController.js";
import { validarId } from "../middlewares/validarId.js";
import {validarArtesano,validarActualizarArtesano,validarConsultaArtesanos} from "../middlewares/validarArtesanos.js";
import { autenticarUsuario } from "../middlewares/autenticacionMiddleware.js";
import {cargarContextoUsuario,autorizarRoles} from "../middlewares/autorizacionMiddleware.js";

const router = express.Router();

// Consultas públicas (GET)
router.get(
  "/",
  /* #swagger.tags = ["Artesanos"]
     #swagger.summary = "Listar artesanos con filtros y paginación"
     #swagger.auto = false
     #swagger.security = []
     #swagger.parameters['nombre'] = {
       in: "query", description: "Filtrar por nombre del artesano.",
       "@schema": { type: "string" }
     }
     #swagger.parameters['dni'] = {
       in: "query", description: "Filtrar por DNI del artesano.",
       "@schema": { type: "string" }
     }
     #swagger.parameters['rubro_id'] = {
       in: "query", description: "Filtrar por ID del rubro.",
       "@schema": { type: "integer", minimum: 1 }
     }
     #swagger.parameters['localidad_id'] = {
       in: "query", description: "Filtrar por ID de la localidad.",
       "@schema": { type: "integer", minimum: 1 }
     }
     #swagger.parameters['provincia_id'] = {
       in: "query", description: "Filtrar por ID de la provincia.",
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
       "@schema": { type: "string", enum: ["id", "nombre", "dni", "rubro_id", "localidad_id", "createdAt"], default: "id" }
     }
     #swagger.parameters['direccion'] = {
       in: "query", description: "Dirección de ordenamiento.",
       "@schema": { type: "string", enum: ["asc", "desc"], default: "asc" }
     }
     #swagger.responses[200] = {
       description: "Listado paginado de artesanos.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ListadoArtesanos" }
         }
       }
     }
     #swagger.responses[400] = {
       description: "Parámetros de consulta inválidos.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ErrorApi" }
         }
       }
     }
  */
  validarConsultaArtesanos,
  listarArtesanos
);

// Perfil propio del artesano autenticado (antes de /:id para evitar colisiones)
router.get(
  "/me",
  /* #swagger.tags = ["Artesanos"]
     #swagger.summary = "Consultar mi perfil de artesano"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ARTESANO."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.responses[200] = {
       description: "Perfil del artesano autenticado.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/PerfilArtesano" }
         }
       }
     }
     #swagger.responses[401] = {
       description: "Token ausente, inválido, vencido o revocado; cuenta inexistente.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ErrorApi" },
           example: { error: "Se requiere un token de acceso." }
         }
       }
     }
     #swagger.responses[403] = {
       description: "Cuenta inactiva o se requiere rol ARTESANO.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ErrorApi" },
           example: { error: "No tiene permiso para esta operación." }
         }
       }
     }
     #swagger.responses[404] = {
       description: "No se encontró un perfil de artesano asociado a este usuario.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ErrorApi" },
           example: { error: "No se encontró un perfil de artesano asociado a este usuario." }
         }
       }
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ARTESANO"),
  obtenerMiPerfilArtesano
);

// Detalle ARTESANO por ID (Solo ADMINISTRADOR)
router.get(
  "/:id",
  /* #swagger.tags = ["Artesanos"]
     #swagger.summary = "Obtener el detalle completo de un artesano por ID"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ADMINISTRADOR."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path", required: true, description: "ID del artesano.",
       "@schema": { type: "integer", minimum: 1, maximum: 2147483647 }
     }
     #swagger.responses[200] = {
       description: "Detalle completo del artesano.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ArtesanoDetalle" }
         }
       }
     }
     #swagger.responses[400] = {
       description: "ID inválido o cabecera Bearer mal formada.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ErrorApi" },
           example: { error: "El ID debe ser un número entero positivo" }
         }
       }
     }
     #swagger.responses[401] = {
       description: "Token ausente o inválido."
     }
     #swagger.responses[403] = {
       description: "Cuenta inactiva o se requiere rol ADMINISTRADOR."
     }
     #swagger.responses[404] = {
       description: "Artesano no encontrado.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ErrorApi" },
           example: { error: "Artesano no encontrado" }
         }
       }
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarId,
  obtenerArtesano
);

// Alta de artesano (Solo ADMINISTRADOR)
router.post(
  "/",
  /* #swagger.tags = ["Artesanos"]
     #swagger.summary = "Crear un nuevo artesano"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ADMINISTRADOR."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/NuevoArtesano" }
         }
       }
     }
     #swagger.responses[201] = {
       description: "Artesano creado correctamente.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ArtesanoDetalle" }
         }
       }
     }
     #swagger.responses[400] = {
       description: "Cuerpo inválido, rubro/localidad inexistente o cabecera Bearer mal formada."
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
     #swagger.responses[409] = {
       description: "Conflicto con registros existentes (DNI o usuario ya asociado)."
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarArtesano,
  crearArtesano
);

// Modificación de artesano (Solo ADMINISTRADOR)
// Orden: autenticación -> contexto -> rol -> validación -> controlador
router.put(
  "/:id",
  /* #swagger.tags = ["Artesanos"]
     #swagger.summary = "Actualizar un artesano existente"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ADMINISTRADOR."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path", required: true, description: "ID del artesano.",
       "@schema": { type: "integer", minimum: 1, maximum: 2147483647 }
     }
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ActualizarArtesano" }
         }
       }
     }
     #swagger.responses[200] = {
       description: "Artesano actualizado.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ArtesanoDetalle" }
         }
       }
     }
     #swagger.responses[400] = {
       description: "ID o cuerpo inválido, rubro/localidad inexistente o Bearer mal formado."
     }
     #swagger.responses[401] = {
       description: "Token ausente o inválido."
     }
     #swagger.responses[403] = {
       description: "Cuenta inactiva o se requiere rol ADMINISTRADOR."
     }
     #swagger.responses[404] = {
       description: "Artesano no encontrado."
     }
     #swagger.responses[409] = {
       description: "Conflicto con registros existentes (DNI o usuario ya asociado)."
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarId,
  validarActualizarArtesano,
  actualizarArtesano
);

// Baja de artesano (Solo ADMINISTRADOR)
// Orden: autenticación -> contexto -> rol -> validación -> controlador
router.delete(
  "/:id",
  /* #swagger.tags = ["Artesanos"]
     #swagger.summary = "Eliminar un artesano"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ADMINISTRADOR."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path", required: true, description: "ID del artesano.",
       "@schema": { type: "integer", minimum: 1, maximum: 2147483647 }
     }
     #swagger.responses[200] = {
       description: "Artesano eliminado correctamente.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/MensajeExito" },
           example: { mensaje: "Artesano eliminado correctamente" }
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
       description: "Artesano no encontrado."
     }
     #swagger.responses[409] = {
       description: "No se puede eliminar el artesano porque posee registros asociados."
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarId,
  eliminarArtesano
);

export default router;
