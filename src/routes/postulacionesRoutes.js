import express from "express";
import {listarPostulaciones,obtenerPostulacion,crearPostulacion,actualizarPostulacion,eliminarPostulacion} from "../controllers/postulacionesController.js";
import { resolverPostulacion } from "../controllers/usuariosController.js";
import { validarId } from "../middlewares/validarId.js";
import {validarPostulacion,validarActualizarPostulacion,validarConsultaPostulaciones,validarResolverPostulacion} from "../middlewares/validarPostulaciones.js";
import { autenticarUsuario } from "../middlewares/autenticacionMiddleware.js";
import {cargarContextoUsuario,autorizarRoles} from "../middlewares/autorizacionMiddleware.js";

const router = express.Router();

// Listado de solicitudes (Solo ADMINISTRADOR)
router.get("/",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ADMINISTRADOR"),validarConsultaPostulaciones,listarPostulaciones);

// Postulación pública (sin autenticación previa)
router.post("/",validarPostulacion,crearPostulacion);

// Resolución de solicitudes (Solo ADMINISTRADOR: aprueba o rechaza)
// Orden: autenticación -> contexto -> rol -> validación -> controlador
router.patch("/:id/resolver",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ADMINISTRADOR"),validarId,validarResolverPostulacion,resolverPostulacion);

// Detalle de solicitud por ID (Solo ADMINISTRADOR)
// Orden: autenticación -> contexto -> rol -> validación -> controlador
router.get("/:id",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ADMINISTRADOR"),validarId,obtenerPostulacion);

// Modificación de postulación (Solo ADMINISTRADOR)
router.put("/:id",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ADMINISTRADOR"),validarId,validarActualizarPostulacion,actualizarPostulacion);

// Eliminación de postulación (Solo ADMINISTRADOR)
router.delete("/:id",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ADMINISTRADOR"),validarId,eliminarPostulacion);

export default router;
