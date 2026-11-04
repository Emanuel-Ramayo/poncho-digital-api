import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearEscenario } from "./helpers/escenario-productos.js";

// 2.4 Aserciones de NODE_ENV y del nombre de la base (*_test) antes de importar la app
assert.equal(process.env.NODE_ENV, "test");
assert.ok(
  new URL(process.env.DATABASE_URL).pathname.endsWith("_test"),
  "La base de datos de pruebas debe finalizar en _test"
);

const { default: prisma } = await import("../src/config/prisma.js");
const { app } = await import("../src/app.js");

let datos;

before(async () => {
  await prisma.$connect();
});

after(async () => {
  await prisma.$disconnect();
});

// 2.4 Limpieza en beforeEach en orden de dependencias (de tablas hijas a tablas padres)
beforeEach(async () => {
  await prisma.$transaction([
    prisma.postulacion.deleteMany(),
    prisma.producto.deleteMany(),
    prisma.tokenRevocado.deleteMany(),
    prisma.usuarioRol.deleteMany(),
    prisma.artesano.deleteMany(),
    prisma.usuario.deleteMany(),
    prisma.stand.deleteMany(),
    prisma.sector.deleteMany(),
    prisma.pabellon.deleteMany(),
    prisma.categoria.deleteMany(),
    prisma.anioPostulacion.deleteMany(),
    prisma.localidad.deleteMany(),
    prisma.provincia.deleteMany(),
    prisma.rubro.deleteMany()
  ]);

  datos = await crearEscenario(app, prisma);
});

const crearProducto = (token, payload) =>
  request(app)
    .post("/api/productos")
    .set("Authorization", `Bearer ${token}`)
    .send(payload)
    .expect(201);

// ==========================================
// 2.2 PRUEBAS DE ACCESO (401, 400, 401, 403)
// ==========================================

test("POST /api/productos sin token devuelve 401 y mensaje de error", async () => {
  const { categoria1 } = datos;

  const respuesta = await request(app)
    .post("/api/productos")
    .send({
      nombre: "Poncho de Vicuña",
      precio: 150000,
      categoria_id: categoria1.id
    })
    .expect(401)
    .expect("Content-Type", /json/);

  assert.deepEqual(respuesta.body, {
    error: "Se requiere un token de acceso."
  });
});

test("POST /api/productos con cabecera Authorization mal formada devuelve 400", async () => {
  const { categoria1 } = datos;

  const respuesta = await request(app)
    .post("/api/productos")
    .set("Authorization", "Basic abc")
    .send({
      nombre: "Poncho de Vicuña",
      precio: 150000,
      categoria_id: categoria1.id
    })
    .expect(400)
    .expect("Content-Type", /json/);

  assert.deepEqual(respuesta.body, {
    error: "Usar el encabezado Authorization: Bearer <token>."
  });
});

test("POST /api/productos con token inválido devuelve 401", async () => {
  const { categoria1 } = datos;

  const respuesta = await request(app)
    .post("/api/productos")
    .set("Authorization", "Bearer token-invalido")
    .send({
      nombre: "Poncho de Vicuña",
      precio: 150000,
      categoria_id: categoria1.id
    })
    .expect(401)
    .expect("Content-Type", /json/);

  assert.deepEqual(respuesta.body, {
    error: "Token inválido, vencido o revocado."
  });
});

test("POST /api/productos con un usuario sin el rol ARTESANO devuelve 403", async () => {
  const { tokenSinRol, categoria1 } = datos;

  const respuesta = await request(app)
    .post("/api/productos")
    .set("Authorization", `Bearer ${tokenSinRol}`)
    .send({
      nombre: "Poncho de Vicuña",
      precio: 150000,
      categoria_id: categoria1.id
    })
    .expect(403)
    .expect("Content-Type", /json/);

  assert.deepEqual(respuesta.body, {
    error: "No tiene permiso para esta operación."
  });
});

// ==========================================
// 2.5 INTEGRACIÓN: PERSISTENCIA Y PROPIEDAD
// ==========================================

test("Crear un producto correcto lo guarda en PostgreSQL asociado a la artesana autenticada", async () => {
  const { ana, tokenAna, categoria1 } = datos;

  const { body } = await crearProducto(tokenAna, {
    nombre: "Poncho de Vicuña",
    descripcion: "Tejido artesanal en telar",
    precio: 150000,
    categoria_id: categoria1.id
  });

  const guardado = await prisma.producto.findUniqueOrThrow({
    where: { id: body.id }
  });

  assert.equal(guardado.artesano_id, ana.artesano.id);
  assert.equal(guardado.categoria_id, categoria1.id);
  assert.equal(guardado.nombre, "Poncho de Vicuña");
  assert.equal(Number(guardado.precio), 150000);

  assert.equal(
    await prisma.producto.count({
      where: { artesano_id: ana.artesano.id }
    }),
    1
  );
});

test("Listar mis productos devuelve todos los productos propios de Ana y ninguno ajeno de Bruno", async () => {
  const { tokenAna, tokenBruno, categoria1, categoria2 } = datos;

  const propio1 = (
    await crearProducto(tokenAna, {
      nombre: "Poncho Tradicional",
      precio: 120000,
      categoria_id: categoria1.id
    })
  ).body;

  const propio2 = (
    await crearProducto(tokenAna, {
      nombre: "Manta de Llama",
      precio: 95000,
      categoria_id: categoria2.id
    })
  ).body;

  const ajeno = (
    await crearProducto(tokenBruno, {
      nombre: "Chalina de Bruno",
      precio: 45000,
      categoria_id: categoria1.id
    })
  ).body;

  const { body } = await request(app)
    .get("/api/productos/mis-productos")
    .set("Authorization", `Bearer ${tokenAna}`)
    .expect(200)
    .expect("Content-Type", /json/);

  assert.deepEqual(
    body.map((p) => p.id).sort((a, b) => a - b),
    [propio1.id, propio2.id].sort((a, b) => a - b)
  );
  assert.equal(
    body.some((p) => p.id === ajeno.id),
    false
  );
});

test("Ana no puede modificar ni eliminar un producto existente de Bruno: devuelve 404 y conserva su dueño en la base", async () => {
  const { bruno, tokenAna, tokenBruno, categoria1 } = datos;

  const ajeno = (
    await crearProducto(tokenBruno, {
      nombre: "Poncho Exclusivo de Bruno",
      precio: 180000,
      categoria_id: categoria1.id
    })
  ).body;

  // Con el token de Bruno se puede consultar públicamente
  await request(app)
    .get(`/api/productos/${ajeno.id}`)
    .expect(200);

  // Al intentar actualizarlo con el token de Ana devuelve 404
  const { body } = await request(app)
    .put(`/api/productos/${ajeno.id}`)
    .set("Authorization", `Bearer ${tokenAna}`)
    .send({
      nombre: "Intento de cambio por Ana",
      precio: 1000,
      categoria_id: categoria1.id
    })
    .expect(404)
    .expect("Content-Type", /json/);

  assert.deepEqual(body, { error: "Producto no encontrado" });

  // Comprobamos en PostgreSQL que el registro sigue existiendo y no cambió de dueño
  const guardado = await prisma.producto.findUniqueOrThrow({
    where: { id: ajeno.id }
  });
  assert.equal(guardado.artesano_id, bruno.artesano.id);
  assert.equal(guardado.nombre, "Poncho Exclusivo de Bruno");
});

