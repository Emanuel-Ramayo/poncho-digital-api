import express from "express";
import {listarStands,obtenerStand,crearStand,actualizarStand,eliminarStand} from "../controllers/standsController.js";
import { validarId } from "../middlewares/validarId.js";
import {validarStand,validarActualizarStand,validarConsultaStands} from "../middlewares/validarStands.js";
import { autenticarUsuario } from "../middlewares/autenticacionMiddleware.js";
import {cargarContextoUsuario,autorizarRoles} from "../middlewares/autorizacionMiddleware.js";

const router = express.Router();

// Consultas públicas (GET)
router.get(
  "/",
  /* #swagger.tags = ["Stands"]
     #swagger.summary = "Listar stands con filtros y paginación"
     #swagger.auto = false
     #swagger.security = []
     #swagger.parameters['disponible'] = {
       in: "query", description: "Filtrar por disponibilidad (true o false).",
       "@schema": { type: "boolean" }
     }
     #swagger.parameters['numero'] = {
       in: "query", description: "Filtrar por número de stand.",
       "@schema": { type: "integer", minimum: 1 }
     }
     #swagger.parameters['sector_id'] = {
       in: "query", description: "Filtrar por ID del sector.",
       "@schema": { type: "integer", minimum: 1 }
     }
     #swagger.parameters['pabellon_id'] = {
       in: "query", description: "Filtrar por ID del pabellón.",
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
       "@schema": { type: "string", enum: ["id", "numero", "disponible", "sector_id", "createdAt"], default: "id" }
     }
     #swagger.parameters['direccion'] = {
       in: "query", description: "Dirección de ordenamiento.",
       "@schema": { type: "string", enum: ["asc", "desc"], default: "asc" }
     }
     #swagger.responses[200] = {
       description: "Listado paginado de stands.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ListadoStands" }
         }
       }
     }
     #swagger.responses[400] = {
       description: "Filtros de consulta inválidos.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ErrorApi" }
         }
       }
     }
  */
  validarConsultaStands,
  listarStands
);

router.get(
  "/:id",
  /* #swagger.tags = ["Stands"]
     #swagger.summary = "Obtener el detalle de un stand por ID"
     #swagger.auto = false
     #swagger.security = []
     #swagger.parameters['id'] = {
       in: "path", required: true, description: "ID del stand.",
       "@schema": { type: "integer", minimum: 1, maximum: 2147483647 }
     }
     #swagger.responses[200] = {
       description: "Detalle del stand.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/Stand" }
         }
       }
     }
     #swagger.responses[400] = {
       description: "ID inválido."
     }
     #swagger.responses[404] = {
       description: "Stand no encontrado.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ErrorApi" },
           example: { error: "Stand no encontrado" }
         }
       }
     }
  */
  validarId,
  obtenerStand
);

// Alta de stand (Solo ADMINISTRADOR)
router.post(
  "/",
  /* #swagger.tags = ["Stands"]
     #swagger.summary = "Crear un stand"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ADMINISTRADOR."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/NuevoStand" }
         }
       }
     }
     #swagger.responses[201] = {
       description: "Stand creado correctamente.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/Stand" }
         }
       }
     }
     #swagger.responses[400] = {
       description: "Cuerpo inválido, sector inexistente o cabecera Bearer mal formada."
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
       description: "Ya existe un stand con ese número en el sector indicado."
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarStand,
  crearStand
);

// Modificación de stand (Solo ADMINISTRADOR)
// Orden: autenticación -> contexto -> rol -> validación -> controlador
router.put(
  "/:id",
  /* #swagger.tags = ["Stands"]
     #swagger.summary = "Actualizar un stand"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ADMINISTRADOR."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path", required: true, description: "ID del stand.",
       "@schema": { type: "integer", minimum: 1, maximum: 2147483647 }
     }
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ActualizarStand" }
         }
       }
     }
     #swagger.responses[200] = {
       description: "Stand actualizado correctamente.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/Stand" }
         }
       }
     }
     #swagger.responses[400] = {
       description: "ID o cuerpo inválido, sector inexistente o cabecera Bearer mal formada."
     }
     #swagger.responses[401] = {
       description: "Token ausente o inválido."
     }
     #swagger.responses[403] = {
       description: "Cuenta inactiva o se requiere rol ADMINISTRADOR."
     }
     #swagger.responses[404] = {
       description: "Stand no encontrado."
     }
     #swagger.responses[409] = {
       description: "Ya existe un stand con ese número en el sector indicado."
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarId,
  validarActualizarStand,
  actualizarStand
);

// Baja de stand (Solo ADMINISTRADOR)
// Orden: autenticación -> contexto -> rol -> validación -> controlador
router.delete(
  "/:id",
  /* #swagger.tags = ["Stands"]
     #swagger.summary = "Eliminar un stand"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ADMINISTRADOR."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path", required: true, description: "ID del stand.",
       "@schema": { type: "integer", minimum: 1, maximum: 2147483647 }
     }
     #swagger.responses[200] = {
       description: "Stand eliminado correctamente.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/MensajeExito" },
           example: { mensaje: "Stand eliminado correctamente" }
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
       description: "Stand no encontrado."
     }
     #swagger.responses[409] = {
       description: "No se puede eliminar porque afecta registros relacionados."
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ADMINISTRADOR"),
  validarId,
  eliminarStand
);

export default router;
