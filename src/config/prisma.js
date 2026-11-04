// src/config/prisma.js
// Crea el cliente de Prisma. En modo test usa la BD de pruebas
// (DATABASE_URL_TEST); en cualquier otro modo usa DATABASE_URL.
import "./entorno.js";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Elige la cadena de conexión según NODE_ENV
const obtenerCadenaConexion = () => {
  if (process.env.NODE_ENV !== "test") {
    return process.env.DATABASE_URL;
  }

  const urlTest = process.env.DATABASE_URL_TEST;

  // Sin BD de pruebas configurada, los tests no deben arrancar
  if (!urlTest?.trim()) {
    throw new Error("Falta DATABASE_URL_TEST para ejecutar las pruebas.");
  }

  // Protección: nunca permitir que los tests apunten a la BD de desarrollo
  if (urlTest === process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL_TEST no puede ser igual a DATABASE_URL.");
  }

  // Protección extra: el nombre de la BD debe contener "test"
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
