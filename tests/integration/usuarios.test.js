// tests/integration/usuarios.test.js
// Pruebas de integración HTTP del módulo de usuarios.
// Usan Supertest contra la app exportada por src/app.js (sin abrir puerto)
// y la base de datos de pruebas configurada con NODE_ENV=test.
import { test, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../../src/app.js";
import prisma from "../../src/config/prisma.js";
import {
  limpiarBaseDatos,
  sembrarDatosBase,
  crearAdministradorPrueba,
  cerrarConexion
} from "../helpers/baseDatos.js";

// Datos que se regeneran antes de cada prueba
let datosBase;
let admin;

// iniciarSesionHttp: helper que hace login por HTTP y devuelve el token
const iniciarSesionHttp = (email, password) =>
  request(app).post("/api/usuarios/login").send({ email, password });

// Antes de cada prueba: BD limpia + admin + datos geográficos/rubro/año
beforeEach(async () => {
  await limpiarBaseDatos();
  datosBase = await sembrarDatosBase();
  admin = await crearAdministradorPrueba();
});

// Al final: cierra Prisma para que el proceso de test termine
after(async () => {
  await cerrarConexion();
});

// Verifica el alta pública de una cuenta y que nunca se devuelva el hash
test("POST /api/usuarios/registro crea un usuario sin exponer passwordHash", async () => {
  const respuesta = await request(app)
    .post("/api/usuarios/registro")
    .send({
      nombre: "Ana Pérez",
      email: "ana@test.com",
      password: "Password123!"
    });

  assert.equal(respuesta.status, 201);
  assert.equal(respuesta.body.email, "ana@test.com");
  assert.equal(respuesta.body.passwordHash, undefined);
});

// Verifica la regla de unicidad del email (409)
test("POST /api/usuarios/registro rechaza un email duplicado con 409", async () => {
  const datos = {
    nombre: "Ana Pérez",
    email: "ana@test.com",
    password: "Password123!"
  };

  await request(app).post("/api/usuarios/registro").send(datos);
  const respuesta = await request(app)
    .post("/api/usuarios/registro")
    .send(datos);

  assert.equal(respuesta.status, 409);
  assert.match(respuesta.body.error, /Ya existe un usuario/i);
});

// Verifica que Zod rechace datos incompletos (400 con detalles)
test("POST /api/usuarios/registro devuelve 400 si faltan datos", async () => {
  const respuesta = await request(app)
    .post("/api/usuarios/registro")
    .send({ email: "sin-nombre@test.com" });

  assert.equal(respuesta.status, 400);
  assert.ok(Array.isArray(respuesta.body.detalles));
});

// Verifica login correcto y que el token sirva para GET /me
test("POST /api/usuarios/login devuelve token y GET /me lo acepta", async () => {
  const login = await iniciarSesionHttp(admin.email, admin.password);

  assert.equal(login.status, 200);
  assert.ok(login.body.token);

  const perfil = await request(app)
    .get("/api/usuarios/me")
    .set("Authorization", `Bearer ${login.body.token}`);

  assert.equal(perfil.status, 200);
  assert.equal(perfil.body.usuario.email, admin.email);
  assert.deepEqual(perfil.body.usuario.roles, ["ADMINISTRADOR"]);
});

// Verifica que una contraseña incorrecta no permita iniciar sesión
test("POST /api/usuarios/login rechaza credenciales inválidas con 401", async () => {
  const respuesta = await iniciarSesionHttp(admin.email, "ClaveIncorrecta!");

  assert.equal(respuesta.status, 401);
  assert.match(respuesta.body.error, /credenciales/i);
});

// Verifica la protección de rutas privadas sin token
test("GET /api/usuarios/me sin token responde 401", async () => {
  const respuesta = await request(app).get("/api/usuarios/me");

  assert.equal(respuesta.status, 401);
  assert.match(respuesta.headers["www-authenticate"], /Bearer/);
});

// Verifica que un usuario sin rol ADMINISTRADOR no pueda listar postulaciones
test("GET /api/postulaciones con usuario sin rol responde 403", async () => {
  await request(app).post("/api/usuarios/registro").send({
    nombre: "Usuario Común",
    email: "comun@test.com",
    password: "Password123!"
  });

  const login = await iniciarSesionHttp("comun@test.com", "Password123!");
  const respuesta = await request(app)
    .get("/api/postulaciones")
    .set("Authorization", `Bearer ${login.body.token}`);

  assert.equal(respuesta.status, 403);
});

// Verifica el registro público de artesano: cuenta + perfil + solicitud PENDIENTE
test("POST /api/usuarios/registro-artesano crea cuenta, artesano y postulación PENDIENTE", async () => {
  const respuesta = await request(app)
    .post("/api/usuarios/registro-artesano")
    .send({
      nombre: "Artesano Uno",
      email: "artesano1@test.com",
      password: "Password123!",
      rubro_id: datosBase.rubro_id,
      localidad_id: datosBase.localidad_id,
      anio_id: datosBase.anio_id
    });

  assert.equal(respuesta.status, 201);
  assert.ok(respuesta.body.artesano.id);
  assert.equal(respuesta.body.postulacion.estado, "PENDIENTE");
  assert.equal(respuesta.body.postulacion.anio_id, datosBase.anio_id);
});

// Verifica que solo un ADMINISTRADOR pueda crear otro administrador
test("POST /api/usuarios/registro-administrador exige token de administrador", async () => {
  const sinToken = await request(app)
    .post("/api/usuarios/registro-administrador")
    .send({
      nombre: "Otro Admin",
      email: "otro@test.com",
      password: "Password123!"
    });

  assert.equal(sinToken.status, 401);

  const login = await iniciarSesionHttp(admin.email, admin.password);
  const conToken = await request(app)
    .post("/api/usuarios/registro-administrador")
    .set("Authorization", `Bearer ${login.body.token}`)
    .send({
      nombre: "Otro Admin",
      email: "otro@test.com",
      password: "Password123!"
    });

  assert.equal(conToken.status, 201);

  // Comprueba en la BD que el nuevo usuario recibió el rol ADMINISTRADOR
  const roles = await prisma.usuarioRol.findMany({
    where: { usuarioId: conToken.body.id },
    include: { rol: true }
  });
  assert.deepEqual(roles.map((asignacion) => asignacion.rol.nombre), ["ADMINISTRADOR"]);
});
