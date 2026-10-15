import jwt from "jsonwebtoken";
import { verificarToken } from "../services/tokensService.js";
import { tokenEstaRevocado } from "../services/revocacionesService.js";

export const autenticarUsuario = async (req, res, next) => {
  const encabezado = req.get("Authorization");

  // Sin encabezado -> 401 + WWW-Authenticate
  if (!encabezado) {
    res.set("WWW-Authenticate", "Bearer");
    return res.status(401).json({ error: "Se requiere un token de acceso." });
  }

  // Formato incorrecto -> 400
  const coincidencia = /^Bearer +(\S+)$/i.exec(encabezado);
  if (!coincidencia) {
    res.set("WWW-Authenticate", 'Bearer error="invalid_request"');
    return res
      .status(400)
      .json({ error: "Usar el encabezado Authorization: Bearer <token>." });
  }

  try {
    req.usuario = verificarToken(coincidencia[1]);

    if (await tokenEstaRevocado(req.usuario.jti)) {
      throw new jwt.JsonWebTokenError("Token revocado.");
    }
  } catch (error) {
    // Errores que no son del token (por ejemplo, de la base) -> manejador central
    if (!(error instanceof jwt.JsonWebTokenError)) {
      return next(error);
    }

    // Inválido, vencido o revocado -> 401
    res.set("WWW-Authenticate", 'Bearer error="invalid_token"');
    return res
      .status(401)
      .json({ error: "Token inválido, vencido o revocado." });
  }

  return next();
};
