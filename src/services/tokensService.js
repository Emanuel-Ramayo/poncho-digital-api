import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { secretoJWT } from "../config/jwt.js";

const ALGORITMO = "HS256";
const DURACION_TOKEN = "1h";

// Emite un token firmado. El payload no lleva email, contraseña ni hash:
// solo los claims estándar: sub (id del usuario), jti (id único), iat y exp.
export const generarToken = (usuario) => {
  return jwt.sign({}, secretoJWT, {
    algorithm: ALGORITMO,
    subject: String(usuario.id),
    expiresIn: DURACION_TOKEN,
    jwtid: randomUUID()
  });
};

// Verifica firma, algoritmo y vencimiento. Además valida que existan
// sub, jti y exp antes de usarlos. Lanza JsonWebTokenError si algo falla.
export const verificarToken = (token) => {
  const payload = jwt.verify(token, secretoJWT, {
    algorithms: [ALGORITMO]
  });

  if (
    typeof payload !== "object" ||
    typeof payload.sub !== "string" || payload.sub === "" ||
    typeof payload.jti !== "string" || payload.jti === "" ||
    typeof payload.exp !== "number"
  ) {
    throw new jwt.JsonWebTokenError("Token con estructura inválida.");
  }

  return { id: payload.sub, jti: payload.jti, exp: payload.exp };
};
