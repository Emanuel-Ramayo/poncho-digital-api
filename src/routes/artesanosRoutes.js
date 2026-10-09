import express from "express";
import {
  listarArtesanos,
  obtenerArtesano,
  crearArtesano,
  actualizarArtesano,
  eliminarArtesano
} from "../controllers/artesanosController.js";
import { validarId } from "../middlewares/validarId.js";
import {
  validarArtesano,
  validarActualizarArtesano,
  validarConsultaArtesanos
} from "../middlewares/validarArtesanos.js";

const router = express.Router();

// Listado paginado y con filtros (?pagina=1&limite=10&rubro_id=1...)
router.get("/", validarConsultaArtesanos, listarArtesanos);

// Alta de artesano
router.post("/", validarArtesano, crearArtesano);

// Detalle por ID
router.get("/:id", validarId, obtenerArtesano);

// Modificación de artesano
router.put("/:id", validarId, validarActualizarArtesano, actualizarArtesano);

// Baja de artesano
router.delete("/:id", validarId, eliminarArtesano);

export default router;