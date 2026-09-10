import express from "express";
import {
  listarArtesanos,
  obtenerArtesano
} from "../controllers/artesanosController.js";

const router = express.Router();

router.get("/", listarArtesanos);
router.get("/:id", obtenerArtesano);

export default router;