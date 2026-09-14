import express from "express";
import {
  listarPostulaciones,
  obtenerPostulacion,
  crearPostulacion,
  actualizarPostulacion,
  eliminarPostulacion
} from "../controllers/postulacionesController.js";
import { validarId } from "../middlewares/validarId.js";

const router = express.Router();

router.get("/", listarPostulaciones);
router.post("/", crearPostulacion);
router.get("/:id", validarId, obtenerPostulacion);
router.put("/:id", validarId, actualizarPostulacion);
router.delete("/:id", validarId, eliminarPostulacion);

export default router;