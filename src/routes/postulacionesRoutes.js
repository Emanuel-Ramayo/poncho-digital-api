import express from "express";
import {
  listarPostulaciones,
  obtenerPostulacion
} from "../controllers/postulacionesController.js";

const router = express.Router();

router.get("/", listarPostulaciones);
router.get("/:id", obtenerPostulacion);

export default router;