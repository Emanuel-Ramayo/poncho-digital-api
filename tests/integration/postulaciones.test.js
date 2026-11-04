// tests/integration/postulaciones.test.js
// Pruebas de integración HTTP del módulo de postulaciones.
// Cubren el alta pública, el listado/detalle protegido y la resolución
// (aprobar/rechazar) exclusiva del rol ADMINISTRADOR.
import { test, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../../src/app.js";
import prisma from "../../src/config/prisma.js";
import {
  limpiarBaseDatos,
  sembrarDatosBase,
  crearAdministradorPrueba,
  crearArtesanoPrueba,
  cerrarConexion
} from "../helpers/baseDatos.js";

// Datos que se regeneran antes de cada prueba
let datosBase;
let admin;
let artesano;
let tokenAdmin;

// iniciarSesionHttp: helper que hace login por HTTP y devuelve el token
const iniciarSesionHttp = (email, password) =>
  request(app).post("/api/usuarios/login").send({ email, password });

// crearPostulacionHttp: helper que da de alta una postulación por la API pública
const crearPostulacionHttp = (artesanoId = artesano.id) =>
  request(app).post("/api/postulaciones").send({
    artesano_id: artesanoId,
    anio_id: datosBase.anio_id
  });

// Antes de cada prueba: BD limpia + admin + artesano sin rol
beforeEach(async () => {
  await limpiarBaseDatos();
  datosBase = await sembrarDatosBase();
  admin = await crearAdministradorPrueba();
  artesano = await crearArtesanoPrueba(datosBase);

  const login = await iniciarSesionHttp(admin.email, admin.password);
  tokenAdmin = login.body.token;
});

// Al final: cierra Prisma para que el proceso de test termine
after(async () => {
  await cerrarConexion();
});

// Verifica que el listado esté protegido
test("GET /api/postulaciones sin token responde 401", async () => {
  const respuesta = await request(app).get("/api/postulaciones");

  assert.equal(respuesta.status, 401);
});

// Verifica el alta pública de una postulación en estado PENDIENTE
test("POST /api/postulaciones crea una postulación pública PENDIENTE", async () => {
  const respuesta = await crearPostulacionHttp();

  assert.equal(respuesta.status, 201);
  assert.equal(respuesta.body.estado, "PENDIENTE");
  // La proyección de main devuelve el nombre del artesano y el año como número
  assert.equal(respuesta.body.artesano.nombre, "Artesano Test");
  assert.equal(respuesta.body.anio, new Date().getFullYear());
});

// Verifica la unicidad artesano + año (409)
test("POST /api/postulaciones duplicada responde 409", async () => {
  await crearPostulacionHttp();
  const respuesta = await crearPostulacionHttp();

  assert.equal(respuesta.status, 409);
  assert.match(respuesta.body.error, /ya posee una postulación/i);
});

// Verifica la validación del cuerpo con Zod
test("POST /api/postulaciones sin artesano_id responde 400", async () => {
  const respuesta = await request(app)
    .post("/api/postulaciones")
    .send({ anio_id: datosBase.anio_id });

  assert.equal(respuesta.status, 400);
  assert.ok(Array.isArray(respuesta.body.detalles));
});

// Verifica el listado paginado para el administrador
test("GET /api/postulaciones con ADMINISTRADOR lista y pagina", async () => {
  await crearPostulacionHttp();

  const respuesta = await request(app)
    .get("/api/postulaciones?pagina=1&limite=10")
    .set("Authorization", `Bearer ${tokenAdmin}`);

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.paginacion.total, 1);
  assert.equal(respuesta.body.datos[0].estado, "PENDIENTE");
});

// Verifica el detalle por ID y el 404 cuando no existe
test("GET /api/postulaciones/:id devuelve detalle o 404", async () => {
  const creada = await crearPostulacionHttp();

  const detalle = await request(app)
    .get(`/api/postulaciones/${creada.body.id}`)
    .set("Authorization", `Bearer ${tokenAdmin}`);

  assert.equal(detalle.status, 200);
  assert.equal(detalle.body.id, creada.body.id);

  const inexistente = await request(app)
    .get("/api/postulaciones/999999")
    .set("Authorization", `Bearer ${tokenAdmin}`);

  assert.equal(inexistente.status, 404);
});

// Verifica que aprobar asigne el rol ARTESANO al usuario dueño del perfil
test("PATCH /api/postulaciones/:id/resolver aprueba y asigna rol ARTESANO", async () => {
  const creada = await crearPostulacionHttp();

  const respuesta = await request(app)
    .patch(`/api/postulaciones/${creada.body.id}/resolver`)
    .set("Authorization", `Bearer ${tokenAdmin}`)
    .send({ estado: "APROBADA" });

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.estado, "APROBADA");

  const roles = await prisma.usuarioRol.findMany({
    where: { usuarioId: artesano.usuarioId },
    include: { rol: true }
  });
  assert.deepEqual(roles.map((asignacion) => asignacion.rol.nombre), ["ARTESANO"]);
});

// Verifica que una solicitud ya resuelta no se pueda resolver de nuevo (409)
test("PATCH /api/postulaciones/:id/resolver dos veces responde 409", async () => {
  const creada = await crearPostulacionHttp();

  await request(app)
    .patch(`/api/postulaciones/${creada.body.id}/resolver`)
    .set("Authorization", `Bearer ${tokenAdmin}`)
    .send({ estado: "APROBADA" });

  const segunda = await request(app)
    .patch(`/api/postulaciones/${creada.body.id}/resolver`)
    .set("Authorization", `Bearer ${tokenAdmin}`)
    .send({ estado: "RECHAZADA" });

  assert.equal(segunda.status, 409);
  assert.match(segunda.body.error, /ya ha sido resuelta/i);
});

// Verifica que un usuario sin rol ADMINISTRADOR no pueda resolver
test("PATCH /api/postulaciones/:id/resolver sin ADMINISTRADOR responde 403", async () => {
  const creada = await crearPostulacionHttp();
  const login = await iniciarSesionHttp(artesano.email, artesano.password);

  const respuesta = await request(app)
    .patch(`/api/postulaciones/${creada.body.id}/resolver`)
    .set("Authorization", `Bearer ${login.body.token}`)
    .send({ estado: "APROBADA" });

  assert.equal(respuesta.status, 403);
});

// Verifica la eliminación de una postulación por parte del administrador
test("DELETE /api/postulaciones/:id elimina la postulación", async () => {
  const creada = await crearPostulacionHttp();

  const respuesta = await request(app)
    .delete(`/api/postulaciones/${creada.body.id}`)
    .set("Authorization", `Bearer ${tokenAdmin}`);

  assert.equal(respuesta.status, 200);
  assert.match(respuesta.body.mensaje, /eliminada/i);
});
