import express from "express";
import {
  listarArtesanos,
  obtenerArtesano,
  crearArtesano,
  actualizarArtesano,
  eliminarArtesano 
} from "../controllers/artesanosController.js";
import { validarId } from "../middlewares/validarId.js";    

const router = express.Router();

router.get("/", listarArtesanos);
router.post("/", crearArtesano);
router.get("/:id", validarId, obtenerArtesano);
router.put("/:id", validarId, actualizarArtesano);
router.delete("/:id", validarId, eliminarArtesano);

export default router;