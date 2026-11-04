// src/routes/productosRoutes.js
import express from "express";
import {
  listarProductos,
  listarMisProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from "../controllers/productosController.js";
import { validarId } from "../middlewares/validarId.js";
import {
  validarProducto,
  validarActualizarProducto,
  validarConsultaProductos
} from "../middlewares/validarProductos.js";
import { autenticarUsuario } from "../middlewares/autenticacionMiddleware.js";
import {
  cargarContextoUsuario,
  autorizarRoles
} from "../middlewares/autorizacionMiddleware.js";

const router = express.Router();

// Listado publico paginado y con filtros (?nombre=&categoria_id=&artesano_id=&precioMin=&precioMax=&pagina=&limite=)
router.get(
  "/",
  /* #swagger.tags = ["Productos"]
     #swagger.summary = "Listar productos con filtros y paginación"
     #swagger.auto = false
     #swagger.security = []
     #swagger.parameters['nombre'] = {
       in: "query", description: "Filtrar por nombre del producto.",
       "@schema": { type: "string" }
     }
     #swagger.parameters['categoria_id'] = {
       in: "query", description: "Filtrar por ID de la categoría.",
       "@schema": { type: "integer", minimum: 1 }
     }
     #swagger.parameters['artesano_id'] = {
       in: "query", description: "Filtrar por ID del artesano.",
       "@schema": { type: "integer", minimum: 1 }
     }
     #swagger.parameters['precioMin'] = {
       in: "query", description: "Precio mínimo.",
       "@schema": { type: "number", minimum: 0 }
     }
     #swagger.parameters['precioMax'] = {
       in: "query", description: "Precio máximo.",
       "@schema": { type: "number", minimum: 0 }
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
       "@schema": { type: "string", enum: ["id", "nombre", "precio", "categoria_id", "artesano_id", "createdAt"], default: "id" }
     }
     #swagger.parameters['direccion'] = {
       in: "query", description: "Dirección de ordenamiento.",
       "@schema": { type: "string", enum: ["asc", "desc"], default: "asc" }
     }
     #swagger.responses[200] = {
       description: "Listado paginado de productos.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ListadoProductos" }
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
  validarConsultaProductos,
  listarProductos
);

// Listado propio del artesano autenticado (sin parametros del cliente)
// Ubicado antes de /:id para evitar colisiones de rutas
router.get(
  "/mis-productos",
  /* #swagger.tags = ["Productos"]
     #swagger.summary = "Consultar los productos propios del artesano autenticado"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ARTESANO."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.responses[200] = {
       description: "Listado de productos pertenecientes al artesano autenticado.",
       content: {
         "application/json": {
           schema: {
             type: "array",
             items: { $ref: "#/components/schemas/Producto" }
           }
         }
       }
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
       description: "Cuenta inactiva o se requiere rol ARTESANO."
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ARTESANO"),
  listarMisProductos
);

// Detalle publico por ID
router.get(
  "/:id",
  /* #swagger.tags = ["Productos"]
     #swagger.summary = "Obtener el detalle de un producto por ID"
     #swagger.auto = false
     #swagger.security = []
     #swagger.parameters['id'] = {
       in: "path", required: true, description: "ID del producto.",
       "@schema": { type: "integer", minimum: 1, maximum: 2147483647 }
     }
     #swagger.responses[200] = {
       description: "Detalle del producto.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/Producto" }
         }
       }
     }
     #swagger.responses[400] = {
       description: "ID inválido."
     }
     #swagger.responses[404] = {
       description: "Producto no encontrado.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ErrorApi" },
           example: { error: "Producto no encontrado" }
         }
       }
     }
  */
  validarId,
  obtenerProducto
);

// Alta de producto (Solo ARTESANO)
router.post(
  "/",
  /* #swagger.tags = ["Productos"]
     #swagger.summary = "Crear un producto propio"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ARTESANO. El producto se asocia al artesano autenticado."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/NuevoProducto" }
         }
       }
     }
     #swagger.responses[201] = {
       description: "Producto creado correctamente.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/Producto" }
         }
       }
     }
     #swagger.responses[400] = {
       description: "Cuerpo inválido o cabecera Bearer mal formada."
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
       description: "Cuenta inactiva o se requiere rol ARTESANO."
     }
     #swagger.responses[409] = {
       description: "La categoría indicada no existe o conflicto de datos."
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ARTESANO"),
  validarProducto,
  crearProducto
);

// Modificacion de producto (Solo ARTESANO)
// Orden: autenticacion -> contexto -> rol -> validacion de parametros y body -> controlador
router.put(
  "/:id",
  /* #swagger.tags = ["Productos"]
     #swagger.summary = "Actualizar un producto propio"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ARTESANO propietario del producto."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path", required: true, description: "ID del producto.",
       "@schema": { type: "integer", minimum: 1, maximum: 2147483647 }
     }
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ActualizarProducto" }
         }
       }
     }
     #swagger.responses[200] = {
       description: "Producto actualizado correctamente.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/Producto" }
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
       description: "Cuenta inactiva o se requiere rol ARTESANO."
     }
     #swagger.responses[404] = {
       description: "Producto inexistente o perteneciente a otro artesano.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/ErrorApi" },
           example: { error: "Producto no encontrado" }
         }
       }
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ARTESANO"),
  validarId,
  validarActualizarProducto,
  actualizarProducto
);

// Baja de producto (Solo ARTESANO)
// Orden: autenticacion -> contexto -> rol -> validacion de ID -> controlador
router.delete(
  "/:id",
  /* #swagger.tags = ["Productos"]
     #swagger.summary = "Eliminar un producto propio"
     #swagger.description = "Requiere JWT válido, cuenta activa y rol ARTESANO propietario del producto."
     #swagger.auto = false
     #swagger.security = [{ bearerAuth: [] }]
     #swagger.parameters['id'] = {
       in: "path", required: true, description: "ID del producto.",
       "@schema": { type: "integer", minimum: 1, maximum: 2147483647 }
     }
     #swagger.responses[200] = {
       description: "Producto eliminado correctamente.",
       content: {
         "application/json": {
           schema: { $ref: "#/components/schemas/MensajeExito" },
           example: { mensaje: "Producto eliminado correctamente" }
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
       description: "Cuenta inactiva o se requiere rol ARTESANO."
     }
     #swagger.responses[404] = {
       description: "Producto inexistente o perteneciente a otro artesano."
     }
  */
  autenticarUsuario,
  cargarContextoUsuario,
  autorizarRoles("ARTESANO"),
  validarId,
  eliminarProducto
);

export default router;
