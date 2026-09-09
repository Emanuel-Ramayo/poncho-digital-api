import express from "express";
import {
  listarStands,
  obtenerStand
} from "../controllers/standsController.js";

const router = express.Router();

router.get("/", listarStands);
router.get("/:id", obtenerStand);

export default router;