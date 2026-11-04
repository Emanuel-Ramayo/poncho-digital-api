// src/config/jwt.js
// Expone el secreto para firmar y verificar tokens JWT.
import "./entorno.js";

export const secretoJWT = process.env.JWT_SECRET;

// Si falta el secreto, el servidor no arranca
if (!secretoJWT?.trim()) {
  throw new Error("Falta configurar JWT_SECRET en el archivo .env");
}
