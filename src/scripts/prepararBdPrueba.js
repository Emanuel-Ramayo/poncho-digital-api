// src/scripts/prepararBdPrueba.js
// Aplica las migraciones de Prisma sobre la BD de PRUEBAS.
// Uso: npm run db:test:preparar  (o npm run test:preparar)
import "./forzarTest.js"; // debe ir primero: fuerza NODE_ENV=test
import "../config/entorno.js";
import { spawnSync } from "node:child_process";

const urlTest = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;

// Valida que exista la URL de la BD de pruebas
if (!urlTest?.trim()) {
  console.error("Falta DATABASE_URL en .env.test.");
  process.exit(1);
}

// Valida que el nombre de la BD contenga "test"
const nombreBd = new URL(urlTest).pathname.toLowerCase();
if (!nombreBd.includes("test")) {
  console.error('El nombre de la BD de pruebas debe contener "test".');
  process.exit(1);
}

// Ejecuta "prisma migrate deploy" apuntando a la BD de pruebas.
// Esto crea las tablas y carga los roles ARTESANO y ADMINISTRADOR.
const resultado = spawnSync(
  "npx",
  ["prisma", "migrate", "deploy", "--config", "prisma7.config.ts"],
  {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, DATABASE_URL: urlTest }
  }
);

process.exit(resultado.status ?? 1);
