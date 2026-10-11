import express from "express";
import {
  listarPostulaciones,
  obtenerPostulacion,
  crearPostulacion,
  actualizarPostulacion,
  eliminarPostulacion
} from "../controllers/postulacionesController.js";
import { validarId } from "../middlewares/validarId.js";
import {
  validarPostulacion,
  validarActualizarPostulacion,
  validarConsultaPostulaciones
} from "../middlewares/validarPostulaciones.js";

const router = express.Router();

// GET /api/postulaciones?estado=APROBADA&anio_id=1
router.get("/", validarConsultaPostulaciones, listarPostulaciones);

// POST /api/postulaciones
router.post("/", validarPostulacion, crearPostulacion);

// GET /api/postulaciones/:id
router.get("/:id", validarId, obtenerPostulacion);

// PUT /api/postulaciones/:id
router.put("/:id", validarId, validarActualizarPostulacion, actualizarPostulacion);

// DELETE /api/postulaciones/:id
router.delete("/:id", validarId, eliminarPostulacion);

export default router;