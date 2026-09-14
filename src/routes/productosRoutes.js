import express from "express";
import {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from "../controllers/productosController.js";
import { validarId } from "../middlewares/validarId.js";

const router = express.Router();

router.get("/", listarProductos);
router.post("/", crearProducto);
router.get("/:id", validarId, obtenerProducto);
router.put("/:id", validarId, actualizarProducto);
router.delete("/:id", validarId,  eliminarProducto);

export default router;