import express from "express";
import {listarArtesanos,obtenerArtesano,crearArtesano,actualizarArtesano,eliminarArtesano,obtenerMiPerfilArtesano} from "../controllers/artesanosController.js";
import { validarId } from "../middlewares/validarId.js";
import {validarArtesano,validarActualizarArtesano,validarConsultaArtesanos} from "../middlewares/validarArtesanos.js";
import { autenticarUsuario } from "../middlewares/autenticacionMiddleware.js";
import {cargarContextoUsuario,autorizarRoles} from "../middlewares/autorizacionMiddleware.js";

const router = express.Router();

// Consultas públicas (GET)
router.get("/", validarConsultaArtesanos, listarArtesanos);

// Perfil propio del artesano autenticado (antes de /:id para evitar colisiones)
router.get(
  "/me",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ARTESANO"),obtenerMiPerfilArtesano);

// Detalle público por ID
router.get("/:id", validarId, obtenerArtesano);

// Alta de artesano (Solo ADMINISTRADOR)
router.post("/",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ADMINISTRADOR"),validarArtesano,crearArtesano);

// Modificación de artesano (Solo ADMINISTRADOR)
// Orden: autenticación -> contexto -> rol -> validación -> controlador
router.put("/:id",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ADMINISTRADOR"),validarId,validarActualizarArtesano,actualizarArtesano);

// Baja de artesano (Solo ADMINISTRADOR)
// Orden: autenticación -> contexto -> rol -> validación -> controlador
router.delete("/:id",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ADMINISTRADOR"),validarId,eliminarArtesano);

export default router;