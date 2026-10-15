import express from "express";
import {
  listarStands,
  obtenerStand,
  crearStand,
  actualizarStand,
  eliminarStand
} from "../controllers/standsController.js";
import { validarId } from "../middlewares/validarId.js";
import {
  validarStand,
  validarActualizarStand,
  validarConsultaStands
} from "../middlewares/validarStands.js";

const router = express.Router();

// Listado paginado y con filtros (?disponible=true&sector_id=&pabellon_id=&numero=&pagina=&limite=)
router.get("/", validarConsultaStands, listarStands);

// Alta de stand
router.post("/", validarStand, crearStand);

// Detalle por ID
router.get("/:id", validarId, obtenerStand);

// Modificación de stand
router.put("/:id", validarId, validarActualizarStand, actualizarStand);

// Baja de stand
router.delete("/:id", validarId, eliminarStand);

export default router;
