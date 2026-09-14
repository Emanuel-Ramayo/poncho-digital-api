import express from "express";
import {
  listarStands,
  obtenerStand,
  crearStand,
  actualizarStand,
  eliminarStand
} from "../controllers/standsController.js";
import { validarId } from "../middlewares/validarId.js";

const router = express.Router();

router.get("/", listarStands);
router.post("/", crearStand);
router.get("/:id", validarId, obtenerStand);
router.put("/:id", validarId, actualizarStand);
router.delete("/:id", validarId, eliminarStand);

export default router;