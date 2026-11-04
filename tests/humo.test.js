// tests/humo.test.js
// Prueba de humo: confirma que el entorno de pruebas está bien armado
// (BD de pruebas accesible, roles cargados y app exportada sin abrir puerto).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import prisma from "../src/config/prisma.js";
import app from "../src/app.js";
import { limpiarBaseDatos, cerrarConexion } from "./helpers/baseDatos.js";

// Antes de todo: deja la BD de pruebas vacía
before(async () => {
  await limpiarBaseDatos();
});

// Al final: cierra la conexión para que el proceso termine
after(async () => {
  await cerrarConexion();
});

test("NODE_ENV es 'test'", () => {
  assert.equal(process.env.NODE_ENV, "test");
});

test("app.js exporta la aplicación de Express", () => {
  assert.equal(typeof app, "function");
});

test("la migración cargó los roles ARTESANO y ADMINISTRADOR", async () => {
  const roles = await prisma.rol.findMany({ select: { nombre: true } });
  const nombres = roles.map((r) => r.nombre).sort();
  assert.deepEqual(nombres, ["ADMINISTRADOR", "ARTESANO"]);
});
