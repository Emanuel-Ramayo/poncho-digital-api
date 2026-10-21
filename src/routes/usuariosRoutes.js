import express from "express";
import { registrarUsuario,registrarUsuarioArtesano,crearAdministrador,iniciarSesion,obtenerMiPerfil } from "../controllers/usuariosController.js";
import { cerrarSesion } from "../controllers/sesionesController.js";
import { validarRegistroUsuario,validarRegistroArtesano,validarInicioSesion,validarRegistroAdmin,validarAsignarArtesano,validarIdUsuario,validarActualizarActivo,validarAsignarRol,validarRetirarRol } from "../middlewares/validarUsuarios.js";
import { autenticarUsuario } from "../middlewares/autenticacionMiddleware.js";
import { cargarContextoUsuario,autorizarRoles } from "../middlewares/autorizacionMiddleware.js";
import { asociarArtesano } from "../controllers/artesanosController.js";
import { agregarRol, eliminarRol } from "../controllers/rolesController.js";
import { actualizarActivo } from "../controllers/estadoController.js";

const router = express.Router();

// --- Rutas públicas ---
router.post("/registro", validarRegistroUsuario, registrarUsuario);
router.post("/registro-artesano", validarRegistroArtesano, registrarUsuarioArtesano);
router.post("/login", validarInicioSesion, iniciarSesion);

// --- Rutas protegidas de cuenta (requieren token) ---
router.get("/me", autenticarUsuario, cargarContextoUsuario, obtenerMiPerfil);
router.post("/logout", autenticarUsuario, cerrarSesion);

// --- Rutas exclusivas para ADMINISTRADOR ---

// Creación de administradores 
router.post("/registro-administrador",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ADMINISTRADOR"),validarRegistroAdmin,crearAdministrador);

// Asignar artesano a cuenta
router.post("/asignar-artesano",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ADMINISTRADOR"),validarAsignarArtesano,asociarArtesano);

// Asignación de rol
router.post("/:id/roles",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ADMINISTRADOR"),validarIdUsuario,validarAsignarRol,agregarRol);

// Revocación de rol
router.delete("/:id/roles/:rol",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ADMINISTRADOR"),validarRetirarRol,eliminarRol);

// Activar o desactivar cuenta
router.patch("/:id/activo",autenticarUsuario,cargarContextoUsuario,autorizarRoles("ADMINISTRADOR"),validarIdUsuario,validarActualizarActivo,actualizarActivo);

export default router;
