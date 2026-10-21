import express from "express";
import {listarStands,obtenerStand,crearStand,actualizarStand,eliminarStand} from "../controllers/standsController.js";
import { validarId } from "../middlewares/validarId.js";
import {validarStand,validarActualizarStand,validarConsultaStands} from "../middlewares/validarStands.js";
import { autenticarUsuario } from "../middlewares/autenticacionMiddleware.js";
import {cargarContextoUsuario,autorizarRoles} from "../middlewares/autorizacionMiddleware.js";

const router = express.Router();

// Consultas públicas (GET)
router.get("/", validarConsultaStands, listarStands);
router.get("/:id", validarId, obtenerStand);

// Alta de stand (Solo ADMINISTRADOR)
router.post("/",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ADMINISTRADOR"),validarStand,crearStand);

// Modificación de stand (Solo ADMINISTRADOR)
// Orden: autenticación -> contexto -> rol -> validación -> controlador
router.put("/:id",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ADMINISTRADOR"),validarId,validarActualizarStand,actualizarStand);

// Baja de stand (Solo ADMINISTRADOR)
// Orden: autenticación -> contexto -> rol -> validación -> controlador
router.delete("/:id",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ADMINISTRADOR"),validarId,eliminarStand);

export default router;