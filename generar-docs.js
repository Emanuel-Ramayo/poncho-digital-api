import swaggerAutogen from "swagger-autogen";
import { fileURLToPath } from "node:url";
import * as esquemas from "./src/documentacion/esquemas.js";

const doc = {
  info: {
    title: "API de Poncho Digital",
    version: "1.0.0",
    description: "Documentación del contrato de la API REST de Poncho Digital.",
  },
  servers: [{ url: "/", description: "Servidor actual" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    // @schemas conserva las definiciones explícitas en components.schemas.
    "@schemas": esquemas,
  },
};

// Resolver desde este archivo permite ejecutarlo desde cualquier carpeta.
// El analizador usa / para resolver imports, también en Windows.
const ruta = (archivo) =>
  fileURLToPath(new URL(archivo, import.meta.url)).replaceAll("\\", "/");

const outputFile = ruta("./swagger-output.json");
const routes = [ruta("./src/app.js")];

const generar = swaggerAutogen({ openapi: "3.0.0" });
const resultado = await generar(outputFile, routes, doc);

if (!resultado.success) {
  throw new Error("No se pudo generar OpenAPI.");
}

