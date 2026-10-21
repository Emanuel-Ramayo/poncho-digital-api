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
router.get("/", validarConsultaProductos, listarProductos);

// Listado propio del artesano autenticado (sin parametros del cliente)
// Ubicado antes de /:id para evitar colisiones de rutas
router.get("/mis-productos",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ARTESANO"),listarMisProductos);

// Detalle publico por ID
router.get("/:id", validarId, obtenerProducto);

// Alta de producto (Solo ARTESANO)
router.post("/",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ARTESANO"),validarProducto,crearProducto);

// Modificacion de producto (Solo ARTESANO)
// Orden: autenticacion -> contexto -> rol -> validacion de parametros y body -> controlador
router.put("/:id",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ARTESANO"),validarId,validarActualizarProducto,actualizarProducto);

// Baja de producto (Solo ARTESANO)
// Orden: autenticacion -> contexto -> rol -> validacion de ID -> controlador
router.delete("/:id",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ARTESANO"),validarId,eliminarProducto);

export default router;