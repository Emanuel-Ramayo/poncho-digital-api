import express from "express";
import {
  listarProductos,
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

const router = express.Router();

// Listado paginado y con filtros (?nombre=&categoria_id=&artesano_id=&precioMin=&precioMax=&pagina=&limite=)
router.get("/", validarConsultaProductos, listarProductos);

// Alta de producto
router.post("/", validarProducto, crearProducto);

// Detalle por ID
router.get("/:id", validarId, obtenerProducto);

// Modificación de producto
router.put("/:id", validarId, validarActualizarProducto, actualizarProducto);

// Baja de producto
router.delete("/:id", validarId, eliminarProducto);

export default router;
