// src/config/entorno.js
// Carga las variables de entorno según el modo de ejecución.
// En modo "test" lee primero .env.test (BD de pruebas) y después .env.
// dotenv NO pisa variables ya definidas, por eso .env.test tiene prioridad.
import dotenv from "dotenv";

// Indica si la app está corriendo en modo de pruebas
export const esTest = process.env.NODE_ENV === "test";

// Carga los archivos .env correspondientes (quiet evita mensajes en consola)
if (esTest) {
  dotenv.config({ path: ".env.test", quiet: true });
}
dotenv.config({ quiet: true });
