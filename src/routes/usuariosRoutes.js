import express from "express";
import {
  registrarUsuario,
  iniciarSesion
} from "../controllers/usuariosController.js";
import {
  validarRegistroUsuario,
  validarInicioSesion
} from "../middlewares/validarUsuarios.js";

const router = express.Router();

// POST /api/usuarios/registro
router.post(
  "/registro",
  validarRegistroUsuario,
  registrarUsuario
);

// POST /api/usuarios/login
router.post(
  "/login",
  validarInicioSesion,
  iniciarSesion
);

export default router;