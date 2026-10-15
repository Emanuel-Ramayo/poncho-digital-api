import "dotenv/config";

export const secretoJWT = process.env.JWT_SECRET;

// Si falta el secreto, el servidor no arranca
if (!secretoJWT?.trim()) {
  throw new Error("Falta configurar JWT_SECRET en el archivo .env");
}
