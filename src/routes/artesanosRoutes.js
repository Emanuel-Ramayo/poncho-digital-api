import express from "express";
 import { listarArtesanos, obtenerArtesano, crearArtesano, actualizarArtesano, eliminarArtesano } from "../controllers/artesanosController.js"; import { validarId } from "../middlewares/validarId.js"; 
 import { validarArtesano, validarConsultaArtesanos } from "../middlewares/validarArtesanos.js"; 
 const router = express.Router();

router.get("/",validarConsultaArtesanos, listarArtesanos);
router.post("/", validarArtesano, crearArtesano);
router.get("/:id", validarId, obtenerArtesano);
router.put("/:id", validarId, validarArtesano, actualizarArtesano);
router.delete("/:id", validarId, eliminarArtesano);

export default router;