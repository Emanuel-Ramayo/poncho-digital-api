// src/config/prisma.js
// Crea el cliente de Prisma. En modo test usa la BD de pruebas
// (DATABASE_URL cargada con --env-file=.env.test o DATABASE_URL_TEST);
// en cualquier otro modo usa DATABASE_URL.
import "./entorno.js";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Elige la cadena de conexión según NODE_ENV
const obtenerCadenaConexion = () => {
  if (process.env.NODE_ENV !== "test") {
    return process.env.DATABASE_URL;
  }

  const urlTest = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;

  // Sin BD de pruebas configurada, los tests no deben arrancar
  if (!urlTest?.trim()) {
    throw new Error("Falta DATABASE_URL en .env.test para ejecutar las pruebas.");
  }

  // Protección: el nombre de la BD de pruebas debe contener "test"
  const nombreBd = new URL(urlTest).pathname.toLowerCase();
  if (!nombreBd.includes("test")) {
    throw new Error('El nombre de la BD de pruebas debe contener "test".');
  }

  return urlTest;
};

const adapter = new PrismaPg({
  connectionString: obtenerCadenaConexion()
});

const prisma = new PrismaClient({
  adapter
});

export default prisma;
