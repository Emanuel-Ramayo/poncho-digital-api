import express from "express";
import {
  registrarUsuario,
  iniciarSesion,
  obtenerMiPerfil
} from "../controllers/usuariosController.js";
import { cerrarSesion } from "../controllers/sesionesController.js";
import {
  validarRegistroUsuario,
  validarInicioSesion
} from "../middlewares/validarUsuarios.js";
import { autenticarUsuario } from "../middlewares/autenticacionMiddleware.js";

const router = express.Router();

// Rutas públicas
router.post("/registro", validarRegistroUsuario, registrarUsuario);
router.post("/login", validarInicioSesion, iniciarSesion);

// Rutas protegidas (requieren token)
router.get("/me", autenticarUsuario, obtenerMiPerfil);
router.post("/logout", autenticarUsuario, cerrarSesion);

export default router;